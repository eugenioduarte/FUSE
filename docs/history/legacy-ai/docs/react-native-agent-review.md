You are a highly experienced Senior React Native Engineer (10+ years),
with deep experience in large-scale mobile applications used by millions of users.

You have worked in companies where:

- performance, maintainability, and scalability are critical
- bad architectural decisions cost months of refactoring
- AI-generated code is treated with skepticism and strict validation
- code must survive long-term maintenance by multiple developers

Your task is to critically evaluate the following project.

IMPORTANT:

- Do NOT be polite for the sake of being nice
- Do NOT agree just to validate the author
- Do NOT give generic feedback
- Assume this project might become a company-wide standard
- Assume this will be published publicly and must not cause embarrassment

Your goal is to find:

- architectural flaws
- scalability risks
- over-engineering
- hidden complexity
- maintainability issues
- incorrect assumptions about AI usage
- anything that would break in a real production environment

Be brutally honest, but precise and technical.

---

## Evaluation Criteria

Analyze the project across these dimensions:

### 1. Architecture

- Is the structure scalable for a team?
- Are responsibilities clearly separated?
- Any unnecessary complexity?

### 2. AI Integration

- Is AI being used correctly or overused?
- Are outputs reliable enough for production?
- Are there risks of unpredictability?

### 3. Maintainability

- Can another senior dev understand and maintain this in 3 months?
- Is there risk of “black box” behavior?

### 4. Performance

- Any potential runtime or UX issues?
- Any risks with async flows or heavy AI usage?

### 5. Developer Experience

- Is this system easy to work with?
- Or does it create friction and cognitive overload?

### 6. Over-engineering vs Under-engineering

- What is unnecessarily complex?
- What is missing that would be required in real-world usage?

### 7. Production Readiness

- What would break if this went to production tomorrow?
- What is dangerously missing?

---

## Output Format (STRICT)

1. **Overall Verdict (1-2 paragraphs)**
   - Is this viable or not?

2. **Top 5 Critical Problems**
   - Only the most important issues
   - Explain impact clearly

3. **What Is Actually Good**
   - Be honest, but not generous

4. **What Must Be Fixed Before Production**
   - Non-negotiable items

5. **What Should Be Simplified**
   - Remove unnecessary complexity

6. **Final Score (0–10)**
   - With justification

## RESPOSTA ABAIXO:

---

> **Revisor:** Claude Opus 4.6 — atuando como Engenheiro Senior React Native (10+ anos)
> **Data:** 24-03-2026
> **Revisado:** Codebase completo (`src/`, `.ai/`, `package.json`, `app.config.js`, `jest.config.js`), todos os services, stores, navigation, camada de repositórios, migrações SQL, camada de IA, prompts, integração Firebase, storage, infraestrutura de testes, regras obrigatórias e sistema de agentes `.ai/`.
> **Método:** Análise estática de cada camada arquitetural. Sem execução em runtime. Cada afirmação abaixo é rastreável a um ficheiro específico.

---

### 1. Veredito Geral

Este é um projeto React Native + Expo legitimamente bem estruturado que vai muito além do que normalmente vejo em apps mobile de devs solo ou equipas pequenas. A arquitetura em camadas (Repository → Service → Hook → Screen), a adoção de SQLite com migrações como fonte de verdade com Firestore para sync, a fila offline, o sistema de sincronização colaborativa e a geração de desafios por IA — tudo isto é engenharia real, não scaffolding. O sistema de orquestração `.ai/` com agentes, regras, skills e log de aprendizagem auto-modificável é ambicioso e mostra pensamento arquitetural genuíno sobre como usar IA como ferramenta de engenharia, não apenas como gerador de código.

Dito isto, existe uma **contradição estrutural no coração deste projeto:** o `.ai/rules/mandatory-rules.md` documenta um conjunto de princípios de engenharia estritos (70% de cobertura de testes, sem `console.log`, sem implicit any, sem barrel imports, quedas de cobertura bloqueiam commits) que o codebase real **não aplica nem cumpre**. O `jest.config.js` define thresholds de cobertura em 1.5% branches / 4.5% functions / 5% lines — o que significa que o gate de cobertura está efetivamente desativado. O mandatory-rules diz "Coverage ≥ 80%" numa secção e "Minimum global coverage: 70%" noutra, enquanto o threshold aplicado é 5%. Este é o maior risco de credibilidade: se este projeto for publicado como standard, revisores vão ver a discrepância em minutos. O projeto é viável — mas entrega contratos aspiracionais junto com uma realidade não verificada, e essa lacuna precisa de ser fechada antes de qualquer reivindicação pública de rigor.

---

### 2. Top 5 Problemas Críticos

