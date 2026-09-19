# 个人开发者 AI Agent 学习资源指南（GitHub 优先）

> **调研日期：2026-09-11**
> 核实方式：所有 GitHub 仓库的 star 数、主语言、维护状态（最近推送时间 `pushed_at`）均于 2026-09-11 通过 GitHub REST API（`https://api.github.com/repos/{owner}/{repo}`）逐一核实；非 GitHub 资源通过直接访问官方页面或搜索官方公告核实。凡未能核实的信息，均明确标注「未核实」。
> 维护状态判定：`pushed_at` 距今 2 个月以内视为「活跃」，超过 3 个月视为「放缓/内容稳定」，并结合官方公告判断是否被取代。

---

## 如何使用本指南

1. **先走路径，再查清单。** 本指南的主体是一条三阶段学习路径（见下一节）；分类资源清单是路径的支撑材料，按需取用，不必从头到尾刷完。
2. **不要试图学完所有框架。** AI Agent 框架更迭极快（2025-2026 间已发生 AutoGen + Semantic Kernel 合并为 Microsoft Agent Framework、OpenAI Swarm 被 Agents SDK 取代、Anthropic SDK 更名等变动）。正确的策略是：**深入一个框架，理解所有框架共同的模式**（工具调用、上下文管理、编排、评测）。
3. **警惕过时资源。** 文末专门列出「已被取代或停止维护」的资源清单，搜索教程时注意甄别。
4. **动手优先。** 对懂编程的学习者，读 10 篇文章不如写 1 个能跑的 Agent。每阶段都配了可直接运行的代码仓库。

---

## 建议学习路径

### 阶段 1：入门——建立心智模型（约 1~2 周）

**目标：** 不写代码或少量代码，搞清楚 Agent 是什么、不是什么，掌握核心概念（工具调用 / tool use、ReAct 循环、工作流 vs 智能体、上下文管理）。

