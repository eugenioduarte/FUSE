> **[PT]** Plano para garantir que toda a documentação em `.ai/` e `docs/` está escrita em inglês, com um comentário de contexto em português no topo de cada ficheiro.

---

# SDD — Task #7: English Documentation with Portuguese Headers

**Status:** Planned
**Priority:** Low
**Agent:** `react-native-engineer` (mechanical edits)

---

## 🎯 Goal

Ensure all `.md` files in `.ai/` are written in English, with a brief `> **[PT]**` comment at the top of each file explaining its purpose in one line. Files that are already in English just need the header added if missing.

---

## 📦 Scope

### Directories to Audit
- `.ai/agents/*.md` — 9 agent files
- `.ai/skills/*.md` — 9 skill files
- `.ai/rules/*.md` — 5 rule files
- `.ai/docs/*.md` — 4 doc files
- `.ai/router/router.md` — 1 file
- `.ai/_sdd/*.md` — all SDD files

### Format Required

Every `.md` file must start with:
```markdown
> **[PT]** One-line description of what this file does.

---
```

Then content in English.

---

## 🏗 Architecture Decisions

- The `> **[PT]**` header is a blockquote — renders nicely in GitHub
- Content language: English only
- No content rewrites — only translation of existing Portuguese content to English where needed
- The `> **[PT]**` line itself stays in Portuguese (it's the meta-description for Portuguese speakers)

---

## 📋 Implementation Plan

### Step 1 — Audit Files
```bash
# List all .md files in .ai/
find .ai/ -name "*.md" | sort
```
For each file, check:
- Does it have a `> **[PT]**` header? If not → add one
- Is the body content in Portuguese? If yes → translate to English

### Step 2 — Add Missing Headers
For files that already have correct English content but no PT header:
```markdown
> **[PT]** [one-line description in Portuguese]

---
```

### Step 3 — Translate Portuguese Content
For files where body content is in Portuguese:
- Translate body to English
- Keep the `> **[PT]**` header in Portuguese
- Preserve all code blocks exactly (no translation needed)
- Preserve all formatting (headings, lists, tables)

### Step 4 — Verify
```bash
# Check all files have the [PT] header
for f in $(find .ai/ -name "*.md"); do
  head -1 "$f" | grep -q "\[PT\]" || echo "Missing header: $f"
done
```
Output must be empty.

---

## ✅ Definition of Done

- [ ] All `.md` files in `.ai/` have a `> **[PT]**` header as first line
- [ ] All body content in `.ai/*.md` files is in English
- [ ] No Portuguese sentences in file bodies (comments/headers excluded)
- [ ] All files render correctly in GitHub Markdown preview
