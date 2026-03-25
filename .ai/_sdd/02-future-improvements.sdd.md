> **[PT]** Documento de investigação de melhorias técnicas do projeto FUSE. Referências: análise do Grok via `report.md` + auditoria arquitetural via `react-native-agent-review.md` (Claude Opus 4.6, 6.5/10) + `base3.md`. Cada item inclui **nível de dificuldade** e avaliação de necessidade real.
>
> **Nota sobre `base3.md`:** é documentação interna do FUSE — não copiar padrões diretamente, adaptar considerando o que já existe.

---

# SDD: Future Technical Improvements — FUSE App

> Status: Investigation
> Data de criação: 2026-03-24
> Última atualização: 2026-03-24
> Fontes: `report.md` (Grok) + `react-native-agent-review.md` (Claude Opus 4.6) + `base3.md`

---

## 0. Checklist de Progresso

> Marcar conforme cada item for investigado/implementado. Ordem sugerida: de cima para baixo (quick wins primeiro, depois os maiores).

### 🔴 Críticos / Bloqueiam Release

- [ ] **Firebase version lock** — fixar `"firebase": "latest"` → `"^11.x.x"` _(2 min)_
- [ ] **`dotenv` → devDependencies** — mover de `dependencies` para `devDependencies` _(2 min)_
- [ ] **API Key no bundle (proxy)** — implementar proxy server-side, remover `EXPO_PUBLIC_ANTHROPIC_API_KEY` _(1–2 dias)_
- [ ] **Alinhar thresholds de cobertura** — `jest.config.js` 5% vs `mandatory-rules.md` 70-80% _(1h)_

### 🟡 Melhorias Estruturais

- [ ] **AIProvider abstraction** — criar interface `AIProvider` + `AnthropicProvider` _(2–4h)_
- [ ] **Validação Zod para respostas de IA** — schemas Zod nos parsers de AI _(2–3h)_
- [ ] **Extrair navigation.tsx (622 linhas)** — separar em route-defs, notification-orchestrator, overlay-host, auth-sync-effect _(4–6h)_
- [ ] **Unificar notification handlers duplicados** — `buildNotificationHandler` + `buildTopLevelNotificationHandler` → 1 função _(1h)_
- [ ] **Integrar `useNetworkStore` com netinfo real** — ou remover o guard fake _(2h)_
- [ ] **Extrair `loadDashItems()` no dashboard.hook.ts** — 3 useEffects duplicados → 1 função _(1h)_
- [ ] **New Arch compatibility audit** — `lottie-ios`, `react-native-chart-kit`, `reanimated` _(meio dia)_

### 🟢 Otimizações / Backlog

- [ ] **AsyncStorage → MMKV** — migrar dados de startup (auth, theme, preferences) _(4–8h)_
- [ ] **FlashList em listas longas** — só quando houver lista > 50 items com perf medido _(2–4h/tela)_
- [x] **Consolidar agentes `.ai/`** — de 14 para 7 (architect, engineer, reviewer, test-writer, quality, design-docs + pr-lifecycle) ✅ concluído 2026-03-24 _(~3h)_
- [ ] **Monorepo** — só quando houver segundo package concreto _(semanas)_

---

## 1. Overview

Este documento consolida as melhorias técnicas pertinentes ao projeto FUSE identificadas a partir de:

- Análise crítica do Grok sobre o projeto (`report.md`)
- **Review arquitetural completo** pelo Claude Opus 4.6 (`react-native-agent-review.md` — nota 6.5/10)
- Auditoria das dependências atuais (`package.json`)
- Estado da configuração do Expo (`app.json` — `newArchEnabled: true`)
- Auditoria do `base3.md` (doc de arquitetura de IA do FUSE)

O objetivo **não é implementar tudo de uma vez**. É registrar o que foi identificado com contexto suficiente para tomar decisões informadas sobre o que realmente vale o esforço **neste projeto, neste momento**.

---

## 2. Estado Atual do Projeto (Snapshot)

