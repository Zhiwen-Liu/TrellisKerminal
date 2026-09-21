# Bundled Skills

"Bundled skills" are multi-file built-in skills shipped inside the Trellis CLI npm package. Unlike user-installed skills (which a user adds separately into their own skill root), bundled skills are written automatically into the project's shared `.agents/skills/` root by `trellis init` and kept in sync by `trellis update`. They are part of Trellis itself, not third-party content.

A bundled skill is a directory under `packages/cli/src/templates/common/bundled-skills/<skill>/` that already contains its own `SKILL.md` (with YAML frontmatter) plus optional `references/`, assets, or other supporting files. Trellis copies the whole directory tree as-is into the shared `.agents/skills/` root, so references stay lazy-loadable instead of being flattened into one oversized `SKILL.md`.

## What Counts As Bundled (vs. Adjacent Concepts)

| Source path | Type | How it ships |
| --- | --- | --- |
| `templates/common/bundled-skills/<name>/` | Bundled skill (multi-file) | Whole directory copied to the shared `.agents/skills/` root |
| `templates/common/skills/<name>.md` | Single-file workflow skill | Wrapped with frontmatter, written as `.agents/skills/<name>/SKILL.md` |
| `templates/common/commands/<name>.md` | Slash command / prompt | Session-boundary commands (`trellis-start` / `trellis-continue` / `trellis-finish-work`) delivered as skills in `.kerminal/skills/` |
| `templates/kerminal/agents/` | Kerminal agent prompt | Written as `.kerminal/skills/trellis-*/SKILL.md` (plus `.kerminal/KERMINAL.md`) |
| User skills under the platform skill root | User-authored or third-party | Not managed by Trellis at all |

The Trellis CLI never touches anything that is not produced by one of its own template loaders. Anything a user drops into a platform skill root by hand is left alone.

## Current Bundled Skills

The set is discovered at runtime by listing directories under `templates/common/bundled-skills/`:

| Skill | Purpose |
| --- | --- |
| `trellis-meta` | This skill. Explains the local Trellis architecture and customization entry points to an AI working inside a user project. |
| `trellis-session-insight` | Wraps the `trellis mem` CLI so an AI knows when and how to reach into past Claude Code / Codex / Pi Agent conversation logs. |
| `trellis-spec-bootstrap` | Platform-neutral workflow for creating or refreshing `.trellis/spec/` from the real codebase (with optional GitNexus / ABCoder integration). |

The list is discovered at runtime, so adding a new directory under `bundled-skills/` is the only step required to register a new skill (see "Adding a New Bundled Skill" below).

## Where Bundled Skills Land

The Kerminal file set — entry skills, agent prompts, workflow skills, bundled skills — is described exactly once, by `collectKerminalTemplates()` in `packages/cli/src/configurators/kerminal.ts`. For bundled skills that description is two calls: `resolveBundledSkills(ctx)` reads every directory under `templates/common/bundled-skills/`, resolves placeholders, and returns a flat list of `{relativePath, content}` entries; `collectSkillTemplates(".agents/skills", <workflowSkills>, <bundledSkills>)` folds them into the `Map<filePath, content>` under `.agents/skills/<skill>/<relativePath>`.

Bundled skills land in the shared `.agents/skills/` root (the agentskills.io shared standard), which Kerminal discovers natively alongside its own `.kerminal/skills/` root:

| Skill root | Content |
| --- | --- |
| `.agents/skills/<skill>/` | Workflow skills plus the full bundled-skill set |

One description, two consumers:

1. `trellis init` → `configurePlatform("kerminal", cwd)` → `configureKerminal()` → `writeTemplateMap(cwd, collectKerminalTemplates())`. The registry in `configurators/index.ts` maps the platform to that one collector; the `configureKerminal` wrapper adds the one piece of behavior a `Map<path, content>` cannot express — Kerminal only loads project-level configuration in a directory containing `.git`, so init offers to run `git init` (interactive) or warns (non-interactive). It never restates the file list.
2. `trellis update` → `collectPlatformTemplates("kerminal")` (in `configurators/index.ts`) → the same map, used to detect drift and to populate `.trellis/.template-hashes.json`.

Because both consumers read the one description, init and update cannot disagree about which files a bundled skill produces.

## Dispatch Wiring (Code Path)

The mechanism that auto-dispatches bundled skills to the shared skill root lives in two files:

1. `packages/cli/src/templates/common/index.ts`
   - `listDirectories("bundled-skills")` enumerates the on-disk skills.
   - `listBundledSkillFiles(skillDir)` walks each skill's directory recursively and returns `{relativePath, content}` for every file.
   - `getBundledSkillTemplates()` returns the cached `CommonBundledSkill[]`.

2. `packages/cli/src/configurators/shared.ts`
   - `resolveBundledSkills(ctx)` flattens that list into `ResolvedSkillFile[]` with `<skill>/<relativePath>` paths and resolved placeholders.
   - `collectSkillTemplates(skillsRoot, workflowSkills, bundledSkills)` returns workflow skills and bundled skill files together as a `Map<filePath, content>` rooted at `skillsRoot`.
   - `writeTemplateMap(cwd, files)` is the single writer that puts a collected map on disk.

