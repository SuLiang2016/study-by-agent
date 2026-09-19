// refreshCore 的单元测试：注入 fixture adapter，直接断言结构化 Report——
// 无子进程、无临时文件、无 stdout 正则，测试之间不共享状态。
// 已知的两个历史 bug（字符串 pushed_at 调用 getTime 崩溃、Math.round 把 3.5 个月舍入为 3 漏报）
// 都会让本套测试变红。
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { refreshCore } from '../src/lib/refresh.ts';

const today = '2026-09-19';

const repo = (id, url, extra = {}) => ({
  id,
  name: id,
  url,
  type: 'repo',
  category: '实战教程',
  stages: [1],
  stars: null,
  language: null,
  maintenance: null,
  pushedAt: null,
  verifiedAt: '2020-01-01',
  note: '',
  ...extra,
});

const article = (id) => ({
  id,
  name: id,
  url: `https://example.com/${id}`,
  type: 'article',
  category: '实战教程',
  stages: [1],
  stars: null,
  language: null,
  maintenance: null,
  pushedAt: null,
  verifiedAt: '2020-01-01',
  note: '',
});

const fixtureAdapter = (byRepo) => async (slug) => {
  const hit = byRepo[slug];
  if (!hit) return { status: 404 };
  if (hit.error) return { status: hit.error, rateRemaining: hit.rateRemaining ?? null };
  return { status: 200, ...hit };
};

// stale fixture：105 天前推送 = 3.5 个月（30 天月），足以击穿 Math.round 的漏报
const ok = { stars: 12345, language: 'Python', pushedAt: '2026-09-10' };
const stale = { stars: 99, language: 'TypeScript', pushedAt: '2026-06-06' };

test('成功仓库写回字段并推进顶层核实日期；入参不被改动', async () => {
  const data = { verifiedAt: '2020-01-01', resources: [repo('a', 'https://github.com/test/a'), article('x')] };
  const report = await refreshCore(data, fixtureAdapter({ 'test/a': ok }), today);

  assert.equal(report.updated.length, 1);
  assert.equal(report.data.verifiedAt, today);
  const written = report.data.resources.find((r) => r.id === 'a');
  assert.equal(written.stars, 12345);
  assert.equal(written.language, 'Python');
  assert.equal(written.pushedAt, '2026-09-10');
  assert.equal(written.verifiedAt, today);
  assert.equal(report.data.resources.find((r) => r.id === 'x').verifiedAt, '2020-01-01');
  // 纯函数：入参保持原样
  assert.equal(data.resources[0].stars, null);
  assert.equal(data.verifiedAt, '2020-01-01');
});

test('推送超 3 个月的仓库进入 stale，月数保留原始浮点并给出建议', async () => {
  const data = {
    verifiedAt: '2020-01-01',
    resources: [repo('a', 'https://github.com/test/a'), repo('b', 'https://github.com/test/b', { maintenance: 'active' })],
  };
  const report = await refreshCore(data, fixtureAdapter({ 'test/a': ok, 'test/b': stale }), today);

  assert.equal(report.updated.length, 2);
  assert.equal(report.stale.length, 1);
  const entry = report.stale[0];
  assert.equal(entry.slug, 'test/b');
  assert.ok(Math.abs(entry.months - 3.5) < 0.001, `月数应为 3.5，实际 ${entry.months}`);
  assert.equal(entry.maintenance, 'active');
  assert.equal(entry.suggest, 'slowing');
  // 新推送仅 9 天的仓库不在提醒之列
  assert.ok(!report.stale.some((s) => s.slug === 'test/a'));
});

test('404 仓库进入 notFound、不中断其余仓库，并阻止核实日期推进', async () => {
  const data = {
    verifiedAt: '2020-01-01',
    resources: [repo('a', 'https://github.com/test/a'), repo('gone', 'https://github.com/test/gone')],
  };
  const report = await refreshCore(data, fixtureAdapter({ 'test/a': ok }), today);

  assert.deepEqual(report.notFound, ['test/gone']);
  assert.equal(report.updated.length, 1);
  assert.equal(report.data.verifiedAt, '2020-01-01');
  assert.equal(report.data.resources.find((r) => r.id === 'gone').verifiedAt, '2020-01-01');
  assert.equal(report.stale.length, 0);
});

test('限流等非 404 失败进入 skipped，不阻止核实日期推进', async () => {
  const data = {
    verifiedAt: '2020-01-01',
    resources: [repo('a', 'https://github.com/test/a'), repo('b', 'https://github.com/test/b')],
  };
  const adapter = fixtureAdapter({ 'test/a': ok, 'test/b': { error: 403, rateRemaining: '57' } });
  const report = await refreshCore(data, adapter, today);

  assert.deepEqual(report.skipped, [{ slug: 'test/b', status: 403, rateRemaining: '57' }]);
  assert.equal(report.updated.length, 1);
  assert.equal(report.data.verifiedAt, today);
  assert.equal(report.data.resources.find((r) => r.id === 'b').stars, null);
});

test('事件按「逐仓 checking → 结果」的顺序发出，供 CLI 打印进度', async () => {
  const data = {
    verifiedAt: '2020-01-01',
    resources: [repo('a', 'https://github.com/test/a'), repo('gone', 'https://github.com/test/gone')],
  };
  const events = [];
  await refreshCore(data, fixtureAdapter({ 'test/a': ok }), today, (e) => events.push(e.type));

  assert.deepEqual(events, ['checking', 'updated', 'checking', 'not-found']);
});
