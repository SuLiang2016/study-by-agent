/**
 * refresh-stars 的纯核心：逐仓更新、过期判定、核实日期推进规则。
 * CLI 壳（scripts/refresh-stars.mjs）只负责参数、真实 adapter、文件读写与打印。
 *
 * seam 在 fetchRepo 函数参数上：真 adapter 住 CLI（fetch + GitHub API 形状翻译），
 * 测试 adapter 是 fixture 表——两个 adapter，seam 成立。
 */
import { suggestMaintenance } from './maintenance.ts';
import type { Resource } from './types';

export interface RefreshData {
  verifiedAt: string;
  resources: Resource[];
}

/** fetchRepo adapter 的返回：GitHub API 形状已翻译为领域字段 */
export interface RepoFetched {
  /** 200 携带字段；404 = 已不存在；其余 = 跳过（如限流） */
  status: number;
  stars?: number;
  language?: string | null;
  /** YYYY-MM-DD */
  pushedAt?: string;
  rateRemaining?: string | null;
}

export interface UpdatedRepo {
  slug: string;
  stars: number;
  language: string | null;
  pushedAt: string;
}

export interface SkippedRepo {
  slug: string;
  status: number;
  rateRemaining: string | null;
}

export interface StaleRepo {
  slug: string;
  /** 距核实日期的月数，原始浮点值，显示时才取整 */
  months: number;
  maintenance: string | null;
  suggest: string | null;
}

export interface RefreshReport {
  /** 更新后的完整数据（新对象，不改动入参） */
  data: RefreshData;
  updated: UpdatedRepo[];
  notFound: string[];
  skipped: SkippedRepo[];
  stale: StaleRepo[];
}

export type RefreshEvent =
  | { type: 'checking'; slug: string }
  | { type: 'updated'; slug: string; stars: number; language: string | null; pushedAt: string }
  | { type: 'not-found'; slug: string }
  | { type: 'skipped'; slug: string; status: number; rateRemaining: string | null };

const MONTH_MS = 30 * 24 * 60 * 60 * 1000;

export function parseRepoSlug(url: string): string {
  const { pathname } = new URL(url);
  const [, owner, name] = pathname.split('/');
  return `${owner}/${name}`;
}

export async function refreshCore(
  data: RefreshData,
  fetchRepo: (slug: string) => Promise<RepoFetched>,
  today: string,
  onEvent?: (event: RefreshEvent) => void,
): Promise<RefreshReport> {
  const emit = (event: RefreshEvent) => onEvent?.(event);
  const updated: UpdatedRepo[] = [];
  const notFound: string[] = [];
  const skipped: SkippedRepo[] = [];
  const stale: StaleRepo[] = [];
  const resources: Resource[] = [];

  for (const r of data.resources) {
    if (r.type !== 'repo' || !r.url.includes('github.com')) {
      resources.push(r);
      continue;
    }
    const slug = parseRepoSlug(r.url);
    emit({ type: 'checking', slug });
    const { status, stars, language, pushedAt, rateRemaining } = await fetchRepo(slug);

    if (status === 404) {
      emit({ type: 'not-found', slug });
      notFound.push(slug);
      resources.push(r);
      continue;
    }
    const ok = status >= 200 && status < 300;
    if (!ok || stars === undefined || !pushedAt) {
      emit({ type: 'skipped', slug, status, rateRemaining: rateRemaining ?? null });
      skipped.push({ slug, status, rateRemaining: rateRemaining ?? null });
      resources.push(r);
      continue;
    }

    resources.push({ ...r, stars, language: language ?? null, pushedAt, verifiedAt: today });
    updated.push({ slug, stars, language: language ?? null, pushedAt });
    emit({ type: 'updated', slug, stars, language: language ?? null, pushedAt });

    // 月份比较必须用原始浮点值：先舍入会把 3.0~3.5 个月误判为未超期
    const months = (new Date(today).getTime() - new Date(pushedAt).getTime()) / MONTH_MS;
    if (months > 3) {
      stale.push({ slug, months, maintenance: r.maintenance, suggest: suggestMaintenance(pushedAt, today) });
    }
  }

  // 顶层 verifiedAt 描述「最近一次完整核实」的快照日期：只有无 404 才推进，
  // 否则部分失败的条目还留着旧数据，顶层日期先行会自相矛盾
  return {
    data: { verifiedAt: notFound.length ? data.verifiedAt : today, resources },
    updated,
    notFound,
    skipped,
    stale,
  };
}
