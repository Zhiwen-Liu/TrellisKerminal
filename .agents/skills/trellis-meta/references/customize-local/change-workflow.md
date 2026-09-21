# Change Local Workflow

When the user wants to change Trellis phases, next-action hints, whether to create tasks, whether to use sub-agents, or when to check/wrap up, edit `.trellis/workflow.md` first.

## Read These Files First

1. `.trellis/workflow.md`
2. Entry skills for the current platform (`.kerminal/skills/`, `.agents/skills/`)
3. The current task's `task.json` and `prd.md`

## Common Needs And Edit Points

| Need | Edit point |
| --- | --- |
| Change phase names or phase order | `Phase Index` and the corresponding Phase sections. |
| Change whether to create a task when there is no task | `[workflow-state:no_task]` state block. |
| Change the next step during planning | Phase 1 and `[workflow-state:planning]`. |
| Change whether an agent is required during in_progress | Phase 2 and `[workflow-state:in_progress]`. |
| Change wrap-up after completion | Phase 3 and `[workflow-state:completed]`. |
| Change which skill a user intent triggers | `Skill Routing` table. |

## Modification Steps

1. Find the relevant section in `.trellis/workflow.md`.
2. When changing rules, keep explicit trigger conditions and next actions.
3. If adding or renaming a skill/agent, synchronize the corresponding skill files under `.kerminal/skills/` and `.agents/skills/`.
4. Workflow-state changes only need an edit to the `[workflow-state:STATUS]` block in `.trellis/workflow.md`. The breadcrumb reader is parser-only — it reads whatever you put in the block on every context pull. Keep the opening and closing tags' STATUS strings identical (`[workflow-state:foo]…[/workflow-state:foo]`); mismatched STATUS pairs are silently dropped.
5. Make the AI reread `.trellis/workflow.md`; do not keep using rules from the old conversation.

## Example: Relax Task Creation Requirements

To change when task creation can be skipped, usually edit `[workflow-state:no_task]`:

```md
[workflow-state:no_task]
Task is not required when the answer is a one-reply explanation, no files are changed, and no research is needed.
[/workflow-state:no_task]
```

If the formal Phase 1 flow also needs to change, synchronize the Phase 1 section.

## Example: Main Session Does Not Use Sub-Agents

If the user wants the main session to handle implementation and checking itself, change the Phase 2 routing in `.trellis/workflow.md` instead of deleting the `trellis-implement` / `trellis-check` skills under `.kerminal/skills/` — keeping the skills intact lets the routing be restored later.

## Resume Routing: `trellis-continue`

Resuming a task means loading the `trellis-continue` entry skill (`.kerminal/skills/trellis-continue/`). It runs `get_context.py`, loads the Phase Index from `.trellis/workflow.md`, and decides which phase step to load next by combining `task.json.status` with the artifacts present in the task directory. The routing list is fixed in the skill itself; the steps it lands on are defined in `.trellis/workflow.md`.

| `status` | Artifact state | Resume at |
| --- | --- | --- |
| `planning` | `prd.md` missing | Phase 1.1 (load `trellis-brainstorm`) |
| `planning` | lightweight task with `prd.md` complete | ask for start review, then run `task.py start` |
| `planning` | complex task missing `design.md` or `implement.md` | complete missing planning artifacts |
| `planning` | complex task has `prd.md`, `design.md`, and `implement.md` | ask for start review, then run `task.py start` |
| `in_progress` | no implementation in conversation history | Phase 2.1 (`trellis-implement`) |
| `in_progress` | implementation done, no `trellis-check` run | Phase 2.2 (`trellis-check`) |
| `in_progress` | check passed | Phase 3.3 (spec update) → 3.4 (commit) |
| `completed` | task is still in active tree | Phase 3.5 (load `trellis-finish-work` to archive) |

When you add a custom status (e.g. `in-review`), add a `[workflow-state:in-review]` block in `.trellis/workflow.md` for the per-turn breadcrumb AND extend the corresponding phase guidance in `.trellis/workflow.md` so the new status has a step to land on. If the status also needs its own resume row, extend the routing list inside the `trellis-continue` skill — it is a Trellis-managed template file, so check `.trellis/.template-hashes.json` (or list it under `update.skip` in `.trellis/config.yaml`) before editing. Without the route entry, resume falls through to a default branch and the user will not land on the step you intended.

## Notes

`.trellis/workflow.md` is the local project workflow, not an immutable template. The user can adapt it to team habits. After editing it, platform entry files may still contain old descriptions, so inspect them too.
