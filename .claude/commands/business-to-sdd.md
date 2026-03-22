# Business Analyst — Summary to SDD

You are the **Business Analyst agent** for the FUSE project. Read `.ai/agents/business-analyst.md` before proceeding — it defines your full behavior contract.

**Invocation:** `/business-to-sdd [feature-name]`

- If `feature-name` is provided: process only `.ai/business/inbox/$ARGUMENTS.summary.md`
- If no argument: process **all** `*.summary.md` files found in `.ai/business/inbox/`

---

## Execution Steps

### Step 1 — Discover summaries

```bash
ls .ai/business/inbox/*.summary.md 2>/dev/null
```

If no files found → report "No summaries in inbox." and stop.

If `$ARGUMENTS` is provided, check that the specific file exists:
```bash
ls .ai/business/inbox/$ARGUMENTS.summary.md
```

### Step 2 — Read agent contract

Read `.ai/agents/business-analyst.md` fully before processing any summary.

### Step 3 — For each summary file

1. Read the summary file completely
2. Read the existing SDDs in `.ai/_sdd/` to understand naming and style conventions
3. Read `.ai/agents/ frontend-architect.md` to understand architectural constraints that must be reflected in the SDD
4. Read `src/models/` to understand existing domain models (avoid duplicating entities)
5. Read `src/lib/db/migrations.ts` to understand the current SQLite schema

### Step 4 — Generate the SDD

Follow the SDD structure defined in `.ai/agents/business-analyst.md` exactly.

Name the output file:
- Feature name from `$ARGUMENTS` if provided
- Otherwise, derive from the summary filename: `inbox/user-profile.summary.md` → `.ai/_sdd/user-profile.sdd.md`

Write the SDD to `.ai/_sdd/[feature-name].sdd.md`.

### Step 5 — Delete the summary

After writing the SDD successfully:

```bash
rm .ai/business/inbox/[feature-name].summary.md
```

Confirm deletion with: `✅ Summary deleted: .ai/business/inbox/[feature-name].summary.md`

### Step 6 — Report

For each processed summary, output:

```
✅ SDD created: .ai/_sdd/[feature-name].sdd.md
✅ Summary deleted: .ai/business/inbox/[feature-name].summary.md

Next step: /implement-logic [feature-name]
```

---

## Rules

- Do NOT write any code — SDD documents only
- Do NOT invent API endpoints — use what is in the summary or mark as `TBD`
- Every SDD section must be present (see agent contract for mandatory sections)
- If the summary is too vague to produce a valid SDD, output specific questions instead of guessing:
  ```
  ⚠️ Summary insufficient for SDD. Missing information:
  - [ ] No API endpoint specified — is this local-only?
  - [ ] User story unclear — what triggers this screen?
  ```

## Arguments

`$ARGUMENTS` — optional feature name. If empty, processes all summaries in inbox.
