<p align="center">
<picture>
<source srcset="assets/trellis.png" media="(prefers-color-scheme: dark)">
<source srcset="assets/trellis.png" media="(prefers-color-scheme: light)">
<img src="assets/trellis.png" alt="Trellis Logo" width="500" style="image-rendering: -webkit-optimize-contrast; image-rendering: crisp-edges;">
</picture>
</p>

<p align="center">
<strong>An out-of-the-box engineering framework for AI coding.</strong><br/>
<sub>AI writes code fast, but every session it starts from scratch — no memory of your project, your conventions, or your team's requirements. Trellis persists specs, tasks, and memory into your repo, so any coding agent works to your engineering standards.</sub>
</p>

> [!NOTE]
> **TrellisKerminal** is an engineering framework for [Kerminal](https://kerminal.cn/): it persists specs, tasks, and memory into your repo so every coding session works to your team's standards. Ships as a single `trellis-kerminal` npm package; docs are plain Markdown in [`docs/`](./docs/).

<p align="center">
<a href="./README_CN.md">简体中文</a> •
<a href="./docs/">Docs</a> •
<a href="./docs/quickstart.md">Quick Start</a> •
<a href="./docs/kerminal.md">Kerminal Reference</a>
</p>

<p align="center">
<a href="https://github.com/Zhiwen-Liu/TrellisKerminal/blob/main/LICENSE"><img src="https://img.shields.io/badge/license-AGPL--3.0-16a34a.svg?style=flat-square" alt="license" /></a>
<a href="https://github.com/Zhiwen-Liu/TrellisKerminal/stargazers"><img src="https://img.shields.io/github/stars/Zhiwen-Liu/TrellisKerminal?style=flat-square&color=eab308" alt="stars" /></a>
<a href="./docs/"><img src="https://img.shields.io/badge/docs-markdown-0f766e?style=flat-square" alt="docs" /></a>
<a href="https://github.com/Zhiwen-Liu/TrellisKerminal/issues"><img src="https://img.shields.io/github/issues/Zhiwen-Liu/TrellisKerminal?style=flat-square&color=e67e22" alt="open issues" /></a>
<a href="https://github.com/Zhiwen-Liu/TrellisKerminal/pulls"><img src="https://img.shields.io/github/issues-pr/Zhiwen-Liu/TrellisKerminal?style=flat-square&color=9b59b6" alt="open PRs" /></a>
</p>

## Why Trellis?

| Capability | What it changes |
| --- | --- |
| **Auto-injected specs** | Write conventions once in `.trellis/spec/`, then let Trellis inject the relevant context into each session instead of repeating yourself. |
| **Task-centered workflow** | Keep PRDs, implementation context, review context, and task status in `.trellis/tasks/` so AI work stays structured. |
| **Project memory** | Journals in `.trellis/workspace/` preserve what happened last time, so each new session starts with real context. |
| **Team-shared standards** | Specs live in the repo, so one person's hard-won workflow or rule can benefit the whole team. |
| **Kerminal-native** | Built for Kerminal's pull-based skill model: entry skills, agent prompts, and generic sub-agent dispatch, no hooks required. |

## Prerequisites:

- **Node.js** >= 18
- **Python** >= 3.9

## Quick Start

```bash
# 1. Install the CLI from npm
npm install -g trellis-kerminal@latest

# 2. Initialize in your repo with Kerminal
trellis init -u your-name

# 3. Open the project in Kerminal and describe your task
```

To hack on the source instead:

```bash
git clone https://github.com/Zhiwen-Liu/TrellisKerminal.git
cd TrellisKerminal
pnpm install && pnpm build
cd packages/cli && pnpm link --global   # provides `trellis` (alias `tl`)
#    the global link resolves into this clone — keep it around
```

See [Quick Start](./docs/quickstart.md) and the [Kerminal reference](./docs/kerminal.md) for setup details.

## How to Use

The workflow is simple:

1. **Describe what you want** in natural language.
2. **Brainstorm** with the AI one question at a time until the PRD is clear, then implementation begins.
3. **Let it run** — the AI calls Trellis Implement and auto-checks the result against specs, lint, type-check, and tests.
4. **Ask the agent to finish the trellis task** when the work is done or the session context fills up (Kerminal has no slash palette, so `/trellis:finish-work` becomes a plain request). Trellis archives the task and updates journals.

## How It Works

Trellis runs a 4-phase loop with auto-invoked skills and sub-agents:

1. **Plan** — `trellis-brainstorm` walks through requirements one question at a time and writes `prd.md`. Research-heavy items go to a `trellis-research` sub-agent. The result is curated specs + research files referenced from `implement.jsonl` / `check.jsonl`.
2. **Implement** — a `trellis-implement` sub-agent writes code from the PRD with the curated context auto-injected, no git commit.
3. **Verify** — a `trellis-check` sub-agent reviews the diff against specs and runs lint, type-check, and tests, self-fixing where it can.
4. **Finish** — a final check runs, then `trellis-update-spec` promotes new learnings back into `.trellis/spec/` so the next session starts smarter.

## Resources

| Need                    | Link                                     |
| ----------------------- | ---------------------------------------- |
| Install in a repo       | [Quick Start](./docs/quickstart.md)      |
| Kerminal platform model | [Kerminal Reference](./docs/kerminal.md) |

## FAQ

<details>
<summary><strong>How is Trellis different from <code>CLAUDE.md</code>, <code>AGENTS.md</code>, or <code>.cursorrules</code>?</strong></summary>

Those files are useful entry points, but they tend to become monolithic. Trellis adds scoped specs, task PRDs, workflow gates, workspace memory, and platform-aware generated files around them.

</details>

<details>
<summary><strong>Is Trellis only for Claude Code?</strong></summary>

Yes, by design. TrellisKerminal targets [Kerminal](https://kerminal.cn/) as its only platform — the entire workflow, skill set, and update pipeline are tuned for it.

</details>

<details>
<summary><strong>Is Trellis for solo developers or teams?</strong></summary>

Both. Solo developers use it for memory and repeatable workflow. Teams get the larger benefit: shared standards, task boundaries, and reviewable context.

</details>

<details>
<summary><strong>Do I have to write every spec file manually?</strong></summary>

No. Many teams start by letting AI draft specs from existing code and then tighten the important parts by hand. Trellis works best when you keep the high-signal rules explicit and versioned.

</details>

<details>
<summary><strong>Can teams use this without constant conflicts?</strong></summary>

Yes. Personal workspace journals stay separate per developer, while shared specs and tasks stay in the repo where they can be reviewed and improved like any other project artifact.

</details>

## Community & Resources

- [Docs (Markdown)](./docs/)
- [GitHub Issues](https://github.com/Zhiwen-Liu/TrellisKerminal/issues)
- [Discussions](https://github.com/Zhiwen-Liu/TrellisKerminal/discussions)

<p align="center">
<a href="https://github.com/Zhiwen-Liu/TrellisKerminal">TrellisKerminal</a> •
<a href="./LICENSE">AGPL-3.0 License</a> •
Built by <a href="https://github.com/Zhiwen-Liu">Zhiwen-Liu</a>
</p>
