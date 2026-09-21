# Change Local Agents

When the user wants to change `trellis-research`, `trellis-implement`, or `trellis-check` behavior, edit the corresponding agent skills under `.kerminal/skills/` in the user project.

## Read These Files First

1. The target agent skill under `.kerminal/skills/`
2. `.trellis/workflow.md` Phase 2 / research routing
3. Current task `prd.md`
4. Current task `implement.jsonl` / `check.jsonl`
5. The agent prelude (the pull-based context-reading steps at the top of the skill)

## Common Paths

| Platform | Path |
| --- | --- |
| Kerminal | `.kerminal/skills/trellis-{research,implement,check}/SKILL.md` |

Earlier releases shipped these prompts as per-platform agent definition files; the Kerminal-only distribution ships them only as skills. Kerminal has no sub-agent registry — the main session loads a skill and spawns a generic sub-agent whose prompt is the skill content.

Use the actual paths in the user project as authoritative.

## Common Needs

| Need | Which agent to edit |
| --- | --- |
| Research must write files, not only reply in chat | `trellis-research` |
| Certain local specs must be read before implementation | `trellis-implement` + `implement.jsonl` configuration rules |
| Specific commands must run during checking | `trellis-check` |
| Agent must not modify certain directories | The corresponding agent's write boundary instructions |
| Agent output format must be fixed | The corresponding agent's final/reporting instructions |

## Modification Principles

1. **Preserve role boundaries**: research investigates and persists; implement writes implementation; check reviews and fixes.
2. **Do not hard-code project specs into agents**: long-term specs belong in `.trellis/spec/`; agents are responsible for reading them.
3. **Make read order explicit**: active task -> PRD -> info -> JSONL -> spec/research.
4. **Make write boundaries explicit**: which directories may be written and which may not.
5. **Synchronize across the agent skills**: when a rule affects research, implement, and check together, decide whether to change one skill or all of the agent skills.

## The Pull-Based Prelude

Kerminal agent skills open with a prelude that reads the active task, the task JSONL, and task artifacts after startup. Do not remove those steps when editing — otherwise the agent works only from chat context and bypasses Trellis's core mechanism. (Earlier releases also supported hook-push platforms where a platform hook injected context before the agent started; responsibility boundaries still had to live in the agent file there.)
