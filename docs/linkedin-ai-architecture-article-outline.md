# Como Transformei o `.claude/` em um Sistema de Engenharia com Agentes, Skills, SDD e MCP

Eu não queria mais usar IA como um "chat esperto" que ajuda de vez em quando.

Eu queria um sistema.

Um sistema que entendesse arquitetura, respeitasse contratos, separasse responsabilidades, mantivesse contexto ao longo do tempo e ajudasse a transformar pedidos em entregas reais sem virar caos.

Foi isso que comecei a construir no FUSE dentro do `.claude/`.

E o resultado deixou de ser só um conjunto de prompts.

Hoje o `.claude/` funciona como uma camada operacional de engenharia: com agents especializados, skills reutilizáveis, rules contextuais, observability, comandos de execução e uma extensão enterprise para geração de SDDs guiada por contexto de domínio e integração com Jira e Figma via MCP.

Este artigo documenta todas as decisões, fluxos e aprendizados — com uma análise honesta do que funciona, o que ainda está imaturo e o que aprendemos com o processo.

---image

## O problema que eu queria resolver

Quem trabalha sozinho ou em times pequenos conhece esse padrão:

- cada sessão começa com perda de contexto
- decisões arquiteturais ficam espalhadas
- regras viram "boas intenções" em vez de contratos
- a IA ajuda em partes, mas não mantém consistência no sistema inteiro

O problema nunca foi só produtividade.

O problema era **previsibilidade**.

Eu queria reduzir o custo de pensar tudo do zero a cada tarefa, sem abrir mão de qualidade técnica.

E mais: eu queria que a IA operasse dentro de um sistema de engenharia real — com as mesmas restrições, os mesmos contratos e as mesmas expectativas que eu teria de um desenvolvedor sênior.

Então, em vez de depender de um único assistente genérico, comecei a estruturar um ecossistema em que cada parte tivesse um papel claro.

---

## A evolução do sistema: três gerações em três dias

O sistema passou por três gerações entre 23 e 26 de março de 2026.

**v1.0.0 (23/03):** 14 agents inicializados. O problema era óbvio desde o começo — responsabilidades sobrepostas, `frontend-architect` e `coupling-analyzer` fazendo coisas parecidas, `react-native-engineer` e `logic-engineer` sem separação real. Mais agents não significam mais qualidade.

**v2.0.0 (24/03):** Consolidação de 14 para 7 agents. Absorções importantes:
- `frontend-architect` + `coupling-analyzer` → `architect`
- `react-native-engineer` + `logic-engineer` → `engineer`
- `code-reviewer` + `pr-review-fixer` → `reviewer`
- `performance-auditor` + `sonar-auto-fixer` → `quality`
- `ui-designer` + `doc-designer` + `business-analyst` → `design-docs`

**v3.0.0 (25/03):** Migração Skills-First. O sistema `.ai/` (com um `system.md` de 1200 linhas) foi arquivado em `docs/history/legacy-ai/`. O `.claude/` se tornou o sistema ativo com arquitetura completamente diferente: entrypoint de 80 linhas, rules path-scoped, agents lean com frontmatter YAML, e skills como diretórios independentes.

A lição aqui é simples: **simplicidade é uma decisão arquitetural, não uma limitação**.

---image

## A primeira virada: sair de prompt solto e criar arquitetura

A base de tudo foi entender que o sistema precisava de um entrypoint leve e forte ao mesmo tempo.

No FUSE, esse papel ficou com o `CLAUDE.md`.

Ele não tenta carregar tudo. Ele define identidade, invariantes, routing e operating model em 80 linhas.

Em volta dele, o sistema foi separado em camadas com contratos claros:

| Camada | Responsabilidade |
|---|---|
| `agents/` | Papéis de execução com tools restritas |
| `skills/` | Conhecimento reutilizável carregado sob demanda |
| `rules/` | Guardrails ativados por contexto de arquivo |
| `agent-memory/` | Memória persistente por role |
| `commands/` | Fluxos operacionais invocáveis |
| `observability/` | Métricas, token tracking, router |
| `sdd/` | Backlog, design documents e enterprise layer |

Essa separação mudou tudo.

Quando a IA deixa de carregar tudo no mesmo prompt e passa a operar com contratos bem definidos, ela deixa de ser só uma interface conversacional e começa a parecer uma plataforma interna.

### O contrato arquitetural do domínio de produto

