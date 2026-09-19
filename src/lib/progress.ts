/**
 * 学习进度 module：勾选状态的存储与页面 wiring 收拢于此。
 *
 * External interface：
 * - progressPayload(ids)：构建期把 { byStage, all } 序列化为 payload 字符串，
 *   页面经 <script type="application/json" id="path-ids"> 注入（包裹约定见 PAYLOAD_ID）
 * - initProgress(root)：运行期接管全部 DOM wiring，每个页面调用一次
 *
 * DOM 约定（interface 的一部分，页面与 ResourceCard 按此书写标记）：
 * - [data-progress-toggle][data-id]，内含可选 [data-progress-label] 文案位
 * - [data-progress-count][data-stage] 与 [data-progress-bar][data-stage]（bar 内含 <i> 作填充）
 * - [data-progress-reset] 清空按钮
 * - payload 元素缺失或损坏时只跳过计数与进度条，不影响 toggle
 *
 * 存储格式（私有）：localStorage key 为 STORAGE_KEY，值为 id 字符串数组的 JSON。
 */
const STORAGE_KEY = 'progress';
const PAYLOAD_ID = 'path-ids';
const RESET_CONFIRM_TEXT = '确定清空全部学习进度吗？';

interface ProgressPayload {
  byStage: Record<string, string[]>;
  all: string[];
}

/** 构建期序列化。payload 的 JSON 形状是私有实现，页面不得手工构造。 */
export function progressPayload(ids: ProgressPayload): string {
  return JSON.stringify(ids);
}

/** 运行期解析 payload。任何缺失、损坏或形状错误都返回 null，由调用方跳过进度展示。 */
export function parseProgressPayload(text: string | null | undefined): ProgressPayload | null {
  if (!text) return null;
  try {
    const { byStage, all } = JSON.parse(text);
    if (typeof byStage !== 'object' || byStage === null || !Array.isArray(all)) return null;
    return { byStage, all };
  } catch {
    return null;
  }
}

/** stage 为 'all' 表示「本页 payload 的 all 集合」，其余按 byStage 查找，查不到返回空集。 */
export function idsFor(payload: ProgressPayload, stage?: string): string[] {
  if (stage === 'all') return payload.all;
  if (!stage) return [];
  return payload.byStage[stage] || [];
}

export function countIn(done: ReadonlySet<string>, ids: string[]): number {
  return ids.filter((id) => done.has(id)).length;
}

export function percentDone(done: ReadonlySet<string>, ids: string[]): number {
  return ids.length ? (countIn(done, ids) / ids.length) * 100 : 0;
}

export function loadProgress(storage: Pick<Storage, 'getItem'>): Set<string> {
  try {
    return new Set(JSON.parse(storage.getItem(STORAGE_KEY) || '[]'));
  } catch {
    return new Set();
  }
}

export function saveProgress(storage: Pick<Storage, 'setItem'>, ids: ReadonlySet<string>): void {
  storage.setItem(STORAGE_KEY, JSON.stringify([...ids]));
}

export function clearProgress(storage: Pick<Storage, 'removeItem'>): void {
  storage.removeItem(STORAGE_KEY);
}

/** 全量接线：读取 localStorage、渲染 toggle/计数/进度条、委托点击事件。 */
export function initProgress(root: Document = document): void {
  const refresh = () => {
    const done = loadProgress(localStorage);

    root.querySelectorAll<HTMLElement>('[data-progress-toggle]').forEach((btn) => {
      const isDone = done.has(btn.dataset.id!);
      btn.classList.toggle('is-done', isDone);
      btn.setAttribute('aria-pressed', String(isDone));
      const label = btn.querySelector<HTMLElement>('[data-progress-label]');
      if (label) label.textContent = isDone ? '已学' : '标记已学';
    });

    const payload = parseProgressPayload(root.getElementById(PAYLOAD_ID)?.textContent);
    if (!payload) return;

    root.querySelectorAll<HTMLElement>('[data-progress-count]').forEach((el) => {
      const ids = idsFor(payload, el.dataset.stage);
      el.textContent = `${countIn(done, ids)}/${ids.length}`;
    });
    root.querySelectorAll<HTMLElement>('[data-progress-bar]').forEach((el) => {
      const ids = idsFor(payload, el.dataset.stage);
      const fill = el.querySelector<HTMLElement>('i');
      if (fill) fill.style.width = `${percentDone(done, ids)}%`;
    });
  };

  root.addEventListener('click', (e) => {
    const toggle = (e.target as HTMLElement).closest<HTMLElement>('[data-progress-toggle]');
    if (toggle) {
      const done = loadProgress(localStorage);
      const id = toggle.dataset.id!;
      if (done.has(id)) done.delete(id);
      else done.add(id);
      saveProgress(localStorage, done);
      refresh();
      return;
    }
    if ((e.target as HTMLElement).closest('[data-progress-reset]')) {
      if (confirm(RESET_CONFIRM_TEXT)) {
        clearProgress(localStorage);
        refresh();
      }
    }
  });

  refresh();
}
