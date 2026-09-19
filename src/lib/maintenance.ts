/**
 * 维护状态 module：四级分级的标签、筛选选项、展示约定与可机械判定的建议逻辑收拢于此。
 * 判定标准的权威表述在 methodology.md；「内容稳定」「重心已转移」依赖人工判断，机械函数不越界。
 */
import type { Maintenance } from './types';

export const MAINTENANCE_LABEL: Record<Maintenance, string> = {
  active: '活跃',
  stable: '内容稳定',
  slowing: '更新放缓',
  shifted: '重心已转移',
};

/** 非 GitHub 仓库无维护状态：'none' 是 data 属性、筛选与 CSS（.maint-none）共用的哨兵值 */
const NONE: MaintenanceDisplay = { key: 'none', label: '—', className: 'maint-none' };

export interface MaintenanceDisplay {
  /** data-maintenance 属性与筛选选项共用的值 */
  key: string;
  label: string;
  /** 徽章修饰类，对应 global.css 的 .maint-* */
  className: string;
}

export function maintenanceDisplay(m: Maintenance | null): MaintenanceDisplay {
  if (!m) return NONE;
  return { key: m, label: MAINTENANCE_LABEL[m], className: `maint-${m}` };
}

/** 资源库筛选下拉的选项（含非仓库哨兵，数组顺序即展示顺序） */
export const MAINTENANCE_FILTER_OPTIONS: { value: string; label: string }[] = [
  ...Object.entries(MAINTENANCE_LABEL).map(([value, label]) => ({ value, label })),
  { value: NONE.key, label: '—（非仓库）' },
];

const MONTH_MS = 30 * 24 * 60 * 60 * 1000;

/**
 * 机械建议：只覆盖判定表中可自动判定的两级——活跃（≤2 个月）、更新放缓（>3 个月）。
 * 2~3 个月的空档与「内容稳定 / 重心已转移」属人工判断，返回 null。
 * 月份比较必须用原始浮点值：先舍入会把 3.0~3.5 个月误判为未超期。
 */
export function suggestMaintenance(pushedAt: string | null, verifiedAt: string): Maintenance | null {
  if (!pushedAt) return null;
  const months = (new Date(verifiedAt).getTime() - new Date(pushedAt).getTime()) / MONTH_MS;
  if (months <= 2) return 'active';
  if (months > 3) return 'slowing';
  return null;
}
