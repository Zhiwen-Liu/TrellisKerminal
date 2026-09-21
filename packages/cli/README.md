<p align="center">
<picture>
<source srcset="assets/trellis.png" media="(prefers-color-scheme: dark)">
<source srcset="assets/trellis.png" media="(prefers-color-scheme: light)">
<img src="assets/trellis.png" alt="Trellis Logo" width="500" style="image-rendering: -webkit-optimize-contrast; image-rendering: crisp-edges;">
</picture>
</p>

<p align="center">
<strong>Engineering memory and workflow for Kerminal.</strong><br/>
<sub>Specs, tasks, and session memory persisted in your repo — so every Kerminal session codes to your team's standards.</sub>
</p>

<p align="center">
<a href="https://github.com/Zhiwen-Liu/TrellisKerminal/blob/main/README_CN.md">简体中文</a> •
<a href="https://github.com/Zhiwen-Liu/TrellisKerminal/blob/main/docs/quickstart.md">Quick Start</a> •
<a href="https://github.com/Zhiwen-Liu/TrellisKerminal/blob/main/docs/kerminal.md">Kerminal Reference</a>
</p>

<p align="center">
<a href="https://github.com/Zhiwen-Liu/TrellisKerminal/blob/main/LICENSE"><img src="https://img.shields.io/badge/license-AGPL--3.0-16a34a.svg?style=flat-square" alt="license" /></a>
<a href="https://github.com/Zhiwen-Liu/TrellisKerminal/stargazers"><img src="https://img.shields.io/github/stars/Zhiwen-Liu/TrellisKerminal?style=flat-square&color=eab308" alt="stars" /></a>
<a href="https://www.npmjs.com/package/trellis-kerminal"><img src="https://img.shields.io/npm/v/trellis-kerminal?style=flat-square&color=cb3837" alt="npm" /></a>
<a href="https://github.com/Zhiwen-Liu/TrellisKerminal/issues"><img src="https://img.shields.io/github/issues/Zhiwen-Liu/TrellisKerminal?style=flat-square&color=e67e22" alt="open issues" /></a>
</p>

## The problems it solves

If you code with Kerminal, you have probably hit these:

- **Every session starts from scratch** — you have explained your error-handling style, directory layout, and naming rules to the AI for the Nth time. Session ends, it forgets again.
- **Code quality drifts between sessions** — last session's output was great; this session's style is different. Without enforced standards, output quality is a coin flip.
- **Team conventions live in one person's head** — the senior engineer knows all the rules; nothing is written down. Newcomers and AI both depend on tribal knowledge.
- **Long tasks blow the context window** — start a fresh session and everything you discussed, decided, and half-finished is gone.
- **Last week's decisions are unrecoverable** — "why did we pick option B again?" means scrolling through chat history forever.

TrellisKerminal persists **specs, tasks, and memory** into your repo, so the AI reads the record before writing a line:

| Pain | How Trellis addresses it |
|------|--------------------------|
| Re-explaining conventions | **Spec system**: team standards live in `.trellis/spec/`; coding sub-agents load the relevant specs before they start |
| Quality drift | **Check sub-agent**: reviews every diff against the specs and runs lint / type-check / tests, self-fixing what it can |
| Tribal knowledge | **Bootstrap task**: the first task after init drafts your conventions into spec files — permanently captured |
| Context loss | **Task system**: each task keeps its PRD, design, and execution plan under `.trellis/tasks/`; a new session says "continue" and picks up |
| Lost decisions | **Workspace journals + mem search**: every session is journaled; `trellis mem search` full-text-searches local AI session history |

## Core concepts

**Three persistence layers** (all inside your git repo, reviewable like code):

```
.trellis/
├── spec/        # Standards: your team's coding rules; sub-agents read before coding
├── tasks/       # Tasks: per-task PRD / design / research / context manifests
└── workspace/   # Memory: per-developer session journals, traceable across sessions
```

**One three-phase workflow** (Plan → Execute → Finish):

1. **Plan** — the `trellis-brainstorm` skill clarifies requirements one question at a time and writes `prd.md`; complex tasks get `design.md`; research goes to a `trellis-research` sub-agent and is persisted
2. **Execute** — a `trellis-implement` sub-agent reads the specs and research listed in `implement.jsonl` first, then codes; a `trellis-check` sub-agent reviews the diff against specs, runs checks, self-fixes
3. **Finish** — after a final full-scope check, `trellis-update-spec` promotes what this task learned back into the specs — **the next session starts smarter**

