// 批量刷新 resources.json 中的 GitHub 数据（star 数 / 主语言 / 最近推送时间 / 核实日期）。
// 用法：npm run refresh:stars   （可选设置 GITHUB_TOKEN 环境变量以提升限流额度）
//
// 注意：本脚本只更新机械数据；维护状态分级、是否被取代需要人工复核——
// 运行结束后会把「推送超过 3 个月」和「API 404」的仓库列出来提醒。
import { readFileSync, writeFileSync } from 'node:fs';

const DATA_URL = new URL('../src/data/resources.json', import.meta.url);
const MONTH_MS = 30 * 24 * 60 * 60 * 1000;
const today = new Date().toISOString().slice(0, 10);

const data = JSON.parse(readFileSync(DATA_URL, 'utf8'));
const repos = data.resources.filter((r) => r.type === 'repo' && r.url.includes('github.com'));

const headers = { 'User-Agent': 'study-by-agent', Accept: 'application/vnd.github+json' };
if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;

const parseRepo = (url) => {
  const { pathname } = new URL(url);
  const [, owner, name] = pathname.split('/');
  return `${owner}/${name}`;
};

const updated = [];
const notFound = [];
const stale = [];

for (const r of repos) {
  const slug = parseRepo(r.url);
  process.stdout.write(`检查 ${slug} ... `);
  const res = await fetch(`https://api.github.com/repos/${slug}`, { headers });

  if (res.status === 404) {
    console.log('404（已不存在？建议移入甄别清单）');
    notFound.push(slug);
    continue;
  }
  if (!res.ok) {
    console.log(`HTTP ${res.status}（${res.headers.get('x-ratelimit-remaining') ?? '?'} 次限额剩余）`);
    continue;
  }

  const j = await res.json();
  r.stars = j.stargazers_count;
  r.language = j.language;
  r.pushedAt = j.pushed_at.slice(0, 10);
  r.verifiedAt = today;
  updated.push(r);

  const ageMonths = Math.round((Date.now() - j.pushed_at.getTime()) / MONTH_MS);
  if (ageMonths > 3) {
    stale.push(`${slug}（${ageMonths} 个月未推送，当前标记：${r.maintenance ?? '—'}）`);
  }
  console.log(`★ ${j.stargazers_count.toLocaleString('en-US')} · 推送 ${r.pushedAt}`);
}

data.verifiedAt = today;
writeFileSync(DATA_URL, JSON.stringify(data, null, 2) + '\n');

console.log(`\n完成：更新 ${updated.length} 个仓库，核实日期 → ${today}`);
if (notFound.length) {
  console.log(`\n⚠ 以下仓库已 404，请人工移入 deprecated.json：\n  ${notFound.join('\n  ')}`);
}
if (stale.length) {
  console.log(`\n⚠ 以下仓库推送已超 3 个月，请人工复核维护状态：\n  ${stale.join('\n  ')}`);
}
if (!notFound.length && !stale.length) {
  console.log('无需要人工复核的仓库。');
}
