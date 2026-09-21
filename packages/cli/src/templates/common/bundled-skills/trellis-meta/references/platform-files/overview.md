# Platform Files Overview

`.trellis/` stores the shared Trellis runtime; platform files are the adapter layer that defines how Kerminal enters Trellis.

When a local AI modifies Trellis, it should distinguish two file categories first:

- **Shared files**: `.trellis/workflow.md`, `.trellis/tasks/`, `.trellis/spec/`, `.trellis/scripts/`.
- **Platform files**: `.kerminal/`, `.agents/skills/`, and the project `AGENTS.md`.

Platform files do not store business state. They let the AI read Trellis state, call Trellis scripts, and load Trellis skills and agent prompts.

## Platform File Categories

| File type | Kerminal location | Purpose |
| --- | --- | --- |
| instructions | `AGENTS.md` | The managed Trellis block points the agent at `.trellis/`. |
| entry skills | `.kerminal/skills/trellis-start/` etc. | User-invocable session entry points. |
| agent prompts | `.kerminal/skills/trellis-implement/` etc. | Dispatched as generic sub-agents. |
| shared skills | `.agents/skills/` | Reusable capability skills, natively discovered. |

## Platform Integration Mode

Kerminal integrates with Trellis in a pull-based way; there are no hooks or plugins that inject context automatically:

- The managed Trellis block in `AGENTS.md` points the agent at `.trellis/` and names the entry skills to load.
- Entry skills (`trellis-start`, `trellis-continue`, `trellis-finish-work`) are loaded explicitly at session start, resume, and wrap-up; every other skill is read on demand.
- Agent prompts (`trellis-research`, `trellis-implement`, `trellis-check`) are dispatched as generic sub-agents and instruct the sub-agent to read the active task, PRD, and JSONL context after startup.

To change "when the AI knows what," inspect `AGENTS.md` and the entry skills first. To change how sub-agents load context, inspect the agent prompt skills themselves.

Historical releases supported hook-based and other modes across many platforms.

## Local Modification Order

When the user asks to customize behavior, the AI should inspect files in this order:

1. Read `.trellis/workflow.md` to confirm the shared flow.
2. Read `AGENTS.md` and list `.kerminal/skills/` to see which entry skills and agent prompts exist.
3. Read the relevant `.kerminal/skills/` files and the shared skills under `.agents/skills/`.
4. Modify the local file closest to the user's need.
5. If the change affects the shared flow, synchronize `.trellis/workflow.md` or `.trellis/spec/`.

Do not modify only platform files and forget the shared workflow. Do not modify only `.trellis/workflow.md` and forget that platform entry points may still contain old descriptions.
