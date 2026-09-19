// 直接 import .ts：依赖 Node ≥22.18 的默认类型剥离，无需编译步骤
import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  progressPayload,
  parseProgressPayload,
  idsFor,
  countIn,
  percentDone,
  loadProgress,
  saveProgress,
  clearProgress,
} from '../src/lib/progress.ts';

const fakeStorage = (initial = {}) => {
  const map = new Map(Object.entries(initial));
  return {
    getItem: (key) => (map.has(key) ? map.get(key) : null),
    setItem: (key, value) => map.set(key, String(value)),
    removeItem: (key) => map.delete(key),
  };
};

test('progressPayload 与 parseProgressPayload 往返一致', () => {
  const ids = { byStage: { '1': ['a', 'b'], '2': ['c'] }, all: ['a', 'b', 'c'] };
  assert.deepEqual(parseProgressPayload(progressPayload(ids)), ids);
});

test('parseProgressPayload：缺失、损坏、形状错误一律返回 null', () => {
  assert.equal(parseProgressPayload(null), null);
  assert.equal(parseProgressPayload(undefined), null);
  assert.equal(parseProgressPayload(''), null);
  assert.equal(parseProgressPayload('{oops'), null);
  assert.equal(parseProgressPayload('{"all":[]}'), null); // 缺 byStage
  assert.equal(parseProgressPayload('{"byStage":null,"all":[]}'), null);
  assert.equal(parseProgressPayload('{"byStage":{},"all":"x"}'), null); // all 非数组
});

test('idsFor：all 取全集，未知与缺失阶段取空集', () => {
  const payload = { byStage: { '1': ['a'] }, all: ['a', 'b'] };
  assert.deepEqual(idsFor(payload, 'all'), ['a', 'b']);
  assert.deepEqual(idsFor(payload, '1'), ['a']);
  assert.deepEqual(idsFor(payload, '9'), []);
  assert.deepEqual(idsFor(payload, undefined), []);
});

test('countIn 与 percentDone：空集为 0，否则按比例', () => {
  const done = new Set(['a']);
  assert.equal(countIn(done, ['a', 'b', 'c']), 1);
  assert.equal(countIn(new Set(), ['a', 'b']), 0);
  assert.equal(percentDone(done, ['a', 'b']), 50);
  assert.equal(percentDone(done, []), 0);
});

test('loadProgress / saveProgress / clearProgress：往返与容错', () => {
  const storage = fakeStorage();
  assert.equal(loadProgress(storage).size, 0);

  saveProgress(storage, new Set(['a', 'b']));
  assert.deepEqual([...loadProgress(storage)], ['a', 'b']);

  clearProgress(storage);
  assert.equal(loadProgress(storage).size, 0);

  assert.equal(loadProgress(fakeStorage({ progress: '{oops' })).size, 0);
  assert.equal(loadProgress(fakeStorage({ progress: 'null' })).size, 0);
});
