// 批量刷新 resources.json 中的 GitHub 数据（star 数 / 主语言 / 最近推送时间 / 核实日期）。
// 用法：npm run refresh:stars   （可选设置 GITHUB_TOKEN 环境变量以提升限流额度）
//
// 决策逻辑在 src/lib/refresh.ts 的 refreshCore；本文件只是 CLI 壳——拼 adapter、读写文件、打印。
import { readFileSync, writeFileSync } from 'node:fs';
import { refreshCore } from '../src/lib/refresh.ts';

// 数据文件路径可作为参数传入（测试用临时文件），默认写回真实数据
const DATA_URL = process.argv[2]
  ? new URL(`file://${process.argv[2].replace(/\\/g, '/')}`)
  : new URL('../src/data/resources.json', import.meta.url);
const today = new Date().toISOString().slice(0, 10);

// 真 adapter：GitHub REST API 形状（stargazers_count / pushed_at ISO 串 / 限流头）在此翻译为领域字段
function createGitHubFetchRepo() {
  const headers = { 'User-Agent': 'study-by-agent', Accept: 'application/vnd.github+json' };
  if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  return async (slug) => {
    const res = await fetch(`https://api.github.com/repos/${slug}`, { headers });
    if (res.status === 404) return { status: 404 };
    if (!res.ok) {
      return { status: res.status, rateRemaining: res.headers.get('x-ratelimit-remaining') };
    }
    const j = await res.json();
    // API 返回的 pushed_at 是 ISO 字符串，取日期部分
    return { status: 200, stars: j.stargazers_count, language: j.language, pushedAt: j.pushed_at.slice(0, 10) };
  };
}

const data = JSON.parse(readFileSync(DATA_URL, 'utf8'));

const report = await refreshCore(data, createGitHubFetchRepo(), today, (event) => {
  switch (event.type) {
    case 'checking':
      process.stdout.write(`检查 ${event.slug} ... `);
      break;
    case 'updated':
      console.log(`★ ${event.stars.toLocaleString('en-US')} · 推送 ${event.pushedAt}`);
      break;
    case 'not-found':
      console.log('404（已不存在？建议移入甄别清单）');
      break;
    case 'skipped':
      console.log(`HTTP ${event.status}（${event.rateRemaining ?? '?'} 次限额剩余）`);
      break;
  }
});

writeFileSync(DATA_URL, JSON.stringify(report.data, null, 2) + '\n');

const { updated, notFound, skipped, stale } = report;
console.log(`\n完成：更新 ${updated.length} 个仓库${notFound.length ? '' : `，核实日期 → ${today}`}`);
if (notFound.length) {
  console.log(`\n⚠ 以下仓库已 404，请人工移入 deprecated.json：\n  ${notFound.join('\n  ')}`);
}
if (stale.length) {
  console.log(
    `\n⚠ 以下仓库推送已超 3 个月，请人工复核维护状态：\n  ${stale
      .map(
        (s) =>
          `${s.slug}（${Math.round(s.months)} 个月未推送，当前标记：${s.maintenance ?? '—'}，建议标记：${s.suggest ?? '需人工判定'}）`,
      )
      .join('\n  ')}`,
  );
}
if (!notFound.length && !stale.length) {
  console.log('无需要人工复核的仓库。');
}
