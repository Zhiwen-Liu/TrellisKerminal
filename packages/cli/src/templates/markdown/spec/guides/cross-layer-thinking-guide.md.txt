# Cross-Layer Thinking Guide

> **Purpose**: Think through data flow across layers before implementing.

---

## The Problem

**Most bugs happen at layer boundaries**, not within layers.

Common cross-layer bugs:

- API returns format A, frontend expects format B
- Database stores X, service transforms to Y, but loses data
- Multiple layers implement the same logic differently

---

## Before Implementing Cross-Layer Features

### Step 1: Map the Data Flow

Draw out how data moves:

```
Source → Transform → Store → Retrieve → Transform → Display
```

For each arrow, ask:

- What format is the data in?
- What could go wrong?
- Who is responsible for validation?

### Step 2: Identify Boundaries

| Boundary              | Common Issues                     |
| --------------------- | --------------------------------- |
| API ↔ Service         | Type mismatches, missing fields   |
| Service ↔ Database    | Format conversions, null handling |
| Backend ↔ Frontend    | Serialization, date formats       |
| Component ↔ Component | Props shape changes               |

### Step 3: Define Contracts

For each boundary:

- What is the exact input format?
- What is the exact output format?
- What errors can occur?

---

## Common Cross-Layer Mistakes

### Mistake 1: Implicit Format Assumptions

**Bad**: Assuming date format without checking

**Good**: Explicit format conversion at boundaries

### Mistake 2: Scattered Validation

**Bad**: Validating the same thing in multiple layers

**Good**: Validate once at the entry point

### Mistake 3: Leaky Abstractions

**Bad**: Component knows about database schema

**Good**: Each layer only knows its neighbors

### Mistake 4: Every Consumer Parses The Same Payload

**Bad**: A command reads JSONL events and casts fields inline:

```typescript
const thread = (ev as { thread?: string }).thread;
const labels = (ev as { labels?: string[] }).labels;
```

This looks local, but it means every consumer owns a private version of the
event contract. The next field change will update one command and miss another.

**Good**: Decode once at the event boundary, then export typed projections:

```typescript
if (!isThreadEvent(ev)) return false;
return ev.thread === filter.thread;
```

**Rule**: For append-only logs, JSON streams, RPC payloads, or config files,
create one owner for:

- event / payload type definitions
- type guards and normalization from `unknown`
- metadata projections used by UI commands
- reducers that replay state from the source of truth

Rendering code may format fields, but it must not redefine the payload contract.

---

## Checklist for Cross-Layer Features

Before implementation:

- [ ] Mapped the complete data flow
- [ ] Identified all layer boundaries
- [ ] Defined format at each boundary
- [ ] Decided where validation happens

After implementation:

- [ ] Tested with edge cases (null, empty, invalid)
- [ ] Verified error handling at each boundary
- [ ] Checked data survives round-trip
- [ ] Checked that consumers import shared decoders / projections instead of
      casting payload fields locally
- [ ] Checked that derived state points back to the source event identifier
      (`seq`, `id`, `version`) instead of inventing a second cursor

---

## Dual-Root Skill Consistency

In a Kerminal-managed project, skill files live in **two roots**:
`.kerminal/skills/` (entry skills such as `trellis-start`) and
`.agents/skills/` (reusable and bundled skills such as `trellis-before-dev`).
The same skill can exist in both roots (e.g., `trellis-check`). This is a
cross-layer boundary.

### Checklist: After Modifying Any Skill File

- [ ] Find the skill in both roots: `find .kerminal/skills .agents/skills -name "<skill>*"`
- [ ] Update every copy that must change (SKILL.md plus any bundled reference files)
- [ ] Keep frontmatter (`name`, `description`) and directory layout conventions aligned
- [ ] Re-grep both roots afterwards to verify nothing was missed

**Real-world example**: A fix landed in one root's copy of a skill while the other root kept the stale wording — caught by re-grepping both roots.

---

## Generated Runtime Template Upgrade Consistency

Some generated files are both documentation and runtime input. In Trellis,
`.trellis/workflow.md` is parsed by `get_context.py`, `task.py`, and shared
context modules such as `workflow_phase.py`. Template changes must be validated
against both fresh init and upgrade paths.

### Checklist: After Modifying A Runtime-Parsed Template

- [ ] Identify every runtime parser that reads the template, not just the file
      writer that installs it
- [ ] Check whether relevant syntax lives outside obvious managed regions
      such as tag blocks
- [ ] Verify fresh `init` output and a versioned `update` scenario that writes
      the older `.trellis/.version`
- [ ] Add an upgrade regression using an older pristine template fixture, then
      assert the installed file reaches the current packaged shape