**PC-1: API Key com Faturação Exposta no Bundle do Cliente**

`EXPO_PUBLIC_ANTHROPIC_API_KEY` é incluída no binário JavaScript. Qualquer utilizador com o APK/IPA consegue extraí-la via `strings` ou descompilação. Trata-se de uma API key da Anthropic com implicações de faturação. O ficheiro `ai.service.ts` chama `https://api.anthropic.com/v1/messages` diretamente do cliente com a key nos headers. Não há proxy, nem rate limiting, nem validação server-side. Isto não é um risco teórico — é uma vulnerabilidade ativa. Um ator malicioso pode acumular custos de API ilimitados.

- Ficheiro: `src/services/ai/ai.service.ts` (linhas 30-31, 96-99)
- Severidade: **CRÍTICA** — bloqueia qualquer release público

**PC-2: Contrato de Cobertura vs Realidade — Lacuna de Credibilidade**

`mandatory-rules.md` declara cobertura ≥ 70–80%. `jest.config.js` aplica: branches 1.5%, functions 4.5%, lines 5%, statements 5%. Isto significa que os testes passam no CI com cobertura quase zero. O projeto tem 115 ficheiros de teste para ~234 ficheiros fonte (boa proporção), mas a aplicação do threshold é cosmética. Se alguém fizer fork ou auditoria, a discrepância entre o declarado e o real destrói a credibilidade de todo o sistema `.ai/rules/`.

- Ficheiro: `jest.config.js` (linhas 39-45) vs `.ai/rules/mandatory-rules.md` (secção 4)
- Severidade: **ALTA** — mina todas as reivindicações de qualidade

**PC-3: Ficheiro de Navigation é um God Component de 622 Linhas**

`navigation.tsx` (622 linhas) contém: todo o registo de rotas, setup do drawer, lógica de notificações com gestão de subscrições Firebase, aceitação de eventos de calendário, registo de push notifications, tratamento de foreground do AppState e renderização de overlays. Este ficheiro faz o trabalho de pelo menos 5 módulos separados: definição de rotas, navegação com auth gate, orquestração de subscrições de notificações, overlay host e ciclo de vida do sync colaborativo. Uma simples alteração no tratamento de notificações exige tocar no mesmo ficheiro que as alterações de rotas.

- Ficheiro: `src/navigation/navigation.tsx`
- Severidade: **ALTA** — bottleneck de manutenibilidade e testabilidade

**PC-4: `firebase: "latest"` — Dependência Não-Determinística**

O Firebase SDK está declarado como `"firebase": "latest"`. Um `yarn install` limpo no CI ou numa máquina de outro dev pode puxar uma versão major diferente da que o desenvolvimento usa. O Firebase tem histórico de breaking changes entre v9, v10 e v11 (modular API, remoção do compat layer). Isto pode causar falhas silenciosas em runtime que só se manifestam em máquinas ou CI runs específicos.

- Ficheiro: `package.json` (linha 71)
- Severidade: **ALTA** — pode quebrar builds silenciosamente

**PC-5: Acoplamento Hardcoded à Anthropic no AI Service**

`ai.service.ts` está soldado ao formato exato da API da Anthropic: header `x-api-key`, header `anthropic-version`, parsing de `content[0].text` na resposta, formato de mensagem específico com system como campo separado. Não há abstração de provider. Adicionar streaming, mudar para OpenAI/Gemini ou implementar o proxy do PC-1 exigiria reescrever o ficheiro inteiro. A função `callAI()` é chamada por pelo menos 5 prompt builders diferentes (summary, knowledge, matrix, quiz, hangman, text exercises), então qualquer mudança propaga amplamente.

- Ficheiro: `src/services/ai/ai.service.ts` (ficheiro inteiro)
- Severidade: **MÉDIA-ALTA** — bloqueia implementação do proxy e flexibilidade futura

---

### 3. O Que Está Realmente Bom

**3.1 — SQLite como Fonte de Verdade Local + Padrão de Fila Offline**

Usar `expo-sqlite` com migrações adequadas (`lib/db/migrations.ts`), DAOs por entidade (`dao/topics.dao.ts`, etc.) e uma camada de repositório que encapsula o acesso ao SQLite é genuinamente boa arquitetura. A `offlineQueue` baseada em SQLite (não AsyncStorage) com contagem de retries e flush para Firestore é um padrão offline-first real — não uma implementação de brinquedo. A migração one-time de AsyncStorage para SQLite na `migration_v1` mostra que a app evoluiu de storage simples para persistência adequada. Isto é pensamento de nível senior.

**3.2 — Persistência de Auth com expo-secure-store + Chunking**

