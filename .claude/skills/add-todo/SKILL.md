
---
name: add-todo
description: Use when the user asks to add a TODO, task, or reminder to track for later work (e.g. "add a todo", "/add-todo ..."). Manages TODO.md at the repo root, organizing entries by backend/frontend/general and grouping them by nature of change using the Conventional Commit types.
---

Add an entry to `TODO.md` at the repository root. The argument passed to this skill is
the todo text (and optionally a hint about scope/type); if no argument was given, ask the
user what to add.

## File location

Always `TODO.md` at the repo root — never inside `backend/` or `frontend/`.

## Structure

`TODO.md` is organized in two levels:

1. Top-level section by area: `## Backend`, `## Frontend`, `## General` (for anything
   that doesn't clearly belong to one workspace — repo tooling, docs, CI, etc).
2. Within each area, subsections by nature of change, using the same types as this
   repo's commit convention (see root `CLAUDE.md`): `### Feat`, `### Fix`, `### Refactor`,
   `### Perf`, `### Test`, `### Build`, `### Ci`, `### Chore`, `### Docs`, `### Style`,
   `### Revert`.

Entries are checkbox list items:

```markdown
# TODO

## Backend

### Feat
- [ ] Add rate limiting to the WS upgrade handler

### Fix
- [ ] Connection documents aren't deleted if Redis is down during disconnect

## Frontend

### Refactor
- [ ] Extract typing-indicator logic out of AppLayout

## General

### Chore
- [ ] Update README with new env var
```

Only include section headers (both area and type) that currently have at least one item.
Keep areas in the fixed order Backend, Frontend, General. Keep type subsections in the
fixed order listed above (Feat, Fix, Refactor, Perf, Test, Build, Ci, Chore, Docs, Style,
Revert), regardless of insertion order.

## Steps

1. Read `TODO.md` if it exists; if not, you'll create it fresh with just the sections you
   need.
2. Determine the **area** (Backend / Frontend / General):
   - Infer it from the file paths, component names, or wording in the request (e.g.
     mentions of a React component, `frontend/src/...` → Frontend; mentions of a
     controller/service/repository, `backend/src/...`, WebSocket handlers → Backend).
   - If genuinely ambiguous (affects both, or neither), use General.
   - Don't ask the user unless it's truly unclear from context — make a reasonable call.
3. Determine the **type** (nature of change) using the same judgment as picking a
   Conventional Commit type: new capability → Feat, bug → Fix, restructuring without
   behavior change → Refactor, speed/efficiency → Perf, test-only → Test, build tooling →
   Build, CI config → Ci, misc maintenance → Chore, documentation → Docs, formatting →
   Style, reverting prior work → Revert.
4. Insert the new item as a checkbox (`- [ ] ...`) under the matching
   area/type subsection, creating the area/type headers if they don't already exist yet
   (in the fixed order from above — insert the new heading in the correct position rather
   than appending it at the end).
5. Keep the todo text concise (one line, imperative mood, no trailing period) — matching
   the style of commit subject lines in this repo.
6. Don't touch, reorder, or reword any existing entries — only add the new one.
7. Write the file back.

## Output

Report back which area/type section the item was filed under, e.g.:
`Added to Backend > Fix in TODO.md`.
