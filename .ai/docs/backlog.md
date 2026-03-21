# Backlog — Fine-tuning & Pending Items

Items flagged during development that need revisiting. Add here whenever something is left pending, skipped, or marked as "do later".

---

## Tag Legend

| Tag         | Type                               |
| ----------- | ---------------------------------- |
| 🔴 BUG      | Broken behavior, wrong output      |
| 🟠 UI       | Visual issue, layout, screen       |
| 🟡 UX       | Flow, interaction, usability       |
| 🟢 FEAT     | Missing feature, enhancement       |
| 🔵 AI       | Agent, prompt, router, fine-tuning |
| 🟣 REFACTOR | Code quality, structure, cleanup   |
| ⚪ DOCS     | Documentation, .md files           |

Format: `[tag] Screen/Area — description`

---

## Pending

### [2026-03-21] 🔵 AI — Agente autônomo de PR lifecycle

Build an agent that handles the full PR lifecycle autonomously:

1. Create PR
2. Monitor pipeline — if it fails, read the errors (Sonar, lint, tests, etc.)
3. Fix all QA issues found (Sonar violations, test failures, any other gate)
4. Read PR review comments and address them
5. Respond to comments explaining the changes made
6. Commit, push and finalize the PR with merge

**Scope:** Claude Code Agent SDK + CI/CD integration (GitHub Actions / pipeline hooks).
**Priority:** Near future — foundation requires stable PR workflow and QA gates in place.

---

## Done

<!-- Move items here once resolved -->
