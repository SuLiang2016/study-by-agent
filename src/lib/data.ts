import resourcesJson from '../data/resources.json';
import stagesJson from '../data/stages.json';
import deprecatedJson from '../data/deprecated.json';
import type { Resource } from './types';

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

export const stagesData = stagesJson as { stages: Stage[] };
export const stages = stagesData.stages;

export const deprecatedData = deprecatedJson as { items: DeprecatedItem[] };

export const resourceById = Object.fromEntries(resources.map((r) => [r.id, r])) as Record<string, Resource>;

/** 每个阶段的学习路径资源 id 列表，供进度统计使用 */
export const pathIdsByStage = Object.fromEntries(
  stages.map((s) => [String(s.num), s.steps.flatMap((step) => step.ids)]),
) as Record<string, string[]>;

export const allPathIds = stages.flatMap((s) => s.steps.flatMap((step) => step.ids));
