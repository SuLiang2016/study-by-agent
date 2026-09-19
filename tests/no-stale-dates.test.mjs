// lint 闸门：代码里禁止写死核实日期——快照日一律引用 verifiedAt，历史日引用 GUIDE_VERIFIED_AT，
// 否则数据刷新后文案必然自相矛盾（本站曾有 6 处硬编码同时漂移）。
// 白名单：src/data/（数据文件本身）与 site.ts 的 GUIDE_VERIFIED_AT 声明行（历史日期在代码里的唯一来源）。
// 文档（README、CONTEXT.md、src/pages/*.md、research/）属历史陈述，不在管辖范围。
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DATE_RE = /20\d{2}-\d{2}-\d{2}/;

function walk(dir, exts, out = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, exts, out);
    else if (exts.some((e) => name.endsWith(e))) out.push(p);
  }
  return out;
}

test('代码中不允许出现硬编码日期字面量', () => {
  const files = [...walk(join(ROOT, 'src'), ['.ts', '.astro']), ...walk(join(ROOT, 'scripts'), ['.mjs'])];
  const offenders = [];
  for (const file of files) {
    const normalized = file.replace(/\\/g, '/');
    if (normalized.includes('/src/data/')) continue;
    const isSiteLib = normalized.endsWith('/src/lib/site.ts');
    readFileSync(file, 'utf8').split('\n').forEach((line, i) => {
      if (!DATE_RE.test(line)) return;
      if (isSiteLib && /GUIDE_VERIFIED_AT\s*=/.test(line)) return;
      offenders.push(`${normalized.replace(`${ROOT.replace(/\\/g, '/')}/`, '')}:${i + 1}: ${line.trim()}`);
    });
  }
  assert.deepEqual(offenders, []);
});