O invariante mais importante do sistema não está em nenhum agent. Ele está no `CLAUDE.md`:

```
Model → Service → Query → Hook → Screen
```

- **Model:** representa domínio, nunca payload de API
- **Service:** transporte, parsing de DTO, normalização
- **Query:** TanStack Query para estado async e caching
- **Hook:** lógica de negócio e handlers
- **Screen:** apresentação apenas

DTOs nunca chegam à UI. Screens não contêm lógica. Services não importam React.

Esse contrato é verificado por agents distintos (architect no design, engineer na implementação, reviewer no gate pré-merge) — o que cria enforcement por três frentes independentes.

---

## Os agents: de assistentes genéricos para um sistema especializado

Uma das decisões mais importantes foi não cair na armadilha do "super agente que faz tudo".

No `.claude/`, especialização é o princípio. Hoje o sistema tem 8 agents com papéis distintos:

| Agent | Modelo | Tools | Especialização |
|---|---|---|---|
| `architect` | Sonnet | Read, Grep, Glob | SDDs, design, coupling — **somente leitura** |
| `engineer` | Sonnet | Read, Write, Edit, Bash, Grep, Glob | Implementação dentro do contrato |
| `reviewer` | Sonnet | Read, Grep, Glob, Bash | Quality gate pré-merge |
| `test-writer` | Haiku | Read, Write, Edit, Bash | Testes determinísticos |
| `quality` | Sonnet | Read, Grep, Bash | Performance, análise estática |
| `design-docs` | Haiku | Read, Write, Edit | UI polish, documentação, business→SDD |
| `pr-lifecycle` | Sonnet | Read, Bash | Lifecycle completo de PR |
| `security-analyst` | Sonnet | Read, Grep, Glob | OWASP MAS 7 domínios |

### Por que o `architect` é read-only?

O `architect` não tem `Write` ou `Edit` em seu `tools:`. Isso é uma decisão arquitetural consciente.

Um arquitecto que pode modificar código é um arquitecto que vai ceder à pressão de resolver o problema imediatamente em vez de pensar na solução correta. A restrição de ferramentas força a separação de responsabilidades no próprio sistema de agents.

### A estratégia de modelo (Sonnet vs Haiku)

- **Sonnet:** agents que tomam decisões arquiteturais, reviews, implementação complexa
- **Haiku:** `test-writer` e `design-docs` (doc mode) — tarefas com padrão mais mecânico e alto volume

Na geração anterior, o sistema tinha Ollama local (qwen2.5-coder:14b) para tarefas simples. A decisão de mover para Claude-only foi tomada em 25/03: a complexidade de manter dois backends LLM (remote + local) superou a economia de custo para o porte atual do projeto. A documentação desta decisão está em `.claude/observability/router.md`.

---image

## Skills: o conhecimento saiu do prompt e virou ativo do sistema

A decisão de estruturar conhecimento como skills independentes foi uma das mais impactantes.

Em vez de colocar tudo dentro das instruções dos agents, o conhecimento foi extraído para `skills/` como diretórios independentes:

```
skills/
  engineering-principles/   SKILL.md + evals/
  coding-conventions/       SKILL.md + evals/
  api-integration/          SKILL.md + evals/ + assets/
  clean-code/               SKILL.md + evals/ + scripts/
  coupling-analysis/        SKILL.md + evals/ + scripts/ + references/
  react-native-patterns/    SKILL.md + evals/ + scripts/
  typescript-strict/        SKILL.md + evals/
  owasp-security/           SKILL.md + evals/ + references/ (7 domínios MASVS)
  security-auth/            SKILL.md + evals/
  security-crypto/          SKILL.md + evals/
  ...
```

Hoje são 23 skills, cada uma com:

- `SKILL.md` — conhecimento acionável, não filosófico
- `evals/evals.json` — cenários de avaliação para verificar se a skill está sendo aplicada corretamente
- `assets/` (quando aplicável) — templates de código, checklists
- `scripts/` (quando aplicável) — automações de suporte (flashlist-check, complexity-check, analyze-deps)
- `references/` (quando aplicável) — padrões externos como OWASP MAS por domínio

### O que é uma "boa skill"?

Uma skill ruim é uma lista de regras. Uma boa skill é conhecimento que um agente pode aplicar a uma situação específica e chegar a uma conclusão correta.

Por exemplo, a skill `engineering-principles` não diz "escreva código simples". Ela diz:

