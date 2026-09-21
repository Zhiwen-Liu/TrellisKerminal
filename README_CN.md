<p align="center">
<picture>
<source srcset="assets/trellis.png" media="(prefers-color-scheme: dark)">
<source srcset="assets/trellis.png" media="(prefers-color-scheme: light)">
<img src="assets/trellis.png" alt="Trellis Logo" width="500" style="image-rendering: -webkit-optimize-contrast; image-rendering: crisp-edges;">
</picture>
</p>

<p align="center">
<strong>给 Kerminal 装上工程记忆与工作流。</strong><br/>
<sub>规范沉淀进仓库、任务全程留痕、跨会话可追溯 —— 让每一次 Kerminal 会话都按你团队的标准写代码。</sub>
</p>

<p align="center">
<a href="./README.md">English</a> •
<a href="./docs/quickstart.md">快速开始</a> •
<a href="./docs/kerminal.md">Kerminal 集成参考</a>
</p>

<p align="center">
<a href="https://github.com/Zhiwen-Liu/TrellisKerminal/blob/main/LICENSE"><img src="https://img.shields.io/badge/license-AGPL--3.0-16a34a.svg?style=flat-square" alt="license" /></a>
<a href="https://github.com/Zhiwen-Liu/TrellisKerminal/stargazers"><img src="https://img.shields.io/github/stars/Zhiwen-Liu/TrellisKerminal?style=flat-square&color=eab308" alt="stars" /></a>
<a href="https://www.npmjs.com/package/trellis-kerminal"><img src="https://img.shields.io/npm/v/trellis-kerminal?style=flat-square&color=cb3837" alt="npm" /></a>
<a href="https://github.com/Zhiwen-Liu/TrellisKerminal/issues"><img src="https://img.shields.io/github/issues/Zhiwen-Liu/TrellisKerminal?style=flat-square&color=e67e22" alt="open issues" /></a>
</p>

## 它解决什么问题

用 Kerminal 写代码，你大概遇到过这些：

- **每次会话都从零开始** —— 你已经第 N 次向 AI 解释项目的错误处理风格、目录约定、命名规范了。会话一结束，它又忘了。
- **代码质量随会话漂移** —— 上次写得很好，这次换个会话，风格就变了。没有强制标准，AI 的输出全看当天"心情"。
- **团队规范只活在某个人脑子里** —— 资深工程师知道所有约定，但没写下来；新人和 AI 都只能靠口口相传。
- **长任务做到一半上下文爆了** —— 开新会话后，之前讨论了什么、决定了什么、做到哪一步，全都丢失。
- **上周的决策找不回来了** —— "我们当时为什么选了方案 B？" 翻聊天记录翻不到。

TrellisKerminal 把**规范、任务、记忆**三样东西持久化进你的仓库，让 AI 每次干活前先"读档案"：

| 痛点 | Trellis 的解法 |
|------|---------------|
| 反复解释规范 | **Spec 系统**：团队约定写在 `.trellis/spec/`，写代码的子 agent 开工前自动加载对应规范 |
| 质量漂移 | **Check 子 agent**：每次实现后对照 spec 审查 + 跑 lint/typecheck/tests，能修则修 |
| 规范在脑子里 | **Spec 引导任务**：init 后第一个任务就是把团队约定梳理成 spec 文件，永久沉淀 |
| 上下文丢失 | **任务系统**：每个任务的 PRD、设计、执行计划存在 `.trellis/tasks/`，新会话说"继续"即可接上 |
| 决策找不到 | **工作区日志 + mem 检索**：每次会话自动记日志；`trellis mem search` 全文检索本机所有 AI 会话历史 |

## 核心概念

**三个持久化层**（都在你的 git 仓库里，随代码一起 review）：

```
.trellis/
├── spec/        # 规范层：团队的编码标准，子 agent 写代码前必读
├── tasks/       # 任务层：每个任务的 PRD / 设计 / 研究文档 / 上下文清单
└── workspace/   # 记忆层：每个开发者的会话日志，跨会话可追溯
```

**一个三阶段工作流**（Plan → Execute → Finish）：

1. **Plan**：`trellis-brainstorm` 技能逐题澄清需求，写出 `prd.md`；复杂任务补 `design.md`；按需派出 `trellis-research` 子 agent 做调研并落盘
2. **Execute**：`trellis-implement` 子 agent 先读 `implement.jsonl` 列出的规范和资料再写代码；`trellis-check` 子 agent 对照 spec 审查、跑检查、自动修复
3. **Finish**：全量检查后 `trellis-update-spec` 把本轮新学到的经验写回 spec——**下次会话直接受益**

## 快速开始

