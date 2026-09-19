// refresh-stars.mjs 的回归测试。
// 反馈回路：用 mock fetch（tests/mock-fetch.mjs，--import 预加载）+ 临时数据文件跑真实脚本，
// 断言三件事——不崩、stale/404 提醒正确、verifiedAt 语义正确。
// 当前已知的两个 bug（字符串调用 getTime、Math.round 漏报）都会让本套测试变红。
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, cpSync, readFileSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SCRIPT = join(ROOT, 'scripts', 'refresh-stars.mjs');
const MOCK = join(ROOT, 'tests', 'mock-fetch.mjs');

let tmp;

before(() => {
  tmp = mkdtempSync(join(tmpdir(), 'refresh-stars-'));
  // 裁剪成 3 条仓库条目（ok / stale / gone），fixture 只认识前两个 slug
  const data = JSON.parse(readFileSync(join(ROOT, 'src', 'data', 'resources.json'), 'utf8'));
  data.verifiedAt = '2020-01-01';
  data.resources = [
    { ...data.resources[0], id: 'ok', url: 'https://github.com/test/ok' },
    { ...data.resources[1], id: 'stale', url: 'https://github.com/test/stale' },
    { ...data.resources[2], id: 'gone', url: 'https://github.com/test/gone' },
  ];
  writeFileSync(join(tmp, 'resources.json'), JSON.stringify(data, null, 2) + '\n');
});

after(() => {
  if (tmp) rmSync(tmp, { recursive: true, force: true });
});

function runScript() {
  let stdout;
  let exitCode = 0;
  try {
    stdout = execFileSync(
      process.execPath,
      ['--import', `file://${MOCK.replace(/\\/g, '/')}`, SCRIPT, join(tmp, 'resources.json')],
      { encoding: 'utf8', timeout: 30000 },
    );
  } catch (err) {
    exitCode = err.status ?? 1;
    stdout = `${err.stdout ?? ''}${err.stderr ?? ''}`;
  }
  return { exitCode, stdout };
}

test('脚本跑完不崩，汇总行输出（回归：字符串 pushed_at 调用 getTime 抛 TypeError）', () => {
  const { exitCode, stdout } = runScript();
  assert.equal(exitCode, 0, `脚本异常退出：\n${stdout}`);
  assert.match(stdout, /完成：更新 2 个仓库/);
});

test('推送超 3 个月的仓库必须出现在人工复核提醒里（回归：Math.round 把 3.5 个月舍入为 3）', () => {
  const { stdout } = runScript();
  assert.match(stdout, /test\/stale/);
  assert.match(stdout, /请人工复核维护状态/);
});

test('404 仓库进入「建议移入甄别清单」提醒，且不中断其余仓库', () => {
  const { stdout } = runScript();
  assert.match(stdout, /test\/gone/);
  assert.match(stdout, /已 404，请人工移入 deprecated\.json/);
  // 404 分区只应包含真正 404 的仓库，成功仓库不能混入（分区到下一个空行结束）
  const notFoundSection = stdout.match(/请人工移入 deprecated\.json：([^]*?)\n\n/)?.[1] ?? '';
  assert.match(notFoundSection, /test\/gone/);
  assert.doesNotMatch(notFoundSection, /test\/(ok|stale)/);
});

test('部分仓库 404 时，顶层 verifiedAt 保持不变（仅完整刷新成功才推进）', () => {
  runScript();
  const data = JSON.parse(readFileSync(join(tmp, 'resources.json'), 'utf8'));
  assert.equal(data.verifiedAt, '2020-01-01');
});

test('成功的仓库写回 star 数、语言与当日核实日期', () => {
  const { stdout } = runScript();
  assert.match(stdout, /★ 12,345/);
  const data = JSON.parse(readFileSync(join(tmp, 'resources.json'), 'utf8'));
  const ok = data.resources.find((r) => r.id === 'ok');
  assert.equal(ok.stars, 12345);
  assert.equal(ok.language, 'Python');
  assert.equal(ok.verifiedAt, new Date().toISOString().slice(0, 10));
});