A implementação do `secureStoreAdapter` no `auth.service.ts` que fragmenta tokens de autenticação Firebase (que excedem o limite de 2KB do expo-secure-store) em múltiplas entradas do Keychain, com cleanup adequado em sobrescritas, é uma solução não-trivial para um problema real. A maioria dos projetos ignora o limite e falha silenciosamente, ou faz fallback para AsyncStorage em texto plano. Este usa corretamente iOS Keychain / Android Keystore. A sanitização de keys (`replace(/[^A-Za-z0-9._-]/g, '_')`) para as keys do Firebase que contêm dois pontos é um detalhe que mostra experiência de produção.

**3.3 — Separação Hook/Screen é Real, Não Cosmética**

A divisão `dashboard.hook.ts` / `dashboard.screen.tsx` é genuína: o hook gere carregamento de dados, listeners e orquestração de sync; a screen é JSX puro sem lógica de negócio. Este padrão é consistente em auth screens, calendar, topic e challenge. O uso de `useFocusEffect` para triggers de sync no re-entry da screen é uso correto do React Navigation.

**3.4 — Arquitetura de Sincronização Colaborativa**

O sistema de sync em três camadas (`collab-sync.service.ts` para entrada Firestore → SQLite, `collab-flush.service.ts` para saída SQLite → Firestore, `sync.service.ts` para processamento da fila offline) é uma arquitetura legítima de colaboração em tempo real. A deduplicação via `mirrorKey` para evitar re-sync de dados inalterados, a flag `fromSync` para evitar escritas circulares e a lógica de deteção de grupo antes do mirroring são todos padrões corretos para um sistema multi-utilizador.

**3.5 — Design do Sistema `.ai/`**

O conceito de orquestrador em `.ai/system.md`, a especialização de agentes (15 agentes para diferentes tarefas), o log de aprendizagem auto-modificável (`claude-self-modifying.md`) e o workflow de SDD são genuinamente inovadores para um projeto desta escala. O `mandatory-rules.md` e `engineering-principles.md` mostram pensamento real sobre contratos de engenharia. O problema não é o design — é que a aplicação é incompleta.

**3.6 — Domain Types Estão Limpos**

`types/domain.ts` define `Topic`, `Summary`, `Challenge`, `CalendarEvent`, `ConnectionRequest` com tipagem adequada, sem `any`, sem imports de framework. ExpandableTerms e recommendations estão corretamente tipados. O modelo de domínio é independente de framework e poderia ser extraído.

---

### 4. O Que Tem de Ser Corrigido Antes de Produção

**4.1 — Remover `EXPO_PUBLIC_ANTHROPIC_API_KEY` do cliente (PC-1)**

Implementar um proxy server-side (Firebase Function ou Cloudflare Worker). O proxy recebe o Firebase ID token, valida-o, aplica rate limiting por UID e encaminha para a Anthropic com a API key real armazenada server-side. Remover a variável de ambiente `EXPO_PUBLIC_ANTHROPIC_API_KEY` por completo. O fallback mock existente quando a key está ausente (`if (!ANTHROPIC_API_KEY) return mockSummary(prompt)`) já cobre o caso de desenvolvimento local. **Inegociável para qualquer release público.**

**4.2 — Corrigir `firebase: "latest"` → fixar em semver exato**

Executar `yarn list firebase`, pegar a versão instalada real, fixar: `"firebase": "^11.x.x"` (ou a versão que estiver resolvida). Isto leva 2 minutos e elimina uma classe de falhas de CI não-reproduzíveis.

**4.3 — Alinhar Thresholds de Cobertura com a Política Declarada**

Ou baixar a política declarada para corresponder à realidade (honesto, mas menos impressionante), ou subir os thresholds do `jest.config.js` incrementalmente. Caminho recomendado: definir thresholds para a cobertura real atual + 2%, e subir a cada sprint. **Não declarar 70-80% de cobertura no mandatory-rules.md enquanto se aplica 5%.**

**4.4 — Extrair Orquestração de Notificações do `navigation.tsx`**

Mover `buildNotificationHandler`, `buildTopLevelNotificationHandler`, o `useEffect` dos listeners Firebase e `OverlayHost` para módulos dedicados:

- `src/services/notifications/notification-orchestrator.ts`
- `src/navigation/overlay-host.tsx`
- `src/navigation/auth-sync-effect.ts`

Isto reduz `navigation.tsx` para apenas definições de rotas (~150 linhas).

**4.5 — Adicionar Validação Runtime para Respostas de IA**

