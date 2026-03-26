> **[PT]** Registo de itens pendentes, melhorias adiadas e bugs identificados durante o desenvolvimento — adicionar sempre que algo for marcado como "fazer depois".

---

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

### [2026-03-22] 🟢 FEAT — i18n Dinâmico: tradução sob demanda para qualquer idioma

O utilizador pode selecionar qualquer idioma na app. A tradução é gerada a partir do `en.json` via AI e persistida no device para uso offline.

**Escopo:**
- UI de seleção de idioma (lista ou search de locales)
- Chamar o modelo de tradução (AI ou API externa) com o `en.json` como source
- Persistir o JSON traduzido no device (SQLite ou AsyncStorage)
- Carregar o locale traduzido no i18next em runtime
- Cache: só traduzir novamente se `en.json` mudar (hash/version check)

**A investigar depois:**
- Idiomas RTL (árabe, hebraico, persa) — React Native tem suporte parcial via `I18nManager.forceRTL`, mas layout e componentes precisam de revisão para não quebrar; avaliar impacto por tela
- Qualidade das traduções para idiomas de baixo recurso
- Tamanho do JSON traduzido vs. quotas de armazenamento

**Após implementar:**
- Atualizar `README.md` — adicionar entrada em `### What Makes FUSE Different` destacando suporte dinâmico a qualquer idioma via tradução AI sob demanda

---

## Done

### [2026-03-21] 🔵 AI — Agente autônomo de PR lifecycle ✅

Build an agent that handles the full PR lifecycle autonomously.

**Implemented:**
- `.claude/commands/pr-lifecycle.md` — `/pr-lifecycle [PR_NUMBER]` slash command
- `.ai/agents/pr-lifecycle.md` — Full agent spec (4 phases: create → CI → reviews → merge)
- `.ai/scripts/pr-lifecycle.sh` — Status check helper script
- `.ai/agents/README.md` — Updated with new agent entry