| Aspecto             | Estado Atual                         | Observação                                                             |
| ------------------- | ------------------------------------ | ---------------------------------------------------------------------- |
| React Native        | 0.81.5                               | Último estável                                                         |
| Expo                | ~54.0.0                              | SDK mais recente                                                       |
| New Architecture    | `newArchEnabled: true` ✅            | Habilitado no `app.json`                                               |
| Turbo Modules       | Não auditado                         | New Arch ativo mas deps não verificadas                                |
| Gestão de segredos  | `EXPO_PUBLIC_` + `expo-secure-store` | Padrão correto — mas `EXPO_PUBLIC_ANTHROPIC_API_KEY` exposta no bundle |
| Storage chave-valor | `AsyncStorage`                       | MMKV seria ~10x mais rápido                                            |
| Estrutura           | Single-package                       | Sem monorepo                                                           |
| Firebase            | `firebase: latest`                   | Versão não fixada — risco de breaking change                           |

---

## 3. Melhorias Identificadas

---

### 3.1 API Key de IA no Bundle — CRITICAL-001 (`base3.md`)

**Dificuldade:** 🟡 Média (requer infraestrutura server-side)

**O que o `base3.md` documenta como C-1:**
O projeto já usa o padrão correto do Expo: `EXPO_PUBLIC_*` para config client-side. O problema não é o padrão — é que **`EXPO_PUBLIC_ANTHROPIC_API_KEY` (chave com billing) não pode estar no bundle** independente da convenção usada. Qualquer pessoa com o `.apk`/`.ipa` consegue extrair via decompilação.

```
Distinção importante:
EXPO_PUBLIC_ANTHROPIC_MODEL   → ✅ Ok no bundle (dado público, não secreto)
EXPO_PUBLIC_ANTHROPIC_API_KEY → ❌ Chave com billing — não pode ser client-side
```

**Estado atual vs correto (documentado em `base3.md` Sprint 1):**

```
Hoje:
  App → EXPO_PUBLIC_ANTHROPIC_API_KEY (embutida no bundle) → Anthropic API

Correto:
  App → Firebase ID token (usuário autenticado) → Proxy Server → ANTHROPIC_API_KEY (server-side) → Anthropic API
```

**O que deve mudar:**

- Implementar proxy server-side: **Firebase Function** (já no projeto, zero setup extra) ou **Cloudflare Worker** (cold start < 5ms, mais barato)
- Proxy valida Firebase ID token → aplica rate limit por uid → proxia para Anthropic
- Remover `EXPO_PUBLIC_ANTHROPIC_API_KEY` do client
- Mock local continua funcionando quando key ausente ✅ (pattern já existe no `ai.service.ts`)
- `dotenv@17.2.3` listado como dep de runtime: verificar se é apenas para scripts de build/CI — se sim, mover para `devDependencies`

**Questões a investigar:**

- Firebase Functions (já no projeto) vs Cloudflare Worker — custo e latência para portfólio?
- `EXPO_PUBLIC_ANTHROPIC_API_KEY` está no `.env` local ou exposta em algum lugar?
- `dotenv` é usado em algum código de runtime além de scripts de CI?

**Prioridade:** 🔴 Alta — `base3.md` classifica como CRITICAL-001, pré-requisito para qualquer release público

---

### 3.2 New Architecture + TurboModules: Auditoria de Compatibilidade

**Dificuldade:** 🟡 Média (auditoria manual + testes em device por dep)

**Contexto — o que são TurboModules no contexto do FUSE:**
New Architecture = JSI + Fabric + TurboModules. O projeto **não precisa criar TurboModules próprios** (isso é para quem escreve módulos nativos do zero). A preocupação é: as deps instaladas ainda usam a bridge antiga e podem **falhar silenciosamente** ou crashar com `newArchEnabled: true`.

- TurboModules = módulos nativos carregados via JSI (lazy, sem bridge serialization)
- Deps que não migraram para JSI usam interop mode (mais lento) ou quebram
- Fabric = novo renderer UI; deps que usam o renderer antigo têm comportamento undefined

**Risco concreto:**

- `lottie-ios@3.5.0` — versão de 2022, anterior ao suporte New Arch; versão atual é 4.x+
- `react-native-chart-kit@^6.12.0` — usa bridge legacy, sem atualização desde 2023; candidato a substituição
- `react-native-reanimated` — **não listado** diretamente no `package.json`, mas dep transitiva do Skia/Navigation; sem versão ≥ 3.x, animações com New Arch têm bugs conhecidos
- `@shopify/react-native-skia@^2.3.7` — v2.x tem suporte, mas v3.x é mais estável com New Arch

