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

---

## Done

### [2026-03-21] 🔵 AI — Agente autônomo de PR lifecycle ✅

Build an agent that handles the full PR lifecycle autonomously.

**Implemented:**
- `.claude/commands/pr-lifecycle.md` — `/pr-lifecycle [PR_NUMBER]` slash command
- `.ai/agents/pr-lifecycle.md` — Full agent spec (4 phases: create → CI → reviews → merge)
- `.ai/scripts/pr-lifecycle.sh` — Status check helper script
- `.ai/agents/README.md` — Updated with new agent entry
