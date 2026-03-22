# Business AI Pipeline

This folder is the entry point for converting business requirements into production code through a structured 3-stage AI pipeline.

---

## Pipeline Overview

```
inbox/feature-name.summary.md
        ↓  /business-to-sdd
.ai/_sdd/00-feature-name.sdd.md      (summary deleted)
        ↓  /implement-logic feature-name
src/screens/feature-name/            (logic + functional UI, no styling)
        ↓  /ui-polish feature-name
src/screens/feature-name/            (design system applied, UI complete)
        ↓  rename
.ai/_sdd/00-feature-name.sdd.done.md (archived)
```

---

## Stage 1 — Summary → SDD

**Who:** Product owner / developer
**Action:** Drop a `*.summary.md` file in `inbox/`
**Then run:** `/business-to-sdd`

The business-analyst agent reads all summaries in `inbox/`, converts each to a full SDD at `.ai/_sdd/`, and deletes the summary file.

### SDD Naming Convention

SDDs are numbered sequentially so the implementation order is explicit at a glance:

```
.ai/_sdd/00-web-demonstration.sdd.md   ← pending / in progress
.ai/_sdd/00-web-demonstration.sdd.done.md  ← all 3 stages complete
```

When creating a new SDD, use the next available number:

```
00-first-feature.sdd.md
01-second-feature.sdd.md
02-third-feature.sdd.md
```

When all 3 stages are done, rename the file by replacing `.sdd.md` with `.sdd.done.md`.

### Summary file format (`inbox/feature-name.summary.md`)

```markdown
# Feature Name

## What it does (user perspective)
Short description of the feature goal.

## User stories
- As a [role], I want [action] so that [value]

## Screens / flows (rough)
- Screen A → Screen B → ...

## Data involved
- What entities are created/read/updated

## API / integrations (if known)
- Endpoint: POST /api/...
- Payload: { ... }

## Edge cases / rules
- ...

## Out of scope
- ...
```

---

## Stage 2 — SDD → Logic Implementation

**Who:** AI agent (logic-engineer)
**Action:** Reads the SDD, implements all layers
**Run:** `/implement-logic feature-name`

What gets implemented:
- Domain model + DTO
- Service (API calls)
- Repository (offline-first, SQLite)
- DAO (raw SQL)
- Hook (business logic)
- Screen (functional only — basic RN primitives, no design system)

The screen renders correctly and the feature works end-to-end. UI is intentionally unstyled.

---

## Stage 3 — Functional UI → Polished UI

**Who:** AI agent (ui-designer)
**Action:** Applies design system to existing screens
**Run:** `/ui-polish feature-name`

What gets applied:
- Design system components (replace View/Text/TouchableOpacity with project components)
- Theme colors and spacing
- Animations and transitions
- Accessibility attributes
- Match UX/UI standards in `.ai/skills/ux-ui-standards.md`

---

## Rules

- **Never skip Stage 2** — UI polish cannot happen before logic is implemented and working
- **One feature at a time** — finish all 3 stages before starting the next feature
- **Summary files are disposable** — they are deleted after SDD generation; the SDD is the source of truth
- **SDD is immutable during implementation** — if requirements change, update the SDD first, then re-run the affected stages
- **SDDs are numbered** — use the next available `NN-` prefix; never reuse a number
- **Done means done** — only rename to `.sdd.done.md` when all 3 stages are merged to `main`
