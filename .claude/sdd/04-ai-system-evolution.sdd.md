> **[PT]** Investigação sobre a evolução do sistema AI do FUSE — de agentes monolíticos (`.ai/agents/`) para uma arquitectura skills-first com subagents lean. Baseado na conversa com o arquiteto, análise da documentação do Claude Code (Skills + Subagents), padrão Agent Skills aberto (agentskills.io) e princípios do Anthropic "Building Effective Agents" (Dez 2024).

---

# SDD: AI System Evolution — Skills-First Architecture

> Status: Active — Migration in progress
> Criado: 2026-03-25
> Fontes: Claude Code Docs (Skills, Subagents, Memory), Anthropic "Building Effective Agents", OpenCode architecture analysis

---

## TL;DR

O sistema actual do FUSE (`system.md` + 7 agents monolíticos + 9 skills-como-docs) foi um avanço correcto mas já existe uma geração seguinte. O mercado (Claude Code, OpenCode, agentskills.io) está a convergir para:

- **Skills como unidade primária** → cada skill é pequena, focada, carregada on-demand
- **Agents como execution contexts** → poucos (4–6 max), genéricos, diferenciados por tools/model/MCP
- **MCP scoped ao subagent**, não ao sistema global
- **Rules path-scoped** via `.claude/rules/` → só carregam quando o ficheiro afectado é aberto
- **CLAUDE.md conciso** → < 200 lines, o resto em skills/rules importadas

Esta mudança reduz drásticamente o token consumption, aumenta a precisão das instruções e alinha FUSE com o padrão aberto Agent Skills.

---

## 1. Diagnóstico do Sistema Actual

### O que existe hoje

```
.ai/
  system.md              → ~1200 linhas (orquestrador + routing + exemplos)
  agents/
    architect.md         → ~290 linhas
    engineer.md          → ?
    reviewer.md          → ?
    test-writer.md       → ?
    quality.md           → ?
    design-docs.md       → ?
    pr-lifecycle.md      → ?
  skills/
    api-integration-pattern.md
    clean-code-rules.md
    coupling-analysis.md
    gitignore-rules.md
    project-architecture.md
    react-native-best-practices.md
    translations.md
    typescript-strict-rules.md
    ux-ui-standards.md
  rules/
    folder-structure.md
    git-workflow.md
    mandatory-rules.md
    naming-conventions.md
```

### Problemas do sistema actual

| Problema                                                                                            | Impacto                                                                   |
| --------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| `system.md` com >1200 linhas é carregado **inteiro** em cada sessão                                 | ↑ tokens, ↓ aderência (quanto maior o contexto, menor a compliance)       |
| Cada agent `.md` contém routing logic, exemplos, workflow — muito além da responsabilidade do agent | Contexto inchado, difícil de manter                                       |
| Skills são "docs de referência" mas não são invocáveis como skills nativas                          | Não se beneficiam de lazy-loading                                         |
| MCP servers e tools não estão scoped por agent                                                      | Qualquer agent pode invocar qualquer tool — sem isolamento                |
| Sem persistent memory por agent                                                                     | Cada sessão recomeça do zero — os agents não aprendem padrões do projecto |
| Estrutura `.ai/` é proprietária, não segue padrão aberto                                            | Não portável, não beneficia de tooling externo                            |

---

## 2. O que o Mercado Está a Fazer Agora

### 2.1 Anthropic — "Building Effective Agents" (Dez 2024)

Princípios publicados depois de trabalharem com dezenas de equipas em produção:

> _"The most successful implementations weren't using complex frameworks or specialized libraries. Instead, they were building with simple, composable patterns."_

Três princípios core:

1. **Maintain simplicity** in your agent's design
2. **Prioritize transparency** — show the agent's planning steps explicitly
3. **Carefully craft your ACI (Agent-Computer Interface)** — tool documentation matters more than the overall prompt