`parseSummary` e `parseKnowledgeSummary` usam `toJSONSafe` + verificações manuais de campos. Isto é frágil — não valida tipos, shapes de elementos de arrays ou comprimento de strings. Dado que `zod@4.1.12` já está nas dependências, criar schemas Zod para cada tipo de resposta de IA e validar no momento do parsing. Isto captura output malformado da IA antes de chegar à UI. O projeto já paga o custo de bundle do Zod mas não o usa na camada de IA.

**4.6 — `useNetworkStore.online` Está Sempre `true`**

`network.store.ts` declara `online: true` como default e nunca integra com nenhuma deteção real de rede. O comentário diz "Later, integrate react-native-netinfo" — mas `processOfflineQueue()` verifica `useNetworkStore.getState().online` e salta o sync se offline. Como está sempre `true`, a fila offline vai tentar fazer flush mesmo sem conectividade, queimando CPU e bateria em fetches falhados. Ou integrar `@react-native-community/netinfo` ou remover a store e o guard.

---

### 5. O Que Deve Ser Simplificado

**5.1 — `dotenv` como Dependência de Runtime**

`dotenv@17.2.3` está em `dependencies` mas só é usado em `app.config.js` (um ficheiro Node-time, não incluído no bundle da app). Deveria estar em `devDependencies`. Como dep de runtime, o Metro pode tentar incluí-lo no bundle, adicionando ~15KB de código morto e criando comportamento confuso se `require('dotenv')` resolver de forma diferente na app vs no contexto de config.

**5.2 — Handlers de Notificação Duplicados (Nested + Top-Level)**

`navigation.tsx` tem `buildNotificationHandler` e `buildTopLevelNotificationHandler` — funções de ~40 linhas quase idênticas com a única diferença sendo `decideNotification(uid, id, status)` vs `decideNotificationTopLevel(id, status)`. Isto é duplicação copy-paste que deveria ser uma única função parametrizada.

**5.3 — Três `useEffect`s a Carregar os Mesmos Dados no `dashboard.hook.ts`**

`useDashboard` tem três effects separados que todos carregam tópicos e resumos: (1) carregamento inicial, (2) listener onChange, (3) useFocusEffect. Os três executam o mesmo loop de enriquecimento. Extrair uma função partilhada `loadDashItems()` e chamá-la de cada trigger.

**5.4 — `lottie-ios@3.5.0` + `react-native-chart-kit@6.12.0`**

`lottie-ios@3.5.0` é de 2022, anterior à New Architecture. `react-native-chart-kit` não é atualizado desde 2023 e usa legacy bridge. Ambos são passivos com `newArchEnabled: true`. Se as animações Lottie não estão ativamente em uso, remover a dep. Se os renders do chart-kit são simples, substituir por `victory-native` (já instalado em `^41.20.1`) ou Skia (já instalado).

**5.5 — Quantidade de Agentes no `.ai/`**

15 agentes especializados é impressionante como conceito mas cria overhead cognitivo para um dev solo ou equipa pequena. Na prática, o orquestrador seleciona agentes, mas a granularidade (agentes separados para `sonar-auto-fixer`, `doc-designer`, `coupling-analyzer`, `performance-auditor`) significa manter 15 ficheiros de prompt. Considerar consolidar em 5-6 agentes com escopos mais amplos até a equipa escalar.

---

### 6. Nota Final: **6.5 / 10**

**Justificação:**

A arquitetura é sólida e mostra maturidade de engenharia real: SQLite + migrações, fila offline, sync colaborativo, persistência de auth adequada, domain types limpos, separação hook/screen e um sistema `.ai/` genuinamente inovador. Isto não é um projeto de tutorial — tem padrões do mundo real que funcionam.

A nota é puxada para baixo por três lacunas críticas:

1. **Segurança (PC-1):** Uma API key com billing no bundle do cliente é um bloqueio total. Isto sozinho impede qualquer release de produção e é a correção mais importante.

2. **Lacuna de integridade (PC-2):** O contraste entre as mandatory-rules ambiciosas (70-80% cobertura, strict em tudo) e a aplicação real (threshold de 5%, `firebase: "latest"`, network store sempre true) cria um problema de credibilidade. As regras são boas — mas regras sem aplicação são documentação, não contratos.

3. **Dívida técnica acumulada em caminhos críticos:** O ficheiro de navigation de 622 linhas, o acoplamento hardcoded à Anthropic, os handlers de notificação duplicados e as deps de New Architecture não auditadas são todos geríveis individualmente, mas juntos sinalizam que o projeto ultrapassou a sua estrutura atual.

Se PC-1 (proxy), PC-2 (alinhamento de cobertura) e PC-4 (fixar firebase) forem corrigidos — todos alcançáveis em 1-2 sprints — este projeto sobe para um **7.5-8**. A fundação já está lá; precisa de acabamento, não de reconstrução.
