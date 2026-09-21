<p align="center">
<picture>
<source srcset="assets/trellis.png" media="(prefers-color-scheme: dark)">
<source srcset="assets/trellis.png" media="(prefers-color-scheme: light)">
<img src="assets/trellis.png" alt="Trellis Logo" width="500" style="image-rendering: -webkit-optimize-contrast; image-rendering: crisp-edges;">
</picture>
</p>

<p align="center">
<strong>开箱即用的 AI 编码工程化框架</strong><br/>
<sub>AI 写代码很快，但它每次会话都从零开始理解项目，记不住你的规范，也记不住团队级别的需求。Trellis 会把规范、任务、记忆沉淀进仓库，让任意 Coding Agent 都按你的工程标准来实践。</sub>
</p>

> [!NOTE]
> **TrellisKerminal** 是面向 [Kerminal](https://kerminal.cn/) 的工程化框架：把规范、任务、记忆沉淀进仓库，让每一次编码会话都遵循团队标准。以单个 `trellis-kerminal` npm 包发布；文档以纯 Markdown 形式维护在 [`docs/`](./docs/) 目录中。

<p align="center">
<a href="./README.md">English</a> •
<a href="./docs/">文档</a> •
<a href="./docs/quickstart.md">快速开始</a> •
<a href="./docs/kerminal.md">Kerminal 参考</a>
</p>

<p align="center">
<a href="https://github.com/Zhiwen-Liu/TrellisKerminal/blob/main/LICENSE"><img src="https://img.shields.io/badge/license-AGPL--3.0-16a34a.svg?style=flat-square" alt="license" /></a>
<a href="https://github.com/Zhiwen-Liu/TrellisKerminal/stargazers"><img src="https://img.shields.io/github/stars/Zhiwen-Liu/TrellisKerminal?style=flat-square&color=eab308" alt="stars" /></a>
<a href="./docs/"><img src="https://img.shields.io/badge/docs-markdown-0f766e?style=flat-square" alt="docs" /></a>
<a href="https://github.com/Zhiwen-Liu/TrellisKerminal/issues"><img src="https://img.shields.io/github/issues/Zhiwen-Liu/TrellisKerminal?style=flat-square&color=e67e22" alt="open issues" /></a>
<a href="https://github.com/Zhiwen-Liu/TrellisKerminal/pulls"><img src="https://img.shields.io/github/issues-pr/Zhiwen-Liu/TrellisKerminal?style=flat-square&color=9b59b6" alt="open PRs" /></a>
</p>

## 为什么用 Trellis？

| 能力 | 带来的改变 |
| --- | --- |
| **自动注入规范** | 将规范沉淀到 `.trellis/spec/` 之后，Trellis 会在每次会话中按当前任务自动按需注入相关上下文，无需反复说明。 |
| **任务驱动工作流** | PRD、实现上下文、审查上下文与任务状态统一存放于 `.trellis/tasks/`，AI 开发过程保持结构化、可追溯。 |
| **项目记忆** | `.trellis/workspace/` 中的工作日志（journal）会保留上一次会话的脉络，因此每次新会话都能基于真实上下文开始。 |
| **团队共享标准** | Spec 随仓库一同版本化，个人总结出的规则与流程可以直接成为整个团队的基础设施。 |
| **Kerminal 原生** | 为 Kerminal 的 pull-based 技能模型而生：入口技能、agent 提示词、通用子 agent 派发，无需 hooks。 |

## 前置要求

- **Node.js** >= 18
- **Python** >= 3.9

## 快速开始

```bash
# 1. 从 npm 安装 CLI
npm install -g trellis-kerminal@latest

# 2. 在你的仓库中用 Kerminal 初始化
trellis init -u your-name

# 3. 在 Kerminal 中打开项目，用自然语言描述需求
```

如需从源码构建（二次开发）：

```bash
git clone https://github.com/Zhiwen-Liu/TrellisKerminal.git
cd TrellisKerminal
pnpm install && pnpm build
cd packages/cli && pnpm link --global   # 提供 `trellis`（别名 `tl`）
#    全局链接解析到这个克隆目录，请勿删除
```

查看 [快速开始](./docs/quickstart.md) 与 [Kerminal 参考](./docs/kerminal.md) 以了解详细配置步骤。

## 如何使用

使用流程非常简单：

1. **用自然语言描述你的需求。**
2. **与 AI 一起头脑风暴**，一次只回答一个问题，直到 PRD 足够清晰，然后开始实现。
3. **交由 AI 自主推进** —— AI 会调用 `trellis-implement` 编写代码，并自动依据 Spec、lint、type-check 与测试进行校验。
4. **让 agent 执行 finish the trellis task**：当工作完成或会话上下文接近上限时（Kerminal 没有 slash palette，`/trellis:finish-work` 会变成普通请求）。Trellis 会归档任务并更新工作日志。

## 工作原理

Trellis 内部运行一个 3 阶段循环（Plan → Execute → Finish），skill 与子代理按需派发：

1. **Plan（规划）** —— `trellis-brainstorm` 逐题梳理需求并写入 `prd.md`；涉及资料调研的部分派发给 `trellis-research` 子代理处理。阶段产出为一组精选的 Spec 与研究文件，由 `implement.jsonl` / `check.jsonl` 编排。
2. **Implement（实现）** —— `trellis-implement` 子代理依据 PRD 编写代码，所需上下文已按 `implement.jsonl` 自动注入，不会执行 git commit。
3. **Verify（验证）** —— `trellis-check` 子代理基于 diff 对照 Spec 逐项核查，并运行 lint、type-check 与测试，在能力范围内自动修复。
4. **Finish（收尾）** —— 执行最终检查后，`trellis-update-spec` 将本轮新增的认知沉淀回 `.trellis/spec/`，为下一次会话积累上下文。

## 资源

| 需求 | 链接 |
| --- | --- |
| 在仓库中安装 Trellis | [快速开始](./docs/quickstart.md) |
| Kerminal 平台机制 | [Kerminal 参考](./docs/kerminal.md) |

## 常见问题

<details>
<summary><strong>Trellis 与 <code>CLAUDE.md</code>、<code>AGENTS.md</code>、<code>.cursorrules</code> 有何区别？</strong></summary>

这些文件本身是有用的入口，但容易在长期使用中变得冗长臃肿。Trellis 在此之上补充了：作用域明确的 Spec、按任务划分的 PRD、工作流关卡、工作区记忆，以及按平台自动生成的适配文件。

</details>

<details>
<summary><strong>TrellisKerminal 支持哪些 AI 工具？</strong></summary>

仅支持 [Kerminal](https://kerminal.cn/)，有意为之 —— 整个工作流、技能集与更新管线都为它量身调优。

</details>

<details>
<summary><strong>Trellis 适合个人开发者还是团队？</strong></summary>

两者皆可。个人开发者主要受益于记忆机制与可复用的工作流；团队使用收益更大——标准统一、任务边界清晰、上下文可审查。

</details>

<details>
<summary><strong>是否需要手动编写每一个 Spec 文件？</strong></summary>

并不需要。多数团队的做法是先由 AI 基于现有代码生成初稿，再人工收紧关键规则。Trellis 的效果取决于是否将高价值规则显式化并纳入版本管理。

</details>

<details>
<summary><strong>团队协作时是否会频繁产生冲突？</strong></summary>

不会。个人工作区的 journal 按开发者独立维护，共享的 Spec 与任务则进入仓库，可以像其他项目产物一样进行评审与改进。

</details>

## 社区与资源

- [文档（Markdown）](./docs/)
- [GitHub Issues](https://github.com/Zhiwen-Liu/TrellisKerminal/issues)
- [GitHub Discussions](https://github.com/Zhiwen-Liu/TrellisKerminal/discussions)

### 联系我们

<p align="center">
<img src="assets/wx_link11.jpg" alt="微信群" width="260" />
&nbsp;&nbsp;&nbsp;&nbsp;
<img src="assets/feishu-group-qr.jpg" alt="飞书话题群" width="260" />
</p>

<p align="center">
<a href="https://github.com/Zhiwen-Liu/TrellisKerminal">TrellisKerminal</a> •
<a href="./LICENSE">AGPL-3.0 License</a> •
由 <a href="https://github.com/Zhiwen-Liu">Zhiwen-Liu</a> 构建
</p>
