/**
 * 资源库筛选 module：筛选状态、卡片可见性与计数/空态 wiring 收拢于此。
 *
 * External interface：
 * - readFilters(selects)：从 [data-filter] 下拉收集当前筛选状态
 * - cardMatches(filters, dataset)：纯谓词，一张卡的 dataset 在当前筛选下是否可见
 * - initCatalogFilters(root)：运行期全量接线，catalog 页调用一次
 *
 * DOM 约定（interface 的一部分，catalog.astro 与 ResourceCard 按此书写标记）：
 * - [data-filter] 下拉，dataset.filter 为维度名（stage/category/type/maintenance），value 'any' 表示不过滤
 * - [data-resource-card] 卡片，携带 data-stages（逗号分隔多值）与 data-category / data-type / data-maintenance
 * - [data-result-count] 计数位、[data-empty] 空态、[data-filter-reset] 清除按钮
 */

export interface CatalogFilters {
  stage: string;
  category: string;
  type: string;
  maintenance: string;
}

const ANY = 'any';

export function readFilters(
  selects: Iterable<{ dataset: Record<string, string | undefined>; value: string }>,
): CatalogFilters {
  const filters: CatalogFilters = { stage: ANY, category: ANY, type: ANY, maintenance: ANY };
  for (const { dataset, value } of selects) {
    const key = dataset.filter;
    if (key === 'stage' || key === 'category' || key === 'type' || key === 'maintenance') {
      filters[key] = value;
    }
  }
  return filters;
}

/** 'any' 表示该维度不过滤；stage 对 data-stages 的逗号分隔多值列表做包含判断。 */
export function cardMatches(filters: CatalogFilters, dataset: Record<string, string | undefined>): boolean {
  return (
    (filters.stage === ANY || (dataset.stages ?? '').split(',').includes(filters.stage)) &&
    (filters.category === ANY || dataset.category === filters.category) &&
    (filters.type === ANY || dataset.type === filters.type) &&
    (filters.maintenance === ANY || dataset.maintenance === filters.maintenance)
  );
}

/** 全量接线：读取下拉、按当前筛选切换卡片可见性、更新计数与空态、绑定 change 与清除。 */
export function initCatalogFilters(root: Document = document): void {
  const selects = [...root.querySelectorAll<HTMLSelectElement>('[data-filter]')];
  const cards = [...root.querySelectorAll<HTMLElement>('[data-resource-card]')];
  const countEl = root.querySelector<HTMLElement>('[data-result-count]');
  const emptyEl = root.querySelector<HTMLElement>('[data-empty]');

  const applyFilters = () => {
    const filters = readFilters(selects);
    let shown = 0;
    for (const card of cards) {
      const visible = cardMatches(filters, card.dataset);
      card.hidden = !visible;
      if (visible) shown++;
    }
    if (countEl) countEl.textContent = String(shown);
    if (emptyEl) emptyEl.hidden = shown !== 0;
  };

  selects.forEach((s) => s.addEventListener('change', applyFilters));
  root.querySelector('[data-filter-reset]')?.addEventListener('click', () => {
    selects.forEach((s) => (s.value = ANY));
    applyFilters();
  });
  applyFilters();
}
