---
layout: ../layouts/BaseLayout.astro
title: 方法论
description: 资源核实方式、维护状态判定标准、star 数据更新流程与仍未核实的事项。
prose: true
---

# 方法论

本站全部内容整理自一份经核实的调研指南（2026-09-11）。这一页说明数据是怎么来的、怎么判定的、以及将来如何更新——引用本站数据前，请先读这一页。

## 数据从哪来

- **GitHub 数据**：全部来自 GitHub REST API（`GET /repos/{owner}/{repo}`），字段为 `stargazers_count`（star 数）、`language`（主语言）、`pushed_at`（最近推送时间）、`archived`（是否归档）。
- **非 GitHub 资源**（官方文章、课程、PDF）：通过直接访问官方页面或搜索官方公告核实。
- **诚实原则**：凡未能核实的信息，一律明确标注「未核实」，不做推断。

## 维护状态怎么判定

| 状态 | 判定标准 |
| --- | --- |
| 活跃 | `pushed_at` 距核实日期 2 个月以内 |
| 更新放缓 | `pushed_at` 距核实日期超过 3 个月，且仍在推送 |
| 内容稳定 | 文档型仓库，近一年无更新但内容不过时（如 12-factor-agents） |
| 重心已转移 | 官方公告明确将学习/维护重心移至继任项目（如 Semantic Kernel → Agent Framework） |

「是否被取代」的判断结合官方公告作出，依据一律附在[甄别清单](/study-by-agent/deprecated/)中。

## star 数据如何更新

star 数变动很快，快照数据会过时。本站提供了批量刷新脚本：

```bash
# 调用 GitHub API 更新 resources.json 中的 star 数、主语言、最近推送时间与核实日期
npm run refresh:stars
```

脚本只解决机械部分：

- **自动更新**：star 数、主语言、`pushed_at`、核实日期；
- **需要人工复核**：维护状态分级、是否被取代——脚本会把「推送时间超过 3 个月」和「API 404」的仓库打印出来提醒你；
- 有 GitHub API 限流顾虑时，设置环境变量 `GITHUB_TOKEN` 再运行。

可选读 API 较高（每小时 60 次），本站 27 个仓库一次跑完绰绰有余。

## 仍未核实的事项

以下信息在核实日无法确认，使用时请以官方页面为准：

- Berkeley Agentic AI MOOC 2026 年最新一期的具体开课安排（仅核实到 2025 秋季迭代）；
- LangChain Academy 各课程当前是否免费（页面未标注）；
- huggingface/agents-course 的免费认证当前是否开放（以 huggingface.co/learn/agents-course 为准）；
- `anthropics/claude-agent-sdk-typescript` 存在且活跃，但 GitHub 语言统计显示为 Shell（仓库主要封装 Claude Code CLI），未进一步核对内容。

## 未收录说明

- `e2b-dev/ai-agents`：经 API 核实已 404，未收录；
- `openai/swarm`：仅列入[甄别清单](/study-by-agent/deprecated/)，不作为学习资源收录。