**O que deve mudar:**

- Auditar cada dep nativa (com módulo iOS/Android) contra [reactnative.directory](https://reactnative.directory)
- `lottie-ios@3.5.0` → atualizar para `lottie-react-native@^7.x` (versão atual, suporta New Arch)
- `react-native-chart-kit` → avaliar substituição por `@shopify/react-native-skia` (já instalado) ou `victory-native-xl`
- Confirmar versão do `react-native-reanimated` e garantir ≥ 3.x

**Questões a investigar:**

- Houve crashes ou comportamentos estranhos no app? Podem ser sintoma de incompatibilidade de arch
- `lottie-ios@3.5.0` está fixado intencionalmente (bug em versão nova)?
- `react-native-chart-kit` tem uso real no codebase ou é dep residual?

**Prioridade:** 🟡 Média — não bloqueia hoje, mas vai bloquear na próxima atualização do Expo SDK

---

### 3.3 Monorepo: Necessidade Real vs Complexidade

**Dificuldade:** 🔴 Alta (setup + migração Expo para workspace tem armadilhas sérias)

**O que o `base3.md` cita como P11:**
Extrair `@fuse/ai-client` — `AIProvider`, `callAI`, `toJSONSafe`, schemas, cache e retry logic — como package interno reutilizável. Esse seria o gatilho real para um monorepo.

**Estado atual:** Single-package, tudo em `/FUSE` diretamente.

**Dificuldades reais de monorepo com Expo (não ignorar):**

1. **Metro + workspaces**: Metro bundler tem comportamento próprio com `node_modules` em workspaces — requer patches manuais em `metro.config.js` e `babel.config.js` para resolver symlinks
2. **pnpm + Expo**: funciona mas exige `shamefully-hoist=true` no `.npmrc` ou configuração de `hoist-pattern` — adiciona fricção de onboarding
3. **EAS Build em monorepo**: requer configuração adicional no `eas.json` (`projectRoot`, `buildRoot`) — pode quebrar workflows de CI
4. **Turborepo overhead**: para 1–2 packages, o ganho de cache de task runners não compensa o overhead de configuração

**Quando faz sentido para o FUSE:**

- Proxy server-side (item 3.1) virar package Node separado que compartilha tipos com o app
- `@fuse/ai-client` com segundo consumidor concreto (ex: um web dashboard)
- Backend NestJS com tipos compartilhados com o mobile

**O que vale fazer antes do monorepo:**
Organizar `src/services/ai/` com a estrutura do `base3.md` (provider.ts, cache.ts, schemas.ts) — cria a estrutura lógica do futuro package sem overhead de workspace.

**Questões a investigar:**

- O proxy server-side (item 3.1) vai precisar de tipos compartilhados com o app?
- MCP do JIRA/Figma (plano futuro) produz código Node que reutiliza lógica do app?

**Decisão preliminar:** ⏸ Não agora. Organizar `src/services/ai/` primeiro. Monorepo só quando houver segundo package com código compartilhado real.

---

### 3.4 AIProvider Abstraction — C-2 (`base3.md`)

**Dificuldade:** 🟢 Baixa (refactor local, sem dependências externas)

**O que o `base3.md` documenta como C-2:**
`ai.service.ts` está acoplado ao formato exato da Anthropic (`x-api-key`, `anthropic-version`, `content[0].text`). Trocar para outro provider (OpenAI, Gemini) ou adicionar streaming = reescrever o arquivo inteiro.

**Estado atual:**

```ts
// Hoje — hardcoded Anthropic no ai.service.ts
headers: { 'x-api-key': ANTHROPIC_API_KEY, 'anthropic-version': ANTHROPIC_VERSION }
```

**O que o `base3.md` propõe (P2):**

```ts
// src/services/ai/provider.ts
export interface AIProvider {
  complete(messages: AIMessage[], options?: AIOptions): Promise<string>
  stream?(messages: AIMessage[], options?: AIOptions): AsyncIterable<string>
}

// src/services/ai/anthropic.provider.ts  ← implementação atual isolada aqui
// src/services/ai/mock.provider.ts       ← mock explícito para testes
```

**Por que vale fazer antes de proxy e streaming:**

- Sem essa interface, implementar o proxy (item 3.1) e streaming (`base3.md` P6) vai criar mais acoplamento
- Mock provider para testes fica limpo e explícito — sem interceptar `fetch` manualmente
- Habilita migração para **Vercel AI SDK** (`@ai-sdk/anthropic`) no futuro sem reescrita

**Questões a investigar:**

- O mock de IA atual está centralizado ou espalhado por hooks/screens?
- `callAI()` é chamado diretamente de múltiplos lugares ou já tem camada intermediária?

**Prioridade:** 🟡 Média — deve ser feito antes de implementar proxy (3.1) e streaming

---

### 3.5 AsyncStorage → MMKV

**Dificuldade:** 🟢 Baixa-Média (migração mecânica, mas requer `expo prebuild`)

**O que Grok identificou:**
O projeto usa `@react-native-async-storage/async-storage@2.2.0`. AsyncStorage é assíncrono, baseado em I/O de arquivo, e lento para leituras frequentes. **MMKV** é ~10-30x mais rápido via memória mapeada e suporta New Architecture nativamente via JSI.

```
AsyncStorage: ~2-5ms por read (I/O file, async)
MMKV:         ~0.1ms por read (memory mapped, sync)
```

**Relação com `base3.md` P5 (cache de IA):**
O `base3.md` propõe usar `AsyncStorage` para cache de respostas de IA (TTL 7 dias). Para strings grandes (respostas de texto), o ganho de MMKV é menor. O benefício principal é em dados pequenos lidos no startup: auth state, preferences, theme.

**O que teria que mudar:**

- Instalar `react-native-mmkv` (requer `expo prebuild` — módulo nativo)
- Migrar: auth state, user preferences, theme, feature flags → MMKV
- `expo-secure-store` para dados sensíveis (tokens) ✅ — não substituir
- Avaliar manter `AsyncStorage` para cache de IA (dados maiores, leitura menos frequente)

**Questões a investigar:**

- Onde `AsyncStorage` é usado? (`grep -r "AsyncStorage" src/`)
- O projeto usa Expo Go (MMKV não funciona) ou já tem dev build?
- `react-native-mmkv` suporta Expo SDK 54 + New Arch? (sim, confirmar versão)

**Prioridade:** 🟡 Média — ganho real em startup, mas requer prebuild e dev build

---

### 3.6 Firebase Version Lock

**Dificuldade:** 🟢 Mínima (2 minutos)

**Problema identificado:**

```json
"firebase": "latest"
```

Usar `latest` para Firebase é uma bomba relógio. Firebase tem histórico de breaking changes entre major versions. Um `yarn install` em nova máquina ou CI pode instalar versão diferente da que está em desenvolvimento.

**O que deve mudar:**

- Confirmar versão atual com `yarn list firebase`
- Fixar: `"firebase": "^11.x.x"` no `package.json`
- Rodar `yarn` para atualizar `yarn.lock`
- Adicionar entry no `claude-self-modifying.md`: nunca usar `latest` em deps críticas

**Prioridade:** 🔴 Alta — custo mínimo, risco real

---

### 3.7 FlashList como Substituto do FlatList

**Dificuldade:** 🟢 Baixa (quase drop-in replacement, ajustes menores de API)

**O que Grok identificou:**
`mandatory-rules.md` já proíbe `ScrollView` e exige `FlatList`. O próximo nível é `@shopify/FlashList`:

- `FlatList`: virtualization básica, overhead em listas longas
- `FlashList`: reciclagem de células (RecyclerView pattern), ~5-10x mais eficiente em 100+ items
- `@shopify/react-native-skia` já está no projeto (mesmo vendor, menos fricção)

**O que valeria fazer:**

- Instalar `@shopify/flash-list`
- Atualizar `mandatory-rules.md`: `FlashList` para listas > 50 items
- `FlashList` requer `estimatedItemSize` — não é drop-in puro, tem ajuste de props

**Questões a investigar:**

- Quais telas têm listas com mais de 50 items?
- `FlashList` suportado no Expo SDK 54 + New Arch? (verificar — provavelmente sim)

**Prioridade:** 🟢 Baixa — `FlatList` já resolve; só investigar quando houver problema de performance medido em lista longa

---

### 3.8 Alinhar Thresholds de Cobertura — Lacuna de Credibilidade (Review PC-2)

**Dificuldade:** 🟢 Baixa (configuração + decisão de política)

**Fonte:** `react-native-agent-review.md` — PC-2

**O problema:**
`mandatory-rules.md` declara cobertura ≥ 70–80%. O `jest.config.js` aplica: branches 1.5%, functions 4.5%, lines 5%, statements 5%. Os testes passam com cobertura quase zero. A proporção de ficheiros de teste (115 para ~234 fonte) é boa, mas o threshold enforcement é cosmético.

**Impacto:**
Se alguém auditar o projeto ou fizer fork, a discrepância entre o declarado e o real destrói a credibilidade de todo o sistema `.ai/rules/`. Regras sem enforcement são documentação, não contratos.

**O que deve mudar:**

- Verificar cobertura real atual: `yarn test:coverage` e ler o relatório
- Definir thresholds no `jest.config.js` para cobertura real + 2% (ratchet up)
- Atualizar `mandatory-rules.md` para refletir a política real (ex: "mínimo 30%, meta 70%")
- A cada sprint, subir os thresholds incrementalmente

**Prioridade:** 🔴 Alta — custo baixo, impacto de credibilidade alto

---

### 3.9 Extrair God Component `navigation.tsx` (Review PC-3)

**Dificuldade:** 🟡 Média (refactor seguro mas com vários ficheiros)

**Fonte:** `react-native-agent-review.md` — PC-3, 4.4, 5.2

**O problema:**
`navigation.tsx` tem 622 linhas e faz o trabalho de pelo menos 5 módulos:

1. Definição de rotas (Stack + Drawer)
2. Auth gate (initialRouteName baseado em auth state)
3. Orquestração de notificações Firebase (2 handlers quase idênticos de ~40 linhas)
4. Overlay host (`OverlayHost` com loading, error, fastWay, edit, notification, success)
5. Ciclo de vida do sync colaborativo (`startCollabSyncForUser`, `triggerInitialCollaborativeSync`, listeners de calendar/notifications)

**Sub-problemas identificados:**

- `buildNotificationHandler` e `buildTopLevelNotificationHandler` são **copy-paste** com a única diferença sendo `decideNotification(uid, id, status)` vs `decideNotificationTopLevel(id, status)` — deveria ser uma única função parametrizada
- Um único `useEffect` gere auth listeners, collab sync, push registration, notifications e calendar — qualquer mudança num subsistema força tocar em tudo

**O que deve mudar (proposta de extração):**

```
src/navigation/
  navigation.tsx          ← só definição de rotas + Drawer/Stack (~150 linhas)
  overlay-host.tsx        ← OverlayHost component
  auth-sync-effect.ts     ← useEffect de auth + collab sync + push registration

src/services/notifications/
  notification-orchestrator.ts ← handlers de notificação unificados (1 função parametrizada)
```

**Prioridade:** 🟡 Média — não bloqueia features mas é o bottleneck de manutenibilidade #1 do app

---

### 3.10 Validação Zod para Respostas de IA (Review 4.5)

**Dificuldade:** 🟢 Baixa (Zod já instalado, schemas são definição de tipos)

**Fonte:** `react-native-agent-review.md` — 4.5

**O problema:**
`parseSummary` e `parseKnowledgeSummary` no `ai.service.ts` usam `toJSONSafe` + verificações manuais (`if (!parsed?.title || !parsed?.content)`). Isto é frágil — não valida tipos dos campos, shapes de `expandableTerms[]`, nem comprimento de strings. Output malformado da IA passa silenciosamente para a UI.

**Estado atual:**

```ts
// Hoje — validação manual frágil
const parsed = toJSONSafe(text)
if (!parsed?.title || !parsed?.content) {
  throw new Error('AI returned unexpected format.')
}
```

**O que deveria ser:**

```ts
// Com Zod (já em dependencies: zod@4.1.12)
const SummarySchema = z.object({
  title: z.string().min(1),
  content: z.string().min(10),
  keywords: z.array(z.string()).max(20).default([]),
})

const KnowledgeSchema = SummarySchema.extend({
  expandableTerms: z
    .array(
      z.object({
        term: z.string(),
        mini: z.string().optional(),
      }),
    )
    .max(30)
    .default([]),
  recommendations: z.array(z.string()).max(20).default([]),
})

// No parser: const result = SummarySchema.safeParse(toJSONSafe(text))
```

**Por que vale fazer agora:**

- O projeto **já paga o custo de bundle do Zod** mas não o usa na camada de IA
- Previne crashes silenciosos quando a IA retorna formato inesperado
- Prepara o terreno para o `AIProvider` (item 3.4) — os schemas são parte do contrato da interface

**Prioridade:** 🟡 Média — custo mínimo, previne bugs de parsing silenciosos

---

### 3.11 `useNetworkStore.online` Sempre `true` (Review 4.6)

**Dificuldade:** 🟢 Baixa (integrar lib ou remover guard)

**Fonte:** `react-native-agent-review.md` — 4.6

**O problema:**
`network.store.ts` declara `online: true` como default e nunca integra com deteção real de rede. O comentário diz "Later, integrate react-native-netinfo". Mas `processOfflineQueue()` em `sync.service.ts` verifica `useNetworkStore.getState().online` e salta o sync se offline. Como está sempre `true`, a fila offline tenta flush mesmo sem conectividade — queimando CPU e bateria em fetches falhados.

**Opção A — integrar `@react-native-community/netinfo`:**

```ts
import NetInfo from '@react-native-community/netinfo'

// No App.tsx ou provider:
NetInfo.addEventListener((state) => {
  useNetworkStore.getState().setOnline(state.isConnected ?? true)
})
```

**Opção B — remover o guard fake:**
Se a fila offline já tem retry + backoff, remover a verificação `if (!online) return` e deixar os fetches falharem naturalmente (já teria backoff).

**Prioridade:** 🟡 Média — afeta durabilidade da bateria e UX offline real

---

### 3.12 Três `useEffect`s Duplicados no `dashboard.hook.ts` (Review 5.3)

**Dificuldade:** 🟢 Mínima (refactor puro, ~15 min)

**Fonte:** `react-native-agent-review.md` — 5.3

**O problema:**
`useDashboard` tem 3 effects separados que todos carregam tópicos e resumos com o mesmo loop de enriquecimento:

1. `useEffect` de carregamento inicial
2. `useEffect` com `topicsRepository.onChange()`
3. `useFocusEffect` para re-entry na screen

Os três têm o mesmo bloco `for (const t of topics) { summaries… enriched.push() }`.

**O que deve mudar:**

```ts
// Extrair:
const loadDashItems = async () => {
  const topics = await topicsRepository.list()
  const enriched: DashItem[] = []
  for (const t of topics) {
    const summaries = await summariesRepository.list(t.id)
    enriched.push({ id: t.id, topicName: t.title /* ... */ })
  }
  return enriched
}

// Usar nos 3 triggers:
useEffect(() => {
  loadDashItems().then(setItems)
}, [])
useEffect(() => {
  return topicsRepository.onChange(() => loadDashItems().then(setItems))
}, [])
useFocusEffect(
  useCallback(() => {
    loadDashItems().then(setItems)
  }, []),
)
```

**Prioridade:** 🟢 Baixa — não afeta funcionalidade, mas é code smell visível

---

### 3.13 `dotenv` como Dependência de Runtime (Review 5.1)

**Dificuldade:** 🟢 Mínima (1 linha no package.json)

**Fonte:** `react-native-agent-review.md` — 5.1

**O problema:**
`dotenv@17.2.3` está em `dependencies` mas só é usado em `app.config.js` — um ficheiro que corre em Node no config-time, não é incluído no bundle da app. Como dep de runtime, o Metro pode tentar incluí-lo no bundle, adicionando ~15KB de código morto.

**O que deve mudar:**

- Mover `dotenv` de `dependencies` para `devDependencies`
- Verificar que `app.config.js` continua a funcionar (sim — devDeps estão disponíveis em config-time)

**Prioridade:** 🔴 Alta (custo zero) — fix de 2 minutos

---

### 3.14 Consolidar Agentes `.ai/` (Review 5.5)

**Dificuldade:** 🟢 Baixa (reorganização de ficheiros markdown)

**Fonte:** `react-native-agent-review.md` — 5.5

**O problema:**
15 agentes especializados cria overhead cognitivo para dev solo ou equipa pequena. Agentes como `sonar-auto-fixer`, `doc-designer`, `coupling-analyzer`, `performance-auditor` são granulares demais — cada um requer manutenção de um ficheiro de prompt separado.

**Proposta de consolidação (15 → 6):**

| Agente Atual                                        | Agente Consolidado |
| --------------------------------------------------- | ------------------ |
| `react-native-engineer` + `logic-engineer`          | **Engineer**       |
| `frontend-architect` + `coupling-analyzer`          | **Architect**      |
| `code-reviewer` + `pr-review-fixer`                 | **Reviewer**       |
| `test-writer` + `test-write-e2e`                    | **Test Writer**    |
| `performance-auditor` + `sonar-auto-fixer`          | **Quality**        |
| `ui-designer` + `doc-designer` + `business-analyst` | **Design & Docs**  |

**Quando escalar de volta:** Quando a equipa crescer e diferentes pessoas precisarem de agentes com contextos diferentes.

**Prioridade:** 🟢 Baixa — melhora DX mas não bloqueia nada

---

## 4. Matriz de Priorização

| #   | Item                                   | Fonte         | Prioridade | Dificuldade | Esforço       | Risco de Não Fazer                   |
| --- | -------------------------------------- | ------------- | ---------- | ----------- | ------------- | ------------------------------------ |
| 1   | Firebase version lock                  | Grok + Review | 🔴 Alta    | 🟢 Mínima   | 2 min         | Breaking change silencioso em CI     |
| 2   | `dotenv` → devDependencies             | Review 5.1    | 🔴 Alta    | 🟢 Mínima   | 2 min         | ~15KB de código morto no bundle      |
| 3   | Alinhar coverage thresholds            | Review PC-2   | 🔴 Alta    | 🟢 Baixa    | 1h            | Credibilidade de todo o `.ai/rules/` |
| 4   | API Key no bundle (proxy)              | Grok + Review | 🔴 Alta    | 🟡 Média    | 1–2 dias      | Chave de billing exposta no bundle   |
| 5   | AIProvider abstraction                 | base3.md C-2  | 🟡 Média   | 🟢 Baixa    | 2–4h          | Reescrita total para trocar provider |
| 6   | Validação Zod para respostas de IA     | Review 4.5    | 🟡 Média   | 🟢 Baixa    | 2–3h          | Crashes silenciosos de parsing       |
| 7   | Extrair `navigation.tsx`               | Review PC-3   | 🟡 Média   | 🟡 Média    | 4–6h          | Bottleneck de manutenibilidade #1    |
| 8   | Unificar notification handlers         | Review 5.2    | 🟡 Média   | 🟢 Mínima   | 1h            | Copy-paste que diverge com o tempo   |
| 9   | Integrar `useNetworkStore` com netinfo | Review 4.6    | 🟡 Média   | 🟢 Baixa    | 2h            | Flush offline sem rede = CPU/bateria |
| 10  | New Arch compatibility audit           | Grok          | 🟡 Média   | 🟡 Média    | Meio dia      | Crashes no próximo Expo SDK update   |
| 11  | Extrair `loadDashItems()` do dashboard | Review 5.3    | 🟢 Baixa   | 🟢 Mínima   | 15 min        | Code smell — 3 effects duplicados    |
| 12  | AsyncStorage → MMKV                    | Grok          | 🟢 Baixa   | 🟢 Baixa    | 4–8h          | Performance de startup               |
| 13  | FlashList nas listas longas            | Grok          | 🟢 Baixa   | 🟢 Baixa    | 2–4h por tela | Performance incremental              |
| 14  | Consolidar agentes `.ai/`              | Review 5.5    | ✅ Feito   | 🟢 Baixa    | 2026-03-24    | Concluído: 14→7 agentes              |
| 15  | Monorepo                               | base3.md P11  | ⏸ Depois   | 🔴 Alta     | Semanas       | Nenhum risco agora                   |

---

## 5. Critérios de Decisão Aplicados

Para cada item foi avaliado:

1. **Resolve um problema real no projeto agora?** → Firebase lock, API Key, coverage gap: sim, imediato
2. **Tem impacto em segurança ou estabilidade?** → API Key, New Arch audit, network store: sim
3. **O custo é proporcional ao ganho?** → AIProvider, Zod validation, dotenv, notification handlers: sim (baixo custo, ganho real)
4. **Quebra o que já funciona?** → FlashList, MMKV, AIProvider são opt-in / refactor local
5. **Afeta credibilidade do projeto?** → Coverage gap e navigation god component: sim

---

## 6. Próximos Passos

### Imediato (esta sessão / hoje)

- [ ] `yarn list firebase` → fixar versão no `package.json` + commit
- [ ] Mover `dotenv` para `devDependencies` + verificar `app.config.js`
- [ ] `yarn test:coverage` → verificar cobertura real → ajustar thresholds no `jest.config.js`
- [ ] Atualizar `mandatory-rules.md` para refletir política de cobertura real

### Esta semana

- [ ] `grep -r "EXPO_PUBLIC_" .env*` — mapear o que está exposto no bundle
- [ ] Decidir proxy: Firebase Functions vs Cloudflare Worker
- [ ] Extrair `loadDashItems()` no `dashboard.hook.ts` (15 min)
- [ ] Unificar `buildNotificationHandler` + `buildTopLevelNotificationHandler` numa função parametrizada

### Próxima sprint

- [ ] Criar `src/services/ai/provider.ts` com `AIProvider` + `AnthropicProvider`
- [ ] Adicionar schemas Zod para respostas de IA (`SummarySchema`, `KnowledgeSchema`, etc.)
- [ ] Extrair `navigation.tsx`: route-defs, overlay-host, auth-sync-effect, notification-orchestrator
- [ ] Integrar `@react-native-community/netinfo` no `useNetworkStore` (ou remover guard)
- [ ] Auditar New Arch: `lottie-ios`, `react-native-chart-kit`, `react-native-reanimated`

### Backlog

- [ ] AsyncStorage → MMKV para dados de startup (auth, theme, preferences)
- [ ] FlashList quando houver lista longa com problema de performance medido
- [x] Consolidar agentes `.ai/` — 14 → 7 ✅ concluído 2026-03-24
- [ ] Monorepo quando houver segundo package com código compartilhado real

---

## 7. Registro de Decisões

| Data       | Item                        | Decisão       | Motivo                                                                 |
| ---------- | --------------------------- | ------------- | ---------------------------------------------------------------------- |
| 2026-03-24 | Criação deste documento     | ✅ Criado     | Consolidar melhorias técnicas identificadas por Grok + base3.md        |
| 2026-03-24 | Atualização com review      | ✅ Atualizado | Integrar todas as sugestões do `react-native-agent-review.md` (6.5/10) |
| —          | Firebase version lock       | —             | —                                                                      |
| —          | `dotenv` → devDependencies  | —             | —                                                                      |
| —          | Alinhar coverage thresholds | —             | —                                                                      |
| —          | API Key no bundle           | —             | —                                                                      |
| —          | AIProvider abstraction      | —             | —                                                                      |
| —          | Validação Zod para IA       | —             | —                                                                      |
| —          | Extrair navigation.tsx      | —             | —                                                                      |
| —          | Unificar notif. handlers    | —             | —                                                                      |
| —          | Network store + netinfo     | —             | —                                                                      |
| —          | New Arch audit              | —             | —                                                                      |
| —          | Dashboard loadDashItems()   | —             | —                                                                      |
| —          | AsyncStorage → MMKV         | —             | —                                                                      |
| —          | Consolidar agentes .ai/     | —             | —                                                                      |
| —          | Monorepo                    | ⏸ Adiado      | Sem segundo package concreto ainda                                     |

---

> **Nota:** Documento vivo. Atualizar a coluna "Decisão" conforme cada item for investigado e decidido. Marcar os checkboxes da secção 0 conforme progresso.
