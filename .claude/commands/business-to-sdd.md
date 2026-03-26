# Business Analyst — Summary to SDD

You are the **Design & Docs agent** for the FUSE project. Read `.claude/agents/design-docs.md` and `.claude/skills/business-analysis/SKILL.md` before proceeding.

**Invocation:** `/business-to-sdd [feature-name]`

- If `feature-name` is provided: process only `.claude/inbox/$ARGUMENTS.summary.md`
- If no argument: process all `*.summary.md` files found in `.claude/inbox/`

---

## Execution Steps

### Step 1 — Discover summaries

```bash
ls .claude/inbox/*.summary.md 2>/dev/null
```

If no files are found, report `No summaries in inbox.` and stop.

If `$ARGUMENTS` is provided, verify the specific file exists:

```bash
ls .claude/inbox/$ARGUMENTS.summary.md
```

### Step 2 — Read required context

Read in this order:

1. `.claude/agents/design-docs.md`
2. `.claude/skills/business-analysis/SKILL.md`
3. Existing SDDs in `.claude/sdd/`
4. `.claude/agents/architect.md`
5. Existing domain models and migrations relevant to the feature

### Step 3 — Generate the SDD

Rules:

- preserve the business intent without inventing requirements
- align the design with the active `.claude` architecture
- mark unknowns as `TBD`
- if the feature name has no sequence yet, use the next available `NN-` prefix in `.claude/sdd/`

Write the result to:

```text
.claude/sdd/[sequence]-[feature-name].sdd.md
```

### Step 4 — Delete the summary

After the SDD is written successfully:

```bash
rm .claude/inbox/[feature-name].summary.md
```

### Step 5 — Report

Output:

```text
✅ SDD created: .claude/sdd/[sequence]-[feature-name].sdd.md
✅ Summary deleted: .claude/inbox/[feature-name].summary.md

Next step: /implement-logic [feature-name]
```

If the summary is too vague, stop and report explicit missing information instead of guessing.

## Arguments

`$ARGUMENTS` — optional feature name. If empty, processes all summaries in the inbox.