**Implicação directa para FUSE:** O `system.md` actual é o oposto disso. É um framework complexo com routing matrices, classification logic em TypeScript, e exemplos verbosos. O Anthropic diz claramente: _"adding complexity only when it demonstrably improves outcomes"_.

### 2.2 Claude Code — Skills + Subagents (2025–2026)

Claude Code introduziu dois primitivos que mudam completamente o paradigma:

#### Skills (`.claude/skills/<name>/SKILL.md`)

```yaml
---
name: api-integration-pattern
description: API integration conventions for this codebase. Use when writing services or queries.
context: fork # opcional: corre num subagent isolado
agent: Explore # qual subagent executa (Explore, Plan, general-purpose, custom)
allowed-tools: Read, Grep
disable-model-invocation: false # Claude pode invocar automaticamente
---
# API Integration Pattern

When writing services:
  - Use the Query layer for async orchestration
  - DTOs never leak into Models
...
```

**O que muda:**

- Skill descriptions carregam em contexto (sem o conteúdo completo)
- Conteúdo completo só carrega quando invocada
- Skills com `context: fork` correm num subagent isolado — sem poluição de contexto
- Claude invoca automaticamente quando detecta relevância pela description

#### Subagents (`.claude/agents/<name>.md`)

```yaml
---
name: security-analyst
description: Security analysis and vulnerability detection. Use proactively after auth changes.
tools: Read, Grep, Glob, Bash
model: sonnet
memory: project # persistent memory por projecto
mcpServers:
  - semgrep:
      type: stdio
      command: semgrep-mcp
skills:
  - api-integration-pattern
  - typescript-strict-rules
---
You are a security analyst. Analyse code for OWASP Mobile Top 10 vulnerabilities...
```

**O que muda radicalmente:**

- **MCP scoped ao subagent** — semgrep só existe quando o security analyst corre
- **Skills injectadas no subagent** — herda conhecimento domain-specific no startup
- **Persistent memory** — aprende padrões do projecto através de sessões
- **Tool restrictions** — só acede às tools de que realmente precisa
- **Model por agent** — Haiku para exploração, Sonnet para análise profunda

#### Rules path-scoped (`.claude/rules/`)

```yaml
---
# .claude/rules/screens.md
paths:
  - 'src/screens/**/*.tsx'
  - 'src/screens/**/*.ts'
---
# Screen Rules

- No business logic in screen files
- StyleSheet.create required for all styles
- No inline JSX logic heavier than ternary
```

**O que muda:** Rules só carregam quando Claude abre ficheiros que matcham o path. Zero overhead para sessões que não tocam em screens.

### 2.3 Agent Skills Open Standard (agentskills.io)