- [ ] Update the backend spec that owns the runtime contract

**Real-world example**: A workflow platform routing marker format changed
between releases. Fresh init was correct, but `trellis update` only merged
`[workflow-state:*]` blocks and preserved stale markers outside those blocks.
Result: upgraded projects got new hook scripts but old workflow routing, so
`get_context.py --mode phase --platform <id>` could return empty phase detail.

---

## Versioned Content Boundary

Versioned content is a cross-layer boundary: when the same logical content
exists in multiple release lanes (stable, beta, RC), the source paths, the
routing or navigation config, and the version selector presented to readers
must all describe the same release line.

### Checklist: Before Editing Versioned Content

- [ ] Identify the target release line: stable, beta, or RC
- [ ] Verify the edited file lives in that line's path prefix (e.g., a `beta/`
      subtree vs the root/stable tree)
- [ ] Verify routing or navigation config points the version label to the same
      paths
- [ ] Grep the opposite lane for release-line-specific terms before committing
- [ ] Treat content from one line appearing under another line's paths as a
      source-path bug, not a rendering bug

**Real-world example**: A beta-only workflow change was documented under the
stable paths. Consumers following the stable version then got beta behavior.
The fix was to restore the stable content, move the beta material into the
beta lane, and add a grep audit for beta markers against the stable tree.

---

## Mode-Detection Probe Checklist

When a CLI auto-detects a mode by probing a remote resource (e.g., requesting an index URL to decide between two download modes):

### Before implementing:

- [ ] Probe runs in **ALL** code paths that use the result (interactive, `-y`, `--flag` combos)
- [ ] 404 vs transient error are distinguished — don't treat both as "not found"
- [ ] Transient errors **abort or retry**, never silently switch modes
- [ ] Shared state (caches, prefetched data) is **reset** when the input context changes (e.g., the user switches source)
- [ ] **Shortcut paths** (e.g., a non-interactive flag that skips a picker) must have the same error-handling quality as the probed path — check that downstream functions don't call catch-all wrappers

### After implementing:

- [ ] Trace every path from probe result to the mode-decision branch — no fallthrough
- [ ] External format contracts (URL shapes, response schemas) are tested or at least documented as comments
- [ ] Metadata reads consume a complete response or use a streaming parser — never parse a fixed-size prefix as full JSON
- [ ] When reconstructing a composite identifier from parsed parts, verify **all** fields are included and in the **correct position** (e.g., `owner/repo@ref` not `owner@ref/repo`)
- [ ] Verify that **action functions** called after a shortcut don't internally use the old catch-all fetch — they must use the probe-quality variant when error distinction matters

**Real-world example**: One probe-based flow accumulated 8 bugs across 3 review rounds: (1) the probe only ran in interactive mode, (2) transient errors fell through to the wrong mode, (3) a reconstructed identifier had a field in the wrong position, (4) prefetched data leaked across source switches, (5) a shortcut flag bypassed the probe while its downstream action used a catch-all fetch, turning timeouts into "not found".

**Real-world example**: Agent-session update hints fetched npm `latest` metadata with `response.read(4096)` and then parsed it as complete JSON. The published CLI package metadata exceeded 4 KB, so the JSON was truncated, parse failed silently, and the first session injection showed no update hint. Fix: read the complete response before parsing, and add a regression where `version` is followed by an 8 KB metadata tail.

---

## When to Create Flow Documentation

Create detailed flow docs when:

- Feature spans 3+ layers
- Multiple teams are involved
- Data format is complex
- Feature has caused bugs before

---

## Event Log / Projection Boundary

Append-only logs are cross-layer contracts. A single event travels through:

```
CLI input → event writer → append-only log (JSONL) → reader → filter → reducer → display
```

### Checklist: After Adding A New Event Kind Or Field

- [ ] Add the event kind to the central event taxonomy
- [ ] Add a typed event variant or type guard at the event layer
- [ ] Add normalization helpers for array/object fields that come from
      user input or JSON
- [ ] Keep `seq` / `id` assignment in the event writer only
- [ ] Make filters and reducers consume the typed event guard, not local casts
- [ ] Make display code consume reducer output or typed events, not raw JSON
- [ ] Add at least one regression that proves history replay and live filtering
      use the same filter model

**Real-world example**: A cross-layer feature shipped typed events (`kind`, `description`, `context`) but let several commands re-parse the raw payload fields with local type casts instead of routing through the shared types and reducers. The fix was to make the core event layer own the event types and guards, and expose one canonical metadata projection and one replay reducer — every consumer then read derived state through them instead of re-parsing.