> **Simplicity Scales:** Prefer small pure functions, flat structures, and explicit flow. If a solution increases cognitive load, it must provide measurable value to justify that cost.

Isso é aplicável a uma decisão real. "Escreva código simples" não é.

### Por que extrair princípios de engenharia como skill?

O legado tinha um `engineering-principles.md` com 12 princípios e suas motivações. Durante a migração, esse arquivo foi descartado com a justificativa de "implícito agora".

Isso foi um erro. Princípios sem motivação explícita não sobrevivem à rotatividade — eles degeneram em regras sem contexto que ninguém sabe por que existem.

A restauração desses princípios como skill `engineering-principles` garante que o `architect` e o `engineer` sempre tenham acesso ao "por quê" das decisões, não apenas ao "o quê".

---

## Rules: o sistema só fica sério quando guardrail vira contrato

Eu também não queria um sistema em que as regras fossem opcionais ou globais.

Por isso o `.claude/` ganhou `rules/` **path-scoped**.

As regras entram por contexto de arquivo. Isso é uma diferença fundamental em relação ao legado.

### O sistema legado vs o sistema atual

No legado, `mandatory-rules.md` tinha 225 linhas de regras globais. Todo agent carregava tudo o tempo todo. Isso era ineficiente e contraproducente.

No sistema atual:

| Rule | Ativa quando... | Cobre |
|---|---|---|
| `git.md` | Editando `.gitignore`, `.github/**` | Commit discipline, auto-push proibido |
| `hooks.md` | Editando `*.hook.ts/tsx` | Naming, side effects, API shape |
| `screens.md` | Editando `src/screens/**` | Presentation-first, co-location, StyleSheet |
| `services.md` | Editando `src/services/**` | DTO boundaries, validação externa |
| `tests.md` | Editando `__tests__/**`, `*.test.*` | Coverage targets, no real API calls |
| `typescript.md` | Editando `src/**/*.ts/tsx` | No implicit any, exhaustive switch |
| `performance.md` | Editando `src/**/*.ts/tsx` | Performance, state, memory, native, code quality, determinism |

### Rastreabilidade: 12 regras obrigatórias do legado → 7 rules atuais

O legado tinha 12 mandatory-rules. Auditei a cobertura uma por uma:

| Regra legada | Cobertura atual |
|---|---|
| 1. Strict TypeScript | `typescript.md` — completa |
| 2. Architectural Boundaries | `CLAUDE.md` + `hooks.md` + `screens.md` — completa |
| 3. Screen Co-location | `screens.md` — completa |
| 4. Test Coverage | `tests.md` — completa |
| 5. Git Discipline | `git.md` — completa |
| 6. Performance Safety | `performance.md` — restaurada |
| 7. State Management | `performance.md` — restaurada |
| 8. Memory Safety | `performance.md` — restaurada |
| 9. Native Safety | `performance.md` — restaurada |
| 10. Encapsulation | `screens.md` — parcial |
| 11. Code Quality | `performance.md` — restaurada |
| 12. Determinism | `performance.md` — restaurada |

6 das 12 regras estavam sem cobertura após a migração. Foram restauradas em `rules/performance.md` — um arquivo que consolida as regras de comportamento de runtime que o sistema havia perdido.

---image

## Agent Memory: a diferença entre scaffolding e conhecimento real

Uma das partes mais importantes — e mais negligenciadas — do sistema é o `agent-memory/`.

Cada role tem um diretório de memória:

```
agent-memory/
  architect/README.md
  engineer/README.md
  reviewer/README.md
  test-writer/README.md
  quality/README.md
  design-docs/README.md
  pr-lifecycle/README.md
  security-analyst/README.md
```

No momento da migração, todos esses arquivos eram stubs com uma linha de descrição de propósito. Scaffolding sem substância.

O legado tinha um artefato chamado `claude-self-modifying.md` — um log vivo de padrões aprendidos em sessões anteriores. Era o único mecanismo de memória persistente real do sistema. E foi descartado na migração.

### Padrões recuperados para o engineer memory

Hoje o `agent-memory/engineer/README.md` tem 5 entradas reais:

1. **GlobalLoadingObserver:** nunca chamar `overlayActions.open('loading')` manualmente — o observer usa `useIsFetching()` e `useIsMutating()` globalmente
2. **Flat store:** sem slices, sem domains, sem flows — `{name}.store.ts` com Zustand `create()` + state + actions + hooks no mesmo arquivo
3. **Navigation:** `useEffect` + `router.replace()`, nunca `<Redirect>` — causa white screen no Expo Router antes do router estar pronto
4. **Hydration:** campo `rehydrated` não pode ser persistido — race condition com `onRehydrateStorage` causa white screen permanente
5. **Dependencies:** nunca `"latest"` para pacotes críticos — descoberto quando Firebase `"latest"` resolveu major diferente no CI

Cada entrada tem `Rule`, `Why` e `Applies to`. O "Why" é a parte mais importante — é o que permite julgar casos de borda, não apenas seguir regras cegamente.

### O que ainda está imaturo

5 dos 8 agent-memory files continuam como stubs: `test-writer`, `quality`, `design-docs`, `pr-lifecycle` e `security-analyst`. Para roles frequentemente invocados, isso representa uma perda de acúmulo real. Cada decisão tomada por esses agents que não é registrada precisa ser redescoberta na próxima sessão.

---

## A extensão enterprise: SDD como sistema, não só como documento

O `.claude/sdd/system/` é a camada de design e orquestração enterprise do sistema.

O objetivo não era criar mais uma camada bonita. Era resolver um problema real: como transformar um pedido vindo de negócio ou de Jira em uma cadeia de design e execução com menos improviso e mais rastreabilidade.

### Os quatro contratos

O sistema tem 4 contratos formais que são mutuamente consistentes:

**`sdd-contract.md`** — define as 9 seções obrigatórias de todo SDD:
- Objective, Scope, Inputs, Dependencies, Decisions, Implementation Notes, Acceptance Criteria, Risks, Status

**`orchestrator-contract.md`** — define o papel do orquestrador de work item:
- Responsabilidades: classificar domínio, identificar módulos necessários, definir ordem de execução, validar gates
- Proibições: nunca implementar diretamente, nunca assumir contexto que não está nos arquivos de domínio
- 6 status válidos: `draft`, `ready`, `in_progress`, `blocked`, `done`, `cancelled`

**`delivery-contract.md`** — define o que constitui evidência de entrega:
- Testes passando, PR com descrição, reviewer sign-off, CI verde

**`context-contract.md`** — define o que cada domínio deve ter:
- `_context.md`, `_architecture.md`, `_decisions.md`, `_shared-components.md`

### O fluxo de trabalho: de Jira a entrega

```
Jira ticket
  ↓ /jira-to-sdd
raw intake (_raw.md) — coleta contexto: descrição, critérios, riscos, domínio
  ↓ context classification
carrega sdd/system/contexts/{domain}/_context.md, _architecture.md, _decisions.md
  ↓ orchestration plan (_orchestrator.md)
define módulos: logic.sdd.md, ui.sdd.md, test.sdd.md
  + módulos condicionais: api.sdd.md, state.sdd.md, security.sdd.md, analytics.sdd.md
  ↓ cada módulo SDD
engineer implementa seguindo o contrato
  ↓ delivery evidence
PR, testes, CI, reviewer sign-off
```

### Contextos de domínio: onde o sistema ganha memória de negócio

Dois domínios estão ativos hoje: `auth` e `dashboard`.

Cada domínio tem 4 arquivos:

- `_context.md`: propósito do domínio, stack, padrões, regras específicas, módulos condicionais obrigatórios
- `_architecture.md`: componentes, fluxo de dados, responsabilidades de cada camada
- `_decisions.md`: decisões aceitas (com rationale), pendentes (com opções), rejeitadas (com motivo)
- `_shared-components.md`: hooks, componentes, models, services e design tokens compartilhados

Uma história de login nova não parte do zero. Ela herda linguagem do domínio, decisões já tomadas, componentes compartilhados e riscos conhecidos.

Sem isso, a IA ajuda em tarefas. Com isso, ela começa a ajudar a sustentar produto.

---image

## Jira + Figma + MCP: integração enterprise sem acoplar o sistema a credenciais

A abordagem de MCP no FUSE foi desenhada para ser segura por padrão.

```
.mcp.json                            ← versionado, define os servidores do projeto
.claude/settings.json                ← aprovação explícita dos MCPs: ["jira", "figma"]
.env.local                           ← segredos locais, nunca commitados
.claude/sdd/system/integrations/     ← governance e onboarding
```