Kerminal reaches those two helpers from `collectKerminalTemplates()` in `packages/cli/src/configurators/kerminal.ts`; the registry in `configurators/index.ts` maps the platform to that one collector, and `shared.ts` / `workflow.ts` supply the shared skill-collection and `.trellis/` scaffolding behind it.

## Adding a New Bundled Skill

The shape and dispatch wiring are already generic, so adding a skill requires only file changes plus distribution verification.

1. **Create the directory tree.**

   ```
   packages/cli/src/templates/common/bundled-skills/<my-skill>/
     SKILL.md                     # YAML frontmatter + body
     references/                  # optional
       <topic>.md
     assets/                      # optional (anything readable as utf-8)
   ```

2. **Write a valid `SKILL.md` header.** The frontmatter must include at minimum:

   ```yaml
   ---
   name: <my-skill>
   description: "When the AI should reach for this skill. Triggering phrases go here."
   ---
   ```

   The `description` is what the host platform's auto-trigger mechanism matches against, so it should describe the user-intent triggers, not the skill's internals.

3. **Use placeholders where appropriate.** Bundled skill content runs through `resolvePlaceholders(file.content, ctx)`. Any `{{platform_name}}`, `{{python_cmd}}`, etc. token supported by `resolvePlaceholders` will be substituted with the resolved platform context.

4. **No dispatch wiring is required.** `listDirectories("bundled-skills")` discovers the new directory automatically, so the shared skill root receives it on the next `trellis init` or `trellis update`.

5. **Verify the distribution path** before shipping. Skipping any of these steps has historically caused features to be documented as bundled while the published npm tarball was missing the files:

   - Source files exist on the branch being tagged.
   - `pnpm -C packages/cli build` copies the asset into `dist/templates/common/bundled-skills/<skill>/`.
   - `npm pack --dry-run --json` includes the expected `dist/**` paths.
   - In a fresh temp project, `trellis init` writes `.agents/skills/<skill>/SKILL.md`.
   - `.trellis/.template-hashes.json` lists the generated files.
   - `trellis update --dry-run` in that temp project reports "Already up to date!".

6. **Add a migration manifest entry** if the skill is added in a release that other projects will upgrade into. Without an explicit manifest entry the file will land via the standard "missing file" branch of `trellis update`, but a manifest makes the change visible in the changelog.

## Overriding a Bundled Skill Locally

There is no formal "project-local skill" mechanism (e.g. `.trellis/skills/`). Bundled skills live in the shared `.agents/skills/` root, so any override lives there too.

The supported pattern relies on the existing template-hash diff in `trellis update`:

1. Edit the local file directly. Example: `.agents/skills/trellis-meta/SKILL.md`.
2. The file's hash now diverges from the entry in `.trellis/.template-hashes.json`.
3. The next `trellis update` detects the user modification and leaves the file untouched (Trellis never overwrites user-modified files without an explicit `--force`).

Caveats:

- The override applies to the single shared copy under `.agents/skills/<name>/`; there is no per-platform duplication.
- A future `trellis update --force` will overwrite local edits. Keep the override under version control so it can be reapplied if needed.
- Third-party skills installed under the same skill root with a different folder name are untouched by Trellis and are the cleaner option when the goal is to add behavior, not to mutate the bundled skill.
- Team-private conventions belong in `.trellis/spec/` or in a separate project-local skill, not in modifications to `trellis-meta` itself. See `customize-local/add-project-local-conventions.md`.

## Removing a Bundled Skill From a Project

There is no per-project opt-out flag for bundled skills. Two options:

1. **Delete the directory in the shared skill root.** `trellis update` will see the file missing, compare against `.template-hashes.json`, and treat the deletion the same as any other user modification — it will not silently re-create the directory unless `--force` is passed.

2. **Pin a Trellis version that did not ship the skill.** The bundled-skill set is determined at build time, so installing an older release of the CLI is the only way to permanently exclude a skill that the current release ships.

A third option — globally disabling all bundled skills — is not supported. The dispatch is unconditional: `collectKerminalTemplates()` takes no arguments, so there is nowhere for a flag to enter. Adding one would mean changing that signature plus `collectPlatformTemplates` in `configurators/index.ts`.

## Operating Rules

- Treat `templates/common/bundled-skills/` as the single source of truth for what bundled skills exist. Do not hand-maintain platform-by-platform skill lists.
- Do not add platform-specific logic inside a bundled `SKILL.md`. If a behavior is Kerminal-specific, put it in `templates/kerminal/` instead.
- Do not couple bundled skills to a specific CLI binary (e.g. `trellis mem`) without surfacing the dependency in the skill's description and references — users on older releases may not have the command.
- Do not store project-private content in a bundled skill. Bundled skills are public, shipped to every user; project rules belong in `.trellis/spec/` or a local skill.
