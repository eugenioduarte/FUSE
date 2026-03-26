# Logic Engineer — Logic + Functional UI Implementation

You are the **Engineer agent** for the FUSE project. Read `.claude/agents/engineer.md` before proceeding.

**Invocation:** `/implement-logic [feature-name]`

`feature-name` is required. It must match an existing SDD at `.claude/sdd/*-[feature-name].sdd.md`.

---

## Pre-flight Checks

Before writing code:

```bash
ls .claude/sdd/*-$ARGUMENTS.sdd.md
yarn tsc --noEmit 2>&1 | tail -20
ls src/models/
ls src/lib/db/dao/
ls src/services/repositories/
```

If the SDD is missing, stop and report:

```text
⛔ SDD not found: .claude/sdd/*-$ARGUMENTS.sdd.md
Run /business-to-sdd $ARGUMENTS first.
```

## Read Before Implementing

1. `.claude/sdd/*-$ARGUMENTS.sdd.md`
2. `.claude/agents/engineer.md`
3. `.claude/agents/architect.md`
4. Relevant migrations, repositories, navigation, and adjacent models

## Implementation Checklist

Implement in this order:

1. domain model
2. DTO and transport mapping
3. persistence and migrations
4. repository boundary
5. hook orchestration
6. functional screen
7. navigation wiring
8. tests

Rules:

- preserve the contract `Model -> Service -> Query -> Hook -> Screen`
- do not leak DTOs into hooks or screens
- keep the screen functional and intentionally light on presentation
- add tests before reporting completion

## Post-implementation Validation

```bash
yarn tsc --noEmit
yarn lint
yarn test --testPathPattern=$ARGUMENTS
```

Fix failures before reporting success.

## Report

```text
✅ Logic implementation complete: [feature-name]
TypeScript: ✅ no new errors
Lint: ✅ passing
Tests: ✅ passing

Next step: /ui-polish [feature-name]
```

## Arguments

`$ARGUMENTS` — feature name, required.