O Claude Code implementa o padrão aberto [Agent Skills](https://agentskills.io/), suportado também por outros AI tools. Isto significa:

- Skills escritas para FUSE funcionam em Claude Code, Cursor, e outros tools que implementem o standard
- Portabilidade real entre ferramentas
- Comunidade de skills reutilizáveis

### 2.4 OpenCode

OpenCode (~120K GitHub stars) é o coding agent open-source mais usado no momento. A sua arquitectura confirma a tendência:

- LSP integration nativa (o agent sabe o que está a fazer no código)
- Multi-session paralela no mesmo projecto
- 75+ LLM providers — modelo escolhido por t ask, não por sessão
- Sem "agent documents" monolíticos — configuração via ferramentas standard

---

## 3. Arquitectura Skills-First — Como Ficaria o FUSE

### 3.1 O Shift Conceptual

**Hoje:**

```
System Orchestrator → Agent (lê rules + skills) → executa
```

**Skills-First:**

```
CLAUDE.md (< 200 linhas, contexto sempre presente)
    ↓
Rules path-scoped (carregam on-demand por ficheiro)
    ↓
Skills on-demand (carregam quando relevantes ou invocadas)
    ↓
Subagents lean (contexto próprio, MCP próprio, memory própria)
```

### 3.2 Mapeamento do Sistema Actual → Skills-First

#### Agentes actuais → Skills + Subagents lean

| Actual                       | Transformação                                                                              | Resultado                                                          |
| ---------------------------- | ------------------------------------------------------------------------------------------ | ------------------------------------------------------------------ |
| `architect.md` (~290 linhas) | Split: skill `sdd-creation` + skill `coupling-analysis` + subagent lean `architect`        | Subagent recebe skills no startup; system prompt fica em 40 linhas |
| `engineer.md`                | Split: skill `react-native-implementation` + skill `layer-patterns` + subagent `engineer`  | Idem                                                               |
| `reviewer.md`                | Skills `code-review-checklist` + `typescript-violations` + subagent `reviewer`             | Reviewer com `memory: project` aprende padrões de PR               |
| `test-writer.md`             | Skills `test-patterns-unit` + `test-patterns-e2e` + subagent `test-writer` com model Haiku | Haiku suficiente para testes template-driven                       |
| `quality.md`                 | Split em 2 subagents: `sonar-fixer` (Haiku, MCP semgrep) + `perf-auditor` (Sonnet)         | MCP scoped, models por complexidade                                |
| `design-docs.md`             | Skills `ux-polish-checklist` + `readme-template` + subagent `design-docs`                  |                                                                    |
| `pr-lifecycle.md`            | Skill `pr-workflow` com `context: fork` + `disable-model-invocation: true`                 | Invocação manual apenas                                            |

#### System.md actual → CLAUDE.md conciso

O `system.md` de 1200+ linhas seria fragmentado em:

```
.claude/
  CLAUDE.md                    → ~150 linhas (contexto sempre presente)
    - Project context (RN Expo)
    - Architecture model (Model → Service → Query → Hook → Screen)
    - Folder structure reference
    - Critical constraints only
    @.claude/rules/import-list.md   # imports declaradas, não inline

  rules/
    screens.md                 → só carrega para src/screens/**
    services.md                → só carrega para src/services/**
    hooks.md                   → só carrega para **/*.hook.ts
    git.md                     → git workflow, conventional commits
    typescript.md              → strict rules para todos os .ts/.tsx
    tests.md                   → só carrega para **/__tests__/**

  skills/
    sdd-creation/              → como criar SDDs
      SKILL.md
      examples/feature.sdd.md
    coupling-analysis/         → como analisar acoplamento
      SKILL.md
    react-native-patterns/     → RN best practices
      SKILL.md
      reference.md             → lista completa de padrões (só carrega quando pedido)
    typescript-strict/         → TS violations e guidelines
      SKILL.md
    api-integration/           → service/query layer patterns
      SKILL.md
      examples/
    ux-polish/                 → design system checklist
      SKILL.md
    test-patterns/             → unit test patterns
      SKILL.md
      templates/hook.test.ts
    pr-workflow/               → PR lifecycle
      SKILL.md
      disable-model-invocation: true   # só tu invocas

  agents/
    architect.md               → lean, recebe skills no startup
    engineer.md                → lean, recebe skills por task type
    reviewer.md                → com memory: project
    test-writer.md             → model: haiku
    security-analyst.md        → MCP semgrep scoped, se necessário
```

### 3.3 Exemplo: Subagent Lean

O que o `architect.md` actual poderia ficar:

```yaml
---
name: architect
description: Architecture decisions, SDDs, coupling analysis. Use for new features, structural refactors, and before major changes.
tools: Read, Grep, Glob
model: sonnet
memory: project
skills:
  - sdd-creation
  - coupling-analysis
  - project-architecture-patterns
---

You are the Frontend Architect of this React Native (Expo) project.

Responsibilities:
- Create SDDs before any implementation
- Analyse coupling before major refactors
- Enforce architectural layer boundaries
- Never write implementation details unless explicitly requested

Always check memory for previously documented architectural decisions.
```

**Linha count: ~15 linhas** (vs ~290 actuais).
**Skills injectadas no startup** pelo frontmatter — não precisa de as "carregar manualmente".

---

## 4. Benefícios Mensuráveis

| Métrica                            | Actual                                                | Skills-First                                        | Ganho                                    |
| ---------------------------------- | ----------------------------------------------------- | --------------------------------------------------- | ---------------------------------------- |
| Tokens por sessão (system context) | ~1200 linhas sempre                                   | ~150 linhas CLAUDE.md + rules on-demand             | ~80% menos tokens base                   |
| Aderência às regras                | Decresce com tamanho do contexto (Anthropic research) | Rules chegam quando o ficheiro está activo          | Conformidade mais alta                   |
| MCP overhead                       | N/A (sem MCP no sistema)                              | MCP só activo no subagent relevante                 | Zero overhead em sessões normais         |
| Memory cross-session               | Zero (cada sessão reinicia)                           | Subagents com `memory: project` acumulam            | Agents ficam mais inteligentes over time |
| Portabilidade                      | `.ai/` proprietário                                   | `.claude/` standard (Agent Skills open standard)    | Funciona em qualquer tool compatível     |
| Custo por operação                 | Sonnet para tudo                                      | Haiku para testes/exploração, Sonnet para reasoning | ~60% redução em custo de tasks mecânicas |

---

## 5. O que Não Muda

Mesmo com a migração para Skills-First, os contratos fundamentais do FUSE mantêm-se:

- **Arquitetura Model → Service → Query → Hook → Screen** — não muda
- **Rules obrigatórias** (no barrel imports, no inline styles, no business logic in screen) — migram para `.claude/rules/` path-scoped
- **Git workflow** — conventional commits, never auto-push — vai para `.claude/rules/git.md`
- **Coverage thresholds** — vão para `.claude/rules/tests.md`
- **Naming conventions** — `.claude/rules/typescript.md`

A mudança é estrutural, não conceptual.

---

## 6. Riscos e Contrapontos

### 6.1 Curva de migração

A migração de `.ai/` para `.claude/` é trabalho não trivial:

- Todos os agents precisam de ser reescritos em formato YAML frontmatter
- Skills precisam de ser convertidas para directórios `SKILL.md`
- A routing logic do `system.md` desaparece — Claude descobre automaticamente pelas descriptions
- Sem certeza de que Claude Code é o tool principal do projecto (vs VS Code + Copilot como agora)

**Quando faz sentido migrar:** Quando o projecto adoptar Claude Code como tool primário de desenvolvimento.

### 6.2 Auto-discovery vs routing explícito

O sistema actual tem routing explícito (`if matches 'sdd' → architect`). Skills-First depende de Claude descobrir automaticamente a skill pela description.

**Vantagem routing explícito:** Previsível, determinístico, auditável.
**Vantagem auto-discovery:** Menos manutenção, mais flexível, escala com novos agents sem reescrever system.md.

**Solução híbrida:** Skills com `disable-model-invocation: true` para workflows críticos (deploy, commit) + auto-discovery para knowledge skills.

### 6.3 Memory é local (não partilhada)

`memory: project` guarda em `.claude/agent-memory/<name>/` — pode ser checked in version control com `memory: project`, mas é machine-local por default.

Para teams, requere disciplina de commit da memory folder.

---

## 7. Próximos Passos de Investigação

> Estes são itens de estudo, não implementação imediata.

- [ ] **Estudar Agent Skills open standard** → https://agentskills.io/ (formato exacto, diferenças do claude code)
- [ ] **Ler Claude Code Skills docs completos** → https://code.claude.com/docs/en/skills (já lido parcialmente nesta investigação)
- [ ] **Ler Claude Code Subagents docs** → https://code.claude.com/docs/en/sub-agents (já lido parcialmente)
- [ ] **Experimentar com `.claude/` neste projecto** → criar um skill simples (ex: `sdd-creation`) e testar com Claude Code
- [ ] **Avaliar se Claude Code substitui Copilot** como tool principal — é pré-requisito para migração completa
- [ ] **Definir quais rules são path-scoped** → mapeamento de `.ai/rules/*.md` para `.claude/rules/` com frontmatter `paths:`
- [ ] **Avaliar MCP servers úteis para FUSE** → candidatos: semgrep (security), sonar (quality), firebase (dados), github (PR workflow)
- [ ] **Prototipar subagent lean** → reescrever `architect.md` no novo formato e comparar resultados práticos

---

## 8. Referências

| Documento                             | URL                                                          | Relevância                                               |
| ------------------------------------- | ------------------------------------------------------------ | -------------------------------------------------------- |
| Anthropic — Building Effective Agents | https://www.anthropic.com/research/building-effective-agents | Princípios fundamentais, patterns (Dec 2024)             |
| Claude Code — Skills                  | https://code.claude.com/docs/en/skills                       | API completa de skills, frontmatter, context:fork        |
| Claude Code — Subagents               | https://code.claude.com/docs/en/sub-agents                   | Subagents, MCP scoping, skills preload, memory           |
| Claude Code — Memory                  | https://code.claude.com/docs/en/memory                       | CLAUDE.md best practices, rules path-scoped, auto-memory |
| Agent Skills open standard            | https://agentskills.io/                                      | Standard aberto implementado pelo Claude Code            |
| OpenCode                              | https://opencode.ai                                          | Referência de agent coding tool open-source              |

---

## 9. Diagrama Comparativo

### Sistema Actual (`.ai/` custom)

```
[User Request]
      ↓
[system.md — 1200+ linhas, sempre em contexto]
  ├── routing matrix
  ├── agent creation protocol
  ├── orchestration examples
  └── checklists
      ↓
[agents/architect.md — ~290 linhas]
  ├── role + LLM routing
  ├── architectural principles
  ├── SDD template
  └── coupling analysis workflow
      ↓ (manual reference)
[skills/project-architecture.md]
[skills/coupling-analysis.md]
```

### Skills-First (`.claude/` standard)

```
[User Request]
      ↓
[CLAUDE.md — 150 linhas, contexto base]
  + [rules/*.md — path-scoped, carregam on-demand]
      ↓
Claude detecta pela description da skill/agent
      ↓
[@architect subagent]
  system prompt: 15 linhas
  skills injectadas: sdd-creation + coupling-analysis
  model: sonnet
  memory: project (aprende com uso)
  tools: Read, Grep, Glob (restrito)
  mcpServers: —
      ↓
[/sdd-creation skill — carrega conteúdo completo]
  + [reference.md — carrega só se pedido]
```

**Diferença:** No primeiro caso, ~1700+ linhas em contexto. No segundo, ~300 linhas no caso base.

---

> **Nota Final:** Esta não é uma refactorização urgente. O sistema actual funciona e foi um avanço real. Esta investigação documenta o que vem a seguir para quando o momento for certo — especialmente se o FUSE adoptar Claude Code como tool principal de desenvolvimento.

---

## 10. Como Recriar as Skills Correctamente — Anthropic skill-creator

> Fonte: https://github.com/anthropics/skills/blob/main/skills/skill-creator/SKILL.md

O Anthropic publicou um `skill-creator` que é em si mesmo uma skill — serve para criar e iterar todas as outras. Este é o processo oficial e mais avançado de construir skills de qualidade. Usá-lo para migrar as skills do FUSE garante que cada skill seja **testada, benchmarked e optimizada para triggering** antes de entrar em produção.

---

### 10.1 Anatomia correcta de uma Skill (segundo o skill-creator)

```
skill-name/
├── SKILL.md              ← required. YAML frontmatter + instruções markdown
├── evals/
│   └── evals.json        ← test cases: prompts + assertions
├── scripts/              ← código executável para tarefas repetitivas/determinísticas
├── references/           ← docs carregadas em contexto quando necessário
└── assets/               ← templates, ícones, ficheiros de output
```

**Três níveis de loading (progressive disclosure):**

| Nível             | O que carrega                             | Quando                      |
| ----------------- | ----------------------------------------- | --------------------------- |
| Metadata          | `name` + `description` (~100 words)       | Sempre em contexto          |
| SKILL.md body     | Instruções completas (< 500 linhas ideal) | Quando a skill é invocada   |
| Bundled resources | `references/`, `scripts/`, `assets/`      | On-demand, só quando pedido |

**Regras de ouro:**

- SKILL.md < 500 linhas. Se exceder, criar hierarquia adicional com ponteiros claros.
- Ficheiros de referência grandes (> 300 linhas) devem ter table of contents.
- Scripts em `scripts/` executam sem ser carregados em contexto — ideal para tarefas repetitivas.
- Quando uma skill suporta múltiplos domínios, organizar por variante em `references/`.

---

### 10.2 Frontmatter correcto

```yaml
---
name: react-native-patterns
description: React Native best practices for this codebase. Use proactively whenever
  writing hooks, screens, lists, animations, or anything touching the JS thread.
  Make sure to use this skill whenever the user mentions components, performance,
  FlatList, Reanimated, or navigation — even if they don't explicitly ask for "best practices".
disable-model-invocation: false # Claude pode invocar automaticamente
context: fork # opcional: corre num subagent isolado
agent: Explore # qual subagent executa (quando context: fork)
allowed-tools: Read, Grep
---
```

**Nota crítica sobre `description`:** O Anthropic descobriu que Claude tende a "undertrigger" skills — não as usa quando devia. A description deve ser **ligeiramente "pushy"**: incluir contextos específicos onde a skill deve disparar, mesmo que o utilizador não peça explicitamente.

---

### 10.3 Processo de criação (o loop oficial)

```
1. Capture Intent
   → O que deve a skill fazer?
   → Quando deve disparar?
   → Qual o formato de output esperado?
   → Precisa de test cases verificáveis?

2. Interview & Research
   → Edge cases, dependências, exemplos de input/output
   → Verificar MCPs disponíveis para research

3. Escrever SKILL.md draft
   → Imperativo no body ("Use X", "Return Y", "Always check Z")
   → Explicar o *porquê* em vez de apenas MUST/NEVER
   → Draft → ler com olhos frescos → melhorar

4. Criar test cases (evals/evals.json)
   → 2–3 prompts realistas que um utilizador real escreveria
   → Sem assertions ainda — só prompts

5. Correr test cases
   → with-skill E baseline em simultâneo (não sequencial)
   → Guardar outputs para comparação

6. Rever resultados (qualitativo + quantitativo)
   → Benchmark: pass rates, timing, tokens
   → Human review dos outputs

7. Melhorar a skill com base no feedback
   → Generalizar a partir do feedback (não overfitting para os exemplos)
   → Manter o prompt lean — remover o que não está a contribuir
   → Explicar o porquê — LLMs respondem melhor a reasoning do que a regras rígidas
   → Se os test runs todos escreveram o mesmo helper script → bundlar em scripts/

8. Repetir até o utilizador estar satisfeito

9. Description Optimization (script oficial)
   → Gerar 20 eval queries (should-trigger + should-not-trigger)
   → Correr run_loop.py para optimizar a description automaticamente
   → Aplica best_description no frontmatter

10. Package the skill (.skill file)
```

---

### 10.4 Mapeamento das Skills Actuais do FUSE → Novo Formato

Cada skill existente em `.ai/skills/` precisa de passar por este processo ao migrar para `.claude/skills/`. Estimativa de esforço:

| Skill actual                     | Skill nova                                       | Esforço estimado | Precisa de scripts bundled?             |
| -------------------------------- | ------------------------------------------------ | ---------------- | --------------------------------------- |
| `react-native-best-practices.md` | `react-native-patterns/`                         | Médio (4–6h)     | Sim — lint checks, componentes template |
| `typescript-strict-rules.md`     | `typescript-strict/`                             | Baixo (2–3h)     | Não                                     |
| `clean-code-rules.md`            | `clean-code/`                                    | Baixo (2h)       | Não                                     |
| `api-integration-pattern.md`     | `api-integration/`                               | Médio (3–4h)     | Sim — template de service/query         |
| `project-architecture.md`        | `project-architecture/`                          | Alto (6–8h)      | Sim — SDD template em `assets/`         |
| `coupling-analysis.md`           | `coupling-analysis/`                             | Médio (3–4h)     | Sim — scripts de análise de deps        |
| `ux-ui-standards.md`             | `ux-standards/`                                  | Médio (3–4h)     | Sim — checklist template                |
| `translations.md`                | `translations/`                                  | Baixo (2h)       | Não                                     |
| `gitignore-rules.md`             | Migrar para `.claude/rules/git.md` (path-scoped) | Trivial          | N/A                                     |

**Nota:** `gitignore-rules.md` não é uma skill invocável — é uma regra passiva. Deve ir para `.claude/rules/git.md` com `paths: ["**/.gitignore"]`.

---

### 10.5 Princípios de Escrita (do skill-creator)

O Anthropic sintetizou o seguinte depois de iterarem muitas skills:

1. **Imperativo no body** — "Return X", "Check Y", "Always verify Z"
2. **Explain the why** — Em vez de `NEVER use ScrollView for lists`, escrever: _"FlatList is required for dynamic lists because ScrollView renders all items upfront, which on mobile with limited memory causes frame drops and kills the 16ms budget."_
3. **Generalizar a partir dos exemplos, não overfittar** — Uma skill que só funciona para os 3 test cases de criação é inútil. Pensar em escala.
4. **Remover o que não contribui** — Ler as transcripts dos test runs. Se o model está a perder tempo com partes da skill que não ajudam, remover.
5. **Bundlar scripts repetitivos** — Se todos os test runs geraram o mesmo helper script, esse script deve estar em `scripts/` e a skill deve referenciar o seu caminho.
6. **Evitar ALWAYS/NEVER em caps** — É um yellow flag. Se precisas de caps, é sinal de que não explicaste suficientemente bem o porquê.

---

### 10.6 Como Usar o skill-creator Para o FUSE

Quando o momento de migrar chegar, o processo seria:

```bash
# 1. Instalar o repositório de skills do Anthropic
git clone https://github.com/anthropics/skills ~/.claude/skills-library

# 2. Activar o skill-creator no projecto FUSE
# (symlink ou copiar para .claude/skills/)
ln -s ~/.claude/skills-library/skills/skill-creator .claude/skills/skill-creator

# 3. Para cada skill existente em .ai/skills/:
# Abrir Claude Code e invocar:
# /skill-creator — converte .ai/skills/react-native-best-practices.md para .claude/skills/react-native-patterns/

# O skill-creator vai:
# - Analisar o conteúdo actual
# - Propor o novo formato SKILL.md
# - Criar evals/evals.json com test cases
# - Correr testes with-skill vs baseline
# - Gerar benchmark e viewer para revisão
# - Optimizar a description para triggering
# - Empacotar como .skill file
```

---

### 10.7 Referências

| Recurso                    | URL                                                                          |
| -------------------------- | ---------------------------------------------------------------------------- |
| Anthropic skills repo      | https://github.com/anthropics/skills                                         |
| skill-creator SKILL.md     | https://github.com/anthropics/skills/blob/main/skills/skill-creator/SKILL.md |
| Agent Skills open standard | https://agentskills.io/                                                      |
| Claude Code Skills docs    | https://code.claude.com/docs/en/skills                                       |
