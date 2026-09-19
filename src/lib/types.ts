export type ResourceType = 'repo' | 'article' | 'course' | 'pdf';
export type Maintenance = 'active' | 'stable' | 'slowing' | 'shifted';

export interface Resource {
  id: string;
  name: string;
  url: string;
  type: ResourceType;
  category: Category;
  /** 建议阶段，可属于多个阶段 */
  stages: number[];
  /** 非 GitHub 资源为 null */
  stars: number | null;
  language: string | null;
  maintenance: Maintenance | null;
  pushedAt: string | null;
  verifiedAt: string;
  note: string;
}

export const TYPE_LABEL: Record<ResourceType, string> = {
  repo: 'GitHub 仓库',
  article: '文章',
  course: '课程',
  pdf: 'PDF',
};

export const MAINTENANCE_LABEL: Record<Maintenance, string> = {
  active: '活跃',
  stable: '内容稳定',
  slowing: '更新放缓',
  shifted: '重心已转移',
};

export const CATEGORIES = [
  '系统课程',
  '清单与路线图',
  '官方框架与SDK',
  '实战教程',
  '协议与生态',
  '评测与可观测性',
  '官方文章与课程',
] as const;

export type Category = (typeof CATEGORIES)[number];
