# study-by-agent · AI Agent 学习指南

面向个人开发者的 AI Agent 学习资源网站：三阶段学习路径、可筛选的资源库、过时资源甄别清单。
内容整理自 [`research/ai-agent-learning-resources.md`](research/ai-agent-learning-resources.md)（2026-09-11 经 GitHub API 逐一核实）。

**线上地址**：https://suliang2016.github.io/study-by-agent/

## 技术栈

- [Astro](https://astro.build)（静态生成，默认零 JS，交互按需注入）
- 资源数据为结构化 JSON（`src/data/`），叙事页面由数据渲染
- 学习进度存于浏览器 localStorage，不注册、不上传、不跨设备同步
- 深浅色主题：默认跟随系统，可手动覆盖

## 常用命令

| 命令 | 作用 |
| --- | --- |
| `npm run dev` | 本地开发（访问 `/study-by-agent/`） |
| `npm run build` | 构建到 `dist/` |
| `npm run preview` | 本地预览构建产物 |
| `npm run refresh:stars` | 刷新 GitHub star / 推送时间 / 核实日期（详见方法论页） |
| `npm test` | 回归测试（刷新脚本行为、数据合法性） |

## 目录结构

```
├── research/                  # 调研指南原稿（内容唯一来源）
├── src/
│   ├── data/                  # 结构化数据：资源、阶段路径、甄别清单
│   ├── lib/                   # 数据装配与类型定义
│   ├── components/            # 资源卡片等组件
│   ├── layouts/               # 基础布局（导航、主题、进度脚本）
│   └── pages/                 # 首页 / stages/[num] / catalog / deprecated / methodology
├── scripts/refresh-stars.mjs  # star 数据刷新脚本
└── .github/workflows/deploy.yml  # GitHub Pages 部署
```

## 更新资源数据

1. 在 `src/data/resources.json` 中增删改资源条目（字段含义见 `src/lib/types.ts`）；
2. 需要批量刷新 star 数据时运行 `npm run refresh:stars`，脚本会提示需人工复核的仓库（推送超 3 个月或 404）；
3. 确认某资源已被取代时，把它从资源库移到 `src/data/deprecated.json` 并附依据；
4. 领域术语以根目录 [`CONTEXT.md`](CONTEXT.md) 为准。

## 部署

推送到 `main` 分支后，GitHub Actions（`.github/workflows/deploy.yml`）自动构建并发布到 GitHub Pages。
若首次启用，请在仓库 **Settings → Pages** 中把 Source 设为 **GitHub Actions**。