**6 variáveis de ambiente necessárias:**
- `FUSE_MCP_JIRA_URL`, `FUSE_MCP_JIRA_BEARER`, `FUSE_MCP_JIRA_WORKSPACE`
- `FUSE_MCP_FIGMA_URL`, `FUSE_MCP_FIGMA_BEARER`, `FUSE_MCP_FIGMA_TEAM`

Nenhuma delas vai no repositório. O `.env.example` tem os placeholders. O `mcp-onboarding.md` tem o guia de 5 passos para configuração local.

**`mcp-enterprise-governance.md`** define as regras que protegem o sistema:
- MCP servers nunca são commitados com credenciais reais
- Nenhum agent pode adicionar MCP servers sem revisão de arquitetura
- Variáveis de ambiente documentadas antes de uso em produção

Esse tipo de cuidado parece operacional, mas ele define se o sistema é só "cool" ou realmente sustentável e seguro.

---image

## Observability: uma das partes menos glamourosas e mais valiosas

A maioria dos setups de IA para desenvolvimento para em prompts, agents e automação.

No FUSE, `.claude/observability/` é parte real do sistema.

### O que é rastreado

**`token-usage.csv`** — por sessão, por agent, por provider:
```
date,session_id,provider,model,input_tokens,output_tokens,cache_tokens,total_tokens
```

**`orchestration.csv`** — por task, por agent:
```
date,session_id,agent,task_type,input_tokens,output_tokens,duration_ms,cost_usd
```

**`pr-costs.csv`** — por PR:
```
pr_number,pr_title,session_count,total_tokens,estimated_cost_usd
```

### O Stop hook

O mecanismo de coleta está wired via `settings.json`:

```json
"hooks": {
  "Stop": [{
    "hooks": [{
      "type": "command",
      "command": "bash .claude/observability/log-claude-tokens.sh"
    }]
  }]
}
```

A cada sessão encerrada, o script faz parse do transcript, extrai tokens de input/output/cache, calcula custo em USD e appenda ao CSV. Funcionando em produção.

### O que esses números revelam

Com observability, é possível responder perguntas concretas:
- onde estamos gastando mais contexto
- qual agent está pesado demais
- o custo real de cada PR do ponto de vista de tokens
- quais fluxos estão sendo realmente usados vs apenas projetados

Sistemas bons não são só bem desenhados. Eles são mensuráveis.

---image

## O estado atual do sistema: avaliação honesta por dimensão

Depois de construir e auditar o sistema, uma avaliação honesta de 0 a 10:

| Dimensão | Score | O que funciona | O que falta |
|---|---|---|---|
| Entrypoint (`CLAUDE.md`) | **9** | 80 linhas, contrato claro, routing table | Não referencia enterprise SDD como ativo explicitamente |
| Sistema de agents | **8** | Tool restriction correta, architect read-only | `quality` tem 1 skill; conflito de modelo em `design-docs` |
| Skills layer | **8** | 23 skills estruturadas, evals por skill | `figma-context` e `jira-intake` sem evals |
| Rules layer | **9** | 12 mandatory-rules 100% cobertas, path-scoped | Hook paths podem perder hooks em padrões não-convencionais |
| Agent memory | **6** | `architect` (3 entradas), `engineer` (5 entradas) | 5/8 stubs — `test-writer`, `quality`, `design-docs`, `pr-lifecycle`, `security-analyst` |
| SDD system | **8.5** | 4 contratos completos, 2 contextos ativos | `enterprise-agent-system-v2.md` com status desatualizado |
| Observability | **7** | Stop hook real, 3 CSVs, scripts funcionais | CSVs com dados mock/legado; sem hooks `PreToolUse`/`PostToolUse` |
| MCP integration | **7.5** | Governance docs, onboarding, settings configurados | Ainda sem work items reais no pipeline end-to-end |
| Commands | **8** | 5 comandos cobrindo pipeline completo | Nenhum documento de casos de falha |
| Templates | **9** | 3 templates com exemplos reais do codebase | — |
| **Score geral** | **8.1** | | |

### O que está genuinamente enterprise e profissional

**Path-scoped rules** — o sistema de regras mais sofisticado que já vi em configuração de AI engineering. Regra de hook que só existe quando você edita um `.hook.ts`. Zero overhead em contextos irrelevantes. Zero enforcement perdido onde importa.

**Architect sem Write/Edit** — restrição de ferramenta que força separação de responsabilidades no próprio sistema de agents. Não é configuração. É design.

