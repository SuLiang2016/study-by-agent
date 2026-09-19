// 直接 import .ts：依赖 Node ≥22.18 的默认类型剥离，无需编译步骤
import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  maintenanceDisplay,
  MAINTENANCE_FILTER_OPTIONS,
  suggestMaintenance,
} from '../src/lib/maintenance.ts';

test('maintenanceDisplay：null 走 none 哨兵，四级逐一映射', () => {
  assert.deepEqual(maintenanceDisplay(null), { key: 'none', label: '—', className: 'maint-none' });
  assert.deepEqual(maintenanceDisplay('active'), { key: 'active', label: '活跃', className: 'maint-active' });
  assert.deepEqual(maintenanceDisplay('stable'), { key: 'stable', label: '内容稳定', className: 'maint-stable' });
  assert.deepEqual(maintenanceDisplay('slowing'), { key: 'slowing', label: '更新放缓', className: 'maint-slowing' });
  assert.deepEqual(maintenanceDisplay('shifted'), { key: 'shifted', label: '重心已转移', className: 'maint-shifted' });
});

test('MAINTENANCE_FILTER_OPTIONS：顺序快照，none 哨兵在末尾', () => {
  assert.deepEqual(MAINTENANCE_FILTER_OPTIONS, [
    { value: 'active', label: '活跃' },
    { value: 'stable', label: '内容稳定' },
    { value: 'slowing', label: '更新放缓' },
    { value: 'shifted', label: '重心已转移' },
    { value: 'none', label: '—（非仓库）' },
  ]);
});

test('suggestMaintenance：判定表可机械部分的行为边界', () => {
  const verifiedAt = '2026-09-11';
  assert.equal(suggestMaintenance(null, verifiedAt), null);
  assert.equal(suggestMaintenance('2026-09-11', verifiedAt), 'active'); // 0 个月
  assert.equal(suggestMaintenance('2026-07-13', verifiedAt), 'active'); // 60 天 = 2.0，以内
  assert.equal(suggestMaintenance('2026-07-12', verifiedAt), null); // 61 天，落入 2~3 个月空档
  assert.equal(suggestMaintenance('2026-06-13', verifiedAt), null); // 90 天 = 3.0，不算「超过」
  assert.equal(suggestMaintenance('2026-06-10', verifiedAt), 'slowing'); // 93 天
  assert.equal(suggestMaintenance('2026-05-29', verifiedAt), 'slowing'); // 105 天 = 3.5，回归 Math.round 误判
});
