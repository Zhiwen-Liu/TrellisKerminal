# Hooks And Settings

Kerminal is pull-based: it has no project-level hooks, settings, plugins, or extensions files, and nothing is injected automatically. The entire configuration surface is:

- `AGENTS.md` — the project-level instruction file; Trellis writes the managed block that points the agent at `.trellis/` and the skills.
- `.kerminal/skills/` and `.agents/skills/` — the two skill roots. Every entry point is a skill that pulls its own context on demand (`get_context.py` + the agent-skill prelude).

Historical releases supported per-platform hooks and settings files.

## How The Same Jobs Get Done

| Job (historical hook) | Kerminal equivalent |
| --- | --- |
| session-start hook injected a Trellis overview when a session started or reset | The `trellis-start` skill runs `get_context.py` when the user opens a session; nothing runs on its own. |
| workflow-state hook emitted the `[workflow-state:STATUS]` body on each user input | The breadcrumb rides along with every `get_context.py` pull; it is parser-only and reads the block in `.trellis/workflow.md` verbatim. |
| sub-agent context hook injected PRD/JSONL before an agent started | The agent-skill prelude: the main session spawns a generic sub-agent whose prompt inlines the active task, JSONL-referenced files, and artifacts (capped by `context_injection` in `.trellis/config.yaml`). |
| shell/session bridge passed session identity into the shell | The `TRELLIS_CONTEXT_ID` environment variable when a shell needs the same session identity. |

## Local Change Scenarios

| User need | Edit location |
| --- | --- |
| AI should see more/less context in a new session | The `trellis-start` skill under `.kerminal/skills/`, or `.trellis/scripts/get_context.py` / `session_context.py`. |
| Per-turn hint policy should change | `[workflow-state:STATUS]` block in `.trellis/workflow.md`. The breadcrumb reader parses workflow.md verbatim — no script edit required. |
| Sub-agent cannot read PRD/spec | The agent-skill prelude, or the task's `implement.jsonl` / `check.jsonl` manifest. |
| `task.py current` in shell has no active task | Check active task state in `.trellis/.runtime/sessions/` and set `TRELLIS_CONTEXT_ID`. |
| Disable an automatic injection | Nothing to disable — Kerminal injects nothing automatically; context is pulled only when a skill is loaded. |

## Notes

- Skills and scripts read project-local `.trellis/`, never the trellis-kerminal CLI source.
- Failures should be visible: if context was not loaded, say what was not read instead of silently continuing without it.

## Troubleshooting Path

If the user says "AI did not read Trellis state":

1. Check whether the relevant entry skill (`trellis-start` / `trellis-continue`) was actually loaded this session.
2. Manually run the `.trellis/scripts/get_context.py` or `task.py current --source` command the skill depends on.
3. Check whether active task state exists in `.trellis/.runtime/sessions/`.
4. Check whether the shell sees the same session identity (`TRELLIS_CONTEXT_ID`).