| 顺序 | 资源 | 说明 |
|---|---|---|
| ① | [Anthropic《Building Effective Agents》](https://www.anthropic.com/research/building-effective-agents)（2024-12，非 GitHub） | 不到一万字就把「工作流 vs 智能体」和几种可组合模式（提示链、路由、并行、编排者-工作者、评估者-优化者）讲透，**先读它建立判断力** |
| ② | [microsoft/ai-agents-for-beginners](https://github.com/microsoft/ai-agents-for-beginners)（74.4k★） | 18 节视频课 + 代码，覆盖 Agent 基础、设计模式、工具使用、MCP 等，是目前最系统的入门课 |
| ③（可选） | [OpenAI《A practical guide to building agents》](https://cdn.openai.com/business-guides-and-resources/a-practical-guide-to-building-agents.pdf)（34 页 PDF，非 GitHub） | 偏业务视角，快速补齐「什么时候该上 Agent」的决策框架 |
| ④（可选） | [Berkeley Agentic AI / LLM Agents MOOC](http://rdi.berkeley.edu/llm-agents/f24)（非 GitHub） | 加州大学正式课程（CS294/194-196），体系化理论，2025 秋季迭代已上线，适合想深挖理论的人 |
| ⑤（按需） | [microsoft/generative-ai-for-beginners](https://github.com/microsoft/generative-ai-for-beginners)（119.6k★） | 若你连 LLM API 调用、function calling、RAG 基础都不熟，先补这 21 课再学 Agent |

> **为什么这个顺序：** 心智模型先行可以避免「工具先行」的陷阱——很多人上来就学某个框架，结果框架一换全部作废。Anthropic 的文章给了你与框架无关的模式语言，ai-agents-for-beginners 再把这些模式落到代码。

### 阶段 2：动手——用框架做出第一个能跑的 Agent（约 4~8 周）

**目标：** 完整做出 2~3 个单智能体应用（带工具调用、RAG、记忆），理解每种框架共同的模式差异。

| 顺序 | 资源 | 说明 |
|---|---|---|
| ① | [huggingface/agents-course](https://github.com/huggingface/agents-course)（32.4k★） | Hugging Face 官方免费课程，覆盖 smolagents / LangGraph / LlamaIndex 三条技术线，带认证（以官网为准），是「动手」阶段最好的骨架 |
| ②（主线框架，二选一深挖） | [langchain-ai/langgraph](https://github.com/langchain-ai/langgraph)（41.5k★）或 [openai/openai-agents-python](https://github.com/openai/openai-agents-python)（29.4k★） | LangGraph 是图编排的事实标准、生态最全；OpenAI Agents SDK 更轻量、概念最少，适合快速上手多智能体交接 |
| ③ | [NirDiamant/GenAI_Agents](https://github.com/NirDiamant/GenAI_Agents)（24.2k★） | 50+ 个可运行 notebook，按难度分级演示各种 Agent 模式，是阶段 2 的「习题集」 |
| ④ | [humanlayer/12-factor-agents](https://github.com/humanlayer/12-factor-agents)（25.8k★） | 12 条「生产级 Agent」设计原则，教你**不依赖框架**思考 Agent 架构，读完再看任何框架都会通透 |
| ⑤（找灵感） | [Shubhamsaboo/awesome-llm-apps](https://github.com/Shubhamsaboo/awesome-llm-apps)（137.2k★） | 100+ 个开箱即跑的 Agent/RAG 应用源码，选一个感兴趣的改造 |
| ⑥（按需） | [huggingface/smolagents](https://github.com/huggingface/smolagents)（29.3k★） | 极简「代码即行动」Agent 库，几千行代码看懂 Agent 内核，适合想拆开看原理的人 |

> **为什么这个顺序：** 先用结构化课程（HF）把三套框架都摸一遍防止过早绑定；然后主线深挖一个框架做项目；GenAI_Agents 当习题集、awesome-llm-apps 当项目灵感库；12-factor-agents 放在框架学习之后读，效果最好——你已经有了对照物。

### 阶段 3：进阶——多智能体、协议、评测与生产化（持续）

**目标：** 从 demo 走向产品：接入 MCP 生态、理解智能体互操作、建立评测与可观测性、掌握多智能体编排。

| 顺序 | 资源 | 说明 |
|---|---|---|
| ① | [microsoft/mcp-for-beginners](https://github.com/microsoft/mcp-for-beginners)（17.2k★） | MCP 是当前 Agent 接工具的事实协议，这门 6 语言示例课程是入门首选 |
| ② | [modelcontextprotocol/servers](https://github.com/modelcontextprotocol/servers)（90.2k★）+ [python-sdk](https://github.com/modelcontextprotocol/python-sdk)（24.3k★） | 官方参考服务器与 SDK，边读边接 |
| ③ | [NirDiamant/agents-towards-production](https://github.com/NirDiamant/agents-towards-production)（21.4k★） | 端到端生产级教程：护栏、评测、部署、成本控制，补上「demo → 产品」最后一公里 |
| ④ | [langfuse/langfuse](https://github.com/langfuse/langfuse)（34.5k★）或 [Arize-ai/phoenix](https://github.com/Arize-ai/phoenix)（11.4k★） | 给自己的 Agent 接上追踪与评测，没有可观测性就无法迭代 |
| ⑤（按需） | [microsoft/agent-framework](https://github.com/microsoft/agent-framework)（13.5k★）或 [crewAIInc/crewAI](https://github.com/crewAIInc/crewAI)（58.4k★） | 需要多智能体编排/角色协作时再学；注意 AutoGen 与 Semantic Kernel 的学习重心已转移至此 |
| ⑥（按需） | [google/adk-python](https://github.com/google/adk-python)（21.5k★）、[a2aproject/A2A](https://github.com/a2aproject/A2A)（25.7k★）、[anthropics/claude-agent-sdk-python](https://github.com/anthropics/claude-agent-sdk-python)（8.1k★） | Google 生态、跨厂商智能体互操作协议（Linux Foundation 治理）、Anthropic 官方 Agent SDK（由 Claude Code 驱动） |

> **为什么这个顺序：** MCP/评测/生产化是 2025-2026 年 Agent 工程化竞争的主战场，也是个人开发者做出「能用」而非「能演示」的产品的分水岭。多智能体编排放在最后——经验上单智能体 + 好工具能解决 80% 的问题，过早多智能体只会增加调试成本。

---

## 分类资源清单

### 1. 系统课程 / 训练营类仓库

| 资源 | 链接 | Star（2026-09-11） | 语言 | 定位 | 建议阶段 | 维护状态 |
|---|---|---|---|---|---|---|
| microsoft/ai-agents-for-beginners | https://github.com/microsoft/ai-agents-for-beginners | 74,432 | Jupyter Notebook | 18 课从零构建 AI Agent，含视频，最系统的入门课 | 阶段 1 | 活跃（2026-09-10 推送） |
| microsoft/generative-ai-for-beginners | https://github.com/microsoft/generative-ai-for-beginners | 119,550 | Jupyter Notebook | 21 课生成式 AI 基础，LLM/工具调用/RAG 预备知识 | 阶段 1（补基础） | 活跃（2026-09-10 推送） |
| huggingface/agents-course | https://github.com/huggingface/agents-course | 32,424 | MDX | HF 官方 Agent 认证课程，覆盖 smolagents/LangGraph/LlamaIndex | 阶段 2 | 活跃（2026-09-09 推送） |
| microsoft/mcp-for-beginners | https://github.com/microsoft/mcp-for-beginners | 17,197 | Jupyter Notebook | MCP 协议系统课程，6 种语言实战示例 | 阶段 3 | 活跃（2026-09-11 推送） |

### 2. Awesome 清单 / 路线图类

| 资源 | 链接 | Star（2026-09-11） | 语言 | 定位 | 建议阶段 | 维护状态 |
|---|---|---|---|---|---|---|
| Shubhamsaboo/awesome-llm-apps | https://github.com/Shubhamsaboo/awesome-llm-apps | 137,199 | Python | 100+ 可直接运行的 Agent/RAG 应用合集，按场景分类 | 阶段 2-3（找项目灵感） | 活跃（2026-09-11 推送） |
| e2b-dev/awesome-ai-agents | https://github.com/e2b-dev/awesome-ai-agents | 29,953 | Markdown | 自主 Agent 项目全景清单，用于调研现有方案 | 全阶段（参考） | 活跃（2026-08-21 推送） |

### 3. 官方框架与 SDK

**主推（选一个深挖）：**

| 资源 | 链接 | Star（2026-09-11） | 语言 | 定位 | 建议阶段 | 维护状态 |
|---|---|---|---|---|---|---|
| langchain-ai/langgraph | https://github.com/langchain-ai/langgraph | 41,471 | Python | 图编排 Agent 的事实标准，可控性与生态最佳 | 阶段 2 主线 | 活跃（2026-09-10 推送） |
| openai/openai-agents-python | https://github.com/openai/openai-agents-python | 29,360 | Python | OpenAI 官方轻量多智能体框架（handoffs/guardrails 原生） | 阶段 2 主线 | 活跃（2026-09-10 推送） |
| microsoft/agent-framework | https://github.com/microsoft/agent-framework | 13,477 | Python/.NET | 微软统一框架：AutoGen + Semantic Kernel 的官方继任者，已进入 RC/迁移期 | 阶段 3 | 活跃（2026-09-11 推送） |
| anthropics/claude-agent-sdk-python | https://github.com/anthropics/claude-agent-sdk-python | 8,080 | Python | Anthropic 官方 Agent SDK（2025-09 由 claude-code-sdk 更名），内嵌文件系统/子智能体/MCP 能力 | 阶段 3 | 活跃（2026-09-10 推送） |
| google/adk-python | https://github.com/google/adk-python | 21,500 | Python | Google 官方 Agent Development Kit，深度绑定 Gemini/Vertex，原生支持 MCP 与 A2A | 阶段 3 | 活跃（2026-09-11 推送） |

**补充（按生态/兴趣选用）：**

| 资源 | 链接 | Star（2026-09-11） | 语言 | 定位 | 维护状态 |
|---|---|---|---|---|---|
| crewAIInc/crewAI | https://github.com/crewAIInc/crewAI | 58,371 | Python | 角色扮演式多智能体协作框架，上手最快 | 活跃（2026-09-11 推送） |
| run-llama/llama_index | https://github.com/run-llama/llama_index | 52,128 | Python | 文档/数据向 Agent（Workflows），RAG 生态最深 | 活跃（2026-09-11 推送） |
| huggingface/smolagents | https://github.com/huggingface/smolagents | 29,287 | Python | 极简「代码即行动」Agent 库，适合读源码学原理 | 活跃（2026-08-25 推送） |
| microsoft/semantic-kernel | https://github.com/microsoft/semantic-kernel | 28,552 | C# | .NET 生态 LLM 编排；官方已发布向 Agent Framework 的迁移指南 | 维护中，重心已转移（2026-09-11 推送） |

### 4. 从零手写 / 实战教程类

| 资源 | 链接 | Star（2026-09-11） | 语言 | 定位 | 建议阶段 | 维护状态 |
|---|---|---|---|---|---|---|
| humanlayer/12-factor-agents | https://github.com/humanlayer/12-factor-agents | 25,795 | TypeScript | 12 条生产级 Agent 设计原则（小而专注、自持上下文等），**公认经典** | 阶段 2→3 | 内容稳定（文档型仓库，最近推送 2025-09-21；近一年无更新但内容不过时） |
| NirDiamant/GenAI_Agents | https://github.com/NirDiamant/GenAI_Agents | 24,241 | Jupyter Notebook | 50+ 分级 Agent 模式教程（对话机器人→多智能体），最佳「习题集」 | 阶段 2 | 活跃（2026-09-08 推送） |
| NirDiamant/agents-towards-production | https://github.com/NirDiamant/agents-towards-production | 21,444 | Jupyter Notebook | 端到端生产级 Agent 教程（护栏/评测/部署/成本） | 阶段 3 | 活跃（2026-09-06 推送） |
| openai/openai-cookbook | https://github.com/openai/openai-cookbook | 75,919 | Jupyter Notebook | OpenAI 官方示例库，含 Agents SDK 实战与 gpt-oss 示例 | 阶段 2-3 | 活跃（2026-09-11 推送） |

### 5. 协议与生态（MCP / A2A）

| 资源 | 链接 | Star（2026-09-11） | 语言 | 定位 | 建议阶段 | 维护状态 |
|---|---|---|---|---|---|---|
| modelcontextprotocol/servers | https://github.com/modelcontextprotocol/servers | 90,243 | TypeScript | MCP 官方参考服务器合集（文件系统/GitHub/浏览器等），接上就能用 | 阶段 3 | 活跃（2026-09-03 推送） |
| modelcontextprotocol/python-sdk | https://github.com/modelcontextprotocol/python-sdk | 24,269 | Python | MCP 官方 Python SDK，写自己的服务器/客户端 | 阶段 3 | 活跃（2026-09-10 推送） |
| modelcontextprotocol/modelcontextprotocol | https://github.com/modelcontextprotocol/modelcontextprotocol | 9,186 | TypeScript | MCP 协议规范与官方文档仓库 | 阶段 3（查阅） | 活跃（2026-09-10 推送） |
| a2aproject/A2A | https://github.com/a2aproject/A2A | 25,732 | Shell | Agent2Agent 开放协议：跨厂商智能体互操作；2025-06 由 Google 捐赠 Linux Foundation，2026-04 宣布 150+ 组织采用 | 阶段 3 | 活跃（2026-09-11 推送），基金会治理 |

### 6. 评测与可观测性

| 资源 | 链接 | Star（2026-09-11） | 语言 | 定位 | 建议阶段 | 维护状态 |
|---|---|---|---|---|---|---|
| langfuse/langfuse | https://github.com/langfuse/langfuse | 34,476 | TypeScript | 开源 Agent 追踪/评测/提示管理平台，自托管友好，LangGraph/CrewAI 等均有集成 | 阶段 3 | 活跃（2026-09-11 推送） |
| comet-ml/opik | https://github.com/comet-ml/opik | 21,933 | Python | 开源 LLM 可观测与评测平台，含 Agent 工作流追踪与自动化评测 | 阶段 3 | 活跃（2026-09-11 推送） |
| Arize-ai/phoenix | https://github.com/Arize-ai/phoenix | 11,417 | Python | AI 可观测与评测，OpenTelemetry 兼容，tracing 体验好 | 阶段 3 | 活跃（2026-09-11 推送） |
| AgentOps-AI/agentops | https://github.com/AgentOps-AI/agentops | 5,816 | Python | Agent 会话回放与成本监控 SDK，两行代码接入 | 阶段 3（可选） | 更新放缓（最近推送 2026-06-25） |

### 7. 已被取代 / 停止维护——甄别提示

| 资源 | 状态 | 依据 |
|---|---|---|
| openai/swarm | 已被取代。教育性质的实验框架，官方已被 OpenAI Agents SDK 取代，不建议再作为学习主线 | 仓库自述为 educational framework；OpenAI Agents SDK 文档（https://github.com/openai/openai-agents-python） |
| microsoft/autogen | 维护明显放缓（最近推送 2026-04-15）。微软已将 AutoGen 与 Semantic Kernel 合并为 Microsoft Agent Framework，官方提供迁移指南：https://learn.microsoft.com/en-us/agent-framework/migration-guide/from-autogen/ | GitHub API 推送时间 + [微软官方博客](https://devblogs.microsoft.com/agent-framework/migrate-your-semantic-kernel-and-autogen-projects-to-microsoft-agent-framework-release-candidate/) |
| e2b-dev/ai-agents | 已不存在（GitHub API 返回 404，2026-09-11 核实），旧教程链接如指向此仓库均已失效 | GitHub API |

---

## 非 GitHub 但值得读（官方文章 / 课程）

| 资源 | 链接 | 说明 |
|---|---|---|
| Anthropic《Building Effective Agents》（2024-12-19） | https://www.anthropic.com/research/building-effective-agents | Agent 工程的「宪法级」短文：工作流 vs 智能体、五种可组合模式。「用简单可组合的模式，而非复杂框架」 |
| Anthropic《Building agents with the Claude Agent SDK》（2025-09-29） | https://claude.com/blog/building-agents-with-the-claude-agent-sdk | 提出 gather context → take action → verify work 循环，是理解 Claude Code 类 Agent 架构的钥匙 |
| OpenAI《A practical guide to building agents》（34 页 PDF） | https://cdn.openai.com/business-guides-and-resources/a-practical-guide-to-building-agents.pdf | 偏产品/业务决策视角：何时用 Agent、如何设计、如何护栏 |
| Berkeley RDI：LLM Agents / Agentic AI MOOC（CS294/194-196） | http://rdi.berkeley.edu/llm-agents/f24 ；新版入口 https://agenticai-learning.org/ | Dawn Song 团队的正式学分课程开放版，2025 秋季迭代已在 YouTube 更新（2026 年最新一期开课情况**未核实**）；进阶版见 http://rdi.berkeley.edu/adv-llm-agents/sp25 |
| LangChain Academy | https://academy.langchain.com/ | LangChain 官方自学课程（如 Introduction to Deep Agents、LangSmith Essentials 等）；课程阵容随产品演进变化，是否免费**未核实**，以官网为准 |
| Microsoft Learn：Agent Framework 文档与迁移指南 | https://learn.microsoft.com/en-us/agent-framework/ | AutoGen/Semantic Kernel → Agent Framework 的官方迁移与学习文档 |
| MCP 官方文档站 | https://modelcontextprotocol.io/ | 协议规范、SDK 导航与概念文档（配套 GitHub 仓库见上表） |

---

## 附：核实方法与未尽事项

- **GitHub 数据**：全部来自 GitHub REST API `GET /repos/{owner}/{repo}`，字段 `stargazers_count` / `language` / `pushed_at` / `archived`，抓取日期 2026-09-11。star 数变动很快，引用时请注意时效。
- **未能核实/不确定的事项**：
  - Berkeley Agentic AI MOOC 2026 年最新一期的具体开课安排（仅核实到 2025 秋季迭代）；
  - LangChain Academy 各课程当前是否免费（页面未标注）；
  - huggingface/agents-course 的免费认证当前是否开放（以 https://huggingface.co/learn/agents-course 为准）；
  - `anthropics/claude-agent-sdk-typescript`（1,747★，2026-09-10 推送）存在且活跃，但 GitHub 语言统计显示为 Shell（仓库主要封装 Claude Code CLI），未进一步核对内容。
- **未收录说明**：候选中的 `e2b-dev/ai-agents` 经 API 核实已 404，故未收录；`openai/swarm` 仅列入「已取代」提示表。