## Quick start

```bash
# Install
npm install -g trellis-kerminal@latest

# Initialize in your repo (needs git; offers git init if missing)
cd your-repo
trellis init -u your-name

# Open the project in Kerminal and describe what you want
```

Prerequisites: Node.js ≥ 18, Python ≥ 3.9, [Kerminal](https://kerminal.cn/).

Init writes `.kerminal/skills/` (entry skills), `.agents/skills/` (workflow skills), `.trellis/` (specs / tasks / memory), and `AGENTS.md` (guidance block), then creates your first task: **turn your team's conventions into specs**.

## What a session looks like

A typical task flow (all natural language inside Kerminal):

```
You: add a CSV export feature to this project

AI:  (loads trellis-start, reads current state)
     A few things to confirm — full export or filtered?
     UTF-8 or GBK encoding? ... (one question at a time, writes prd.md)

You: full export, UTF-8. good to go?

AI:  (shows the PRD summary; after your go-ahead runs task.py start)
     Implementing. Dispatching a trellis-implement sub-agent —
     it read your spec files "Error Handling" and "API Design"
     first, then wrote the code to match.
     Next a trellis-check sub-agent reviewed the diff against
     the specs; lint / typecheck / tests all pass.

You: great, wrap it up

AI:  ("finish the trellis task")
     Code committed, task archived, session journaled.
     One learning worth keeping: the CSV encoding rule is now
     in the specs — nobody needs to ask about it again.
```

The next day, open a fresh session and say "**continue the task**" (`trellis-continue`); the AI picks up from the journal and task docs. Need an old decision? `trellis mem search "CSV encoding"` finds the original discussion.

## Command reference

| Command | What it does |
|---------|--------------|
| `trellis init` | Initialize a project (Kerminal by default, no platform flag needed) |
| `trellis update` | Refresh templates to the latest version (hash-tracked; your edits are never silently overwritten) |
| `trellis upgrade` | Upgrade the global CLI itself |
| `trellis mem` | Search local AI session history (Kerminal / Claude Code / Codex and 5 more stores; offline, read-only) |
| `trellis workflow` | Inspect / reset `.trellis/workflow.md` to the bundled template |
| `trellis uninstall` | Cleanly remove all Trellis-managed files |

Inside a session you never memorize commands — entry skills load by name: `trellis-start`, `trellis-continue`, `trellis-finish-work`. Kerminal has no slash palette; just say "finish the trellis task".

## FAQ

<details>
<summary><strong>How is this different from just writing an AGENTS.md / CLAUDE.md?</strong></summary>

Single files grow monolithic and unmaintained. Trellis splits it into layered specs (per package / per layer), lifecycle-tracked tasks (PRD → implement → archive), and structured session journals — with sub-agents loading only the relevant slice, instead of stuffing one huge file into context every time.

</details>

<details>
<summary><strong>Do I have to write the specs by hand?</strong></summary>

No. The first task after init has the AI draft specs from your existing code; you tighten the important parts by hand. During normal use, `trellis-update-spec` keeps capturing new learnings.

</details>

<details>
<summary><strong>Will updates overwrite my customized template files?</strong></summary>

No. `trellis update` hash-tracks every file's original: modified files trigger a conflict prompt, only pristine ones auto-refresh. Paths can also be permanently excluded via `update.skip` in `config.yaml`.

</details>

<details>
<summary><strong>Does this work for teams?</strong></summary>

Yes. Session journals are isolated per developer (`.trellis/workspace/<name>/`); specs and tasks live in the repo and go through review like any code. Monorepos are supported with per-package specs (auto-detected by `trellis init`).

</details>

## Building from source

```bash
git clone https://github.com/Zhiwen-Liu/TrellisKerminal.git
cd TrellisKerminal
pnpm install && pnpm build
cd packages/cli && pnpm link --global   # provides trellis / tl
```

See [CONTRIBUTING.md](https://github.com/Zhiwen-Liu/TrellisKerminal/blob/main/CONTRIBUTING.md) for the full guide.

<p align="center">
<a href="https://github.com/Zhiwen-Liu/TrellisKerminal">TrellisKerminal</a> •
<a href="https://github.com/Zhiwen-Liu/TrellisKerminal/blob/main/LICENSE">AGPL-3.0 License</a> •
Built by <a href="https://github.com/Zhiwen-Liu">Zhiwen-Liu</a>
</p>