**4 contratos SDD mutuamente consistentes** — sdd-contract, orchestrator-contract, delivery-contract e context-contract. Todos se referem, nenhum contradiz o outro. Isso é raro.

**7 security skills mapeados a OWASP MAS** com um `security-analyst` dedicado que os agrega. A maioria dos sistemas de AI engineering trata segurança como um afterthought. Aqui ela é first-class.

**Stop hook + token tracking** — custo de cada sessão, de cada agent, de cada PR, calculado automaticamente e registrado em CSV. Não é romanticismo sobre AI. É economia.

**Settings.local.example.json com deny em `.env`** — a primeira linha de defesa contra vazamento de segredos está na configuração do próprio sistema de AI.

### O que ainda está imaturo

**5 de 8 agent-memory como stubs** — os roles mais frequentemente invocados (`test-writer`, `quality`) nunca acumularam nada. Cada sessão começa do zero para esses agents.

**CSVs com dados mock** — `token-usage.csv`, `orchestration.csv` e `pr-costs.csv` têm `mock-*` session IDs e nomes de agents do legado (`frontend-architect`, `coupling-analyzer`). Analytics baseada nesses dados seria enganosa.

**Nenhum work item real no pipeline enterprise** — os contextos `auth` e `dashboard` estão bootstrapados, os contratos estão definidos, o workflow está documentado. Mas o ciclo completo `Jira → raw → orchestrator → módulos SDD → implementação → entrega` ainda não foi exercitado end-to-end.

**`figma-context` e `jira-intake` sem evals** — exatamente as duas skills MCP mais estratégicas do sistema não têm cenários de avaliação. Todo o resto tem.

---

## O que eu aprendi com isso

Se eu tivesse que resumir as principais lições:

**1. Especialização vence generalização**

Agents melhores não são os que fazem tudo. São os que fazem bem uma coisa dentro de um contrato claro. O movimento de 14 para 8 agents foi uma melhora de qualidade, não uma limitação de capacidade.

**2. Prompt não é arquitetura**

Um `system.md` de 1200 linhas com tudo junto — routing, exemplos, specs de agent, regras de negócio — parece poderoso. Na prática, é um monolito que ninguém mantém de verdade. Sem estrutura, tudo vira improviso elegante com documentação bonita.

**3. O que foi descartado importa tanto quanto o que foi preservado**

A migração simplificou a estrutura corretamente. Mas descartou junto conteúdo real: princípios de engenharia com motivações, 430 linhas de convenções de nomenclatura, 8 padrões aprendidos em produção. Simplicidade de estrutura não é o mesmo que perda de substância. Auditei linha por linha e restaurei o que importava.

**4. Knowledge precisa sair da cabeça e virar sistema**

Skills, rules, contracts e contextos reduzem dependência de memória tácita. Mas só se tiverem conteúdo real. Scaffolding vazio é mais perigoso do que ausência — cria falsa sensação de organização.

**5. Observability é obrigatória**

Sem telemetria, você não sabe se criou uma boa arquitetura ou só uma narrativa bonita. Com token tracking real, é possível saber o custo de cada decisão de design.

**6. O próximo salto não é mais IA. É melhor operating model**

O ganho real vem quando IA, processo, contrato e documentação trabalham juntos. A infraestrutura está pronta. O próximo passo é exercitar o pipeline end-to-end com work items reais, acumular memória real nos agents e transformar a observability em decisões concretas de melhoria.

---

## Fechamento

O mais interessante disso tudo é que eu não vejo mais o `.claude/` como "configuração do assistente".

Eu vejo como uma **infraestrutura de raciocínio e execução**.

Uma infraestrutura que tenta transformar:
- pedidos em fluxo
- conhecimento em ativo
- contexto em sistema
- e arquitetura em algo reutilizável

O sistema tem hoje:
- arquitetura explícita e auditável
- especialização real por role
- governança de segurança com OWASP MAS
- observability com custo rastreável
- design system para SDD com contratos formais
- base sólida para integração com Jira e Figma

Score 8.1 de 10.

Não é o fim do caminho. Mas já não é só "usar IA no desenvolvimento".

É uma camada operacional de desenvolvimento mediada por IA — com os mesmos critérios que eu exigiria de qualquer outra parte do sistema de engenharia.

E isso, honestamente, é o que importa.

---image

#AI #SoftwareArchitecture #Engineering #ReactNative #ClaudeCode #MCP #DevTools #SoftwareDesign #Agents #ProductEngineering
