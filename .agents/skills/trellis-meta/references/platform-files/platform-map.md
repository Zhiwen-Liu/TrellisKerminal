# Platform File Map

This page lists common Trellis file locations in a user project. Trellis supports Kerminal only — the files below are what `trellis init` (default) or `trellis init --kerminal` writes. Historical Trellis releases supported many other AI platforms; that multi-platform support has been removed.

## Matrix

| Platform | CLI flag | Project instructions | Main directory | Skill directory | Agent directory | Hooks/extensions |
| --- | --- | --- | --- | --- | --- | --- |
| Kerminal | `--kerminal` | `AGENTS.md` | `.kerminal/` | `.agents/skills/` (shared) + `.kerminal/skills/` | None — agent prompts ship as skills under `.kerminal/skills/`, dispatched as generic sub-agents | None (pull-based prelude; no project hooks/settings; project `.git` required for config discovery) |

## File Areas

- `AGENTS.md` — project-level instruction file at the project root; Trellis writes the managed block, Kerminal reads it directly and auto-injects it into spawned sub-agents.
- `.agents/skills/` — shared skill layer (agentskills.io standard): workflow skills plus the bundled skills (`trellis-meta`, `trellis-spec-bootstrap`, `trellis-session-insight`); Kerminal discovers this root natively.
- `.kerminal/skills/` — Kerminal-private skills: the user-invocable entry skills (`trellis-start`, `trellis-continue`, `trellis-finish-work`) and the Trellis agent prompts (`trellis-implement`, `trellis-check`, `trellis-research`).
- `.kerminal/KERMINAL.md` — operator guide for the platform.

## Sub-Agent Dispatch

Kerminal has no project-level sub-agent registry and no hook/settings layer. The main session loads an agent skill from `.kerminal/skills/` and spawns a generic sub-agent whose prompt is the skill content; task context reaches the sub-agent through the pull-based prelude and the auto-injected `AGENTS.md`. When changing implement/check/research behavior, edit the corresponding skill under `.kerminal/skills/` first.

## Decision Rules When Modifying Platform Files

1. User wants a Kerminal-specific change: modify the files above unless shared workflow/spec files must also change.
2. User only says "my AI": inspect the configuration files that actually exist in the project.
3. User wants project rules: prefer `.trellis/spec/` or a project-local skill.
4. User wants Trellis behavior: edit `.trellis/workflow.md` plus the Kerminal skill files.

## When Paths Differ

Kerminal evolves, and user projects may already be customized. If this page disagrees with local files, use the actual settings/config in the user project as authoritative:

- Check the skill or script that an entry point points to.
- Judge behavior by the read rules currently written in the skill file.

Do not delete a custom file just because it is not listed in this path table.