```bash
# 安装
npm install -g trellis-kerminal@latest

# 在你的项目里初始化（需要 git 仓库；不是的话会提示 git init）
cd your-repo
trellis init -u your-name

# 用 Kerminal 打开项目，直接描述你想做什么
```

前置要求：Node.js ≥ 18、Python ≥ 3.9、[Kerminal](https://kerminal.cn/)。

init 会写入 `.kerminal/skills/`（入口技能）、`.agents/skills/`（工作流技能）、`.trellis/`（规范/任务/记忆）、`AGENTS.md`（引导块），并创建第一个任务：**把你的团队约定梳理成 spec**。

## 使用是什么样的

一次典型的任务流（在 Kerminal 里全程自然语言）：

```
你：帮这个项目加一个 CSV 导出功能

AI：（加载 trellis-start，读取当前状态）
    这个需求有几个点想确认——导出全量还是筛选后的？
    编码用 UTF-8 还是 GBK？……（逐题澄清，写入 prd.md）

你：全量导出，UTF-8。可以开始了吗？

AI：（展示 PRD 摘要，请求确认后运行 task.py start）
    开始实现。派出 trellis-implement 子 agent——
    它先读了你们 spec 里的《错误处理规范》和《API 设计约定》，
    然后按约定写完了代码。
    接着 trellis-check 子 agent 对照 spec 审查了 diff，
    lint/typecheck/test 全过。

你：好，收尾吧

AI：（"finish the trellis task"）
    代码已提交，任务归档，会话日志已记录。
    有一条经验值得沉淀：CSV 编码问题写进了 spec——
    下次谁做导出功能不用再问一遍。
```

第二天开新会话，说"**继续任务**"（`trellis-continue`），AI 从日志和任务文档接上进度。想找历史决策，`trellis mem search "CSV 编码"` 直接检索到当时的讨论。

## 命令一览

| 命令 | 作用 |
|------|------|
| `trellis init` | 初始化项目（默认 Kerminal，无需平台参数） |
| `trellis update` | 刷新模板到最新版（hash 追踪，你改过的文件不会被覆盖） |
| `trellis upgrade` | 升级全局 CLI 自身 |
| `trellis mem` | 检索本机 AI 会话历史（Kerminal / Claude Code / Codex 等 8 种数据源，只读离线） |
| `trellis workflow` | 查看 / 重置 `.trellis/workflow.md` 为内置模板 |
| `trellis uninstall` | 干净移除所有 Trellis 管理的文件 |

会话内不用记命令——入口技能按名字加载：`trellis-start`（开始）、`trellis-continue`（继续）、`trellis-finish-work`（收尾）。Kerminal 没有 slash palette，直接说"finish the trellis task"即可。

## 常见问题

<details>
<summary><strong>和直接写 AGENTS.md / CLAUDE.md 有什么区别？</strong></summary>

单文件会越写越臃肿，而且没人维护。Trellis 把它拆成分层的 spec（按包/按层）、带生命周期的任务（PRD→实现→归档）、结构化的会话日志，并由子 agent 按需加载对应部分——而不是每次把一个大文件塞进上下文。

</details>

<details>
<summary><strong>规范要手写吗？</strong></summary>

不用从零写。init 后的第一个任务就是让 AI 对照现有代码起草 spec，你只需要把关收紧关键部分。日常使用中，`trellis-update-spec` 会持续把新经验沉淀进去。

</details>

<details>
<summary><strong>会不会覆盖我改过的模板文件？</strong></summary>

不会。`trellis update` 用 hash 追踪每个文件的原始版本：你改过的文件会提示冲突让你选择，未改过的才自动刷新。也可以在 `config.yaml` 的 `update.skip` 里永久排除路径。

</details>

<details>
<summary><strong>团队协作会不会互相冲突？</strong></summary>

会话日志按开发者隔离（`.trellis/workspace/<name>/`），规范和任务在仓库里像普通代码一样走 review。支持 monorepo 多包规范（`trellis init` 自动探测）。

</details>

## 从源码构建

```bash
git clone https://github.com/Zhiwen-Liu/TrellisKerminal.git
cd TrellisKerminal
pnpm install && pnpm build
cd packages/cli && pnpm link --global   # 提供 trellis / tl 命令
```

贡献指南见 [CONTRIBUTING_CN.md](./CONTRIBUTING_CN.md)。

## 社区

- [GitHub Issues](https://github.com/Zhiwen-Liu/TrellisKerminal/issues) · [Discussions](https://github.com/Zhiwen-Liu/TrellisKerminal/discussions)

<p align="center">
<a href="https://github.com/Zhiwen-Liu/TrellisKerminal">TrellisKerminal</a> •
<a href="./LICENSE">AGPL-3.0 License</a> •
Built by <a href="https://github.com/Zhiwen-Liu">Zhiwen-Liu</a>
</p>
