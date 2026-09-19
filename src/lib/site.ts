import { verifiedAt } from './data';

/** 调研指南本身的核实日期：历史事实，不随数据刷新推进（区别于 resources.json 的 verifiedAt 快照日） */
export const GUIDE_VERIFIED_AT = '2026-09-11';

export const SITE = {
  title: 'AI Agent 学习指南',
  subtitle: '个人开发者 · GitHub 优先路线',
  description: `为个人开发者整理的 AI Agent 学习资源指南：三阶段学习路径、可筛选资源库、过时资源甄别清单。所有 GitHub 仓库均于 ${verifiedAt} 经 API 逐一核实。`,
  repo: 'https://github.com/SuLiang2016/study-by-agent',
};

const BASE = import.meta.env.BASE_URL.replace(/\/+$/, '');

/** 拼接站点内路径（自动带上 GitHub Pages 的 base） */
export const url = (path = '/') => `${BASE}${path.startsWith('/') ? path : `/${path}`}`;
