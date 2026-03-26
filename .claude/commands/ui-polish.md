# UI Designer — Design System Polish

You are the **Design & Docs agent** for the FUSE project. Read `.claude/agents/design-docs.md`, `.claude/skills/ux-standards/SKILL.md`, and the active SDD before proceeding.

**Invocation:** `/ui-polish [feature-name]`

`feature-name` is required. It must match an implemented screen and an SDD in `.claude/sdd/`.

---

## Pre-flight Checks

```bash
ls .claude/sdd/*-$ARGUMENTS.sdd.md
ls src/screens/$ARGUMENTS/$ARGUMENTS.screen.tsx
grep -r "TODO: ui-polish" src/screens/$ARGUMENTS/ --include="*.tsx" -c
```

If the screen is missing, stop and report:

```text
⛔ Screen not found: src/screens/$ARGUMENTS/$ARGUMENTS.screen.tsx
Run /implement-logic $ARGUMENTS first.
```

## Read Before Polishing

1. `.claude/sdd/*-$ARGUMENTS.sdd.md`
2. `.claude/agents/design-docs.md`
3. `.claude/skills/ux-standards/SKILL.md`
4. active theme and shared component surfaces
5. the target screen and any local subcomponents

## Polishing Checklist

- replace raw structure with project components where appropriate
- remove inline visual styles
- apply theme tokens for color, typography, spacing, borders, and loading states
- ensure loading, error, empty, and populated states are visually complete
- add accessibility labels to actionable elements
- remove all `TODO: ui-polish` markers that were addressed

## Post-Polish Validation

```bash
yarn tsc --noEmit
yarn lint
grep -r "TODO: ui-polish" src/screens/$ARGUMENTS/ --include="*.tsx"
```

The expected grep output is empty.

## Report

```text
✅ UI polish complete: [feature-name]
TypeScript: ✅ no new errors
Lint: ✅ passing
TODO markers remaining: 0
```

## Arguments

`$ARGUMENTS` — feature name, required.
