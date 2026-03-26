# AI Architecture Review — FUSE

**Data:** Março 2026 | **Escopo:** Runtime AI layer (app) + Governance layer (.ai/) + Roadmap

> ✅ **Consolidação executada (2026-03-24):** O item 3.14 foi concluído. Os 14 agentes foram consolidados em 7: `architect`, `engineer`, `reviewer`, `test-writer`, `quality`, `design-docs`, `pr-lifecycle`. Ver [CHANGELOG](./../agents/CHANGELOG.md).

> Documento de diagnóstico honesto e crítico. O objetivo não é validar o que foi feito, mas  
> identificar o que precisa evoluir para que essa arquitetura seja profissional, escalável e  
> reutilizável além do FUSE.

---

## Índice

1. [Contexto e premissas da análise](#1-contexto-e-premissas-da-análise)
2. [Fase 1 — Diagnóstico Completo](#2-fase-1--diagnóstico-completo)
   - 2.1 Pontos fortes
   - 2.2 Pontos fracos, riscos e over-engineering
   - 2.3 O que está frágil para crescer
   - 2.4 O que deve ser preservado
3. [Fase 2 — Visão do Próximo Nível](#3-fase-2--visão-do-próximo-nível)
   - 3.1 Critérios de maturidade
   - 3.2 Melhorias por prioridade
   - 3.3 Simplificação do `.ai/` sem perder governança
   - 3.4 Robustez da camada de IA do app
   - 3.5 Padrões 2026 a incorporar
4. [Fase 3 — Plano de Ação](#4-fase-3--plano-de-ação)
   - 4.1 Roadmap por horizonte
   - 4.2 Mudanças de estrutura de pastas
   - 4.3 Agentes: manter / simplificar / adicionar
   - 4.4 Skills e Rules: o que mudar
5. [Síntese executiva](#5-síntese-executiva)

---

## 1. Contexto e Premissas da Análise

**Duas camadas distintas estão sendo avaliadas:**

| Camada            | O que é                                                                                  | Onde vive                                                       |
| ----------------- | ---------------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| **Runtime AI**    | IA que roda dentro do app para o usuário final (summaries, challenges, dashboard agent)  | `src/services/ai/`, `src/services/prompts/`, hooks de challenge |
| **Governance AI** | Sistema de orquestração de agentes para o _desenvolvedor_ (Copilot, código, arquitetura) | `.ai/` — system.md, agents, router, rules, skills               |

Essas camadas têm propósitos completamente diferentes e precisam ser avaliadas separadamente. A maior parte dos problemas vem de **confundir ou negligenciar um dos lados**.

---

## 2. Fase 1 — Diagnóstico Completo

### 2.1 Pontos Fortes

#### Camada Runtime (app)

**`toJSONSafe()` — parser defensivo:**  
A abstração de 3 estratégias de parse (JSON direto → markdown fence → regex `{...}`) é genuinamente bem feita. Resolve o problema real de modelos retornando JSON embrulhado em texto sem lançar exceção. Deve ser extraída como utilitário reutilizável.

**Locale injection automática em `callAI()`:**  
Detectar o locale e injetar `"Always respond in <language>"` no system prompt de forma transparente é elegante. Qualquer chamada nova herda comportamento i18n correto sem esforço. Esta é uma das melhores decisões da camada.

**Retry/backoff com `AbortController`:**  
A lógica de 3 tentativas com backoff diferenciado por tipo de erro (429 vs 5xx vs exceções de rede) e timeout de 30s é produção-ready. A maioria dos projetos pessoais nem chega nesse nível.

**Mock automático quando sem API key:**  
Permite desenvolvimento e CI sem custos. O pattern `if (!ANTHROPIC_API_KEY) return mock()` é simples, previsível e não polui os testes.

**Prompts centralizados e documentados:**  
`src/services/prompts/index.ts` com JSDoc descrevendo propósito, formato de saída e consumidores de cada prompt é uma prática que 90% dos projetos ignora.

**Pré-geração de challenges:**  
A lógica de usar `ch.payload.questions` quando disponível (evitando chamada em runtime) mostra maturidade no pensar em UX e custos. Essa é a direção certa.

#### Camada Governance (.ai/)

**LLM Router com dados reais:**  
Ter 8 dias de métricas reais mostrando 65% de requests local vs 35% cloud, com 35% de economia e 151x de cache multiplier — isso deixou de ser teoria. É evidência. Raríssimo em projetos pessoais.

**`claude-self-modifying.md` — learning log vivo:**  
O conceito de registrar decisões arquiteturais confirmadas em sessões anteriores é uma das ideias mais maduras da arquitetura. É, em essência, memória persistente de contexto entre sessões.

**Security audit pipeline com 7 agentes especializados:**  
Mapear OWASP MAS em agentes especializados por domínio (storage, crypto, network, auth, platform, code, resilience) demonstra pensamento sistêmico. O relatório de 2026-03-22 com findings categorizados por severidade é nível enterprise.

**Router com routing por sinais de complexidade:**  
A heurística de "palavras-gatilho forçam Claude" (refactor, debug, architecture, integration) é pragmática e funciona. Não é perfeito, mas é Pareto-eficiente para desenvolvimento solo ou pequeno time.

---

### 2.2 Pontos Fracos, Riscos e Over-Engineering

#### 🔴 Crítico — Camada Runtime

**CRÍTICO-1: API key exposta no bundle do client**  
`EXPO_PUBLIC_ANTHROPIC_API_KEY` fica embutida no bundle JavaScript compilado. Qualquer pessoa com o APK pode extrair. O comentário no código reconhece isso. O security audit rotulou como CRITICAL-001. Sem proxy, isso é uma questão de tempo até abuso de quota.

```
Estado atual:   App → Anthropic API (key no bundle)
Estado correto: App → Firebase Function/CF Worker (key no servidor) → Anthropic API
```

**CRÍTICO-2: Nenhuma abstração de provider**  
`ai.service.ts` está acoplado ao formato exato da API Anthropic (`x-api-key`, `anthropic-version`, `content[0].text`). Trocar para OpenAI, Gemini, ou um modelo local exige reescrever o arquivo inteiro. Isso viola o princípio mais básico de inversão de dependência.

```ts
// Atual: hardcoded Anthropic
const res = await fetch(`${ANTHROPIC_BASE_URL}/messages`, {
  headers: { 'x-api-key': ANTHROPIC_API_KEY, 'anthropic-version': ANTHROPIC_VERSION },
})

// Deveria ser:
const text = await aiProvider.complete(messages, options)
```

**CRÍTICO-3: Nenhuma validação de schema na saída da IA**  
Após `toJSONSafe()`, a validação é manual — `if (!parsed?.title || !parsed?.content)` — por todo o código. Não há esquemas declarativos. Se o modelo mudar o formato da resposta, os erros aparecem em runtime de forma silenciosa ou com mensagens genéricas. Falta Zod.

```ts
// Atual
if (!parsed?.title || !parsed?.content) throw new Error('AI returned unexpected format.')

// Deveria ser
const result = AISummarySchema.safeParse(parsed)
if (!result.success) throw new AISchemaError(result.error)
```

#### 🟠 Alto — Camada Runtime

**ALTO-1: `prompts/index.ts` é um arquivo monolítico de 165 linhas**  
Contém prompts de 5 domínios diferentes (summary, knowledge, matrix, quiz, hangman, text-answer) em um único arquivo flat. Não escala. Ao adicionar o 7º ou 8º tipo de challenge, o arquivo vira um dump. Precisa de separação por domínio.

**ALTO-2: `DashboardAgentDisplay.tsx` tem 299 linhas com 6 responsabilidades**  
O componente faz: formatação de datas, escuta de notificações Firebase, lógica de próximo evento do calendário, geração de mensagem com IA, hash de prompt e renderização. É um God Component disfarçado de "componente de exibição". Viola SRP de forma séria.

**ALTO-3: Sem cache de respostas de IA**  
Cada chamada a `generateSummary("História do Brasil")` vai à API — sempre. Se o usuário abrir o mesmo resumo 10 vezes, paga-se 10 vezes. A IA não é deterministica, mas para summaries gerados uma vez, o resultado deve ser persistido e reusado. O `summariesRepository` já persiste o conteúdo localmente — mas a geração inicial sempre re-usa a API em vez de checar um cache por hash do prompt.

**ALTO-4: Sem streaming**  
Todos os requests de IA são blocking fetch. Para summaries de 8–14 parágrafos, o usuário espera um timeout invisível. Streaming (via `text/event-stream`) dá feedback imediato e reduz a percepção de latência de ~5s para quase instantâneo. A API da Anthropic suporta `stream: true` desde o início.

#### 🟡 Médio — Camada Governance (.ai/)

**MÉDIO-1: `claude-self-modifying.md` referencia padrões que não existem no código**  
O arquivo menciona `GlobalLoadingObserver`, `useIsFetching()`, `React Query`, e `router.replace()`. Nenhum desses existe no codebase atual (que usa `overlay.store.ts`, chamadas diretas a services, e `@react-navigation`). Isso significa que o learning log tem entradas de _outro projeto_ misturadas, o que contamina o contexto e induz erros.

**MÉDIO-2: Dois "sistemas de arquitetura" paralelos sem fonte única de verdade**  
Existem: `base2.md` (runtime AI), `.ai/docs/architecture.md` (governance AI), `FUSE.wiki/Project-Structure.md` e `FUSE.wiki/UI-and-Animations.md`. Qual é a fonte autoritativa? Para um projeto solo é gerenciável, mas para um time, é inconsistência garantida.

**MÉDIO-3: Rastreamento de tokens via CSV manual e shell scripts**  
O `.ai/router/token-usage.csv`, `orchestration.csv` e os scripts `log-claude-tokens.sh` são mantidos manualmente. Isso funciona para 1 desenvolvedor por 2 semanas. Para uso sério, precisa ser automatizado via Claude hooks ou CI.

**MÉDIO-4: 14 agentes com sobreposição de responsabilidade**  
`logic-engineer`, `react-native-engineer`, `frontend-architect` e `doc-designer` têm zonas de responsabilidade que se sobrepõem. Na prática, em 90% dos casos é o `react-native-engineer` + `code-reviewer` que fazem o trabalho. Os outros 12 agentes são invocados raramente.

#### 🟢 Baixo — Design

**BAIXO-1: Temperature fixada nos callers, não nos prompts**  
`callAI(messages, 0.4)` — o caller escolhe a temperature. Seria mais coeso que cada prompt module declarasse sua temperature ideal, pois o autor do prompt é quem sabe o quão determinístico deve ser a resposta.

**BAIXO-2: `aiService.generateSummaryImage()` e `ttsToBase64()` são stubs**  
Métodos que retornam `picsum.photos` e `null` respectivamente. Se nunca vão ser implementados com Anthropic, devem ser removidos da interface ou marcados `@deprecated`. Stubs permanentes são mentira arquitetural.

---

### 2.3 Onde a Solução Está Frágil para Crescer

1. **Trocar de provider de IA** requere reescrita de `ai.service.ts` inteiro.
2. **Adicionar um novo tipo de challenge** requere adicionar prompts em `prompts/index.ts` (monolítico), criar um hook novo, e torcer para que o schema da resposta seja tratado corretamente sem Zod.
3. **Onboarding de um segundo desenvolvedor**: o `.ai/` tem 70+ arquivos, 5 camadas (agents, skills, rules, router, security), sem um "start here" claro para quem chega novo.
4. **Escalar o Dashboard Agent** para mais contextos (ranking, streaks, conquistas) significa adicionar mais lógica no componente de 299 linhas já sobrecarregado.
5. **Medir o impacto da IA no app** é impossível atualmente — não há correlação entre chamadas à IA e métricas de engajamento do usuário (o usage-tracker e o ai.service são ilhas).

---

### 2.4 O Que Deve Ser Preservado

| Elemento                              | Por quê manter                                                                      |
| ------------------------------------- | ----------------------------------------------------------------------------------- |
| `toJSONSafe()`                        | Resolução elegante de problema real. Extrair para `src/utils/`                      |
| `callAI()` locale injection           | Correto, transparente, sem overhead                                                 |
| Retry/backoff com `AbortController`   | Produção-ready, bem estruturado                                                     |
| Mock automático sem API key           | Crítico para CI/CD e desenvolvimento local                                          |
| `claude-self-modifying.md` _conceito_ | Memória persistente entre sessões é valioso — mas precisa limpar entradas inválidas |
| LLM Router dual-model                 | Economia comprovada com dados reais                                                 |
| Security audit pipeline (7 agentes)   | Estrutura madura, OWASP MAS mapeado                                                 |
| Prompts centralizados                 | Boa ideia, má organização — reorganizar, não abandonar                              |

---

## 3. Fase 2 — Visão do Próximo Nível

### 3.1 Critérios de Maturidade

Uma arquitetura de IA móvel é **madura** quando satisfaz todos estes critérios:

| Critério                  | Descrição                                                | Status atual   |
| ------------------------- | -------------------------------------------------------- | -------------- |
| **Segurança**             | API key nunca no client bundle                           | ❌ Parcial     |
| **Abstração de provider** | Trocar Anthropic por qualquer outro em 1 arquivo         | ❌ Ausente     |
| **Schema validation**     | Output da IA validado com tipos explícitos               | ❌ Manual      |
| **Observabilidade**       | Cada chamada de IA é rastreável (latência, tokens, erro) | ❌ Ausente     |
| **Caching**               | Respostas idênticas não re-pagam por tokens              | ❌ Ausente     |
| **Streaming**             | UX não trava esperando 5–8s em silêncio                  | ❌ Ausente     |
| **Governança testável**   | Agentes e prompts têm testes de contrato                 | ❌ Ausente     |
| **Documentação coesa**    | 1 fonte de verdade por camada                            | ⚠️ Fragmentada |

---

### 3.2 Melhorias por Prioridade

#### Curto Prazo (Sprint 1–2, ~2 semanas)

**P1 — Proxy server-side para a API key**  
Implementar um Firebase Function ou Cloudflare Worker que:

- Receba o Firebase ID token do usuário
- Valide autenticação
- Aplique rate limit por uid (ex.: 20 req/dia)
- Proxie para a Anthropic API com a chave guardada server-side

Isso elimina o CRITICAL-001 do security audit e é o pré-requisito para qualquer uso público.

**P2 — Abstração de provider (`AIProvider` interface)**  
Criar `src/services/ai/provider.ts`:

```ts
export interface AIProvider {
  complete(messages: AIMessage[], options?: AIOptions): Promise<string>
  stream?(messages: AIMessage[], options?: AIOptions): AsyncIterable<string>
}
```

`ai.service.ts` passa a usar `AIProvider`. `AnthropicProvider` implementa a interface. Trocar para OpenAI/Gemini/local = criar um novo arquivo de 50 linhas.

**P3 — Zod schemas para output de IA**  
Criar `src/services/ai/schemas.ts`:

```ts
export const AISummarySchema = z.object({
  title: z.string().min(1),
  content: z.string().min(10),
  keywords: z.array(z.string()).max(20),
})
```

Substituir todas as validações manuais. Erros de schema passam a ser tipados e rastreáveis.

**P4 — Limpar `claude-self-modifying.md`**  
Remover entradas de outros projetos (GlobalLoadingObserver, React Query, router.replace). Adicionar apenas padrões confirmados neste codebase.

#### Médio Prazo (Sprint 3–5, ~1 mês)

**P5 — Cache de respostas de IA**  
`src/services/ai/ai-cache.ts` — hash SHA-256 do prompt+modelo → resultado em cache (AsyncStorage ou SQLite). TTL de 7 dias para summaries. Reduz chamadas em 60%+ para usuários que revisitam conteúdo.

**P6 — Streaming para summaries**  
Usar `stream: true` na Anthropic API. Criar `useStreamingAI` hook que expõe `content` progressivo e `isComplete`. A summary screen mostra parágrafos aparecendo em tempo real em vez de tela branca por 5s.

**P7 — Separar `prompts/index.ts` por domínio**

```
src/services/prompts/
  summary.prompts.ts        # SUMMARY_SYSTEM, KNOWLEDGE_SYSTEM, builders
  challenge.prompts.ts      # MATRIX, QUIZ, HANGMAN, TEXT prompts
  agent.prompts.ts          # dashboard agent, mini-explain
  index.ts                  # re-exports apenas
```

**P8 — Refatorar `DashboardAgentDisplay`**  
Separar em:

- `useDashboardAgent()` hook — toda a lógica (notifs, events, AI call, hash)
- `DashboardAgentDisplay` componente — só renderização (< 60 linhas)
- `AgentMessageCard` componente atômico reutilizável

#### Longo Prazo (1–3 meses)

**P9 — Observabilidade de IA no app**  
Conectar `ai.service.ts` ao `usage-tracker.ts`: cada chamada de IA registra topicId, tipo de operação, tokens estimados, latência, e resultado (success/error). Isso permite responder: "Quais challenges gerados por IA têm maior taxa de conclusão?"

**P10 — Versionamento de prompts**  
Cada prompt tem uma versão semântica. O `summariesRepository` salva `promptVersion` junto ao contenído gerado. Quando o prompt evolui, o app sabe que summaries antigos foram gerados com versão anterior e pode oferecer re-geração.

**P11 — Tornar a camada de IA um package reutilizável**  
`@fuse/ai-client` — um package interno (ou npm privado) com `AIProvider`, `callAI`, `toJSONSafe`, schemas, cache, e retry logic. Reusável em outros projetos sem copy-paste.

---

### 3.3 Simplificação do `.ai/` sem Perder Governança

**Diagnóstico atual:** 14 agentes, 9 skills, 2 routers, 5 subpastas de docs, 20+ scripts. Para um desenvolvedor solo, isso é **overhead de manutenção** disfarçado de sistema sofisticado.

**Princípio de simplificação:** se um agente não foi invocado em 30 dias, é candidato a merge ou deprecação.

**Agentes a consolidar:**

| Agentes atuais                             | Merge sugerido            | Justificativa                      |
| ------------------------------------------ | ------------------------- | ---------------------------------- |
| `logic-engineer` + `react-native-engineer` | → `react-native-engineer` | Sobreposição quase total           |
| `business-analyst` + `doc-designer`        | → `doc-designer`          | BA raramente usado em projeto solo |
| `pr-lifecycle` + `pr-review-fixer`         | → `pr-lifecycle`          | Dois agentes para o mesmo fluxo    |
| `test-writer` + `test-write-e2e`           | Manter separados          | Propósitos genuinamente distintos  |

**Resultado:** 14 agentes → 10 agentes sem perda funcional real.

**Docs a consolidar:**

| Atual (fragmentado)                                                     | Proposto (coeso)                              |
| ----------------------------------------------------------------------- | --------------------------------------------- |
| `architecture.md` + `agent-flow.md` + `orchestrator-quick-reference.md` | → `reference.md` (1 doc de referência rápida) |
| `token-analysis.md` + `token-usage.md` + CSVs                           | → `economics.md` (resumo + link para CSVs)    |
| `base2.md` + `FUSE.wiki/` (seções de IA)                                | → `base2.md` como fonte única de runtime AI   |

---

### 3.4 Como Tornar a Camada de IA do App Mais Robusta

#### Segurança

```
Curto:  Proxy server-side → remove API key do bundle
Médio:  Rate limiting por usuário no proxy
Longo:  Attestation (Play Integrity + App Attest) antes de chamadas de IA
```

#### Abstração

```
Curto:  Interface AIProvider → AnthropicProvider implementa
Médio:  MockProvider para testes determinísticos
Longo:  LocalProvider (modelo on-device via react-native-llm) para offline
```

#### Resiliência

```
Atual:  3 retries com backoff (bom)
Melhorar: circuit breaker — após 5 falhas consecutivas, para de tentar por 60s
          fallback funcional — se IA falha, summary usa conteúdo local anterior
```

#### Performance

```
Curto:  Streaming (text/event-stream) para summaries
Médio:  Cache SHA-256 de prompts
Longo:  Pre-warming — gerar summary em background ao criar tópico
```

---

### 3.5 Padrões 2026 a Incorporar

| Padrão                          | Aplicação no FUSE                                                                                                                                        |
| ------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Structured Outputs**          | Anthropic suporta `response_format: {type: "json_object"}` desde 2024 — usar em vez de confiar no parsing manual                                         |
| **Tool Use / Function Calling** | Substituir prompts de avaliação por tools declaradas — a IA chama `evaluate_answer({score, feedback})` em vez de retornar JSON frágil                    |
| **Prompt caching (Anthropic)**  | `cache_control: "ephemeral"` nos system prompts reduz custo em até 90% em chamadas repetidas com o mesmo system prompt                                   |
| **Edge Functions para proxy**   | Cloudflare Workers ou Supabase Edge Functions têm cold start < 5ms — melhor que Firebase Functions para baixa latência                                   |
| **AI SDK (Vercel)**             | `@ai-sdk/anthropic` abstrai provider, streaming, tools e structured outputs em uma interface unificada — elimina o need de manter `ai.service.ts` custom |

---

## 4. Fase 3 — Plano de Ação

### 4.1 Roadmap por Horizonte

```
SPRINT 1 (Semana 1-2) — Segurança e Fundação
─────────────────────────────────────────────
[ ] Implementar proxy server-side (Firebase Function ou CF Worker)
[ ] Remover EXPO_PUBLIC_ANTHROPIC_API_KEY do client
[ ] Criar AIProvider interface + AnthropicProvider
[ ] Adicionar Zod schemas para todos os outputs de IA
[ ] Limpar entradas inválidas do claude-self-modifying.md

SPRINT 2 (Semana 3-4) — Organização e Qualidade
────────────────────────────────────────────────
[ ] Separar prompts/index.ts em 3 arquivos por domínio
[ ] Refatorar DashboardAgentDisplay → hook + componente puro
[ ] Adicionar testes unitários para toJSONSafe, callAI (mock provider)
[ ] Consolidar agentes .ai/: 14 → 10
[ ] Unificar docs fragmentados em reference.md

SPRINT 3 (Mês 2) — Performance e UX
─────────────────────────────────────
[ ] Streaming para summaries (useStreamingAI hook)
[ ] Cache de respostas (AsyncStorage, TTL 7 dias, SHA-256 key)
[ ] Ativar Anthropic prompt caching no system prompt
[ ] Migrar para Vercel AI SDK (ou manter custom com interface limpa)

SPRINT 4 (Mês 3) — Observabilidade e Escala
─────────────────────────────────────────────
[ ] Conectar ai.service ao usage-tracker (eventos de IA rastreados)
[ ] Versionamento de prompts (promptVersion salvo nos summaries)
[ ] Circuit breaker para falhas consecutivas da IA
[ ] Avaliar extração para @fuse/ai-client package
```

---

### 4.2 Mudanças de Estrutura de Pastas

**Runtime AI — antes vs depois:**

```
ANTES                              DEPOIS
──────────────────────────────     ──────────────────────────────────────────
src/services/ai/
  ai.service.ts                    src/services/ai/
src/services/prompts/                provider.ts          ← interface AIProvider
  index.ts (165 linhas, flat)        anthropic.provider.ts
                                     mock.provider.ts     ← para testes
                                     cache.ts             ← cache layer
                                     streaming.ts         ← useStreamingAI
                                   src/services/prompts/
                                     summary.prompts.ts
                                     challenge.prompts.ts
                                     agent.prompts.ts
                                     schemas.ts           ← Zod schemas
                                     index.ts             ← re-exports
```

**Governance (.ai/) — antes vs depois:**

```
ANTES                              DEPOIS
──────────────────────────────     ──────────────────────────────────────────
.ai/
  agents/ (14 arquivos)            .ai/
  skills/ (9 arquivos)               agents/ (10 arquivos — consolidados)
  rules/ (5 arquivos)                skills/ (sem mudança — bem organizados)
  docs/                              rules/ (sem mudança)
    architecture.md                  docs/
    agent-flow.md                      reference.md      ← architecture + flow
    backlog.md                         backlog.md
    orchestrator-quick-reference.md    economics.md      ← token analysis resumida
    project-structure-snapshot.md      security/         ← mover para cá
    security-audit-report.md           project-structure-snapshot.md
  router/ (7 arquivos)               router/
    router.md                          router.md         ← sem mudança
    token-usage.csv/md                 data/             ← CSVs separados
    orchestration.csv                  *.csv
    *.sh scripts                       scripts/          ← mover scripts
  security/ (9 arquivos)             system.md
  claude-self-modifying.md            claude-self-modifying.md (limpo)
  agents-orchestration.md             agents-orchestration.md
  system.md
```

---

### 4.3 Agentes: Manter / Simplificar / Adicionar

**Manter (imprescindíveis):**

| Agente                   | Por quê                                     |
| ------------------------ | ------------------------------------------- |
| `react-native-engineer`  | Núcleo da implementação, mais usado         |
| `frontend-architect`     | SDD, decisões de design, arquitetura        |
| `code-reviewer`          | Qualidade pré-merge, validação arquitetural |
| `test-writer`            | Frequentemente invocado, local+rápido       |
| `test-write-e2e`         | Fluxo próprio, bem definido                 |
| `sonar-auto-fixer`       | Automação de qualidade CI                   |
| `performance-auditor`    | Específico e valioso para mobile            |
| `security/*` (7 agentes) | Pipeline de auditoria OWASP MAS — manter    |

**Simplificar (merge):**

| De                                         | Para                                                         |
| ------------------------------------------ | ------------------------------------------------------------ |
| `logic-engineer` + `react-native-engineer` | `react-native-engineer` absorve tudo                         |
| `pr-lifecycle` + `pr-review-fixer`         | `pr-lifecycle` cobre o fluxo completo                        |
| `business-analyst` + `doc-designer`        | `doc-designer` com skill de BA adicionada                    |
| `coupling-analyzer`                        | Transformar em skill de `code-reviewer`, não agente separado |

**Adicionar (gaps identificados):**

| Agente novo          | Responsabilidade                                                                                                                      |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| `ai-prompt-engineer` | Review e evolução de prompts de IA do app. Avalia qualidade de output, sugere otimizações de temperature/estrutura, versiona prompts. |
| `infra-agent`        | Firebase Functions, CF Workers, configuração de proxy, variáveis de ambiente. Hoje não há agente para infraestrutura.                 |

---

### 4.4 Skills e Rules: O Que Mudar

**Skills — adicionar:**

| Skill nova                  | Conteúdo                                                                                                                                          |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ai-integration-pattern.md` | Padrões para integrar IA no app: AIProvider interface, Zod schemas, streaming, cache, proxy. Análogo ao `api-integration-pattern.md` mas para IA. |
| `prompt-engineering.md`     | Boas práticas de prompts: structure, temperature, JSON mode, few-shot examples, versioning.                                                       |

**Skills — atualizar:**

| Skill                        | O que atualizar                                                                                       |
| ---------------------------- | ----------------------------------------------------------------------------------------------------- |
| `api-integration-pattern.md` | Adicionar seção sobre proxy de IA e tratamento de streaming                                           |
| `clean-code-rules.md`        | Adicionar regra sobre não deixar stubs (`generateSummaryImage`, `ttsToBase64`) em interfaces públicas |

**Rules — sem mudança estrutural:**  
`mandatory-rules.md`, `folder-structure.md`, `git-workflow.md` e `naming-conventions.md` estão bem definidos. Nenhuma alteração necessária — apenas garantir que os novos arquivos de IA seguem as mesmas convenções.

---

## 5. Síntese Executiva

### O que está bem e deve ser preservado

- Retry/backoff, locale injection, mock fallbacks, `toJSONSafe`, prompts centralizados
- Conceito do learning log (`claude-self-modifying.md`)
- LLM router dual-model com dados reais de economia
- Security audit pipeline especializado

### O que está errado e precisa correção imediata

1. **API key no bundle** — risco de segurança real, precisa de proxy antes de qualquer release público
2. **Zero abstração de provider** — acoplamento direto com Anthropic impede crescimento
3. **Sem Zod schemas** — validação manual é frágil e não escala

### O que está over-engineered para o estágio atual

- 14 agentes onde 8 bastam
- 3 documentos de arquitetura cobrem o mesmo território
- Token tracking manual via CSV quando Claude hooks existem

### Definição de "próximo nível" para esse projeto

> Uma arquitetura de IA madura não é aquela com mais agentes ou mais documentação.  
> É aquela onde **trocar um componente não quebra os outros**, onde **erros são tipados e rastreáveis**,  
> onde **a segurança não depende de segredo em variável de ambiente exposta**,  
> e onde **um novo desenvolvedor consegue contribuir em 1 hora sem ler 70 arquivos**.

Atingir isso é o próximo nível.

---

_Gerado em: 2026-03-24 | Revisão: System Orchestrator Analysis_
