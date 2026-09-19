import resourcesJson from '../data/resources.json';
import stagesJson from '../data/stages.json';
import deprecatedJson from '../data/deprecated.json';
import { CATEGORIES, TYPE_LABEL, type Resource } from './types';
import { MAINTENANCE_LABEL } from './maintenance';

export interface StageStep {
  order: string;
  ids: string[];
  badge?: string;
}

export interface Stage {
  num: number;
  title: string;
  duration: string;
  goal: string;
  steps: StageStep[];
  rationale: string;
}

export interface DeprecatedItem {
  name: string;
  url: string | null;
  status: string;
  detail: string;
  evidence: { label: string; url: string | null }[];
}

export const resourcesData = resourcesJson as { verifiedAt: string; resources: Resource[] };
export const resources = resourcesData.resources;
export const verifiedAt = resourcesData.verifiedAt;

// 构建时校验数据合法性：枚举字段写错会在 build/dev 立刻报错，而不是静默漏筛
const VALID_STAGES = new Set([1, 2, 3]);
for (const r of resources) {
  if (!(r.type in TYPE_LABEL)) throw new Error(`资源 ${r.id} 的 type 非法：${r.type}`);
  if (!CATEGORIES.includes(r.category)) throw new Error(`资源 ${r.id} 的 category 非法：${r.category}`);
  if (r.maintenance !== null && !(r.maintenance in MAINTENANCE_LABEL)) {
    throw new Error(`资源 ${r.id} 的 maintenance 非法：${r.maintenance}`);
  }
  if (!r.stages.length || !r.stages.every((s) => VALID_STAGES.has(s))) {
    throw new Error(`资源 ${r.id} 的 stages 非法：${JSON.stringify(r.stages)}`);
  }
  // 与术语表一致：GitHub 仓库必有 star 数，非仓库类型必无
  if ((r.type === 'repo') !== (r.stars !== null)) {
    throw new Error(`资源 ${r.id} 的 stars 与 type 不一致：type=${r.type}, stars=${r.stars}`);
  }
}

export const stagesData = stagesJson as { stages: Stage[] };
export const stages = stagesData.stages;

export const deprecatedData = deprecatedJson as { items: DeprecatedItem[] };

export const resourceById: Record<string, Resource> = Object.fromEntries(
  resources.map((r) => [r.id, r]),
);

// 学习路径引用的资源 id 必须真实存在：写错在 build/dev 立刻报错，而不是渲染成 undefined
for (const s of stages) {
  for (const step of s.steps) {
    for (const id of step.ids) {
      if (!(id in resourceById)) throw new Error(`阶段 ${s.num} 的 step 引用了不存在的资源 id：${id}`);
    }
  }
}

/** 每个阶段的学习路径资源 id 列表，供进度统计使用 */
export const pathIdsByStage: Record<string, string[]> = Object.fromEntries(
  stages.map((s) => [String(s.num), s.steps.flatMap((step) => step.ids)]),
);

export const allPathIds = stages.flatMap((s) => s.steps.flatMap((step) => step.ids));
