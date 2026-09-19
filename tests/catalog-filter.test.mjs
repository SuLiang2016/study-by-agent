// 直接 import .ts：依赖 Node ≥22.18 的默认类型剥离，无需编译步骤
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { cardMatches, readFilters } from '../src/lib/catalog-filter.ts';

const ANY_ALL = { stage: 'any', category: 'any', type: 'any', maintenance: 'any' };

test('cardMatches：全 any 放行一切卡片，含缺属性的卡', () => {
  assert.equal(cardMatches(ANY_ALL, {}), true);
  assert.equal(cardMatches(ANY_ALL, { stages: '1', category: '教程' }), true);
});

test('cardMatches：stage 对逗号分隔多值做包含判断，缺数据不误放行', () => {
  assert.equal(cardMatches({ ...ANY_ALL, stage: '2' }, { stages: '1,2' }), true);
  assert.equal(cardMatches({ ...ANY_ALL, stage: '3' }, { stages: '1,2' }), false);
  assert.equal(cardMatches({ ...ANY_ALL, stage: '2' }, {}), false);
});

test('cardMatches：其余维度精确匹配，any 维度透传', () => {
  const card = { category: '框架', type: 'repo', maintenance: 'active' };
  assert.equal(cardMatches({ ...ANY_ALL, category: '框架' }, card), true);
  assert.equal(cardMatches({ ...ANY_ALL, category: '教程' }, card), false);
  assert.equal(cardMatches({ ...ANY_ALL, type: 'repo' }, card), true);
  assert.equal(cardMatches({ ...ANY_ALL, maintenance: 'stable' }, card), false);
});

test('readFilters：按 dataset.filter 收集维度，未知维度忽略，空输入全 any', () => {
  const selects = [
    { dataset: { filter: 'stage' }, value: '1' },
    { dataset: { filter: 'category' }, value: 'any' },
    { dataset: { filter: 'bogus' }, value: 'x' },
  ];
  assert.deepEqual(readFilters(selects), { stage: '1', category: 'any', type: 'any', maintenance: 'any' });
  assert.deepEqual(readFilters([]), ANY_ALL);
});
