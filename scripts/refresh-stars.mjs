// 批量刷新 resources.json 中的 GitHub 数据（star 数 / 主语言 / 最近推送时间 / 核实日期）。
// 用法：npm run refresh:stars   （可选设置 GITHUB_TOKEN 环境变量以提升限流额度）
//
// 注意：本脚本只更新机械数据；维护状态分级、是否被取代需要人工复核——
// 运行结束后会把「推送超过 3 个月」和「API 404」的仓库列出来提醒。
import { readFileSync, writeFileSync } from 'node:fs';
import { suggestMaintenance } from '../src/lib/maintenance.ts';

// 数据文件路径可作为参数传入（测试用临时文件），默认写回真实数据
const DATA_URL = process.argv[2]
  ? new URL(`file://${process.argv[2].replace(/\\/g, '/')}`)
  : new URL('../src/data/resources.json', import.meta.url);
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
  // API 返回的 pushed_at 是 ISO 字符串，需先转 Date
  const pushedAtMs = new Date(j.pushed_at).getTime();
  r.stars = j.stargazers_count;
  r.language = j.language;
  r.pushedAt = j.pushed_at.slice(0, 10);
  r.verifiedAt = today;
  updated.push(r);

  // 与 3 个月的比较必须用原始浮点值：先舍入会把 3.0~3.5 个月误判为未超期；只在显示时取整
  const ageMonths = (Date.now() - pushedAtMs) / MONTH_MS;
  if (ageMonths > 3) {
    const suggest = suggestMaintenance(r.pushedAt, today);
    stale.push(`${slug}（${Math.round(ageMonths)} 个月未推送，当前标记：${r.maintenance ?? '—'}，建议标记：${suggest ?? '需人工判定'}）`);
  }
  console.log(`★ ${j.stargazers_count.toLocaleString('en-US')} · 推送 ${r.pushedAt}`);
}

// 顶层 verifiedAt 描述「最近一次完整核实」的快照日期：只有全部仓库都核实成功才推进，
// 否则部分失败的条目还留着旧数据，顶层日期先行会自相矛盾
if (!notFound.length) {
  data.verifiedAt = today;
}
writeFileSync(DATA_URL, JSON.stringify(data, null, 2) + '\n');

console.log(`\n完成：更新 ${updated.length} 个仓库${notFound.length ? '' : `，核实日期 → ${today}`}`);
if (notFound.length) {
  console.log(`\n⚠ 以下仓库已 404，请人工移入 deprecated.json：\n  ${notFound.join('\n  ')}`);
}
if (stale.length) {
  console.log(`\n⚠ 以下仓库推送已超 3 个月，请人工复核维护状态：\n  ${stale.join('\n  ')}`);
}
if (!notFound.length && !stale.length) {
  console.log('无需要人工复核的仓库。');
}
