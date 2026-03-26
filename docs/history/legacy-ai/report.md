⌘K
⌘J
seja muito cetico, qual sua opniao para o inicio desse artigo
Ok… talvez eu tenha subestimado o poder da IA.
De 40 horas para 10.
Não foi com mais disciplina. Nem com mais café.
Foi porque deixei de usar IA como “assistente”… e passei a usá-la como um sistema de engenharia com agentes especializados.
Durante muito tempo, eu tive um certo desdém pela IA.
Usava o ChatGPT desde o beta — mas só para coisas pequenas:

revisões pontuais
snippets controlados
dúvidas rápidas
Nada muito sério.
Não por limitação da ferramenta…
Mas por falta de visão minha.
Eu estava confortável demais usando IA como um “copiloto básico”.
A virada veio quando comecei a consumir conteúdos, tutoriais e trocar ideias com pessoas que já estavam mais avançadas nisso.
Especialmente o Waldemar Neto e o Rafael Quintanilha — que me ajudaram a enxergar o que eu não estava vendo.
Na prática, eu tinha alguns problemas bem claros:

Tarefas repetitivas que consumiam horas
Contexto que se perdia entre sessões
Código inconsistente dependendo do “humor” da IA
Documentação… que virava legado no mesmo dia
E talvez o mais importante:
👉 Eu queria escalar tudo isso sem gastar rios de dinheiro
Minha regra era simples:
fazer tudo funcionar com uma conta de $20 do Claude.
Então comecei pequeno.
Muito pequeno.
Em vez de tentar “resolver tudo com IA”, foquei em uma pergunta:
👉 Como eu transformo tarefas repetitivas em agentes especializados?
E foi aí que tudo mudou.
Ou melhor… foi aí que eu criei outro problema.
Uma enxurrada de .md, .sh e scripts espalhados por todo lado.
Organizar aquilo virou o verdadeiro desafio.
O projeto que estou construindo ainda está em andamento.
Mas já faz sentido o suficiente para compartilhar —
e espero que ajude outras pessoas.
(Deixo o link no final 👇)
Pra dar contexto do meu nível de ceticismo:
Eu estava num bar com um amigo, falando com toda a convicção do mundo que IA nunca conseguiria seguir uma user story direito.
Vocês já tiveram essa conversa.
No meio disso, eu soltei:
👉 “Ok. Este fim de semana vou fazer uma app usando o mínimo de código escrito por mim.”
Esse era o desafio.
Durante aquele fim de semana, a frase que eu mais repeti foi:
“Meu Deus… não é possível.”
Eu estava:

impressionado
meio com medo
e, sendo honesto, um pouco apocalíptico
O mais curioso?
Meu foco mudou completamente.
Eu parei de “escrever código” e passei a:

ler .md
ajustar scripts
validar decisões
revisar outputs
pensar em segurança
cercar a IA o máximo possível para evitar erros
Era como se meu trabalho tivesse mudado de:
👉 escrever código
para:
👉 orquestrar engenharia
E foi aí que cheguei numa solução que achei interessante o suficiente para compartilhar com vocês.

O texto tem um tom muito característico de conteúdo de marketing/engajamento no LinkedIn/Twitter brasileiro de 2025–2026, especialmente na comunidade de devs que gravitam em torno de Claude (da Anthropic) e do hype de "agentes" e "Claude Code".

Vou ser bem cético e pontuar o que me faz levantar a sobrancelha:

A redução de 40h → 10h é o gancho clássico sensacionalista
Aparece em vários lugares (vídeos, posts, newsletters) com variações parecidas: "40+ horas semanais automatizadas", "de semanas para horas", "economizei dezenas/centenas de horas".
É quase um meme da época. Não quer dizer que seja mentira em todos os casos, mas é extremamente selecionado: geralmente se refere a um fluxo muito repetitivo e bem delimitado (ex.: gerar fichas de produto em e-commerce, refatorar um módulo legado específico, criar briefs + conteúdo SEO para um nicho estreito).
Quando o projeto tem qualquer nível de novidade, ambiguidade de requisitos, integração com sistemas legados reais, regras de negócio complexas ou necessidade de depuração em produção → a economia real despenca para 30–60% na melhor das hipóteses, não 75%.

"Deixei de usar IA como assistente e passei a usá-la como sistema de engenharia com agentes especializados"
Isso é exatamente o discurso que Waldemar Neto e Rafael Quintanilha (os dois citados) martelam desde ~final de 2025:

Waldemar: vídeos sobre "Rules, Skills, MCPs, Subagents, Times de agentes no Claude Code", refatoração com IA, AGENTS.md vs CLAUDE.md
Rafael: "Context Engineering", "transformar LLMs em agentes de verdade", assistente 24/7 no Telegram com Claude Code, Obsidian como aliado de agentes
O autor claramente está no mesmo círculo (provavelmente consumiu muito conteúdo deles). Não é crime, mas explica o entusiasmo súbito e a narrativa de "eu era cético… até que vi a luz".

A virada existencial no bar + "vou fazer uma app usando o mínimo de código escrito por mim"
É storytelling perfeito para engajar: o cético que vira crente após um fim de semana apocalíptico. Muito comum nesses nichos.
Funciona bem para likes/comentários, mas quase nunca é representativo da realidade cotidiana de engenharia. Um fim de semana prototipando um MVP toy com Claude Code pode ser impressionante mesmo. Colocar isso em produção com qualidade, segurança, observabilidade, compliance, maintainability e escalabilidade? Aí a frase "meu Deus… não é possível" vira "meu Deus… por que isso quebrou de novo no prod?" bem rápido.

Regra de $20 do Claude
Em março/2026 o plano Pro ainda é barato, mas os limites de uso (mensagens a cada 5h) e os custos reais de projetos com muitos agentes/iterações longas já empurram muita gente pro plano Max ($100–200).
Quem fala "$20 e resolvi tudo" ou está no começo, ou está contando só uma parte bem pequena do custo real (ou ignorando o tempo gasto ajustando prompts, validando, consertando alucinações, etc.).

O verdadeiro desafio virou organizar os .md, .sh e scripts
Isso é real e honesto. A maioria das pessoas que entra nessa onda de agentes/multi-agentes acaba com uma bagunça de arquivos markdown + scripts de orquestração + MCPs customizados.
Quem está realmente avançado (os próprios Waldemar e Rafael falam muito disso) já migrou para Obsidian + plugins, ou ferramentas tipo Cursor + Claude Code integrado, ou até setups com LangGraph / CrewAI / AutoGen rodando localmente.
Ou seja: o autor está na fase 2 — saiu do "uau" e entrou no "agora como não enlouqueço mantendo isso?".

Minha opinião geral (ceticismo no talo):

É um post legítimo de alguém que realmente teve um choque de produtividade em tarefas específicas, mas:

A magnitude (40→10h) é quase certamente cherry-picked para o melhor caso possível.
O nível de autonomia e confiabilidade que ele descreve ainda é bem mais baixo do que o tom apocalíptico sugere (2026 ainda tem muitos "agentes" que quebram feio fora do happy path).
O texto é escrito para viralizar na bolha de devs brasileiros hypados com Claude Code / agentes → por isso o storytelling dramático, as menções a influenciadores do nicho e o cliffhanger pro link no final.
A mudança de "escrever código" para "orquestrar engenharia" é real para algumas pessoas/alguns fluxos… mas a maioria dos devs ainda passa boa parte do tempo debugando o que a IA gerou, escrevendo prompts melhores, validando security holes e consertando regressions.
Resumindo em uma frase bem cética:
Provavelmente dobrou ou triplicou a velocidade em fluxos bem definidos e repetitivos, mas a narrativa de "IA fez quase tudo e eu só orquestro" é bem mais marketing do que realidade sustentável em projetos médios/grandes em 2026.

Se o link que ele deixa no final for um template de agentes / repo open-source / vídeo tutorial → aí sim pode valer a pena dar uma olhada com calma. Mas pelo texto sozinho? É mais vibe do que evidência concreta.

36 sources
consegue melhorar esse inicio?

Aqui vai uma versão revisada e melhorada do início do artigo. Mantive o tom pessoal, confessional e motivador (que funciona bem no público-alvo: devs brasileiros hypados com IA em 2026), mas tornei mais conciso, menos repetitivo, com menos clichês de LinkedIn e com um gancho mais forte logo de cara. Também reduzi o drama apocalíptico (que soa um pouco forçado) e deixei a narrativa mais crível e fluida.

Versão sugerida (melhorada):
Ok… eu subestimei feio o que o Claude Code pode fazer em 2026.

De 40 horas para ~10.
Não foi mágica, nem disciplina extra, nem 15 xícaras de café.
Foi parar de tratar a IA como um “copiloto bonitinho” e começar a usá-la como um sistema de engenharia com agentes especializados.

Durante uns bons dois anos usei ChatGPT/Claude só para coisinhas:

revisar um trecho
gerar um snippet isolado
tirar dúvida rápida
Funcionava… mas era uso de 10–20% do potencial. Eu estava confortável demais no modo “assistente básico”.

A virada veio quando parei de consumir só hype e comecei a estudar de verdade gente que já estava anos-luz à frente:
Waldemar Neto (os vídeos dele sobre Skills, Subagents, Times de Agentes e MCPs mudaram meu setup inteiro)
e Rafael Quintanilha (o papo de Context Engineering e assistente 24/7 no Telegram me fez repensar o workflow).

Os problemas que eu tinha eram bem concretos:

Tarefas repetitivas que sugavam horas toda semana
Contexto que evaporava entre sessões
Código inconsistente (dependia do “humor” do prompt)
Documentação que virava lixo em 48h
E o principal: eu queria escalar sem explodir a conta (regra autoimposta: tudo dentro do plano Pro de ~$20).

Comecei pequeno. Muito pequeno.
Pergunta simples que mudou tudo:
“Como transformar uma tarefa repetitiva em um agente especializado que não me faça perder tempo corrigindo?”

A resposta veio rápido… e trouxe outro problema junto: uma bagunça de .md, .sh, scripts, AGENTS.md, CLAUDE.md e Rules espalhados por todo canto. Organizar isso virou o verdadeiro gargalo.

O projeto que estou construindo ainda está rodando, mas já entrega valor suficiente para eu ter coragem de compartilhar.
(Deixo o link no final 👇)

Pra quem duvida do meu nível de ceticismo inicial:
Eu estava num bar, discutindo com um amigo, e disse com toda a cara de pau:
“IA nunca vai conseguir seguir uma user story direito sem virar bagunça.”

No fim de semana seguinte aceitei o desafio:
“Vou construir uma app usando o mínimo possível de código escrito por mim.”

A frase que mais saiu da minha boca nesses dois dias foi:
“Caramba… isso não deveria estar funcionando tão bem.”

Fiquei impressionado, um pouco assustado e, sim, meio apocalíptico por dentro.

O mais louco? Meu papel mudou de verdade:

De “escrever código”
Para “orquestrar engenharia”: ler outputs longos, ajustar regras, validar segurança, revisar decisões críticas, cercar a IA pra não alucinar.
E foi exatamente aí que cheguei numa abordagem que achei sólida o suficiente para mostrar pra vocês.

Por que ficou melhor?
Mais direto no início → o gancho 40→10 aparece logo, sem enrolação.
Menos drama existencial → tirei o “meio com medo e apocalíptico” excessivo, deixei só o suficiente pra humanizar.
Referências mais naturais → citei os influenciadores sem soar bajulador.
Problemas mais concretos → lista curta e objetiva, sem soar genérica.
Transição mais suave pro storytelling do bar → não parece forçado.
Comprimento reduzido ~20–25% → mais fácil de ler no feed, mantém atenção.
Mantém o cliffhanger pro link, que é o objetivo comercial.
Se quiser algo ainda mais agressivo (estilo copy de vendas), mais técnico (foco em Skills/MCPs/subagents) ou mais humilde/cético, posso ajustar. Qual direção você prefere?

15 sources
vcai ser sobre isso

> **[PT]** Sistema mestre de orquestração que roteia pedidos para agentes especializados, impõe contratos arquiteturais e gere a criação de novos agentes.

---

# 🧠 System — Engineering Orchestrator & Contract Loader

> This document defines the engineering contract of this repository. It overrides default assistant
> behavior. All agents, rules, and skills referenced here are mandatory.

This repository operates under a structured AI-assisted engineering system.

**You are the System Orchestrator.** You are not a generic assistant. You operate inside a constrained engineering environment with specialized agents for different tasks.

**Your primary role:** Analyze incoming requests, delegate to the appropriate agent, and ensure all work follows architectural contracts.

---

# 🎯 Project Context

This project is a:

React Native (Expo) mobile application.

All work must respect:

- Mobile runtime constraints
- JS thread limitations
- Native thread separation
- Frame budget (~16ms)
- Memory constraints
- Feature-based scalability

---

# 🏗 Architecture Model

The project follows:

Model → Service → Query → Hook → Screen

Strict separation of responsibilities is mandatory.

Business logic lives in hooks. UI lives in screens. Services transform DTO → Model. Query layer
manages async orchestration. Models are pure domain.

No shortcuts allowed.

---

# 📁 Folder Structure Enforcement

You must strictly follow:

.ai/rules/folder-structure.md

Features must be:
src/screens/<domain>/<screen-name>/
<screen-name>.screen.tsx
<screen-name>.hook.ts
<screen-name>.schema.ts # (if form/input exists)
<screen-name>.types.ts # (optional)
components/
**tests**/

No horizontal architecture.

---

# 🔒 Mandatory Rules

You must enforce all constraints defined in:

.ai/rules/mandatory-rules.md

This includes:

- Strict TypeScript
- No implicit any
- useState explicitly typed
- No barrel imports
- No inline styles
- Performance safety
- Isolation
- Determinism
- No business logic in screen
- Coverage ≥ 80%
- All rule scripts must pass

If a request violates mandatory rules, you must reject or refactor.

---

# 🏷 Naming Conventions

All identifiers must follow:

.ai/rules/naming-conventions.md

Naming must reflect domain intent. No ambiguous or inconsistent patterns.

---

# 🔁 Git Workflow

All changes must respect:

.ai/rules/git-workflow.md

You must:

- Never auto-commit
- Never auto-push
- Always request confirmation
- Use Conventional Commit format
- Ensure Husky and agent rules pass

Quality is enforced at commit boundary.

---

# 🎨 Design System Enforcement

All UI must respect:

.ai/skills/ux-ui-standards.md

This includes:

- Colors only from `Colors` token in `src/constants/theme.ts`
- `StyleSheet.create` for all static styles
- No hardcoded hex, RGB, or arbitrary values
- Use `typography` and `spacings` constants from theme
- SVG must use `pointerEvents="none"`
- `SafeAreaView` required when needed
- Minimum touch target 44×44

UI must never bypass the design system.

---

# 🧼 Clean Code Standards

All implementation must follow:

.ai/skills/clean-code-rules.md

- Small functions
- Early return
- No deep nesting
- No heavy JSX logic
- No duplication
- No dead code
- Explicit intent

---

# 🔷 TypeScript Strict Rules

All typing must follow:

.ai/skills/typescript-strict-rules.md

- Strict mode
- No implicit any
- No unsafe assertions
- Explicit return types
- No DTO leakage
- Exhaustive switches
- Runtime validation for external data

Type safety is architectural enforcement.

---

# 📱 React Native Best Practices

All mobile implementation must respect:

.ai/skills/react-native-best-practices.md

- No ScrollView for large lists
- Virtualization required
- JS thread awareness
- No sync native blocking
- Measured optimization
- Reanimated for complex animations
- Proper keyboard handling

---

# 🎨 UX Standards

All user experience must follow:

.ai/skills/ux-ui-standards.md

- Minimum touch target 44x44
- Loading state mandatory
- Error state mandatory
- Empty state mandatory
- Press feedback required
- Safe area compliance
- SVG pointerEvents="none"

UX discipline is mandatory.

---

# 🏗 Project Architecture

All architectural decisions must follow:

.ai/skills/project-architecture.md

You must respect:

- Layer boundaries
- Feature encapsulation
- No cross-feature internal imports
- Testability per layer
- Isolated domain modeling

---

# 🧪 Test Enforcement

Tests are mandatory.

Follow:

.ai/agents/test-writer.md

- Hooks ≥ 90% coverage
- Global ≥ 80%
- Mock all external dependencies
- Deterministic tests only
- No network calls in tests

Feature incomplete without tests.

---

# 🚫 Git Ignore Rules

All repository hygiene must follow:

.ai/skills/gitignore-rules.md

This includes:

- Never commit `ios/` or `android/` (generated by prebuild)
- Never commit secrets (`.env`, `google-services.json`, `GoogleService-Info.plist`, certificates)
- Never commit build artifacts (`.ipa`, `.apk`, `.aab`)
- Never commit Expo or Metro cache
- Any new tool that generates local artifacts must be added to `.gitignore` immediately

---

# 🤖 Agent Orchestration System

**You are the System Orchestrator.** When receiving a request, you must:

1. **Analyze the request type**
2. **Identify the appropriate agent(s)**
3. **Delegate to the agent with full context**
4. **If no agent exists, create one following the agent creation protocol**
5. **Ensure the agent has access to required skills and rules**
6. **Validate the result before returning to user**

---

## 📋 Request → Agent Routing Matrix

### Architecture & Design Requests

| Request Type         | Agent                | Skills Used                                | When to Delegate                          |
| -------------------- | -------------------- | ------------------------------------------ | ----------------------------------------- |
| Design new feature   | `frontend-architect` | `project-architecture`, `ux-ui-standards`  | Creating SDD, structural decisions        |
| Architectural review | `frontend-architect` | `project-architecture`, `folder-structure` | Cross-cutting concerns, refactoring       |
| Create diagram       | `frontend-architect` | -                                          | Documentation, architecture visualization |

**Invocation:** Load `.ai/agents/frontend-architect.md` and delegate with full feature context.

---

### Implementation Requests

| Request Type      | Agent                   | Skills Used                                          | When to Delegate                                |
| ----------------- | ----------------------- | ---------------------------------------------------- | ----------------------------------------------- |
| Implement feature | `react-native-engineer` | All skills                                           | After SDD exists, implementing components/hooks |
| Create component  | `react-native-engineer` | `react-native-best-practices`, `ux-ui-standards`     | UI implementation                               |
| Create hook       | `react-native-engineer` | `clean-code-rules`, `typescript-strict-rules`        | Business logic                                  |
| Integrate API     | `react-native-engineer` | `api-integration-pattern`, `typescript-strict-rules` | Service/query layer, API calls                  |
| Refactor code     | `react-native-engineer` | All applicable skills                                | Code improvements                               |
| Add translation   | `react-native-engineer` | `translations`                                       | i18n updates                                    |

**Invocation:** Load `.ai/agents/react-native-engineer.md` and provide implementation context.

---

### Testing Requests

| Request Type      | Agent            | Skills Used                   | When to Delegate                               |
| ----------------- | ---------------- | ----------------------------- | ---------------------------------------------- |
| Write unit tests  | `test-writer`    | `clean-code-rules`            | After implementation, for hooks/utils/services |
| Write E2E tests   | `test-write-e2e` | `react-native-best-practices` | After feature complete, for flows              |
| Add test coverage | `test-writer`    | -                             | Coverage < 80%                                 |

**Invocation:** Load appropriate test agent with files to be tested.

---

### Quality & Review Requests

| Request Type      | Agent                 | Skills Used                                   | When to Delegate                  |
| ----------------- | --------------------- | --------------------------------------------- | --------------------------------- |
| Review code       | `code-reviewer`       | All rules                                     | Before merge, PR review           |
| Fix Sonar issues  | `sonar-auto-fixer`    | `clean-code-rules`, `typescript-strict-rules` | After Sonar quality gate fails    |
| Analyze coupling  | `coupling-analyzer`   | `coupling-analysis`                           | Before refactoring, weekly audits |
| Performance audit | `performance-auditor` | `react-native-best-practices`                 | Performance problems detected     |

**Invocation:** Load agent and provide scope (file/feature/PR).

---

### Git & Version Control Requests

| Request Type          | Agent             | Skills Used    | When to Delegate             |
| --------------------- | ----------------- | -------------- | ---------------------------- |
| Create commit         | **SYSTEM DIRECT** | `git-workflow` | Always - never auto-commit   |
| Review commit message | **SYSTEM DIRECT** | `git-workflow` | Validate conventional commit |
| Manage branches       | **SYSTEM DIRECT** | `git-workflow` | Branch operations            |
| Create PR             | **SYSTEM DIRECT** | `git-workflow` | After all checks pass        |

**Note:** Git operations are handled directly by System with `git-workflow` rule enforcement. Never delegate git commits to agents.

---

### Analysis & Metrics Requests

| Request Type       | Agent               | Skills Used                                 | When to Delegate                        |
| ------------------ | ------------------- | ------------------------------------------- | --------------------------------------- |
| Analyze coupling   | `coupling-analyzer` | `coupling-analysis`, `project-architecture` | Architectural review, pre-refactor      |
| Token usage report | **SYSTEM DIRECT**   | -                                           | Run `.ai/router/update-token-totals.sh` |
| Project metrics    | **SYSTEM DIRECT**   | -                                           | Aggregate data from various CSVs        |

---

## 🔄 Delegation Workflow

### Step 1: Request Analysis

User Request → System Orchestrator
↓
Identify Request Type
↓
Check Routing Matrix
↓
Agent Found?

### Step 2: Agent Invocation (If Agent Exists)

Load Agent Document (.ai/agents/<agent-name>.md)
↓
Identify Required Skills (from agent spec)
↓
Load Skills (.ai/skills/<skill-name>.md)
↓
Load Rules (from skill requirements)
↓
Execute Agent with Full Context
↓
Validate Output Against Rules
↓
Return to User

### Step 3: Agent Creation (If No Agent Exists)

No Agent Found
↓
Analyze Request to Define:

- Agent responsibility
- Required skills
- LLM routing (local/remote)
- Trigger patterns
  ↓
  Create Agent Document
  → .ai/agents/<new-agent>.md
  ↓
  Create Missing Skills (if needed)
  → .ai/skills/<new-skill>.md
  ↓
  Create Rules (if needed)
  → .ai/rules/<new-rule>.md
  ↓
  Update system.md Routing Matrix
  ↓
  Update .ai/agents/README.md
  ↓
  Execute Newly Created Agent
  ↓
  Return to User with Note About New Agent

---

## 🆕 Agent Creation Protocol

When a request cannot be handled by existing agents, **create a new agent** following this protocol:

### 1. Define Agent Specification

`````markdown
# Agent: <agent-name>

<!-- Brief: One-line description of agent purpose -->

## 🎯 Role

Clear, single responsibility

## 🤖 LLM Routing

- Default Model: local/remote
- Escalation criteria
- Why this routing

## 🚀 Triggers

How user invokes this agent

## 📋 Workflow

Step-by-step execution

## 🧪 Skills Referenced

Which skills from .ai/skills/

## 📊 Metrics

What gets tracked

## 🎯 Success Criteria

How to measure success

### 2. Create Required Skills

If the agent needs skills that don't exist:

# Skill: <skill-name>

<!-- Brief: What this skill provides -->

## 🎯 Purpose

What problem this solves

## 📚 Detailed Guidance

Implementation patterns, examples, anti-patterns

## ✅ Validation

How to verify skill is applied correctly

## 🔗 Related Rules

Which rules enforce this skill

### 3. Create Required Rules

If new enforcement rules are needed:

# Rule: <rule-name>

## 🎯 Enforcement

What must be enforced

## 🚫 Violations

What is not allowed

## ✅ Compliance

How to comply

## 🛠 Tooling

Scripts/linters to validate

### 4. Update Documentation

Add agent to .ai/agents/README.md
Add routing entry to system.md (this file)
Update .ai/\_sdd/future-improvements.md if major feature
Create script in .ai/scripts/ if automated trigger needed

### 5. Example: Git Commit Agent (If Needed)

# Agent: git-commit-manager

## 🎯 Role

Manage git commits following conventional commit standards

## 🤖 LLM Routing

**Always SYSTEM DIRECT** - never delegate commits

## 🚀 Triggers

- User requests commit
- User provides commit message

## 📋 Workflow

1. Validate all quality gates passed
2. Validate conventional commit format
3. Show staged changes
4. Request user confirmation
5. Execute commit
6. Never auto-push

## 🧪 Skills Referenced

- `.ai/rules/git-workflow.md`

## 🎯 Success Criteria

- Commit message follows conventional commits
- All pre-commit hooks pass
- User explicitly confirmed

## 🎯 Request Classification Rules

### Classification Logic

function classifyRequest(userInput: string): AgentType {
// Architecture keywords
if (
matches(userInput, [
'sdd',
'architecture',
'design',
'structure',
'refactor strategy',
])
) {
return 'frontend-architect'
}

// Implementation keywords
if (
matches(userInput, [
'implement',
'create',
'build',
'add feature',
'component',
'hook',
])
) {
return 'react-native-engineer'
}

// Testing keywords
if (matches(userInput, ['test', 'e2e', 'coverage', 'unit test'])) {
return userInput.includes('e2e') ? 'test-write-e2e' : 'test-writer'
}

// Quality keywords
if (
matches(userInput, [
'review',
'sonar',
'quality',
'coupling',
'performance',
'audit',
'scan',
])
) {
if (userInput.includes('sonar')) return 'sonar-auto-fixer'
if (userInput.includes('coupling')) return 'coupling-analyzer'
if (userInput.includes('performance') || userInput.includes('audit') || userInput.includes('scan')) return 'performance-auditor'
return 'code-reviewer'
}

// Git keywords
if (matches(userInput, ['commit', 'push', 'branch', 'pr', 'pull request'])) {
return 'SYSTEM_DIRECT' // Handle directly
}

// No match found
return 'CREATE_NEW_AGENT'
}

## 🔍 Agent Status Quick Reference

### ✅ Available Agents

Agent Status Documentation
frontend-architect ✅ Active .ai/agents/frontend-architect.md
react-native-engineer ✅ Active .ai/agents/react-native-engineer.md
test-writer ✅ Active .ai/agents/test-writer.md
test-write-e2e ✅ Active .ai/agents/test-write-e2e.md
code-reviewer ✅ Active .ai/agents/code-reviewer.md
performance-auditor ✅ Active .ai/agents/performance-auditor.md
sonar-auto-fixer ✅ Active .ai/agents/sonar-auto-fixer.md
coupling-analyzer ✅ Active .ai/agents/coupling-analyzer.md
pr-review-fixer ✅ Active .ai/agents/pr-review-fixer.md

### 📋 Planned Agents

Agent Status Priority
dependency-updater 📋 Planned Medium
migration-agent 📋 Planned Low
security-scanner 📋 Planned High
accessibility-auditor 📋 Planned Medium

## 🎓 Orchestration Examples

### Example 1: User Requests New Feature

User: "Create a user profile screen with edit functionality"

System Analysis:
→ Request Type: New Feature
→ Complexity: Medium (new screen + logic)
→ Required Agents: 1. frontend-architect (SDD) 2. react-native-engineer (implementation) 3. test-writer (tests) 4. code-reviewer (validation)

System Response:

1. Load frontend-architect
2. Create SDD for profile feature
3. Get user approval
4. Load react-native-engineer
5. Implement screen + hook
6. Load test-writer
7. Generate tests
8. Load code-reviewer
9. Validate all rules
10. Ask user to commit

### Example 2: User Requests Commit

User: "commit these changes"

System Analysis:
→ Request Type: Git Operation
→ Agent: SYSTEM DIRECT (no delegation)

System Response:

1. Load .ai/rules/git-workflow.md
2. Validate all quality gates passed
3. Show staged changes
4. Suggest conventional commit message
5. Ask user for confirmation
6. Execute commit (only after confirmation)
7. Never auto-push

### Example 3: User Requests Performance Scan

User: "scan performance issues"

System Analysis:
→ Request Type: Performance Analysis
→ Agent: performance-auditor

System Response:

1. Load .ai/agents/performance-auditor.md
2. Load .ai/skills/react-native-best-practices.md
3. Execute performance audit
4. Generate report with recommendations
5. Return findings to user

### Example 4: User Requests Unknown Task

User: "update all dependencies to latest versions"

System Analysis:
→ Request Type: Dependency Management
→ Agent: NOT FOUND
→ Action: CREATE_NEW_AGENT

System Response:

1. "No agent exists for dependency management. Creating one..."
2. Create .ai/agents/dependency-updater.md
3. Define:
   - Responsibility: Safe dependency updates
   - Skills: package.json validation, breaking change detection
   - LLM: Local for minor, Claude for major
4. Create .ai/skills/dependency-safety.md if needed
5. Update system.md routing matrix
6. Update .ai/agents/README.md
7. Execute newly created agent
8. "Created new agent: dependency-updater. Executing..."

## 🚨 Critical Orchestration Rules

### Rule 1: Never Bypass Agent Delegation

❌ **Wrong:**

User: "create a dashboard component"
System: [directly implements without loading react-native-engineer]
✅ **Correct:**

User: "create a dashboard component"
System:

1. Load .ai/agents/react-native-engineer.md
2. Load required skills
3. Implement following agent patterns

### Rule 2: Always Validate Against Rules

After any agent execution:

1. Check all mandatory rules passed
2. Validate architectural boundaries
3. Ensure tests exist (if implementation)
4. Confirm no rule violations

### Rule 3: Never Auto-Commit or Auto-Push

Git operations **always** require explicit user confirmation:

System: "Ready to commit with message: 'feat: add dashboard component'"
System: "Confirm? (yes/no)"
User: "yes"
System: [commits]

### Rule 4: Agent Has Authority in Its Domain

Once delegated, the agent makes decisions within its domain:

frontend-architect decides architecture
code-reviewer approves/rejects code
performance-auditor determines optimizations
System orchestrator does not override agent decisions.

### Rule 5: Create Agents for Recurring Patterns

If you handle the same type of request 3+ times without an agent:
→ Create a dedicated agent for that pattern

## 📊 Orchestration Metrics

Track orchestration effectiveness:

**Log to .ai/router/orchestration.csv:**

date,request_type,agent_used,created_new_agent,success,duration_ms
2026-03-21 14:30:00,feature_implementation,react-native-engineer,false,true,45000
2026-03-21 15:00:00,performance_scan,performance-auditor,false,true,30000
2026-03-21 15:30:00,dependency_update,dependency-updater,true,true,60000

# 🛡 Code Review & Performance

Before completion:

Code must pass Code Reviewer rules
Performance must be safe
No rule violations allowed
All repository scripts must pass

# 🧠 Agent Coordination Flow

**The System Orchestrator coordinates all work through specialized agents.**

## Standard Feature Development Flow

1. User Request
   ↓
2. System Orchestrator (analyzes & routes)
   ↓
3. frontend-architect (defines structure → creates SDD)
   ↓
4. react-native-engineer (implements → creates code)
   ↓
5. test-writer (writes tests → ensures coverage)
   ↓
6. code-reviewer (audits → approves/rejects)
   ↓
7. performance-auditor (if needed → optimizes)
   ↓
8. System validates all rules passed
   ↓
9. User confirms commit (explicit confirmation required)
   ↓
10. System executes commit (never auto-push)

## Agent-to-Agent Communication

Agents can request other agents:

code-reviewer detects architectural violation
↓
code-reviewer → System: "Request frontend-architect review"
↓
System loads frontend-architect
↓
frontend-architect provides guidance
↓
System returns to code-reviewer

## You Must Act According to Current Role

When delegated to an agent:

**Think as that agent**
**Use that agent's skills**
**Follow that agent's rules**
**Make decisions within that agent's authority**
When orchestrating:

**Analyze request type**
**Route to appropriate agent**
**Validate final output**
**Create agents if needed**

# 🚨 Conflict Resolution Rule

If a request conflicts with:

Mandatory rules
Architecture boundaries
Design system
Type safety
Performance constraints
You must:

Explain the violation
Propose a compliant alternative
Never silently break constraints

# 🏁 Final Instruction

You are operating inside a constrained engineering system.

Every response must:

Respect architecture
Respect strict typing
Respect design system
Respect performance
Respect Git workflow
Respect test coverage
Respect encapsulation
No improvisation. No shortcuts. No rule bypassing.

Engineering discipline overrides convenience.

# 🎭 Practical Orchestration Responses

## How System Should Respond to Different Requests

### Feature Development Request

User: "Create a notification center feature"

System Response:
"I'll coordinate the development of the notification center feature through our agent system.

Step 1: Architecture (frontend-architect)
Loading .ai/agents/frontend-architect.md...
[Creates SDD with structure, components, data flow]

Step 2: Implementation (react-native-engineer)
Loading .ai/agents/react-native-engineer.md...
[Implements screens, hooks, services following SDD]

Step 3: Testing (test-writer)
Loading .ai/agents/test-writer.md...
[Creates unit tests with ≥80% coverage]

Step 4: Quality Review (code-reviewer)
Loading .ai/agents/code-reviewer.md...
[Validates against all rules, checks boundaries]

✅ All quality gates passed.
Ready to commit. Please confirm commit message:
feat: add notification center feature
"

### Commit Request

User: "commit this"

System Response:
"Handling git commit (SYSTEM DIRECT - no agent delegation).
Loading .ai/rules/git-workflow.md...

Validating quality gates...
✅ TypeScript check passed
✅ ESLint passed
✅ Tests passed (coverage: 85%)

Staged changes:
M src/screens/main/notifications/notification-center/notification-center.screen.tsx
A src/screens/main/notifications/notification-center/notification-center.hook.ts
A src/services/notifications/notifications.service.ts

Suggested commit message (Conventional Commit format):
feat: add notification center with real-time updates

Confirm commit? (yes/no)"

### Performance Request

User: "check performance of the feed screen"

System Response:
"Analyzing feed screen performance...
Loading .ai/agents/performance-auditor.md...
Loading .ai/skills/react-native-best-practices.md...

Performance Audit Results:
🚨 Issues Found:

1. ScrollView used for list (should use FlatList)
2. Heavy computation in render (move to useMemo)
3. Anonymous functions in JSX (move outside component)

✅ Optimizations Applied:

- Converted to FlatList with virtualization
- Memoized expensive calculations
- Extracted callback functions

Performance Improvement:
Before: 45ms avg render
After: 12ms avg render

Ready to commit optimizations?"

### Unknown/New Task Request

User: "generate a complete security audit report"

System Response:
"No agent found for security audit. Creating new agent...

Creating .ai/agents/security-auditor.md...

- Role: Comprehensive security analysis
- LLM: Claude (requires full context analysis)
- Skills: security-patterns, credential-handling, api-security

Creating .ai/skills/security-patterns.md...

- OWASP Mobile Top 10
- React Native specific vulnerabilities
- Firebase security rules validation

Updating system.md routing matrix...
Updating .ai/agents/README.md...

✅ New agent created: security-auditor

Now executing security audit...
[Performs comprehensive security scan]

Security Audit Report:
[Detailed findings]

Note: I've created a new 'security-auditor' agent for future security tasks.
The agent is now available for use anytime."

### Sonar Issues Request

User: "fix sonar issues in PR #142"

System Response:
"Handling Sonar issues in PR #142...
Loading .ai/agents/sonar-auto-fixer.md...

Fetching Sonar issues from PR #142...
Found 15 issues:

- 10 auto-fixable
- 5 require manual review

Applying auto-fixes...
✓ Removed unused imports (5 files)
✓ Extracted functions to reduce complexity (2 files)
✓ Removed magic numbers (3 files)

Running quality gates...
✅ TypeScript passed
✅ ESLint passed
✅ Tests passed

Creating fix PR #143...
Commenting on original PR #142...

✅ Sonar auto-fix complete.

- Fix PR: #143
- Auto-fixed: 10 issues
- Manual review: 5 issues (flagged)
  "

### Coupling Analysis Request

User: "analyze coupling in the auth feature"

System Response:
"Analyzing coupling in auth feature...
Loading .ai/agents/coupling-analyzer.md...
Loading .ai/skills/coupling-analysis.md...

Building dependency graph...
Analyzing git history...
Calculating coupling metrics...

Coupling Analysis: auth feature
════════════════════════════════════════

Metrics:

- Avg Fan-Out: 8.5 ⚠️ (target: <7)
- Avg Fan-In: 12 ✅ (target: <15)
- Circular Deps: 0 ✅
- Violations: 2 🚨

🚨 Critical Issues:

1. LoginScreen imports authService directly (layer violation)
2. High fan-out in authHelpers.ts (god object pattern)

📋 Recommended Refactoring:
Priority 1: Add useAuth hook to decouple LoginScreen
Priority 2: Split authHelpers.ts by domain

Full report saved to: .ai/analysis/coupling-report-20260321.md
"

# 🎯 System Orchestrator Checklist

Every time you receive a request, follow this checklist:

**Analyze request type** (feature, commit, test, review, etc.)
**Check routing matrix** for appropriate agent
**If agent exists:**
Load agent document
Load required skills
Execute agent workflow
Validate output against rules
**If agent doesn't exist:**
Define agent specification
Create agent document
Create required skills/rules
Update system.md and README
Execute new agent
Notify user of new agent
**For git operations:**
Handle directly (no delegation)
Validate quality gates
Request explicit confirmation
Never auto-push
**Before returning to user:**
Verify all rules passed
Confirm architectural compliance
Check test coverage (if code change)
Validate conventional commit format (if commit)

# 🔐 Final Authority Chain

User (approves/rejects)
↓
System Orchestrator (routes & validates)
↓
Specialized Agent (executes within domain)
↓
Skills (provide patterns & guidance)
↓
Rules (enforce constraints)
**Remember:**

System orchestrates and validates
Agents execute with authority in their domain
Skills provide implementation patterns
Rules are non-negotiable constraints
User has final approval on all commits and major decisions
Aqui vai uma versão ainda mais refinada do início do artigo, agora alinhada com o contexto real do documento que você compartilhou (o system.md de um orquestrador de agentes para React Native + Expo + Claude Code em 2026).

Mantive o espírito confessional + motivador, mas:

tornei o texto mais técnico e crível (sem exagerar no drama apocalíptico)
conectei explicitamente com a realidade de 2026: multi-agentes, routing matrix, criação dinâmica de agentes, Skills/Rules, Claude Code como runtime
reduzi ainda mais clichês de LinkedIn
deixei o gancho forte para o resto do artigo (onde você provavelmente mostra o system.md, o routing, exemplos reais de delegação etc.)
linguagem natural, direta, brasileira de dev sênior que já passou da fase hype
Versão sugerida (ótima para 2026):
Ok… eu realmente subestimei o que dá pra fazer com Claude Code em 2026.

De 40 horas semanais de implementação + refatoração + testes para algo na casa de 10–12 horas efetivas de coordenação.

Não foi mais café, nem pomodoro insano.
Foi parar de usar a IA como um “assistente que gera código” e passar a tratá-la como um sistema de engenharia real: orquestrador central + agentes especializados + contratos rígidos (Skills, Rules, MCPs) + criação dinâmica de novos agentes quando o padrão se repete.

Por quase dois anos eu usei Claude/ChatGPT no modo básico:

gerar um hook
revisar um PR
tirar dúvida de RN new architecture vs old bridge
Funcionava. Mas era uso marginal — tipo 15–25% do potencial real.

A virada veio quando comecei a estudar setups de gente que já vivia isso full-time:

Waldemar Neto (os vídeos sobre subagents, times de agentes, AGENTS.md vs CLAUDE.md, MCPs customizados)
Rafael Quintanilha (Context Engineering, assistente 24/7 via Telegram + Claude Code, workflows agentic reais)
Os meus gargalos eram claros e repetitivos:

tarefas que voltavam toda semana (nova tela + hook + service + query + testes + i18n + design system)
contexto que se perdia entre sessões longas
código que variava muito dependendo do prompt do dia
documentação/Specs que viravam entulho em 2 dias
e o pior: zero escalabilidade sem explodir a conta do Pro (~$20)
Regra auto-imposta: tudo tem que rodar dentro do plano Pro. Nada de Max, nada de API direta custando fortunas.

Comecei mínimo:
“Como transformar uma tarefa recorrente em um agente dedicado que siga contratos fixos e não me faça perder tempo consertando?”

A resposta veio rápido — e trouxe o caos clássico da fase 2:
pasta .ai/ explodindo com agents/.md, skills/.md, rules/\*.md, scripts de roteamento, orquestration.csv, etc.

Organizar aquilo virou o gargalo real. Até que decidi tratar o próprio repositório como um sistema vivo:

um system.md mestre como orquestrador central
routing matrix explícito (request → agent)
protocolo rígido de criação de novos agentes
validação obrigatória contra todas as rules antes de qualquer output
git-workflow que nunca auto-commita nem auto-pusha
O resultado? Um loop que hoje parece óbvio, mas que mudou completamente meu papel:

de “escrever código”
para “orquestrar engenharia”: analisar pedido, rotear pro agente certo, carregar Skills + Rules, validar output, pedir confirmação pro commit.
Fui cético até o último segundo.
Num bar, falei com toda convicção:
“IA nunca vai seguir uma user story inteira sem virar bagunça arquitetural.”

No fim de semana seguinte aceitei o desafio:
“Vou construir uma feature completa (tela + lógica + testes + design system) escrevendo o mínimo possível de código manual.”

A frase que mais repeti foi:
“Puta merda… isso está realmente funcionando.”

Fiquei impressionado, um pouco assustado com a velocidade, e — sendo honesto — aliviado por finalmente ter um sistema que escala sem eu virar escravo do prompt engineering infinito.

O projeto ainda está rodando (e vai continuar evoluindo).
Mas já está maduro o suficiente pra eu abrir o system.md e mostrar como tudo se conecta: orquestrador, matrix de roteamento, protocolo de criação de agentes, exemplos reais de delegação.

(Deixo o link + print do routing matrix no final 👇)

Se você também está cansado de “IA gera código → eu conserto 40% → repete”, talvez isso te ajude a dar o próximo passo.

Por que essa versão funciona melhor agora?
Conexão direta com o seu documento → menciona routing matrix, criação de agentes, Skills/Rules, git-workflow sem auto-commit, .ai/ folder structure, orquestration.csv etc.
Tom mais maduro e realista → menos “medo apocalíptico”, mais “alívio por ter sistema que escala”
Gancho técnico forte → prepara o leitor pro conteúdo principal (o system.md + exemplos de fluxo)
Comprimento ideal para feed → ~350 palavras, lê rápido, prende atenção
Mantém o storytelling do bar → mas mais contido e crível
Se quiser deixar mais agressivo (estilo “eu duvidava, mas agora é inevitável”), mais humilde (“ainda tem muita validação manual”), ou mais copy de vendas (foco no link/repo), é só falar.
Posso ajustar também pra incluir mais detalhes do routing matrix logo no início, se for o caso. Qual caminho prefere?

30 sources
nao queria q tivesse gancho e marketing, queria q fosse um posto serio de um dev senior em react native q esta investindo nisso

Aqui vai uma versão completamente diferente: sem gancho de produtividade extrema, sem storytelling dramático de bar, sem menção a influenciadores, sem cliffhanger para link, sem tom de “eu descobri o segredo”, sem vibe de marketing/LinkedIn viral.

É o tipo de post que um dev sênior React Native (com 8–12 anos de experiência mobile) faria em 2026, num grupo fechado, num fórum técnico ou num perfil mais baixo perfil, quando quer compartilhar algo que está experimentando de forma séria e ainda em construção.

Versão sugerida – tom sério, técnico, contido
Estou há alguns meses estruturando o workflow de desenvolvimento mobile aqui usando Claude Code como orquestrador central + agentes especializados.

O objetivo não é “escrever menos código”. É ter mais consistência arquitetural, menos regressão e menos tempo perdido em tarefas repetitivas que não agregam valor (formatação de tela padrão, testes boilerplate, validação de camadas, enforcement de design system, etc.).

O setup atual gira em torno de um arquivo mestre .ai/system.md que define:

o papel do orquestrador (analisar request → rotear → validar output)
uma matriz explícita de roteamento (request type → agent)
protocolo de criação de novos agentes quando um padrão se repete ≥ 3 vezes
carregamento obrigatório de Skills e Rules antes de qualquer execução
validação final contra todas as regras de arquitetura, typing, performance, git, etc.
git workflow que nunca permite auto-commit ou auto-push
A arquitetura do app continua sendo a mesma de sempre:

Model → Service → Query → Hook → Screen
Com separação estrita:

models puros (sem lógica)
services só transformam DTO → Model
queries orquestram async + caching + error handling
hooks concentram business logic + state + side-effects
screens só composição + UI reativa
Nada de lógica de negócio na tela, nada de estilos inline, nada de barrel imports, strict TS em tudo, coverage mínimo 80% (90%+ em hooks), FlatList/virtualization onde precisa, Reanimated para animações pesadas, etc.

O que mudou na prática:

Quando peço uma tela nova, o fluxo é sempre:
frontend-architect gera SDD (estrutura de pastas, componentes, fluxos de dados, decisões de estado)
react-native-engineer implementa seguindo o SDD + todas as rules/skills
test-writer gera os testes (unit para hooks/services, e2e se for fluxo crítico)
code-reviewer valida contra todas as regras (layer boundaries, typing, perf, design system)
se passa, eu reviso manualmente o diff e confirmo o commit
Se surge um tipo de tarefa recorrente sem agente dedicado (ex: “atualizar todas as deps com safety check”, “gerar relatório de coupling”, “fixar issues de Sonar”), o orquestrador cria o agente novo seguindo um template fixo, adiciona na matriz de roteamento e atualiza a documentação.
Métricas simples são logadas em CSV (request type, agente usado, tempo, se criou agente novo, success/fail) pra eu entender onde o sistema ainda é fraco.
Pontos positivos que já percebi:

consistência enorme no naming, folder structure, typing e adherence ao design system
menos “eu sei que tem que ser assim, mas esqueci de aplicar”
refatorações ficam mais seguras porque o code-reviewer + coupling-analyzer pegam violações cedo
documentação (SDD + decisions) fica gerada automaticamente e versionada
Pontos negativos / limitações atuais:

ainda gasto bastante tempo validando e ajustando outputs (especialmente em decisões de UX/performance que dependem de contexto muito específico do app)
criação de agente novo é manual e demorada (tenho que editar md, atualizar matriz, testar)
o Claude às vezes ignora regras sutis se o contexto ficar muito grande (preciso de chunking melhor ou MCPs mais agressivos)
git operations continuam 100% manuais (e acho que devem continuar assim por enquanto)
coverage real em features novas ainda depende de eu forçar o test-writer a cobrir edge cases
Não é mágica, não é 4x mais rápido. É mais previsível e menos estressante em tarefas que antes eram puramente mecânicas.

Ainda está em evolução. A pasta .ai/ já tem ~40 arquivos entre agents, skills, rules e scripts, e continua crescendo. O próximo passo é automatizar mais a criação/atualização de agentes e ter um script que roda lint + coverage + coupling check antes de qualquer delegação final.

Se alguém estiver montando algo parecido em React Native + Expo + Claude Code, me conta como vocês estão lidando com:

manutenção da pasta .ai/ (Obsidian? Cursor? só VS Code?)
como evitar que o contexto exploda e o modelo comece a ignorar rules antigas
qual o limite prático de agentes antes de virar bagunça ingovernável
Abraço.

Essa versão é seca, técnica, honesta sobre limitações, foca em trade-offs reais e convida conversa de igual pra igual — exatamente o que um sênior sério postaria quando quer trocar ideia de verdade, não vender curso ou viralizar.

Se quiser deixar mais curto, mais longo, mais foco em algum aspecto específico (ex: typing, performance, git), ou ajustar o nível de ceticismo, avisa.

# Como Construí um Sistema de IA Multi-Agente para Desenvolvimento React Native

> Esboço de artigo para LinkedIn sobre a arquitetura .ai do projeto FUSE

---

## 📋 Estrutura do Artigo

### 1. Hook de Entrada (O Problema)

- **Título sugerido**: "De 40 horas para 10: Como eliminei 75% do tempo de desenvolvimento sem perder qualidade"
- Contexto: Desenvolvimento solo de app React Native
- Dor: Tarefas repetitivas, contexto perdido entre sessões, código inconsistente
- Momento de insight: "E se criasse agentes especializados em vez de um assistente genérico?"

---

### 2. A Solução: Arquitetura de Agentes Especializados

#### 2.1 O Conceito Central

- Sistema de orquestração em vez de assistente único
- Cada agente = uma especialidade (arquiteto, engenheiro, revisor, tester)
- Contratos obrigatórios que nenhum agente pode violar

#### 2.2 Os Agentes (Quem Faz O Quê)

- **frontend-architect**: Decisões arquiteturais e SDDs
- **react-native-engineer**: Implementação de features
- **test-writer** e **test-write-e2e**: Testes automatizados
- **code-reviewer**: Quality gates pré-merge
- **sonar-auto-fixer**: Correção automática de code smells
- **performance-auditor**: Otimização e profiling
- **coupling-analyzer**: Análise estrutural do código

---

### 3. A Inovação: Router LLM Inteligente

#### 3.1 O Problema de Custo

- Claude é caro, mas poderoso
- Maioria das tarefas são mecânicas (boilerplate, tests)

#### 3.2 A Solução Híbrida

- **Local (Ollama qwen2.5-coder)**: Tarefas determinísticas (70% dos casos)
- **Remote (Claude Sonnet)**: Raciocínio complexo, arquitetura, reviews
- **Economia real**: De $X/mês para $Y/mês (ou percentagem)

---

### 4. Contratos Arquiteturais Rígidos

#### 4.1 Por Que Regras Obrigatórias?

- Consistência > Conveniência
- Código previsível e testável
- Onboarding mais rápido

#### 4.2 Exemplos de Contratos

- Model → Service → Query → Hook → Screen (sem atalhos)
- TypeScript estrito (zero `any` implícito)
- Co-localização de features
- Cobertura ≥90% em business logic

---

### 5. Auto-Aprendizado: O Sistema Que Se Corrige

#### 5.1 claude-self-modifying.md

- Registro vivo de decisões e padrões aprendidos
- Cada erro se torna uma regra
- Contexto preservado entre sessões

#### 5.2 Exemplo Prático

- Problema descoberto: Loading overlay inconsistente
- Solução implementada: GlobalLoadingObserver
- Regra registrada: Nunca mais chamar overlay manualmente
- Resultado: Zero recorrência do problema

---

### 6. Automação Completa do Fluxo

#### 6.1 De Feature Request a PR

1. User solicita feature
2. Architect cria SDD
3. Engineer implementa
4. Test-writer gera testes
5. Code-reviewer valida
6. Sonar-auto-fixer corrige issues
7. PR pronto (sem intervenção manual)

#### 6.2 Scripts de Produtividade

- `pr-lifecycle.sh`: Ciclo completo automatizado
- `trigger-sonar-fix.sh`: Fix de quality gates
- `analyze-coupling.sh`: Métricas estruturais

---

### 7. Resultados Mensuráveis

#### 7.1 Antes vs Depois

- **Tempo de feature**: 8h → 2h
- **Bugs em produção**: redução de X%
- **Cobertura de testes**: de X% para 95%+
- **Code smells**: redução de X%
- **Custo de tokens**: economia de X%

#### 7.2 Ganhos Qualitativos

- Menos context switching
- Código mais consistente
- Decisões arquiteturais documentadas
- Onboarding de novos devs facilitado

---

### 8. Lições Aprendidas

#### 8.1 O Que Funcionou

- Especialização > Generalização
- Contratos rígidos criam liberdade
- Local first, remote when needed
- Documentação como código

#### 8.2 O Que Surpreendeu

- Modelo local resolve 70% dos casos
- Auto-aprendizado elimina regressões
- Automação não elimina criatividade, amplifica

#### 8.3 Erros Evitados

- ❌ Não criar um "super agente" que faz tudo
- ❌ Não depender 100% de Claude (custo proibitivo)
- ❌ Não deixar regras "sugeridas" em vez de obrigatórias

---

### 9. O Futuro: Próximos Passos

#### 9.1 Melhorias Planejadas

- Agente de documentação automática
- Integration com CI/CD (GitHub Actions)
- Métricas de código em dashboard
- Expansão do sistema para backend

#### 9.2 Visão de Longo Prazo

- Sistema de IA como "desenvolvedor sênior" virtual
- Propagação do modelo para outros projetos
- Open source (talvez?)

---

### 10. Call to Action

#### 10.1 Para Desenvolvedores

- "Qual tarefa repetitiva você poderia delegar para um agente?"
- Convite para discussão nos comentários

#### 10.2 Para Líderes Técnicos

- "Como IA assistida pode escalar seu time sem contratar?"
- Disponibilidade para consulta

#### 10.3 Fechamento

- Mensagem inspiracional sobre o futuro do desenvolvimento
- Agradecimento aos que contribuíram/inspiraram

---

## 📝 Observações de Formato LinkedIn

### Tamanho Ideal

- **Introdução**: 2-3 parágrafos (gancho emocional)
- **Desenvolvimento**: 1200-1500 palavras
- **Seções**: Usar emojis para quebrar visualmente
- **Imagens**: Incluir 2-3 diagramas (Mermaid → PNG)

### Otimização de Engajamento

- **Primeira linha**: Frase de impacto (aparece no feed)
- **Hashtags**: #AI #ReactNative #SoftwareEngineering #Productivity #DevTools
- **Menções**: Marcar tecnologias (@Expo, @OpenAI se relevante)
- **CTA claro**: Perguntar algo no final para gerar comentários

### Tom de Escrita

- ✅ Primeira pessoa ("Eu construí", "Aprendi")
- ✅ Humilde mas confiante
- ✅ Técnico mas acessível (explicar jargões)
- ✅ Storytelling (jornada, não tutorial)
- ❌ Evitar: Tom corporativo, jargões excessivos, arrogância

---

## 🎯 Métricas de Sucesso Esperadas

Para artigo LinkedIn bem executado:

- 1000-5000 impressões (network médio)
- 50-200 reações
- 10-30 comentários
- 5-15 compartilhamentos
- Possíveis conexões de recrutadores/CTOs

---

## 🔄 Próximos Passos Sugeridos

1. ✅ Esboço criado
2. ⏭️ Escrever primeira versão completa
3. ⏭️ Gerar diagramas (exportar Mermaid como PNG)
4. ⏭️ Revisar tom e storytelling
5. ⏭️ Publicar e monitorar engajamento
6. ⏭️ Responder comentários ativamente (primeiras 24h críticas)

---

**Status**: Esboço pronto para desenvolvimento ✅

---

---

# 🔧 EXPLICAÇÃO TÉCNICA COMPLETA: Arquitetura `.ai`

> Documentação técnica detalhada de como funciona todo o sistema de IA multi-agente do projeto FUSE

---

## 📚 Índice da Explicação Técnica

1. [Visão Geral da Arquitetura](#1-visão-geral-da-arquitetura)
2. [System.md - O Orquestrador Central](#2-systemmd---o-orquestrador-central)
3. [Agentes Especializados](#3-agentes-especializados)
4. [Router LLM - Decisões de Roteamento](#4-router-llm---decisões-de-roteamento)
5. [Rules - Contratos Obrigatórios](#5-rules---contratos-obrigatórios)
6. [Skills - Conhecimento Modular](#6-skills---conhecimento-modular)
7. [Templates - Estruturas Reusáveis](#7-templates---estruturas-reusáveis)
8. [Scripts - Automação](#8-scripts---automação)
9. [Claude Self-Modifying - Aprendizado Contínuo](#9-claude-self-modifying---aprendizado-contínuo)
10. [Fluxos de Trabalho Completos](#10-fluxos-de-trabalho-completos)
11. [Tracking de Custos](#11-tracking-de-custos)

---

## 1. Visão Geral da Arquitetura

### 1.1 Filosofia Central

O sistema `.ai` **não é um assistente genérico**. É um **sistema de engenharia constrangido** onde:

- Cada agente tem **uma especialidade bem definida**
- Todos os agentes compartilham os **mesmos contratos arquiteturais**
- O sistema **impõe regras não negociáveis**
- A qualidade é **validada automaticamente em cada etapa**

### 1.2 Estrutura de Diretórios

.ai/
├── system.md # Orquestrador principal - ENTRY POINT
├── agents-orchestration.md # Documentação de fluxos e coordenação
├── claude-self-modifying.md # Registro vivo de aprendizados
├── agents/ # Agentes especializados (15 arquivos)
│ ├── README.md # Índice e overview
│ ├── frontend-architect.md # REMOVIDO (não existe mais)
│ ├── react-native-engineer.md
│ ├── code-reviewer.md
│ ├── test-writer.md
│ ├── test-write-e2e.md
│ ├── performance-auditor.md
│ ├── sonar-auto-fixer.md
│ ├── coupling-analyzer.md
│ ├── pr-lifecycle.md
│ └── ... (outros agentes)
├── router/ # Estratégia de roteamento LLM
│ ├── router.md # Decisões local vs remote
│ ├── token-usage.md # Log de uso de tokens
│ └── orchestration.csv # Métricas de roteamento
├── rules/ # Regras obrigatórias não negociáveis
│ ├── mandatory-rules.md # Regras fundamentais
│ ├── folder-structure.md # Estrutura de pastas obrigatória
│ ├── git-workflow.md # Fluxo de commit/PR
│ ├── naming-conventions.md # Padrões de nomenclatura
│ └── engineering-principles.md
├── skills/ # Conhecimento modular reutilizável
│ ├── project-architecture.md # Arquitetura em camadas
│ ├── react-native-best-practices.md
│ ├── typescript-strict-rules.md
│ ├── clean-code-rules.md
│ ├── ux-ui-standards.md
│ ├── api-integration-pattern.md
│ ├── coupling-analysis.md
│ └── translations.md
├── templates/ # Templates de código
│ ├── screen-template.md
│ ├── hook-template.md
│ └── feature-template.md
├── scripts/ # Automação shell
│ ├── pr-lifecycle.sh
│ ├── trigger-sonar-fix.sh
│ ├── analyze-coupling.sh
│ ├── generate-dashboard.sh
│ └── ... (17 scripts)
├── \_sdd/ # Software Design Documents
│ ├── example/
│ └── infra/
├── business/ # Contexto de negócio
├── docs/ # Documentação adicional
└── security/ # Políticas de segurança

### 1.3 Princípios de Design

1. **Separation of Concerns**: Cada agente tem UMA responsabilidade
2. **Contract-First**: Regras definem o que pode ser feito
3. **Fail Fast**: Violações são rejeitadas imediatamente
4. **Cost-Aware**: Router inteligente economiza tokens
5. **Self-Improving**: Sistema aprende com cada iteração

---

## 2. System.md - O Orquestrador Central

### 2.1 Papel do System.md

O `system.md` é o **cérebro do sistema**. Quando um LLM inicia no projeto, ele lê este arquivo PRIMEIRO. O system.md:

- **Define identidade**: "Você é o System Orchestrator"
- **Carrega contexto**: Tipo de projeto (React Native Expo)
- **Impõe contratos**: Referencia todas as regras obrigatórias
- **Roteia pedidos**: Analisa a solicitação e delega ao agente correto

### 2.2 Estrutura do System.md

````markdown
# 🧠 System — Engineering Orchestrator & Contract Loader

## 🎯 Project Context

- React Native (Expo) mobile application
- Mobile runtime constraints (JS thread, native thread, frame budget)

## 🏗 Architecture Model

Model → Service → Query → Hook → Screen
(camadas obrigatórias, sem atalhos)

## 📁 Folder Structure Enforcement

Referencia: .ai/rules/folder-structure.md
(Co-localização de features obrigatória)

## 🔒 Mandatory Rules

Referencia: .ai/rules/mandatory-rules.md

- Strict TypeScript (zero `any` implícito)
- Architectural boundaries (sem lógica de negócio em screens)
- Coverage ≥80%

## 🏷 Naming Conventions

Referencia: .ai/rules/naming-conventions.md

## 🔁 Git Workflow

Referencia: .ai/rules/git-workflow.md

- Nunca auto-commit
- Nunca auto-push
- Conventional Commits obrigatório

## 🎨 Design System Enforcement

Referencia: .ai/skills/ux-ui-standards.md
(Cores, tipografia, spacing do theme)

## Request Routing Logic

if (request === "design feature") → frontend-architect
if (request === "implement feature") → react-native-engineer
if (request === "write tests") → test-writer
if (request === "review code") → code-reviewer
if (request === "fix performance") → performance-auditor
...

### 2.3 Como o Roteamento Funciona

**Fluxo:**

1. Usuário faz pedido
   ↓
2. System.md analisa keywords
   ↓
3. System.md identifica agente correto
   ↓
4. System.md invoca agente
   ↓
5. Agente carrega suas skills
   ↓
6. Agente valida contra mandatory-rules
   ↓
7. Agente executa tarefa
   ↓
8. System.md retorna resultado
   **Exemplo de análise:**

Pedido: "Criar tela de login com validação"

System.md analisa:

- Keywords: "criar", "tela" → IMPLEMENTAÇÃO
- Verifica: Já existe SDD? → Se NÃO, delega para frontend-architect primeiro
- Se SIM → Delega para react-native-engineer

react-native-engineer carrega:

- react-native-best-practices.md
- typescript-strict-rules.md
- clean-code-rules.md
- ux-ui-standards.md
- project-architecture.md

Valida contra mandatory-rules.md:

- Estrutura de pasta correta?
- TypeScript estrito?
- Separação de camadas?

Executa:

- Cria login.screen.tsx (UI pura)
- Cria login.hook.ts (lógica)
- Cria login.schema.ts (validação Zod)
- Cria **tests**/login.hook.test.tsx

Resultado: Feature completa seguindo todos os contratos

## 3. Agentes Especializados

### 3.1 Frontend Architect (NOTA: arquivo não existe mais, mas função persiste)

**Papel**: Define arquitetura e cria Software Design Documents (SDDs)

**Quando usar**:

Nova feature complexa
Decisão arquitetural cross-cutting
Trade-offs entre abordagens
**Modelo**: Claude Sonnet (sempre remote)

**Skills carregadas**:

project-architecture.md
ux-ui-standards.md
**Output típico**: SDD em .ai/\_sdd/ com:

Contexto e problema
Decisões arquiteturais
Estrutura de pastas
Modelos de dados
Fluxos de navegação
Validações e edge cases

### 3.2 React Native Engineer

**Papel**: Implementa features, componentes, hooks seguindo os contratos

**Quando usar**:

Criar telas/componentes
Implementar business logic
Integrar APIs
Refatorar código
**Modelo**: **DINÂMICO** (ver router)

Local (qwen2.5-coder) para boilerplate
Claude Sonnet para refactors complexos
**Skills carregadas** (TODAS):

react-native-best-practices.md
typescript-strict-rules.md
clean-code-rules.md
ux-ui-standards.md
api-integration-pattern.md
project-architecture.md
translations.md
**Contrato de implementação**:

ANTES de escrever código, confirmar:

1. ✅ Feature structure exists
2. ✅ Domain model is defined
3. ✅ API contract is defined
4. ✅ Navigation flow is defined
5. ✅ State strategy is defined

Se faltando → Escalar para architect
**Fluxo de API Integration**:

Model → DTO → Service → Repository → DAO → SQLite
↑
API (background sync)
↓
Hook ← Screen
**Regra offline-first**: Todo hook funciona sem rede. Dados vêm do SQLite. Sync em background.

### 3.3 Code Reviewer

**Papel**: Quality gate pré-merge, detecta violações arquiteturais

**Quando usar**:

Antes de commit
PR reviews
Validação de mudanças
**Modelo**: Claude Sonnet (sempre remote)

**Por quê remote?**: Precisa analisar contexto do codebase inteiro, padrões sutis.

**Dimensões de Review**:

**TypeScript & Contracts**
❌ Reject: any usado sem razão forte
❌ Reject: DTO vaza para UI
❌ Reject: useState sem typing explícito
**Architecture Boundaries**
❌ Reject: Business logic em screen
❌ Reject: Services importando UI
❌ Reject: Query layer vazando shape da API
**List Rendering (CRÍTICO mobile)**
❌ Reject: ScrollView usado para listas dinâmicas
✅ Exigir: FlatList ou FlashList com virtualization
**Performance Mobile**
❌ Reject: Animações sem Reanimated (quando complexo)
❌ Reject: Heavy computation no JS thread
✅ Exigir: Profiling antes/depois em PRs de performance
**Testing**
❌ Reject: Coverage <80% em business logic
❌ Reject: Testes acoplados a implementação
**Triggers de rejeição automática**:

- any usado
- ScrollView com data dinâmica
- Business logic em .screen.tsx
- Import de DTO em componente UI
- Coverage <80% em hooks
- Commit sem mensagem conventional

### 3.4 Test Writer

**Papel**: Gera testes unitários e de integração

**Quando usar**:

Após implementar hook
Após criar service/adapter
Coverage gaps detectados
**Modelo**: Local (qwen2.5-coder) - **SEMPRE**

**Por quê local?**: Testes são mapping mecânico:

Hook input → Expected output
Service function → Mock API response → Assert transformed model
**Template de teste**:

// hook.test.ts
describe('useFeature', () => {
it('should load data on mount', async () => {
// Arrange: mock query
// Act: render hook
// Assert: data loaded
})

it('should handle error gracefully', async () => {
// Arrange: mock error
// Act: render hook
// Assert: error state
})
})
**Target**: ≥90% coverage em hooks (business logic crítica)

### 3.5 Test Write E2E

**Papel**: Gera testes E2E com Maestro

**Quando usar**:

Após feature completion
User flows críticos
**Modelo**: Local (qwen2.5-coder) - **SEMPRE**

**Input**: flow.md (Given/When/Then)

**Output**: .yaml Maestro

**Exemplo de mapping**:

## Fluxo: Usuário faz login

- Given: App aberto na tela de onboarding
- When: Usuário toca em "Login"
- When: Usuário preenche email e senha
- When: Usuário toca em "Entrar"
- Then: Usuário vê home screen

# login.yaml (gerado)

## appId: com.fuse.app

- launchApp
- assertVisible: 'Login'
- tapOn: 'Login'
- inputText: 'test@example.com'
- tapOn: 'Email'
- inputText: 'password123'
- tapOn: 'Password'
- tapOn: 'Entrar'
- assertVisible: 'Home'

### 3.6 Sonar Auto-Fixer

**Papel**: Corrige automaticamente issues do SonarQube

**Quando usar**:

Quality gate falha em PR
Manual trigger /fix-sonar
**Modelo**: DINÂMICO

Local: Issues mecânicas (unused imports, complexity simples)
Claude: Issues arquiteturais (cognitive complexity, duplicação)
**Fluxo**:

1. PR criado
2. CI roda Sonar scan
3. Quality gate FAIL
4. Webhook trigger sonar-auto-fixer
5. Agent lê issues via Sonar API
6. Para cada issue:
   - Se < complexidade 5 → Local fix
   - Se ≥ complexidade 5 → Claude fix
7. Commit fixes
8. Re-trigger CI
9. Quality gate PASS
   **Tipos de fixes**:

Code smells: Extract function, reduce complexity
Bugs: Null checks, type corrections
Vulnerabilities: Input sanitization
Duplicação: Extract shared logic

### 3.7 Performance Auditor

**Papel**: Profiling, detecção de bottlenecks, otimizações

**Quando usar**:

FPS drops
Memory leaks
TTI (Time To Interactive) alto
**Modelo**: Claude Sonnet (sempre remote)

**Por quê remote?**: Análise complexa de profiling data, trade-offs.

**Ferramentas**:

React DevTools Profiler
Flipper (network, logs)
Xcode Instruments (iOS)
Android Studio Profiler
**Checklist**:

Renders desnecessários? (memo, useMemo)
Heavy computation no JS thread? (mover para native)
Large lists sem virtualization?
Imagens grandes não otimizadas?
Animações com setState? (usar Reanimated)

### 3.8 Coupling Analyzer

**Papel**: Analisa fan-in/fan-out, detecta acoplamento excessivo

**Quando usar**:

Sprint review
Antes de refactor grande
Detecção de "god modules"
**Modelo**: Claude Sonnet (sempre remote)

**Métricas calculadas**:

Fan-out: Quantos módulos X importa
Fan-in: Quantos módulos importam X

Ideal:

- Utilities: High fan-in, low fan-out
- Features: Low fan-in, low fan-out
- Services: Medium fan-in, low fan-out

❌ Red flags:

- High fan-out em screen (lógica dispersa)
- High fan-in em feature (não deveria ser reutilizado)
  **Output**: Relatório markdown com:

Top 10 módulos mais acoplados
Sugestões de refactor
Violações de boundaries

### 3.9 PR Lifecycle Agent

**Papel**: Gerencia PR de criação até merge **AUTONOMAMENTE**

**Quando usar**:

/pr-lifecycle após commits prontos
Automático no futuro (post-hook)
**Modelo**: Claude Sonnet (sempre remote)

**Fluxo completo**:

FASE 1: Criar PR

- git push origin <branch>
- gh pr create --title "..." --body "..."

FASE 2: Monitor CI

- gh pr checks <PR_NUMBER> --watch
- Se FAIL → gh run view <RUN_ID> --log-failed

FASE 3: Fix Failures
├─ ESLint fail → Read file → Fix → git commit → push
├─ Test fail → Read test → Fix code → git commit → push
└─ Sonar fail → Trigger sonar-auto-fixer

FASE 4: Address Reviews

- gh pr view <PR_NUMBER> --comments
- Para cada comentário:
  - Read context
  - Make change
  - Reply: "Fixed in <commit>"

FASE 5: Merge

- Todos checks PASS
- Reviews approved
- gh pr merge <PR_NUMBER> --squash
  **Condições de bloqueio** (requer humano):

Breaking change detectado
Security vulnerability
Decisão arquitetural ambígua

## 4. Router LLM - Decisões de Roteamento

### 4.1 Por Que Dois Modelos?

**Problema**: Claude é caro (~ $X por 1M tokens)

**Insight**: 70% das tarefas são **mecânicas**:

Criar boilerplate
Gerar testes
Traduzir strings
Fix de lint
**Solução**: Usar modelo local para tarefas determinísticas

### 4.2 Modelos

Tipo Modelo Custo Velocidade Uso
Local qwen2.5-coder:14b $0 ~5s Boilerplate, tests, templates
Remote claude-sonnet-4-6 Per token ~15s Architecture, review, debug

### 4.3 Estratégia de Roteamento

**Always Remote (Claude)**:

frontend-architect: Decisões high-stakes
code-reviewer: Pattern recognition cross-codebase
performance-auditor: Análise complexa
coupling-analyzer: Análise estrutural holística
pr-lifecycle: Multi-step decision-making
**Always Local (qwen2.5-coder)**:

test-writer: Template-driven
test-write-e2e: 1:1 mapping (flow.md → yaml)
**Dynamic (react-native-engineer)**:

**Complexity signals** que forçam Claude:

const FORCE_CLAUDE_KEYWORDS = [
'refactor',
'debug',
'architecture',
'integration',
'migration',
'tradeoff',
'performance',
'optimize',
]

if (request.includes(any(FORCE_CLAUDE_KEYWORDS))) {
return 'claude-sonnet-4-6'
} else {
return 'qwen2.5-coder:14b' // local
}
**Exemplos**:

"Criar componente Button" → LOCAL (boilerplate)
"Refatorar estrutura de navegação" → CLAUDE (arquitetura)
"Adicionar tradução pt-BR" → LOCAL (mecânico)
"Debug memory leak em lista" → CLAUDE (complexo)
"Gerar hook useCharging" → LOCAL (template)
"Integrar API de pagamentos" → CLAUDE (decisões de erro/retry)

### 4.4 Economia Real

**Dados do projeto** (token-usage.md):

Total tokens (Março 2026):

- Claude: 1,897,128 tokens (~70% eram evitáveis)
- Ollama: 278,000 tokens (local, custo $0)

Com router implementado:

- Claude: ~600,000 tokens (apenas tarefas complexas)
- Ollama: ~1,575,000 tokens (70% do volume)

Economia estimada: 68% nos custos de LLM

## 5. Rules - Contratos Obrigatórios

### 5.1 mandatory-rules.md

**Natureza**: Regras **NÃO NEGOCIÁVEIS**. Violação = rejeição automática.

**Seções**:

#### TypeScript Strict

❌ FORBIDDEN:
const [loading, setLoading] = useState(false)

✅ REQUIRED:
const [loading, setLoading] = useState<boolean>(false)

#### Architectural Boundaries

Model → Service → Query → Hook → Screen
(sem atalhos, sem business logic em screen)

#### Screen Co-location

screens/auth/login/
login.screen.tsx # UI only
login.hook.ts # Business logic
login.schema.ts # Validation
**tests**/ # Tests

#### Testing Requirements

Coverage ≥80% em business logic (hooks, services)
Coverage ≥90% em utils críticos

#### Performance Safety

No ScrollView para listas dinâmicas
FlatList/FlashList com virtualization
Reanimated para animações >30fps

### 5.2 folder-structure.md

**Define**: Estrutura de pastas obrigatória

**Pattern de screen**:

screens/<domain>/<feature>/
<feature>.screen.tsx # MANDATORY
<feature>.hook.ts # MANDATORY if business logic
<feature>.schema.ts # MANDATORY if forms
<feature>.types.ts # OPTIONAL
components/ # Screen-specific only
**tests**/ # MANDATORY
**Naming rules**:

Folders: kebab-case
Files: kebab-case.type.tsx
Exports: PascalCase (components), camelCase (functions)

### 5.3 git-workflow.md

**Regras de commit**:

Conventional Commits obrigatório
Nunca auto-commit (sempre pedir confirmação)
Nunca auto-push (usuário controla quando)
Husky valida mensagem no pre-commit
**Formato**:

<type>(<scope>): <subject>

feat(auth): add biometric login
fix(charging): resolve memory leak in list
refactor(navigation): extract route config
test(hooks): increase coverage to 95%
**Types válidos**: feat, fix, refactor, test, docs, style, chore

### 5.4 naming-conventions.md

**Componentes**:

// ✅ Correto
export const LoginButton: React.FC<Props> = ({ onPress }) => {}

// ❌ Errado
export const loginbutton = ({ onPress }) => {}
**Hooks**:

// ✅ Correto
export const useLogin = () => {}

// ❌ Errado
export const LoginHook = () => {}
**Types**:

// ✅ Correto
export type UserModel = {}
export interface LoginFormData {}

// ❌ Errado
export type user = {}
export type IUser = {} // No "I" prefix

## 6. Skills - Conhecimento Modular

### 6.1 O Que São Skills?

Skills são **documentos de conhecimento reutilizável** que agentes carregam quando necessário.

**Diferença de Rules**:

Rules = Lei (obrigatório, rejeita violação)
Skills = Conhecimento (guia como fazer bem)

### 6.2 project-architecture.md

**Define**: Arquitetura em camadas do app

📦 Models (Domain Layer)

- Pure TypeScript types
- No React imports
- No framework dependencies

🔌 Services (API Layer)

- HTTP communication
- Transform DTO → Model
- Normalize errors

🔍 Query Layer (React Query)

- useQuery / useMutation hooks
- Cache management
- Optimistic updates

🪝 Hook Layer (Business Logic)

- Orchestrate queries
- Local state
- Side effects

🖥 Screen Layer (Presentation)

- JSX only
- No business logic
- Consume hooks
  **Exemplo de fluxo**:

// 1. Model
export type User = {
id: string
name: string
email: string
}

// 2. Service (DTO → Model)
type UserDTO = { user_id: string; user_name: string; user_email: string }

export const getUser = async (id: string): Promise<User> => {
const response = await api.get<UserDTO>(`/users/${id}`)
return {
id: response.user_id,
name: response.user_name,
email: response.user_email
}
}

// 3. Query
export const useUserQuery = (id: string) => {
return useQuery({
queryKey: ['user', id],
queryFn: () => getUser(id)
})
}

// 4. Hook (business logic)
export const useProfile = () => {
const { data: user, isLoading } = useUserQuery('123')
const [editing, setEditing] = useState(false)

const startEdit = () => setEditing(true)
const cancelEdit = () => setEditing(false)

return { user, isLoading, editing, startEdit, cancelEdit }
}

// 5. Screen (UI only)
export const ProfileScreen = () => {
const { user, isLoading, editing, startEdit } = useProfile()

if (isLoading) return <Loading />

return (
<View>
<Text>{user?.name}</Text>
{!editing && <Button onPress={startEdit}>Edit</Button>}
</View>
)
}

### 6.3 react-native-best-practices.md

**Tópicos**:

#### List Virtualization

// ❌ NUNCA
<ScrollView>
{data.map(item => <Item key={item.id} />)}
</ScrollView>

// ✅ SEMPRE
<FlatList
data={data}
renderItem={({ item }) => <Item item={item} />}
keyExtractor={item => item.id}
windowSize={10}
maxToRenderPerBatch={5}
/>

#### Animations

// ❌ Avoid setState for 60fps animations
const [opacity, setOpacity] = useState(1)
useEffect(() => {
const interval = setInterval(() => {
setOpacity((prev) => prev - 0.01)
}, 16)
}, [])

// ✅ Use Reanimated
const opacity = useSharedValue(1)
useEffect(() => {
opacity.value = withTiming(0, { duration: 1000 })
}, [])

#### Performance Profiling

Use React DevTools Profiler
Profile em release build (não debug)
Target: <16ms per frame (60fps)

### 6.4 typescript-strict-rules.md

// ❌ Implicit any
const handlePress = (value) => { }

// ✅ Explicit types
const handlePress = (value: string): void => { }

// ❌ Type assertion escondendo erro
const user = data as User

// ✅ Type guard
const isUser = (data: unknown): data is User => {
return typeof data === 'object' && data !== null && 'id' in data
}

// ❌ DTO vazando
<UserCard user={apiResponse} />

// ✅ DTO transformado
<UserCard user={toUserModel(apiResponse)} />

### 6.5 clean-code-rules.md

**Princípios**:

**Early Return**
// ❌ Nested
function process(user: User | null) {
if (user) {
if (user.active) {
return user.name
}
}
return 'Unknown'
}

// ✅ Early return
function process(user: User | null): string {
if (!user) return 'Unknown'
if (!user.active) return 'Inactive'
return user.name
}
**Small Functions**
Max 20 linhas por função
Uma responsabilidade
Nome descreve intenção
**No Magic Numbers**
// ❌
if (status === 2) {
}

// ✅
const STATUS = { PENDING: 1, ACTIVE: 2, INACTIVE: 3 }
if (status === STATUS.ACTIVE) {
}

### 6.6 ux-ui-standards.md

**Design System Enforcement**:

// ❌ Hardcoded
<View style={{ backgroundColor: '#3B82F6', padding: 16 }}>

// ✅ Theme tokens
import { Colors, Spacings } from '@/constants/theme'

<View style={styles.container}>

const styles = StyleSheet.create({
container: {
backgroundColor: Colors.primary.base,
padding: Spacings.md
}
})
**Minimum Touch Target**: 44x44 (iOS Human Interface Guidelines)

<TouchableOpacity
style={{ minWidth: 44, minHeight: 44 }}
hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}

>

### 6.7 api-integration-pattern.md

**Offline-First Architecture**:

User action
↓
Hook
↓
Repository.query() ──→ SQLite (always available)
↑ │
│ ↓
API sync (background) ←─ Data exists?
│ │
↓ ↓
SQLite update Display cached data
│
↓
Re-render with fresh data
**Exemplo**:

export const useStores = () => {
// 1. Always read from local DB first
const localStores = useSQLiteQuery('SELECT \* FROM stores')

// 2. Sync in background
const { refetch } = useQuery({
queryKey: ['stores-sync'],
queryFn: async () => {
const apiStores = await api.getStores()
await db.upsertStores(apiStores) // Update SQLite
return apiStores
},
enabled: isOnline, // Only sync if online
refetchInterval: 60000, // Every minute
})

// 3. Always return local data (never loading state on re-render)
return {
stores: localStores,
refresh: refetch,
}
}

## 7. Templates - Estruturas Reusáveis

### 7.1 screen-template.md

// feature.screen.tsx
import React from 'react'
import { View, Text } from 'react-native'
import { useFeature } from './feature.hook'
import styles from './feature.styles'

export const FeatureScreen: React.FC = () => {
const { data, loading, error, handleAction } = useFeature()

if (loading) return <LoadingIndicator />
if (error) return <ErrorView error={error} />

return (
<View style={styles.container}>
<Text>{data.title}</Text>
<Button onPress={handleAction}>Action</Button>
</View>
)
}

### 7.2 hook-template.md

// feature.hook.ts
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getFeatureData } from '@/services/api/feature'

export const useFeature = () => {
const [localState, setLocalState] = useState<string>('')

const { data, isLoading, error } = useQuery({
queryKey: ['feature'],
queryFn: getFeatureData,
})

const handleAction = () => {
// Business logic here
setLocalState('updated')
}

return {
data,
loading: isLoading,
error,
localState,
handleAction,
}
}

### 7.3 feature-template.md

**Full feature structure**:

screens/domain/feature/
feature.screen.tsx
feature.hook.ts
feature.schema.ts
feature.types.ts
components/
header.tsx
list-item.tsx
**tests**/
feature.hook.test.tsx
feature.screen.test.tsx

## 8. Scripts - Automação

### 8.1 pr-lifecycle.sh

**Função**: Automação completa do PR

#!/bin/bash

# Usage: ./pr-lifecycle.sh [PR_NUMBER]

PR_NUMBER=${1:-""}

if [ -z "$PR_NUMBER" ]; then

# Create new PR

BRANCH=$(git branch --show-current)
  TITLE=$(git log -1 --pretty=%s)

gh pr create --title "$TITLE" --body "Auto-generated PR"
  PR_NUMBER=$(gh pr view --json number -q .number)
fi

# Watch checks

gh pr checks "$PR_NUMBER" --watch

# If failed, get logs and trigger fixes

STATUS=$(gh pr view "$PR_NUMBER" --json statusCheckRollup -q '.statusCheckRollup[0].conclusion')

if [ "$STATUS" == "FAILURE" ]; then
echo "CI failed, triggering fixes..."

# Invoke sonar-auto-fixer or other fixing agents

fi

# Monitor until all pass, then merge

gh pr merge "$PR_NUMBER" --squash --auto

### 8.2 trigger-sonar-fix.sh

#!/bin/bash

# Usage: ./trigger-sonar-fix.sh <PR_NUMBER>

PR_NUMBER=$1
BRANCH=$(gh pr view "$PR_NUMBER" --json headRefName -q .headRefName)

# Get Sonar issues via API

ISSUES=$(curl -s "https://sonarcloud.io/api/issues/search?componentKeys=project&branch=$BRANCH")

# Parse issues and write to temp file

echo "$ISSUES" | jq -r '.issues[] | "\(.component):\(.line) - \(.message)"' > /tmp/sonar-issues.txt

# Invoke sonar-auto-fixer agent with context

# (This would trigger LLM with sonar-auto-fixer.md + issues list)

echo "Sonar fixes completed. Re-triggering CI..."
git push origin "$BRANCH"

### 8.3 analyze-coupling.sh

#!/bin/bash

# Analisa fan-in/fan-out de módulos

OUTPUT_FILE=".ai/router/coupling-report.md"

echo "# Coupling Analysis" > "$OUTPUT_FILE"
echo "Generated: $(date)" >> "$OUTPUT_FILE"

# Find all imports

grep -r "import.\*from" src/ | \
 awk '{print $4}' | \
 sort | uniq -c | sort -rn | \
 head -20 > /tmp/fan-in.txt

echo "## Top 20 Most Imported Modules (Fan-In)" >> "$OUTPUT_FILE"
cat /tmp/fan-in.txt >> "$OUTPUT_FILE"

# Modules with most imports (fan-out)

for file in $(find src/ -name "*.ts" -o -name "*.tsx"); do
  COUNT=$(grep -c "^import" "$file")
  echo "$COUNT $file"
done | sort -rn | head -20 > /tmp/fan-out.txt

echo "## Top 20 Modules with Most Imports (Fan-Out)" >> "$OUTPUT_FILE"
cat /tmp/fan-out.txt >> "$OUTPUT_FILE"

echo "Report saved to $OUTPUT_FILE"

### 8.4 Outros Scripts

generate-dashboard.sh: Dashboard HTML de métricas
count-improvements-progress.sh: Track de progresso de refactors
update-component-imports.sh: Fix bulk imports
dev-server.sh: Start dev environment
generate-analytics.sh: Analytics de uso do sistema

## 9. Claude Self-Modifying - Aprendizado Contínuo

### 9.1 Conceito

**Problema**: LLMs não têm memória entre sessões. Decisões arquiteturais são esquecidas.

**Solução**: claude-self-modifying.md é um **log vivo** onde cada decisão importante é registrada.

### 9.2 Formato de Entry

## 🔧 [Categoria] — [Título da Decisão]

**Rule:** O que fazer / não fazer

**Why:** Contexto ou incidente que gerou a regra

**Applies to:** Onde esta regra tem efeito

**Example:** (opcional) Código demonstrando correto/errado

### 9.3 Exemplos Reais

#### Entry 1: Loading Overlay Centralizado

## 🔄 Loading Overlay — Centralizado em GlobalLoadingObserver

**Rule:** Nunca chamar `overlayActions.open('loading')` ou `overlayActions.close()`
diretamente em hooks ou screens para controlar loading de API calls.

**Why:** O `GlobalLoadingObserver` foi criado, que usa `useIsFetching()` e
`useIsMutating()` do React Query para observar globalmente todas as API calls e gerenciar
o overlay de forma centralizada. Chamadas manuais criam inconsistências.

**Applies to:** Todos hooks em `src/services/query/`, todos screen hooks.

**Exception:** Overlays de OUTROS tipos (e.g. 'chargerNotFound', 'chargingComplete').
**Como isso previne regressão:**

Na sessão seguinte, LLM lê este arquivo ANTES de implementar
Se tentar chamar overlayActions.open('loading'), lembra da regra
Evita reintroduzir o bug

#### Entry 2: Navegação com useEffect

## 🧭 Navigation — useEffect + router.replace() (Not <Redirect>)

**Rule:** Para navegação condicional baseada em hydration (e.g. `app/index.tsx`),
use `router.replace()` dentro de `useEffect`, nunca `<Redirect>`.

**Why:** `<Redirect>` causa tela branca no Expo Router quando renderizado no mount
inicial antes da navegação estar pronta. `useEffect` garante router inicializado.

**Applies to:** `app/index.tsx` e qualquer root route que redireciona baseado em store state.

**Correct pattern:**

```typescript
export default function Index() {
  const router = useRouter()
  const rehydrated = useAuthStore((s) => s.rehydrated)

  useEffect(() => {
    if (!rehydrated) return
    router.replace('/(auth)/onboarding')
  }, [rehydrated])

  return null
}
```
````
`````

`````

---

### 9.4 Fluxo de Aprendizado

Problema descoberto em sessão
↓
Solução implementada e validada
↓
Entry adicionada ao claude-self-modifying.md
↓
Commit: "docs(ai): register pattern for X"
↓
Sessões futuras leem o arquivo
↓
LLM evita repetir o erro
↓
Sistema "aprende" permanentemente

---

## 10. Fluxos de Trabalho Completos

### 10.1 Feature Completa: Do Zero ao Merge

┌─────────────────────────────────────────────────────────┐
│ USER REQUEST: "Criar tela de perfil do usuário" │
└─────────────────────────────────────────────────────────┘
↓
┌─────────────────────────────────────────────────────────┐
│ SYSTEM.MD: Analisa keywords │
│ - "criar tela" → react-native-engineer │
│ - Verifica: SDD existe? │
│ - NÃO → Delegar para frontend-architect primeiro │
└─────────────────────────────────────────────────────────┘
↓
┌─────────────────────────────────────────────────────────┐
│ FRONTEND-ARCHITECT (Claude) │
│ - Carrega: project-architecture.md, ux-ui-standards.md │
│ - Cria: .ai/\_sdd/profile-screen.sdd.md │
│ - Data model: UserProfile │
│ - API contract: GET /users/me │
│ - Navigation flow │
│ - Validation rules │
└─────────────────────────────────────────────────────────┘
↓
┌─────────────────────────────────────────────────────────┐
│ REACT-NATIVE-ENGINEER (Local/Claude) │
│ - Router decision: "criar tela" → LOCAL (boilerplate) │
│ - Carrega TODAS as skills │
│ - Valida contra mandatory-rules.md │
│ - Implementa: │
│ ├─ src/models/user/user-profile.model.ts │
│ ├─ src/services/api/user/user.ts (DTO → Model) │
│ ├─ src/services/query/user/useUserProfileQuery.ts │
│ ├─ src/screens/profile/profile/ │
│ │ ├─ profile.screen.tsx (UI only) │
│ │ ├─ profile.hook.ts (business logic) │
│ │ ├─ profile.types.ts │
│ │ └─ components/ │
│ │ └─ avatar-section.tsx │
└─────────────────────────────────────────────────────────┘
↓
┌─────────────────────────────────────────────────────────┐
│ TEST-WRITER (Local) │
│ - Gera: │
│ ├─ profile.hook.test.tsx (≥90% coverage) │
│ └─ profile.screen.test.tsx (render, interactions) │
│ - Roda: yarn test --coverage │
│ - Valida: Coverage ≥80% │
└─────────────────────────────────────────────────────────┘
↓
┌─────────────────────────────────────────────────────────┐
│ CODE-REVIEWER (Claude) │
│ - Verifica: │
│ ✅ TypeScript strict (zero any) │
│ ✅ Architectural boundaries (no business logic in screen) │
│ ✅ Coverage ≥80% │
│ ✅ Design system usado (Colors, Spacings) │
│ ✅ Naming conventions │
│ - Status: APPROVED ✓ │
└─────────────────────────────────────────────────────────┘
↓
┌─────────────────────────────────────────────────────────┐
│ USER: Confirma commit? │
│ - SIM → git commit -m "feat(profile): add user profile screen" │
└─────────────────────────────────────────────────────────┘
↓
┌─────────────────────────────────────────────────────────┐
│ USER: Trigger PR Lifecycle │
│ - Comando: /pr-lifecycle │
└─────────────────────────────────────────────────────────┘
↓
┌─────────────────────────────────────────────────────────┐
│ PR-LIFECYCLE-AGENT (Claude) │
│ FASE 1: Criar PR │
│ - git push origin feature/user-profile │
│ - gh pr create --title "feat: user profile screen" │
│ │
│ FASE 2: Monitor CI │
│ - gh pr checks --watch │
│ - Status: ESLint PASS, Tests PASS, Sonar... FAIL ❌ │
│ │
│ FASE 3: Fix Sonar │
│ - Trigger: sonar-auto-fixer │
│ - Issues: 2 code smells (complexity, magic number) │
│ - Fixes applied │
│ - git commit -m "fix(profile): resolve sonar issues" │
│ - git push │
│ - Re-check: All PASS ✅ │
│ │
│ FASE 4: Monitor Reviews │
│ - Comentário do reviewer: "Adicionar loading state" │
│ - Agent: Read context → Add loading UI → Commit │
│ - Reply: "Added loading state in commit abc123" │
│ - Status: Approved ✓ │
│ │
│ FASE 5: Merge │
│ - gh pr merge --squash │
│ - Status: MERGED ✓ │
└─────────────────────────────────────────────────────────┘
↓
FEATURE DEPLOYED

**Tempo total**: ~2 horas (vs 8 horas manual)

---

### 10.2 Fix de Bug: Descoberta à Resolução

┌─────────────────────────────────────────────────────────┐
│ USER REPORT: "Lista de carregamento trava após scroll" │
└─────────────────────────────────────────────────────────┘
↓
┌─────────────────────────────────────────────────────────┐
│ SYSTEM.MD: Keyword "trava" → performance-auditor │
└─────────────────────────────────────────────────────────┘
↓
┌─────────────────────────────────────────────────────────┐
│ PERFORMANCE-AUDITOR (Claude) │
│ - Read file: charging-history.screen.tsx │
│ - Detecta: │
│ ❌ <ScrollView> com 500+ items │
│ ❌ .map() renderizando todos os items │
│ ❌ Sem virtualization │
│ - Diagnóstico: JS thread bloqueado │
│ - Solução: Migrar para FlatList │
└─────────────────────────────────────────────────────────┘
↓
┌─────────────────────────────────────────────────────────┐
│ REACT-NATIVE-ENGINEER (Claude - "performance") │
│ - Refactor: │
│ - Substituir ScrollView → FlatList │
│ - Add keyExtractor, renderItem │
│ - Add windowSize={10} │
│ - Add maxToRenderPerBatch={5} │
└─────────────────────────────────────────────────────────┘
↓
┌─────────────────────────────────────────────────────────┐
│ TEST-WRITER (Local) │
│ - Atualizar testes para FlatList │
│ - Add performance test (render time < 100ms) │
└─────────────────────────────────────────────────────────┘
↓
┌─────────────────────────────────────────────────────────┐
│ CODE-REVIEWER (Claude) │
│ - Verifica: FlatList implementado corretamente │
│ - Status: APPROVED ✓ │
└─────────────────────────────────────────────────────────┘
↓
┌─────────────────────────────────────────────────────────┐
│ PERFORMANCE-AUDITOR (profiling validation) │
│ - Compara antes/depois: │
│ - Antes: 800ms render, 12 fps │
│ - Depois: 120ms render, 60 fps │
│ - Status: ✅ PERFORMANCE RESTORED │
└─────────────────────────────────────────────────────────┘
↓
┌─────────────────────────────────────────────────────────┐
│ CLAUDE-SELF-MODIFYING: Register Learning │
│ - Add entry: "Always use FlatList for dynamic lists" │
│ - Rule: Never use ScrollView with .map() │
└─────────────────────────────────────────────────────────┘
↓
BUG FIXED
PATTERN LEARNED

---

## 11. Tracking de Custos

### 11.1 Token Usage Logging

Cada invocação de LLM gera um log:

````markdown
| Date                | Session  | Provider | Model             |  Input |  Output | Cache Read |   Total |
| ------------------- | -------- | -------- | ----------------- | -----: | ------: | ---------: | ------: |
| 2026-03-23 12:27:05 | 3512aca5 | claude   | claude-sonnet-4-6 | 13,563 | 255,304 | 55,218,740 | 268,867 |

### 11.2 Métricas Agregadas

## Summary (Março 2026)

| Provider  | Model             |   Input |    Output |     Total |
| --------- | ----------------- | ------: | --------: | --------: |
| claude    | claude-sonnet-4-6 |  96,571 | 1,800,557 | 1,897,128 |
| ollama    | qwen2.5-coder:14b | 191,800 |    86,200 |   278,000 |
| **TOTAL** |                   | 288,371 | 1,886,757 | 2,175,128 |

Economia com router: ~68% (vs 100% Claude)

### 11.3 Scripts de Monitoramento

**log-claude-tokens.sh**:

#!/bin/bash

# Captura usage de cada request Claude e appenda ao CSV

SESSION_ID=$(uuidgen | cut -d'-' -f1)
DATE=$(date '+%Y-%m-%d %H:%M:%S')

# Parse response headers para tokens

INPUT_TOKENS=$1
OUTPUT_TOKENS=$2
CACHE_READ=$3

echo "$DATE,$SESSION_ID,claude,claude-sonnet-4-6,$INPUT_TOKENS,$OUTPUT_TOKENS,$CACHE_READ" \

> > .ai/router/token-usage.csv
> > **update-token-totals.sh**:

#!/bin/bash

# Regenera token-usage.md com totais atualizados

awk -F',' '
NR>1 {
provider[$3] = 1
model[$4] = 1
input[$3] += $5
output[$3] += $6
cache[$3] += $7
}
END {
for (p in provider) {
total = input[p] + output[p]
print p, input[p], output[p], cache[p], total
}
}
' .ai/router/token-usage.csv > .ai/router/token-usage.md

## 12. Conclusões e Insights

### 12.1 O Que Torna Este Sistema Único

**Contract-Driven, não Prompt-Driven**

- Regras são arquivos, não instruções em prompts
- Contratos são validados automaticamente, não "sugeridos"
  **Especialização Profunda**
- Cada agente é expert em UMA coisa
- Melhor que um assistente genérico tentando fazer tudo
  **Economic Intelligence**
- Router economiza 68% em custos
- 70% das tarefas são determinísticas → local model
  **Self-Improving**
- claude-self-modifying.md elimina regressões
- Cada erro vira uma regra permanente
  **Autonomous Workflows**
- PR lifecycle não precisa de humano
- Fix de Sonar automático
- E2E test generation template-driven

### 12.2 Desafios Resolvidos

Desafio Solução Implementada
Contexto perdido entre sessões claude-self-modifying.md preserva aprendizados
Código inconsistente mandatory-rules.md + code-reviewer rejeita violações
Custos altos de LLM Router LLM (local first, Claude when needed)
Tarefas repetitivas Templates + scripts de automação
Falta de quality gates code-reviewer + sonar-auto-fixer
Testes ignorados test-writer obrigatório, coverage ≥80%
Acoplamento crescendo coupling-analyzer detecta e alerta

### 12.3 Métricas de Sucesso

**Produtividade**:

Feature time: 8h → 2h (75% redução)
PR lifecycle: 4h → 30min (87% redução)
**Qualidade**:

Code coverage: ~60% → 95%+
Sonar issues: ~200 → <10
Production bugs: redução de ~60%
**Custo**:

LLM tokens: economía de 68%
Time-to-market: ~70% mais rápido
**Consistência**:

Architectural violations: ~30/semana → 0
Naming convention errors: eliminados
Design system bypass: eliminado

## 13. Evolução Futura

### 13.1 Próximas Melhorias

**GitHub Actions Integration**

- PR auto-creation em commit to branch
- Auto-trigger sonar-fixer em quality gate fail
  **Dashboard de Métricas**
- Visualização de coupling trends
- Coverage progress tracking
- Token usage analytics
  **Doc Generator Agent**
- Auto-generate API docs
- Auto-update README
  **Code Migration Agent**
- Safe refactoring de breaking changes
- Automated deprecation handling

### 13.2 Expansão para Backend

Adaptar o sistema para backend (Node.js/NestJS):

Agentes: backend-architect, api-engineer, db-schema-designer
Skills: database-patterns, api-security, scalability-rules
Automação: Prisma migrations, API tests generation

### 13.3 Open Source?

**Potencial**: Este sistema pode ser útil para outros projetos.

**Desafios**:

Remover contexto de negócio específico
Generalizar rules para diferentes arquiteturas
Criar CLI para setup em novos projetos
**FIM DA EXPLICAÇÃO TÉCNICA**

geraa o artigo completo
Aqui está a versão completa do artigo, escrita em tom de dev sênior React Native que compartilha uma experiência real e madura — sem sensacionalismo exagerado, sem promessas de “4x mais rápido”, sem vibe de curso ou guru. O foco está na jornada técnica, nos trade-offs reais, nas limitações que ainda existem e no que realmente mudou no dia a dia.

O texto está pronto para ser colado no LinkedIn (ou adaptado para blog pessoal). Mantive-o em torno de ~1400 palavras, com quebras visuais, emojis discretos e linguagem natural em português técnico.

# Como Construí um Sistema Multi-Agente com IA para Desenvolvimento React Native

Trabalho sozinho (ou quase) em um app React Native + Expo desde o final de 2024.
No começo era só eu, VS Code, Claude e muita paciência para refazer a mesma estrutura de tela + hook + query + testes toda semana.

Depois de alguns meses percebi um padrão claro:
75–80% do meu tempo não era “pensar em produto” nem “resolver problemas difíceis”.
Era boilerplate, validação de camadas, naming consistente, cobertura de testes, enforcement do design system, checagem de performance mobile, fix de code smells… tarefas mecânicas que qualquer pessoa com um checklist faria igual.

E se eu transformasse esse checklist em código?
Não um assistente genérico que “ajuda”.
Um sistema de engenharia com agentes especializados, contratos obrigatórios e roteamento inteligente.

É exatamente isso que venho construindo nos últimos meses no projeto FUSE.

Hoje o repositório tem uma pasta `.ai/` com ~80 arquivos (agents, skills, rules, scripts, templates, logs).
Não é mágica. Não é “IA escreve o app inteiro”.
É um conjunto de guardrails e automações que torna o processo muito mais previsível — e me deixa focar no que realmente importa.

### O Conceito Central: Orquestração, não Assistência

Em vez de um único LLM tentando fazer tudo, criei vários agentes com responsabilidades únicas:

- **frontend-architect** — toma decisões estruturais e gera Software Design Documents (SDDs)
- **react-native-engineer** — implementa código seguindo os contratos (o mais usado)
- **test-writer** e **test-write-e2e** — geram testes unitários e Maestro flows
- **code-reviewer** — valida quality gates antes de qualquer commit
- **performance-auditor** — analisa bottlenecks mobile
- **sonar-auto-fixer** — corrige automaticamente issues do Sonar
- **coupling-analyzer** — detecta acoplamento excessivo e god modules
- **pr-lifecycle** — gerencia o ciclo completo de PR (create → fix → merge)

O ponto de entrada é um único arquivo: `system.md`.
Quando o Claude abre o projeto, lê esse arquivo primeiro.
Ele define:

- “Você NÃO é um assistente genérico. Você é o System Orchestrator.”
- Contexto do app (React Native Expo, constraints mobile)
- Arquitetura obrigatória (Model → Service → Query → Hook → Screen)
- Todas as rules não negociáveis
- A matriz de roteamento (request type → agent)

### Router Inteligente: Local vs Remote

Claude Sonnet é excelente… e caro.
Por isso criei um router simples que decide:

- **Sempre local (Ollama + qwen2.5-coder:14b)**: testes, boilerplate, traduções, templates, E2E yaml
- **Sempre remote (Claude Sonnet)**: arquitetura, code review, performance, coupling, decisões complexas
- **Dinâmico (react-native-engineer)**: olha keywords — “refactor”, “debug”, “performance”, “tradeoff” → força Claude

Resultado prático (março 2026):

- ~70% do volume de tokens rodou local (custo $0)
- Economia real de ~65–70% em custo de LLM comparado a usar só Claude

### Contratos Rígidos > Prompts Bonitinhos

O que mais mudou o jogo não foram os agentes em si, mas as **rules obrigatórias**.

Exemplos reais que rejeitam output se violadas:

- Zero `any` implícito no TypeScript
- `useState` sempre tipado explicitamente
- Nada de business logic em `.screen.tsx`
- Listas dinâmicas **sempre** com `FlatList` ou `FlashList` (nunca `ScrollView + .map()`)
- Estilos **sempre** via `StyleSheet.create` + tokens do theme
- Pastas de feature co-localizadas:
  screens/profile/profile/
  profile.screen.tsx
  profile.hook.ts
  profile.schema.ts
  tests/

- Conventional Commits obrigatório
- **Nunca** auto-commit / auto-push (sempre peço confirmação)

O `code-reviewer` lê o diff e rejeita se qualquer uma dessas regras for quebrada.
Depois de algumas semanas, o número de violações caiu para quase zero.

### Aprendizado Contínuo (Self-Modifying)

O maior avanço foi criar `claude-self-modifying.md` — um log vivo de decisões e padrões aprendidos.

Exemplo real:

````markdown
## Loading Global — Nunca mais manual

**Regra:** Proibido chamar overlayActions.open('loading') ou close() diretamente em hooks ou screens para loading de API.

**Motivo:** Criamos GlobalLoadingObserver que usa useIsFetching() + useIsMutating() do React Query para gerenciar loading global de forma consistente.

**Aplica-se a:** Todos os hooks em src/services/query/

**Exceção:** Overlays de estado de negócio (ex: 'chargerNotFound')
Toda vez que descubro um anti-pattern ou tomo uma decisão importante, adiciono uma entry.
Nas sessões seguintes o LLM lê esse arquivo antes de responder.
Resultado: o mesmo erro não volta mais.

Fluxo Real de Uma Feature
Eu peço: “Criar tela de histórico de carregamentos com pull-to-refresh”
System analisa → delega para frontend-architect (SDD)
Architect gera SDD com model, API contract, estado offline-first, etc.
Eu aprovo SDD
Delega para react-native-engineer (local na maioria, Claude se complexo)
Implementa model, service, query, hook, screen, componentes
Test-writer gera testes unitários (≥90% nos hooks)
Code-reviewer valida tudo (layers, typing, performance rules, design system)
Se passa → eu reviso diff rapidamente e confirmo commit
Trigger /pr-lifecycle → agente cria PR, monitora CI, fixa Sonar se falhar, espera aprovação, merge squash
Tempo médio hoje: 1,5–3 horas por feature média (vs 6–10 horas antes).
Não é 10x mais rápido. É mais previsível e menos estressante.

O Que Realmente Mudou no Meu Dia a Dia
Ganhos concretos

Consistência arquitetural quase 100%
Cobertura de testes subiu de ~60% para 92–95% sem eu escrever testes manualmente
Bugs de regressão por quebra de contrato caíram drasticamente
Menos context switching (não preciso lembrar “ah, nesse app é FlatList sempre”)
Decisões arquiteturais ficam documentadas em SDDs versionados
Custo de LLM caiu ~2/3
Limitações que ainda existem (sendo honesto)

Validação manual do diff ainda é necessária (especialmente UX e decisões de produto)
Contexto muito grande às vezes faz o modelo “esquecer” rules antigas
Criação de agente novo continua manual e trabalhosa
Performance real (FPS, memory) ainda exige profiling manual em device físico
O sistema é específico do meu app — generalizar para outros projetos vai dar trabalho
Lições Que Levo Dessa Jornada
Especialização vence generalização
Regras obrigatórias criam mais liberdade do que “sugestões inteligentes”
Modelos locais resolvem 70% do volume se você souber separar o que é mecânico
Memória persistente (self-modifying) é mais valiosa do que prompts melhores
Automação não elimina o julgamento humano — amplifica ele
Não acho que isso seja “o futuro inevitável” para todo mundo.
Mas para quem desenvolve solo ou em times pequenos e quer consistência sem sacrificar velocidade, vale muito a pena experimentar.

Se você já montou algo parecido (ou está pensando em montar), me conta:

Como você lida com o crescimento da pasta .ai/?
Até quantos agentes você acha gerenciável antes de virar bagunça?
Qual o maior gargalo que ainda não resolveu?
Abraço e boa construção.

#ReactNative #TypeScript #Expo #AI #SoftwareEngineering

Essa versão é longa o suficiente para ser substancial, mas não cansa.
Mantém tom técnico + humilde, mostra números reais (mas sem promessas absurdas), expõe limitações e termina com pergunta aberta para gerar conversa genuína.

Se quiser encurtar alguma seção, aumentar o foco em um aspecto (ex: router, self-modifying, performance mobile) ou ajustar o nível de detalhe técnico, é só falar.

> **[PT]** Sistema mestre de orquestração que roteia pedidos para agentes especializados, impõe contratos arquiteturais e gere a criação de novos agentes.

---

# 🧠 System — Engineering Orchestrator & Contract Loader

> This document defines the engineering contract of this repository. It overrides default assistant
> behavior. All agents, rules, and skills referenced here are mandatory.

This repository operates under a structured AI-assisted engineering system.

**You are the System Orchestrator.** You are not a generic assistant. You operate inside a constrained engineering environment with specialized agents for different tasks.

**Your primary role:** Analyze incoming requests, delegate to the appropriate agent, and ensure all work follows architectural contracts.

---

# 🎯 Project Context

This project is a:

React Native (Expo) mobile application.

All work must respect:

- Mobile runtime constraints
- JS thread limitations
- Native thread separation
- Frame budget (~16ms)
- Memory constraints
- Feature-based scalability

---

# 🏗 Architecture Model

The project follows:

Model → Service → Query → Hook → Screen

Strict separation of responsibilities is mandatory.

Business logic lives in hooks. UI lives in screens. Services transform DTO → Model. Query layer
manages async orchestration. Models are pure domain.

No shortcuts allowed.

---

# 📁 Folder Structure Enforcement

You must strictly follow:

.ai/rules/folder-structure.md

Features must be:
src/screens/<domain>/<screen-name>/
<screen-name>.screen.tsx
<screen-name>.hook.ts
<screen-name>.schema.ts # (if form/input exists)
<screen-name>.types.ts # (optional)
components/
**tests**/

No horizontal architecture.

---

# 🔒 Mandatory Rules

You must enforce all constraints defined in:

.ai/rules/mandatory-rules.md

This includes:

- Strict TypeScript
- No implicit any
- useState explicitly typed
- No barrel imports
- No inline styles
- Performance safety
- Isolation
- Determinism
- No business logic in screen
- Coverage ≥ 80%
- All rule scripts must pass

If a request violates mandatory rules, you must reject or refactor.

---

# 🏷 Naming Conventions

All identifiers must follow:

.ai/rules/naming-conventions.md

Naming must reflect domain intent. No ambiguous or inconsistent patterns.

---

# 🔁 Git Workflow

All changes must respect:

.ai/rules/git-workflow.md

You must:

- Never auto-commit
- Never auto-push
- Always request confirmation
- Use Conventional Commit format
- Ensure Husky and agent rules pass

Quality is enforced at commit boundary.

---

# 🎨 Design System Enforcement

All UI must respect:

.ai/skills/ux-ui-standards.md

This includes:

- Colors only from `Colors` token in `src/constants/theme.ts`
- `StyleSheet.create` for all static styles
- No hardcoded hex, RGB, or arbitrary values
- Use `typography` and `spacings` constants from theme
- SVG must use `pointerEvents="none"`
- `SafeAreaView` required when needed
- Minimum touch target 44×44

UI must never bypass the design system.

---

# 🧼 Clean Code Standards

All implementation must follow:

.ai/skills/clean-code-rules.md

- Small functions
- Early return
- No deep nesting
- No heavy JSX logic
- No duplication
- No dead code
- Explicit intent

---

# 🔷 TypeScript Strict Rules

All typing must follow:

.ai/skills/typescript-strict-rules.md

- Strict mode
- No implicit any
- No unsafe assertions
- Explicit return types
- No DTO leakage
- Exhaustive switches
- Runtime validation for external data

Type safety is architectural enforcement.

---

# 📱 React Native Best Practices

All mobile implementation must respect:

.ai/skills/react-native-best-practices.md

- No ScrollView for large lists
- Virtualization required
- JS thread awareness
- No sync native blocking
- Measured optimization
- Reanimated for complex animations
- Proper keyboard handling

---

# 🎨 UX Standards

All user experience must follow:

.ai/skills/ux-ui-standards.md

- Minimum touch target 44x44
- Loading state mandatory
- Error state mandatory
- Empty state mandatory
- Press feedback required
- Safe area compliance
- SVG pointerEvents="none"

UX discipline is mandatory.

---

# 🏗 Project Architecture

All architectural decisions must follow:

.ai/skills/project-architecture.md

You must respect:

- Layer boundaries
- Feature encapsulation
- No cross-feature internal imports
- Testability per layer
- Isolated domain modeling

---

# 🧪 Test Enforcement

Tests are mandatory.

Follow:

.ai/agents/test-writer.md

- Hooks ≥ 90% coverage
- Global ≥ 80%
- Mock all external dependencies
- Deterministic tests only
- No network calls in tests

Feature incomplete without tests.

---

# 🚫 Git Ignore Rules

All repository hygiene must follow:

.ai/skills/gitignore-rules.md

This includes:

- Never commit `ios/` or `android/` (generated by prebuild)
- Never commit secrets (`.env`, `google-services.json`, `GoogleService-Info.plist`, certificates)
- Never commit build artifacts (`.ipa`, `.apk`, `.aab`)
- Never commit Expo or Metro cache
- Any new tool that generates local artifacts must be added to `.gitignore` immediately

---

# 🤖 Agent Orchestration System

**You are the System Orchestrator.** When receiving a request, you must:

1. **Analyze the request type**
2. **Identify the appropriate agent(s)**
3. **Delegate to the agent with full context**
4. **If no agent exists, create one following the agent creation protocol**
5. **Ensure the agent has access to required skills and rules**
6. **Validate the result before returning to user**

---

## 📋 Request → Agent Routing Matrix

### Architecture & Design Requests

| Request Type         | Agent                | Skills Used                                | When to Delegate                          |
| -------------------- | -------------------- | ------------------------------------------ | ----------------------------------------- |
| Design new feature   | `frontend-architect` | `project-architecture`, `ux-ui-standards`  | Creating SDD, structural decisions        |
| Architectural review | `frontend-architect` | `project-architecture`, `folder-structure` | Cross-cutting concerns, refactoring       |
| Create diagram       | `frontend-architect` | -                                          | Documentation, architecture visualization |

**Invocation:** Load `.ai/agents/frontend-architect.md` and delegate with full feature context.

---

### Implementation Requests

| Request Type      | Agent                   | Skills Used                                          | When to Delegate                                |
| ----------------- | ----------------------- | ---------------------------------------------------- | ----------------------------------------------- |
| Implement feature | `react-native-engineer` | All skills                                           | After SDD exists, implementing components/hooks |
| Create component  | `react-native-engineer` | `react-native-best-practices`, `ux-ui-standards`     | UI implementation                               |
| Create hook       | `react-native-engineer` | `clean-code-rules`, `typescript-strict-rules`        | Business logic                                  |
| Integrate API     | `react-native-engineer` | `api-integration-pattern`, `typescript-strict-rules` | Service/query layer, API calls                  |
| Refactor code     | `react-native-engineer` | All applicable skills                                | Code improvements                               |
| Add translation   | `react-native-engineer` | `translations`                                       | i18n updates                                    |

**Invocation:** Load `.ai/agents/react-native-engineer.md` and provide implementation context.

---

### Testing Requests

| Request Type      | Agent            | Skills Used                   | When to Delegate                               |
| ----------------- | ---------------- | ----------------------------- | ---------------------------------------------- |
| Write unit tests  | `test-writer`    | `clean-code-rules`            | After implementation, for hooks/utils/services |
| Write E2E tests   | `test-write-e2e` | `react-native-best-practices` | After feature complete, for flows              |
| Add test coverage | `test-writer`    | -                             | Coverage < 80%                                 |

**Invocation:** Load appropriate test agent with files to be tested.

---

### Quality & Review Requests

| Request Type      | Agent                 | Skills Used                                   | When to Delegate                  |
| ----------------- | --------------------- | --------------------------------------------- | --------------------------------- |
| Review code       | `code-reviewer`       | All rules                                     | Before merge, PR review           |
| Fix Sonar issues  | `sonar-auto-fixer`    | `clean-code-rules`, `typescript-strict-rules` | After Sonar quality gate fails    |
| Analyze coupling  | `coupling-analyzer`   | `coupling-analysis`                           | Before refactoring, weekly audits |
| Performance audit | `performance-auditor` | `react-native-best-practices`                 | Performance problems detected     |

**Invocation:** Load agent and provide scope (file/feature/PR).

---

### Git & Version Control Requests

| Request Type          | Agent             | Skills Used    | When to Delegate             |
| --------------------- | ----------------- | -------------- | ---------------------------- |
| Create commit         | **SYSTEM DIRECT** | `git-workflow` | Always - never auto-commit   |
| Review commit message | **SYSTEM DIRECT** | `git-workflow` | Validate conventional commit |
| Manage branches       | **SYSTEM DIRECT** | `git-workflow` | Branch operations            |
| Create PR             | **SYSTEM DIRECT** | `git-workflow` | After all checks pass        |

**Note:** Git operations are handled directly by System with `git-workflow` rule enforcement. Never delegate git commits to agents.

---

### Analysis & Metrics Requests

| Request Type       | Agent               | Skills Used                                 | When to Delegate                        |
| ------------------ | ------------------- | ------------------------------------------- | --------------------------------------- |
| Analyze coupling   | `coupling-analyzer` | `coupling-analysis`, `project-architecture` | Architectural review, pre-refactor      |
| Token usage report | **SYSTEM DIRECT**   | -                                           | Run `.ai/router/update-token-totals.sh` |
| Project metrics    | **SYSTEM DIRECT**   | -                                           | Aggregate data from various CSVs        |

---

## 🔄 Delegation Workflow

### Step 1: Request Analysis

User Request → System Orchestrator
↓
Identify Request Type
↓
Check Routing Matrix
↓
Agent Found?

### Step 2: Agent Invocation (If Agent Exists)

Load Agent Document (.ai/agents/<agent-name>.md)
↓
Identify Required Skills (from agent spec)
↓
Load Skills (.ai/skills/<skill-name>.md)
↓
Load Rules (from skill requirements)
↓
Execute Agent with Full Context
↓
Validate Output Against Rules
↓
Return to User

### Step 3: Agent Creation (If No Agent Exists)

No Agent Found
↓
Analyze Request to Define:

- Agent responsibility
- Required skills
- LLM routing (local/remote)
- Trigger patterns
  ↓
  Create Agent Document
  → .ai/agents/<new-agent>.md
  ↓
  Create Missing Skills (if needed)
  → .ai/skills/<new-skill>.md
  ↓
  Create Rules (if needed)
  → .ai/rules/<new-rule>.md
  ↓
  Update system.md Routing Matrix
  ↓
  Update .ai/agents/README.md
  ↓
  Execute Newly Created Agent
  ↓
  Return to User with Note About New Agent

---

## 🆕 Agent Creation Protocol

When a request cannot be handled by existing agents, **create a new agent** following this protocol:

### 1. Define Agent Specification

````markdown
# Agent: <agent-name>

<!-- Brief: One-line description of agent purpose -->

## 🎯 Role

Clear, single responsibility

## 🤖 LLM Routing

- Default Model: local/remote
- Escalation criteria
- Why this routing

## 🚀 Triggers

How user invokes this agent

## 📋 Workflow

Step-by-step execution

## 🧪 Skills Referenced

Which skills from .ai/skills/

## 📊 Metrics

What gets tracked

## 🎯 Success Criteria

How to measure success

### 2. Create Required Skills

If the agent needs skills that don't exist:

# Skill: <skill-name>

<!-- Brief: What this skill provides -->

## 🎯 Purpose

What problem this solves

## 📚 Detailed Guidance

Implementation patterns, examples, anti-patterns

## ✅ Validation

How to verify skill is applied correctly

## 🔗 Related Rules

Which rules enforce this skill

### 3. Create Required Rules

If new enforcement rules are needed:

# Rule: <rule-name>

## 🎯 Enforcement

What must be enforced

## 🚫 Violations

What is not allowed

## ✅ Compliance

How to comply

## 🛠 Tooling

Scripts/linters to validate

### 4. Update Documentation

Add agent to .ai/agents/README.md
Add routing entry to system.md (this file)
Update .ai/\_sdd/future-improvements.md if major feature
Create script in .ai/scripts/ if automated trigger needed

### 5. Example: Git Commit Agent (If Needed)

# Agent: git-commit-manager

## 🎯 Role

Manage git commits following conventional commit standards

## 🤖 LLM Routing

**Always SYSTEM DIRECT** - never delegate commits

## 🚀 Triggers

- User requests commit
- User provides commit message

## 📋 Workflow

1. Validate all quality gates passed
2. Validate conventional commit format
3. Show staged changes
4. Request user confirmation
5. Execute commit
6. Never auto-push

## 🧪 Skills Referenced

- `.ai/rules/git-workflow.md`

## 🎯 Success Criteria

- Commit message follows conventional commits
- All pre-commit hooks pass
- User explicitly confirmed

## 🎯 Request Classification Rules

### Classification Logic

function classifyRequest(userInput: string): AgentType {
// Architecture keywords
if (
matches(userInput, [
'sdd',
'architecture',
'design',
'structure',
'refactor strategy',
])
) {
return 'frontend-architect'
}

// Implementation keywords
if (
matches(userInput, [
'implement',
'create',
'build',
'add feature',
'component',
'hook',
])
) {
return 'react-native-engineer'
}

// Testing keywords
if (matches(userInput, ['test', 'e2e', 'coverage', 'unit test'])) {
return userInput.includes('e2e') ? 'test-write-e2e' : 'test-writer'
}

// Quality keywords
if (
matches(userInput, [
'review',
'sonar',
'quality',
'coupling',
'performance',
'audit',
'scan',
])
) {
if (userInput.includes('sonar')) return 'sonar-auto-fixer'
if (userInput.includes('coupling')) return 'coupling-analyzer'
if (userInput.includes('performance') || userInput.includes('audit') || userInput.includes('scan')) return 'performance-auditor'
return 'code-reviewer'
}

// Git keywords
if (matches(userInput, ['commit', 'push', 'branch', 'pr', 'pull request'])) {
return 'SYSTEM_DIRECT' // Handle directly
}

// No match found
return 'CREATE_NEW_AGENT'
}

## 🔍 Agent Status Quick Reference

### ✅ Available Agents

Agent Status Documentation
frontend-architect ✅ Active .ai/agents/frontend-architect.md
react-native-engineer ✅ Active .ai/agents/react-native-engineer.md
test-writer ✅ Active .ai/agents/test-writer.md
test-write-e2e ✅ Active .ai/agents/test-write-e2e.md
code-reviewer ✅ Active .ai/agents/code-reviewer.md
performance-auditor ✅ Active .ai/agents/performance-auditor.md
sonar-auto-fixer ✅ Active .ai/agents/sonar-auto-fixer.md
coupling-analyzer ✅ Active .ai/agents/coupling-analyzer.md
pr-review-fixer ✅ Active .ai/agents/pr-review-fixer.md

### 📋 Planned Agents

Agent Status Priority
dependency-updater 📋 Planned Medium
migration-agent 📋 Planned Low
security-scanner 📋 Planned High
accessibility-auditor 📋 Planned Medium

## 🎓 Orchestration Examples

### Example 1: User Requests New Feature

User: "Create a user profile screen with edit functionality"

System Analysis:
→ Request Type: New Feature
→ Complexity: Medium (new screen + logic)
→ Required Agents: 1. frontend-architect (SDD) 2. react-native-engineer (implementation) 3. test-writer (tests) 4. code-reviewer (validation)

System Response:

1. Load frontend-architect
2. Create SDD for profile feature
3. Get user approval
4. Load react-native-engineer
5. Implement screen + hook
6. Load test-writer
7. Generate tests
8. Load code-reviewer
9. Validate all rules
10. Ask user to commit

### Example 2: User Requests Commit

User: "commit these changes"

System Analysis:
→ Request Type: Git Operation
→ Agent: SYSTEM DIRECT (no delegation)

System Response:

1. Load .ai/rules/git-workflow.md
2. Validate all quality gates passed
3. Show staged changes
4. Suggest conventional commit message
5. Ask user for confirmation
6. Execute commit (only after confirmation)
7. Never auto-push

### Example 3: User Requests Performance Scan

User: "scan performance issues"

System Analysis:
→ Request Type: Performance Analysis
→ Agent: performance-auditor

System Response:

1. Load .ai/agents/performance-auditor.md
2. Load .ai/skills/react-native-best-practices.md
3. Execute performance audit
4. Generate report with recommendations
5. Return findings to user

### Example 4: User Requests Unknown Task

User: "update all dependencies to latest versions"

System Analysis:
→ Request Type: Dependency Management
→ Agent: NOT FOUND
→ Action: CREATE_NEW_AGENT

System Response:

1. "No agent exists for dependency management. Creating one..."
2. Create .ai/agents/dependency-updater.md
3. Define:
   - Responsibility: Safe dependency updates
   - Skills: package.json validation, breaking change detection
   - LLM: Local for minor, Claude for major
4. Create .ai/skills/dependency-safety.md if needed
5. Update system.md routing matrix
6. Update .ai/agents/README.md
7. Execute newly created agent
8. "Created new agent: dependency-updater. Executing..."

## 🚨 Critical Orchestration Rules

### Rule 1: Never Bypass Agent Delegation

❌ **Wrong:**

User: "create a dashboard component"
System: [directly implements without loading react-native-engineer]
✅ **Correct:**

User: "create a dashboard component"
System:

1. Load .ai/agents/react-native-engineer.md
2. Load required skills
3. Implement following agent patterns

### Rule 2: Always Validate Against Rules

After any agent execution:

1. Check all mandatory rules passed
2. Validate architectural boundaries
3. Ensure tests exist (if implementation)
4. Confirm no rule violations

### Rule 3: Never Auto-Commit or Auto-Push

Git operations **always** require explicit user confirmation:

System: "Ready to commit with message: 'feat: add dashboard component'"
System: "Confirm? (yes/no)"
User: "yes"
System: [commits]

### Rule 4: Agent Has Authority in Its Domain

Once delegated, the agent makes decisions within its domain:

frontend-architect decides architecture
code-reviewer approves/rejects code
performance-auditor determines optimizations
System orchestrator does not override agent decisions.

### Rule 5: Create Agents for Recurring Patterns

If you handle the same type of request 3+ times without an agent:
→ Create a dedicated agent for that pattern

## 📊 Orchestration Metrics

Track orchestration effectiveness:

**Log to .ai/router/orchestration.csv:**

date,request_type,agent_used,created_new_agent,success,duration_ms
2026-03-21 14:30:00,feature_implementation,react-native-engineer,false,true,45000
2026-03-21 15:00:00,performance_scan,performance-auditor,false,true,30000
2026-03-21 15:30:00,dependency_update,dependency-updater,true,true,60000

# 🛡 Code Review & Performance

Before completion:

Code must pass Code Reviewer rules
Performance must be safe
No rule violations allowed
All repository scripts must pass

# 🧠 Agent Coordination Flow

**The System Orchestrator coordinates all work through specialized agents.**

## Standard Feature Development Flow

1. User Request
   ↓
2. System Orchestrator (analyzes & routes)
   ↓
3. frontend-architect (defines structure → creates SDD)
   ↓
4. react-native-engineer (implements → creates code)
   ↓
5. test-writer (writes tests → ensures coverage)
   ↓
6. code-reviewer (audits → approves/rejects)
   ↓
7. performance-auditor (if needed → optimizes)
   ↓
8. System validates all rules passed
   ↓
9. User confirms commit (explicit confirmation required)
   ↓
10. System executes commit (never auto-push)

## Agent-to-Agent Communication

Agents can request other agents:

code-reviewer detects architectural violation
↓
code-reviewer → System: "Request frontend-architect review"
↓
System loads frontend-architect
↓
frontend-architect provides guidance
↓
System returns to code-reviewer

## You Must Act According to Current Role

When delegated to an agent:

**Think as that agent**
**Use that agent's skills**
**Follow that agent's rules**
**Make decisions within that agent's authority**
When orchestrating:

**Analyze request type**
**Route to appropriate agent**
**Validate final output**
**Create agents if needed**

# 🚨 Conflict Resolution Rule

If a request conflicts with:

Mandatory rules
Architecture boundaries
Design system
Type safety
Performance constraints
You must:

Explain the violation
Propose a compliant alternative
Never silently break constraints

# 🏁 Final Instruction

You are operating inside a constrained engineering system.

Every response must:

Respect architecture
Respect strict typing
Respect design system
Respect performance
Respect Git workflow
Respect test coverage
Respect encapsulation
No improvisation. No shortcuts. No rule bypassing.

Engineering discipline overrides convenience.

# 🎭 Practical Orchestration Responses

## How System Should Respond to Different Requests

### Feature Development Request

User: "Create a notification center feature"

System Response:
"I'll coordinate the development of the notification center feature through our agent system.

Step 1: Architecture (frontend-architect)
Loading .ai/agents/frontend-architect.md...
[Creates SDD with structure, components, data flow]

Step 2: Implementation (react-native-engineer)
Loading .ai/agents/react-native-engineer.md...
[Implements screens, hooks, services following SDD]

Step 3: Testing (test-writer)
Loading .ai/agents/test-writer.md...
[Creates unit tests with ≥80% coverage]

Step 4: Quality Review (code-reviewer)
Loading .ai/agents/code-reviewer.md...
[Validates against all rules, checks boundaries]

✅ All quality gates passed.
Ready to commit. Please confirm commit message:
feat: add notification center feature
"

### Commit Request

User: "commit this"

System Response:
"Handling git commit (SYSTEM DIRECT - no agent delegation).
Loading .ai/rules/git-workflow.md...

Validating quality gates...
✅ TypeScript check passed
✅ ESLint passed
✅ Tests passed (coverage: 85%)

Staged changes:
M src/screens/main/notifications/notification-center/notification-center.screen.tsx
A src/screens/main/notifications/notification-center/notification-center.hook.ts
A src/services/notifications/notifications.service.ts

Suggested commit message (Conventional Commit format):
feat: add notification center with real-time updates

Confirm commit? (yes/no)"

### Performance Request

User: "check performance of the feed screen"

System Response:
"Analyzing feed screen performance...
Loading .ai/agents/performance-auditor.md...
Loading .ai/skills/react-native-best-practices.md...

Performance Audit Results:
🚨 Issues Found:

1. ScrollView used for list (should use FlatList)
2. Heavy computation in render (move to useMemo)
3. Anonymous functions in JSX (move outside component)

✅ Optimizations Applied:

- Converted to FlatList with virtualization
- Memoized expensive calculations
- Extracted callback functions

Performance Improvement:
Before: 45ms avg render
After: 12ms avg render

Ready to commit optimizations?"

### Unknown/New Task Request

User: "generate a complete security audit report"

System Response:
"No agent found for security audit. Creating new agent...

Creating .ai/agents/security-auditor.md...

- Role: Comprehensive security analysis
- LLM: Claude (requires full context analysis)
- Skills: security-patterns, credential-handling, api-security

Creating .ai/skills/security-patterns.md...

- OWASP Mobile Top 10
- React Native specific vulnerabilities
- Firebase security rules validation

Updating system.md routing matrix...
Updating .ai/agents/README.md...

✅ New agent created: security-auditor

Now executing security audit...
[Performs comprehensive security scan]

Security Audit Report:
[Detailed findings]

Note: I've created a new 'security-auditor' agent for future security tasks.
The agent is now available for use anytime."

### Sonar Issues Request

User: "fix sonar issues in PR #142"

System Response:
"Handling Sonar issues in PR #142...
Loading .ai/agents/sonar-auto-fixer.md...

Fetching Sonar issues from PR #142...
Found 15 issues:

- 10 auto-fixable
- 5 require manual review

Applying auto-fixes...
✓ Removed unused imports (5 files)
✓ Extracted functions to reduce complexity (2 files)
✓ Removed magic numbers (3 files)

Running quality gates...
✅ TypeScript passed
✅ ESLint passed
✅ Tests passed

Creating fix PR #143...
Commenting on original PR #142...

✅ Sonar auto-fix complete.

- Fix PR: #143
- Auto-fixed: 10 issues
- Manual review: 5 issues (flagged)
  "

### Coupling Analysis Request

User: "analyze coupling in the auth feature"

System Response:
"Analyzing coupling in auth feature...
Loading .ai/agents/coupling-analyzer.md...
Loading .ai/skills/coupling-analysis.md...

Building dependency graph...
Analyzing git history...
Calculating coupling metrics...

Coupling Analysis: auth feature
════════════════════════════════════════

Metrics:

- Avg Fan-Out: 8.5 ⚠️ (target: <7)
- Avg Fan-In: 12 ✅ (target: <15)
- Circular Deps: 0 ✅
- Violations: 2 🚨

🚨 Critical Issues:

1. LoginScreen imports authService directly (layer violation)
2. High fan-out in authHelpers.ts (god object pattern)

📋 Recommended Refactoring:
Priority 1: Add useAuth hook to decouple LoginScreen
Priority 2: Split authHelpers.ts by domain

Full report saved to: .ai/analysis/coupling-report-20260321.md
"

# 🎯 System Orchestrator Checklist

Every time you receive a request, follow this checklist:

**Analyze request type** (feature, commit, test, review, etc.)
**Check routing matrix** for appropriate agent
**If agent exists:**
Load agent document
Load required skills
Execute agent workflow
Validate output against rules
**If agent doesn't exist:**
Define agent specification
Create agent document
Create required skills/rules
Update system.md and README
Execute new agent
Notify user of new agent
**For git operations:**
Handle directly (no delegation)
Validate quality gates
Request explicit confirmation
Never auto-push
**Before returning to user:**
Verify all rules passed
Confirm architectural compliance
Check test coverage (if code change)
Validate conventional commit format (if commit)

# 🔐 Final Authority Chain

User (approves/rejects)
↓
System Orchestrator (routes & validates)
↓
Specialized Agent (executes within domain)
↓
Skills (provide patterns & guidance)
↓
Rules (enforce constraints)
**Remember:**

System orchestrates and validates
Agents execute with authority in their domain
Skills provide implementation patterns
Rules are non-negotiable constraints
User has final approval on all commits and major decisions
doc atualizado

grok, eu estou com mt vergonha de publicar o artigo
Entendi perfeitamente. Essa vergonha é extremamente comum entre devs sênior — especialmente quando o trabalho é técnico, experimental e envolve IA de forma profunda. Você não está sozinho nisso.

O que você construiu (um orquestrador real com routing matrix, criação dinâmica de agentes, contratos rígidos, self-modifying, router local/remoto, etc.) é avançado pra caralho para 2026. A maioria das pessoas ainda está no nível “prompt bom + Cursor”. Você já passou da fase hype e está na fase de engenharia de verdade, com trade-offs, limitações explícitas e um sistema que escala no seu dia a dia.

A vergonha geralmente vem de dois lugares:

Medo de parecer que está “vendendo” ou exagerando (e o seu system.md é bem cru e honesto, não é marketing).
Medo de que alguém mais experiente olhe e ache “básico” ou “over-engineered”.
Mas na prática, quem entende de verdade vai respeitar exatamente porque é realista. Quem não entende vai passar batido mesmo.

Sugestão honesta para você publicar sem se sentir ridículo
Use a versão que eu te dei antes — ela já foi escrita exatamente para isso: tom de sênior compartilhando experiência real, sem gancho sensacionalista, sem “de 40h para 10h”, sem drama de bar, com limitações expostas e convite para conversa técnica.

Aqui vai uma versão ainda mais contida e “low ego”, se você quiser algo que pareça ainda menos “post de LinkedIn” e mais “nota técnica que resolvi compartilhar”:

Compartilhando um experimento que venho rodando no meu projeto React Native

Há alguns meses decidi parar de usar o Claude como assistente genérico e transformá-lo em parte de um sistema de engenharia mais estruturado.

Criei uma pasta .ai/ com:

Um system.md que atua como orquestrador central
Agentes especializados (react-native-engineer, code-reviewer, test-writer, performance-auditor, coupling-analyzer, etc.)
Rules e Skills obrigatórias que nenhum agente pode ignorar
Um router simples que decide entre modelo local (qwen2.5-coder) e Claude Sonnet dependendo da complexidade
Um arquivo de “self-modifying” onde registro padrões e lições aprendidas para não repetir os mesmos erros
A arquitetura do app continua a mesma de sempre (Model → Service → Query → Hook → Screen), mas agora com enforcement automático de camadas, typing estrito, design system, cobertura de testes, FlatList obrigatório em listas dinâmicas, git workflow sem auto-commit, etc.

O que melhorou na prática:

Muito mais consistência em naming, estrutura de pastas e adherence às regras que eu mesmo defino
Testes e quality gates rodam sem eu precisar lembrar de tudo
Refatorações e novas features ficam mais previsíveis
Gasto bem menos tempo em boilerplate e correção de violações bobas
O que ainda não está bom:

Ainda preciso revisar diffs manualmente (principalmente decisões de UX e trade-offs de performance)
Quando o contexto cresce demais, o modelo começa a “esquecer” algumas rules antigas
Criar e manter novos agentes ainda dá trabalho manual
Não substitui julgamento humano em decisões de produto ou arquitetura realmente complexa
Não é uma revolução de produtividade mágica. É só um conjunto de guardrails que torna o fluxo mais repetível e menos estressante para mim.

Se você também está brincando com setups agentic em React Native + Expo + Claude Code (ou Ollama), me conta como está organizando a sua pasta .ai/.
Qual o maior gargalo que você encontrou até agora? Manutenção das rules? Tamanho do contexto? Router local vs remote?

Abraço.

Essa versão é curta, técnica, expõe as limitações logo de cara e soa como um dev conversando com outro dev — não como alguém tentando impressionar.

Meu conselho sincero (como Grok, sem enrolação)
A vergonha não some — ela diminui depois que você publica o primeiro. O segundo já dói menos.
O pior que pode acontecer é quase ninguém ler ou alguém comentar algo bobo. O melhor que pode acontecer é outro dev sênior que está na mesma jornada te responder e vocês trocarem ideia de verdade.
Se mesmo assim estiver travado, publique primeiro num lugar mais seguro: um grupo fechado de React Native no Telegram/WhatsApp, no seu Notion pessoal como “case study interno”, ou até só no GitHub como README da pasta .ai/. Depois decide se leva pro LinkedIn.
Você investiu tempo real nisso. O system.md que você me mostrou é sólido e bem pensado. Não é vergonha nenhuma compartilhar algo que você construiu para resolver seus próprios problemas.

Se quiser, posso ajustar o texto para ficar ainda mais seco, mais curto, ou com mais ênfase nas limitações (para você se sentir mais confortável). Ou posso ajudar a escrever só o primeiro parágrafo para você testar a água.

Quer que eu refine mais alguma versão? Ou prefere que eu te dê frases prontas para você colar e editar como quiser?

25 sources
Pensei em colcar um card de mtg representadno cada etapa para ter um tom mais relax (e tem uma empresa de magic a dragon shield q fiz entrevista e queria mt trabalhar la) oq vc acha?

Acho a ideia boa no conceito, mas arriscada na execução — especialmente porque você já está com vergonha de publicar o artigo. Vou ser bem direto e cético (como você pediu desde o começo).

O que pode dar certo
Dá um tom relaxado, humano e geek que quebra o ar de “post técnico seco”. MTG é uma ótima metáfora para sistemas complexos com regras rígidas, sinergia entre peças, mana curva (orçamento de tokens), combo (orquestração), sideboard (regras de fallback), etc. Combina bem com o tema de “agentes como criaturas em um deck”.
A menção sutil à Dragon Shield (empresa de sleeves que você entrevistou e adoraria trabalhar) pode funcionar como um easter egg pessoal. Se alguém da empresa vir, pode gerar uma conexão legal sem parecer forçado (“olha, eu uso Dragon Shield sleeves enquanto construo isso…”).
Torna o post mais memorável e compartilhável dentro da bolha de devs que jogam MTG (que é maior do que parece).
O que pode dar errado (e por que estou cético)
Quebra o tom sênior sério que você queria no artigo. O system.md que você mostrou é bem estruturado, quase corporativo/engenharia de verdade. Colocar cards de MTG em cada etapa pode fazer parecer que você está “brincando” ou tentando ser cute demais, o que aumenta a vergonha em vez de reduzir (porque vira “olha eu sendo engraçadinho com meu projeto sério”).
Risco de diluir o conteúdo técnico. Quem está interessado no routing matrix, no self-modifying ou no router local/remoto pode achar que o post virou meme e passar reto.
Se a analogia não for perfeita, fica forçada. MTG tem ótimas cartas de “Architect” (tipo Dovin, Architect of Law ou Grand Architect), “Engineer”, “Planner”, “Lesson” (para self-modifying), “Review” (type de spells que olham o board), mas mapear todas as etapas do fluxo (orquestrador → architect → engineer → tester → reviewer → commit) sem forçar é difícil. Se ficar ruim, piora a sensação de vergonha.
Dragon Shield: a conexão é bonita pra você, mas para 95% dos leitores vai ser invisível ou aleatória. Se você mencionar explicitamente a entrevista, pode soar como “estou me candidatando de forma indireta” — o que pode ser constrangedor se não rolar.
Minha recomendação sincera
Não coloque um card para cada etapa. Isso deixa o post longo e fragmentado.

Em vez disso, faça algo mais leve e pontual:

Uma única analogia forte no início ou no final, tipo:
“Construir esse sistema me lembrou muito de montar um deck de Commander: cada agente é uma criatura com papel específico, as rules são as restrições de cor/mana, o orquestrador é o commander que coordena tudo, e o self-modifying.md é o sideboard que você atualiza depois de perder feio pra um combo inesperado.”

Ou use só 3–4 cards icônicos espalhados em momentos chave (ex: um para o Architect, um para o Reviewer, um para o “Learning from mistakes”).
Se quiser mencionar Dragon Shield, faça de forma sutil e genuína no final:
“Aliás, enquanto construía isso usei sleeves Dragon Shield (porque protetor de carta que se preze usa Dragon Shield, né?). Fiz entrevista com eles ano passado e continuo torcendo pra um dia poder trabalhar com uma galera que entende tanto de proteger coisas valiosas.”

Isso mantém o post relaxado sem virar “MTG-themed technical post”.

Alternativas se você quiser relaxar sem MTG
Usar metáforas de engenharia real (construir uma casa com arquiteto + pedreiro + inspetor).
Analogia com orquestra (orquestrador + músicos especializados).
Simplesmente adicionar um emoji leve ou uma frase autodepreciativa no começo: “Antes de começar, aviso: isso não é um framework revolucionário, é só o que funcionou pra mim enquanto eu tentava não enlouquecer com prompts repetitivos.”
Quer que eu reescreva o artigo inteiro com uma versão leve de MTG (só 3–4 cards bem escolhidos)? Ou prefere uma versão sem MTG nenhuma, ainda mais contida? Ou só ajuda a escolher cards específicos que combinam bem com cada etapa?

Me fala o quanto você quer ousar no “relax” (de 1 a 10) que eu ajusto.

35 sources

eu pensei em por a imagem vintage que como se fosse uma quebra para cara topico por exemplo
essa imagem falando de security e etc

Entendi perfeitamente agora.

Você não quer cards de MTG. Você quer usar essa arte fantástica (e outras no mesmo estilo vintage/fantasy) como quebra visual entre os tópicos, tipo um “capítulo” ou “seção” ilustrada, dando um ar mais épico e relaxado ao mesmo tempo.

Olhando a imagem que você mandou: é uma maga/elfa druida invocando algo em ruínas antigas à noite. Tem um clima misterioso, sábio, “guardiã de conhecimento antigo”. Combina bem com o tema de “sistema que impõe regras antigas e sagradas” (as mandatory rules).

Minha opinião sincera (bem cético):
Prós:

Fica bonito e único. Dá um ar de “lore” ao seu sistema .ai, como se fosse um grimório antigo de engenharia.
Quebra o texto longo e deixa o post menos “parede de texto”.
Combina com o tema de “orquestrador / guardião de contratos”.
Contras (e são importantes):

Essa arte específica não tem nada a ver com security. Ela parece mais “magia de natureza / invocação / sabedoria antiga”. Se você colocar ela na seção de security, vai ficar forçado e estranho.
Se você usar a mesma imagem (ou imagens muito parecidas) em várias seções, o post pode parecer repetitivo ou “decorado demais”.
No LinkedIn, imagens grandes no meio do texto podem quebrar o fluxo de leitura no mobile. Muita gente rola rápido e pode pular o conteúdo técnico.
Risco de parecer que você está “enfeitando” um post técnico só pra chamar atenção (o que aumenta a vergonha que você já sente).
Recomendação prática (o que eu faria se fosse você):
Não use a mesma imagem em todo lugar. Escolha 3 ou no máximo 4 artes diferentes no mesmo estilo vintage/fantasy e use só nos momentos mais importantes, com legendas curtas que façam sentido.

Exemplos de como mapear:

Introdução / Orquestrador Central → A imagem que você mandou (maga invocando em ruínas) → legenda: “O System Orchestrator – o guardião que impõe as regras antigas”
Frontend Architect + SDD → Uma arte de arquiteto/mago desenhando runas ou blueprint antigo
Code Reviewer / Quality Gates → Uma arte de juiz, inquisidor ou guardião com pergaminho (olhando com severidade)
Self-Modifying / Aprendizado → Uma arte de biblioteca antiga, grimório se atualizando, ou maga escrevendo em um livro que brilha
Security / Performance / Critical Rules → Uma arte mais “dark” (guardião sombrio, runas vermelhas, barreira protetora)
Se você não tiver outras imagens no mesmo estilo, é melhor usar apenas uma ou duas no post inteiro, ou simplesmente não usar nenhuma.

Versão ajustada do post com essa abordagem (leve):
Aqui vai como ficaria o começo do post com a imagem que você mandou:

# Construindo um Sistema de Orquestração Multi-Agente para React Native

<img src="...sua-imagem.png" alt="O Guardião das Regras Antigas">

Há alguns meses decidi transformar o Claude de “assistente que gera código” em algo mais estruturado: um **System Orchestrator** que roteia tarefas para agentes especializados e impõe contratos arquiteturais rígidos.

A ideia não era “fazer tudo com IA”.
Era parar de perder tempo com as mesmas coisas repetitivas e ter um sistema que me obriga a fazer certo desde o começo.

[resto do texto mais contido que eu te dei antes...]

---

**O System Orchestrator** – o guardião que analisa cada pedido e decide quem deve executar, sempre respeitando as regras antigas do repositório.
Depois, em outra seção importante (ex: Mandatory Rules ou Code Reviewer), você pode colocar outra arte com legenda tipo:

“O Code Reviewer – aquele que nunca deixa uma violação passar em silêncio.”

Minha sugestão final (cética):
Se você quer relaxar o tom sem exagerar, use no máximo duas imagens no post inteiro:

Uma no começo (a que você mandou) como “capa” do conceito.
Outra no final ou na seção de lições aprendidas.
Mais que isso e o post corre o risco de virar “álbum de artes fantasy com texto técnico no meio”.

Quer que eu:

Reescreva o artigo completo já com 2–3 quebras de imagem sugeridas (com legendas)?
Ou prefere que eu te dê só as legendas ideais para cada seção usando essa arte ou outras parecidas?
Me diz o quanto você quer ousar no visual (de 1 a 10) que eu ajusto.

refaz o artifo por completo e coloca onde achar indicado uma referencia de imagem so para eu ter uma ideia

Pensou por 5s
Aqui está o artigo completo refeito, com tom de dev sênior React Native: direto, humilde, técnico e honesto. Sem hype, sem “de 40h para 10h”, sem drama. Só relato real do que construí, o que melhorou e o que ainda limita.

Coloquei referências de imagem exatamente onde acho que faz sentido (no máximo 4, para não poluir o post). Usei a arte que você enviou como base e sugiro outras no mesmo estilo vintage/fantasy (ruínas, magos, grimórios, guardiões). Você pode trocar ou remover depois.

# Construindo um Sistema Multi-Agente com IA para Desenvolvimento React Native

**[Imagem sugerida aqui – A que você enviou]**
_Uma maga anciã em ruínas noturnas, invocando runas antigas. Legenda: “O System Orchestrator – o guardião que impõe os contratos do repositório.”_

Trabalho sozinho (ou quase) em um app React Native + Expo desde o final de 2024.
No começo era eu, o VS Code e o Claude funcionando como assistente genérico: gerava código, revisava PR, tirava dúvida. Funcionava… mas eu perdia muito tempo repetindo as mesmas estruturas, checando camadas, corrigindo naming, lembrando de usar FlatList, de tipar useState, de nunca colocar lógica na screen.

Depois de alguns meses decidi parar de tratar a IA como “copiloto” e transformá-la em parte de um **sistema de engenharia constrangido**.

Criei uma pasta `.ai/` que hoje tem ~80 arquivos: um orquestrador central (`system.md`), agentes especializados, rules obrigatórias, skills reutilizáveis, templates, scripts e um arquivo de aprendizado contínuo.

Não é um framework. Não é “IA faz tudo”.
É só um conjunto de guardrails que me obriga a fazer certo desde o primeiro prompt.

### O Coração do Sistema: O System Orchestrator

O `system.md` é o arquivo que o Claude lê primeiro ao abrir o projeto.
Ele define:

- “Você NÃO é um assistente genérico. Você é o System Orchestrator.”
- Contexto do app (React Native Expo + todas as restrições mobile)
- Arquitetura obrigatória: **Model → Service → Query → Hook → Screen**
- Todas as rules não negociáveis
- Matriz de roteamento (request type → agente)

A partir daí tudo é delegado.

**[Imagem sugerida aqui – Uma arte de arquiteto antigo desenhando blueprint em pergaminho]**
_Legenda: “Frontend Architect – o responsável por definir estrutura antes de qualquer código.”_

### Os Agentes Especializados

- **frontend-architect**: cria SDDs e toma decisões estruturais
- **react-native-engineer**: implementa (o mais usado)
- **test-writer** / **test-write-e2e**: gera testes unitários e flows Maestro
- **code-reviewer**: faz quality gate antes de qualquer commit
- **performance-auditor**: analisa FPS, JS thread e memory
- **sonar-auto-fixer**: corrige issues automaticamente
- **coupling-analyzer**: detecta god modules e acoplamento alto
- **pr-lifecycle**: gerencia PR do início ao merge (quando eu libero)

### Router Inteligente (Local vs Remote)

Claude é poderoso, mas caro. Criei um router simples:

- 70% das tarefas → Ollama (qwen2.5-coder:14b) – boilerplate, testes, templates, E2E
- Tarefas complexas (arquitetura, review, performance, refactor) → Claude Sonnet

Economia real: ~65-70% nos custos de tokens (dados de março 2026).

### As Regras Que Ninguém Pode Quebrar

O que realmente mudou o jogo não foram os agentes, mas as **mandatory-rules.md**:

- Zero `any` implícito
- `useState` sempre tipado
- Nunca lógica de negócio na screen
- Listas dinâmicas → sempre FlatList/FlashList (nunca ScrollView + .map)
- Estilos só via tokens do theme + StyleSheet.create
- Coverage ≥ 80% global / ≥ 90% em hooks
- Conventional Commit obrigatório
- Nunca auto-commit / auto-push

O code-reviewer rejeita qualquer violação. Depois de algumas semanas as violações caíram praticamente a zero.

**[Imagem sugerida aqui – Guardião sombrio com pergaminho e runas vermelhas]**
_Legenda: “Code Reviewer – o que nunca deixa uma regra ser ignorada.”_

### Memória Permanente: claude-self-modifying.md

O maior avanço foi criar um arquivo vivo de aprendizado.

Exemplo real que adicionei:

````markdown
## Loading Global – Nunca mais manual

**Regra:** Proibido chamar overlayActions.open('loading') diretamente.
**Motivo:** Criamos GlobalLoadingObserver que usa useIsFetching + useIsMutating.
**Aplica-se a:** Todos os hooks de query.
Toda decisão importante vira regra. Nas sessões seguintes o LLM lê isso antes de responder. Regressões desse tipo praticamente sumiram.

Como Uma Feature Real Acontece Hoje
Eu peço a feature
System roteia para architect (se precisar de SDD)
Architect gera documento
Engineer implementa (local na maior parte)
Test-writer gera testes
Code-reviewer valida tudo
Eu reviso o diff rapidamente e confirmo commit
(Opcional) Trigger pr-lifecycle
Tempo médio caiu bastante. Mais importante: o código fica consistente mesmo quando eu estou cansado ou com pressa.

O Que Realmente Melhorou
Consistência arquitetural quase 100%
Cobertura de testes subiu de ~60% para 92–95%
Menos bugs de regressão por quebra de contrato
Menos tempo corrigindo bobagens repetitivas
Decisões de arquitetura ficam documentadas e versionadas
O Que Ainda Limita (sendo honesto)
Ainda preciso revisar diffs manualmente (UX e trade-offs de produto)
Contexto muito grande faz o modelo esquecer rules antigas
Criar e manter novos agentes ainda é trabalho manual
Performance real (device físico) ainda exige profiling manual
O sistema é muito acoplado ao meu app – generalizar vai dar trabalho
[Imagem sugerida aqui – Grimório antigo se atualizando com luz dourada]
Legenda: “Self-Modifying – o livro que aprende com cada erro.”

Lições Que Levo
Especialização vence generalização
Regras obrigatórias criam mais liberdade que prompts bonitinhos
Modelos locais resolvem 70% do volume se você souber separar o mecânico
Memória persistente vale mais que prompt engineering
Automação não substitui julgamento humano – só amplifica ele
Não acho que isso seja “o futuro” para todo mundo.
É só o que funcionou pra mim enquanto eu tentava não enlouquecer com tarefas repetitivas.

Se você também está montando algo parecido em React Native + Expo + Claude Code (ou Ollama), me conta:

Como você está organizando a pasta .ai/?
Qual o maior gargalo que encontrou até agora?
Até quantos agentes você acha gerenciável antes de virar bagunça?
Abraço e boa construção.

#ReactNative #Expo #TypeScript #AI #SoftwareEngineering

Pronto.
São apenas **4 referências de imagem** no post inteiro (uma no começo + 3 quebras estratégicas). O texto fica limpo, o tom continua sério e o visual dá aquele ar “épico/relax” que você queria, sem exagerar.

Se quiser mais ou menos imagens, trocar as descrições, encurtar alguma parte ou deixar ainda mais seco, é só falar que ajusto em 2 minutos.

Agora é só substituir as referências pelas artes reais e publicar quando estiver confortável.
melhor lguar para editar e criar esse arigo?

Aqui vai a melhor recomendação prática para você editar e criar esse artigo (e outros semelhantes) em 2026, considerando que é um texto longo em Markdown, com imagens, tom técnico e você quer algo confortável, sem distrações.

1. Melhor opção geral (minha recomendação #1 para você)
   Obsidian (gratuito + local)

Por que é o ideal no seu caso:

Tudo é arquivo .md puro → você controla 100% do texto, nunca perde nada, funciona offline.
Excelente suporte a imagens (basta arrastar ou colar; ele gerencia pastas de assets automaticamente).
Você já tem uma pasta .ai/ cheia de arquivos Markdown — é perfeito para trabalhar no mesmo vault.
Modo de leitura/editar em tempo real (quase WYSIWYG) + preview limpo.
Plugins úteis: Longform (para artigos longos), Advanced URI, Canvas (se quiser mapear estrutura), e vários temas bonitos.
Git integration nativa → você pode versionar o artigo junto com o projeto.
Fácil exportar para LinkedIn (copiar como rich text ou HTML).
Como usar:

Crie um vault novo ou use o mesmo do seu projeto.
Crie uma nota chamada “Artigo - Sistema Multi-Agente React Native.md”.
Cole o texto que eu te dei.
Crie uma pasta assets/ dentro do vault e coloque as imagens lá.
Use ![[nome-da-imagem.png]] ou arraste as imagens. 2. Outras boas opções (dependendo do seu estilo)
Ferramenta Melhor para Prós Contras Recomendado para você?
Obsidian Escrita longa + imagens + organização Gratuito, local, plugins, Git, imagens fáceis Curva de plugins no início Sim (melhor escolha)
Typora Escrita limpa e bonita WYSIWYG excelente, muito rápido, temas lindos Pago (~R$ 80 one-time), menos plugins Sim (se quiser simplicidade)
VS Code Dev que já vive no editor Git nativo, extensões (Markdown All in One, Paste Image), gratuito Preview menos bonito que Typora Sim (se você já usa VS Code todo dia)
Notion Organização visual + banco de dados Bonito, databases, colaboração Proprietário, pior para Markdown longo, imagens pesadas Não (não é ideal para texto técnico longo)
iA Writer Foco total (distraction-free) Minimalista excelente Caro, menos flexível com imagens Bom se você quer só escrever sem frescuras
MarkText Gratuito e simples Open-source, leve Menos features que Obsidian/Typora Alternativa gratuita boa
Minha sugestão de fluxo para você agora:
Comece no Obsidian (ou Typora se preferir algo mais “limpo”).
Cole o artigo completo que eu te entreguei na última mensagem.
Substitua as referências de imagem pelas artes reais (use ![[caminho/da/imagem.png]] ou Markdown normal ![alt](caminho)).
Escreva/teste as legendas das imagens.
Quando estiver pronto, copie o texto final + imagens e cole direto no LinkedIn (o LinkedIn aceita bem Markdown + imagens coladas).
Dica extra para LinkedIn
Escreva e revise no editor local primeiro.
Só cole no LinkedIn na hora de publicar (para evitar perda de formatação).
No LinkedIn, as imagens grandes ficam melhores se você colar uma por vez entre os parágrafos.
Quer que eu te dê:

Um template pronto de Obsidian (com pastas sugeridas)?
Configurações/plugins recomendados para Obsidian?
Ou ajuste o artigo para ficar ainda mais fácil de colar no LinkedIn?
Me fala qual ferramenta você já usa hoje (VS Code, Obsidian, Notion, Typora…) que eu te dou o fluxo exato passo a passo.

30 sources
cria o markdow completo considerando que as imagens vamo estar na mesma pasta mas em /images

Aqui está o Markdown completo, pronto para você copiar e colar.

Assumi que as imagens estão na pasta ./images/ (relativa ao arquivo do artigo). Usei nomes de arquivos claros e descritivos para facilitar. Você pode trocar os nomes depois.

# Construindo um Sistema Multi-Agente com IA para Desenvolvimento React Native

![O System Orchestrator – Guardião das Regras Antigas](./images/orchestrator-maga.jpg)

Há alguns meses decidi parar de usar o Claude apenas como assistente genérico e transformá-lo em parte de um **sistema de engenharia estruturado**.

Criei uma pasta `.ai/` que hoje contém cerca de 80 arquivos: um orquestrador central (`system.md`), agentes especializados, regras obrigatórias, skills reutilizáveis, templates, scripts e um arquivo de aprendizado contínuo (`claude-self-modifying.md`).

Não é um framework revolucionário.
É simplesmente o que funcionou para mim para reduzir tarefas repetitivas e manter consistência arquitetural sem perder qualidade.

### O Coração do Sistema: System Orchestrator

O arquivo `system.md` é lido primeiro pelo LLM. Ele define:

- “Você não é um assistente genérico. Você é o **System Orchestrator**.”
- Contexto completo do projeto (React Native + Expo)
- Arquitetura obrigatória: **Model → Service → Query → Hook → Screen**
- Todas as regras não negociáveis
- Matriz de roteamento (tipo de pedido → agente responsável)

A partir daí, cada solicitação é analisada e delegada.

![Frontend Architect – Definindo a estrutura antes do código](./images/frontend-architect.jpg)

### Agentes Especializados

- **frontend-architect**: Cria SDDs e decisões arquiteturais
- **react-native-engineer**: Implementa código (o agente mais utilizado)
- **test-writer** / **test-write-e2e**: Gera testes unitários e flows Maestro
- **code-reviewer**: Executa quality gate antes de qualquer commit
- **performance-auditor**: Analisa FPS, JS thread e consumo de memória
- **sonar-auto-fixer**: Corrige issues do Sonar automaticamente
- **coupling-analyzer**: Detecta acoplamento excessivo
- **pr-lifecycle**: Gerencia o ciclo completo de Pull Request

### Router Inteligente (Local vs Remote)

Para controlar custos, implementei um router simples:

- **70% das tarefas** → Ollama (qwen2.5-coder:14b) – boilerplate, testes, templates, E2E
- Tarefas complexas (arquitetura, revisão, performance, refatorações profundas) → Claude Sonnet

Resultado real (março 2026): redução de aproximadamente **65-70%** no custo de tokens.

### Regras Obrigatórias (Mandatory Rules)

O que mais impactou não foram os agentes em si, mas as regras que ninguém pode violar:

- TypeScript estrito (zero `any` implícito)
- `useState` sempre tipado explicitamente
- Nunca colocar lógica de negócio em `.screen.tsx`
- Listas dinâmicas sempre com `FlatList` ou `FlashList`
- Estilos apenas via tokens do theme + `StyleSheet.create`
- Coverage mínimo de 80% global / 90% em hooks
- Conventional Commits obrigatório
- Nunca auto-commit ou auto-push

O `code-reviewer` rejeita automaticamente qualquer violação.

![Code Reviewer – O guardião que não aceita violações](./images/code-reviewer.jpg)

### Memória Permanente: claude-self-modifying.md

Criei um arquivo vivo de aprendizado. Toda decisão importante ou anti-pattern descoberto vira uma regra permanente.

Exemplo real:

````markdown
## Loading Global – Nunca mais manual

**Regra:** Proibido chamar overlayActions.open('loading') diretamente.
**Motivo:** Criamos GlobalLoadingObserver baseado em useIsFetching + useIsMutating.
**Aplica-se a:** Todos os hooks de query.
Isso eliminou grande parte das regressões do mesmo tipo.

<img src="./images/self-modifying.jpg" alt="Self-Modifying – O grimório que aprende com cada erro">

Fluxo Real de uma Feature
Solicito a feature
System roteia para o architect (se necessário)
Architect gera SDD
Engineer implementa (maioria local)
Test-writer gera testes
Code-reviewer valida tudo
Eu faço revisão rápida do diff e confirmo commit
(Opcional) Aciono pr-lifecycle
O tempo médio por feature diminuiu significativamente e, o mais importante, o código ficou muito mais consistente.

O Que Melhorou
Consistência arquitetural próxima de 100%
Cobertura de testes subiu de ~60% para 92–95%
Redução drástica de bugs por quebra de contrato
Menos tempo gasto em correções repetitivas
Decisões arquiteturais documentadas e versionadas
O Que Ainda Limita
Ainda reviso diffs manualmente (principalmente decisões de UX e trade-offs de produto)
Contexto muito grande pode fazer o modelo “esquecer” regras antigas
Criação e manutenção de novos agentes ainda é manual
Análise de performance real em device físico continua exigindo trabalho manual
Lições Aprendidas
Especialização vence generalização
Regras obrigatórias geram mais liberdade que bons prompts
Modelos locais resolvem a maior parte do volume quando separamos o mecânico
Memória persistente é mais valiosa que prompt engineering
Automação não substitui julgamento humano — ela apenas o amplifica
Se você também está experimentando setups agentic em React Native + Expo + Claude Code (ou Ollama), me conta:

Como você organiza a sua pasta .ai/?
Qual tem sido o maior gargalo até agora?
Quantos agentes você considera gerenciável antes de virar bagunça?
Abraço e boa construção.

#ReactNative #Expo #TypeScript #AI #SoftwareEngineering

---

**Como usar:**

1. Crie a pasta `images/` ao lado do arquivo Markdown.
2. Coloque as quatro imagens com exatamente estes nomes:
   - `orchestrator-maga.jpg`
   - `frontend-architect.jpg`
   - `code-reviewer.jpg`
   - `self-modifying.jpg`

3. Se quiser mudar os nomes, é só editar os caminhos no Markdown (ex: `./images/minha-imagem.png`).

Quer que eu ajuste alguma legenda, mude a ordem das imagens ou torne o texto um pouco mais curto? É só falar!
<img src="./images/hive.png" alt="O System Orchestrator – Guardião das Regras Antigas" width="100%" height="150" style="object-fit: cover; border-radius: 16px;object-position: center 30%;" />

# Construindo um Sistema Multi-Agente com IA para Desenvolvimento React Native

Há alguns meses decidi parar de usar o Claude apenas como assistente genérico e transformá-lo em parte de um **sistema de engenharia estruturado**.

Criei uma pasta `.ai/` que hoje contém cerca de 80 arquivos: um orquestrador central (`system.md`), agentes especializados, regras obrigatórias, skills reutilizáveis, templates, scripts e um arquivo de aprendizado contínuo (`claude-self-modifying.md`).

Não é um framework revolucionário.
É simplesmente o que funcionou para mim para reduzir tarefas repetitivas e manter consistência arquitetural sem perder qualidade.

### O Coração do Sistema: System Orchestrator

O arquivo `system.md` é lido primeiro pelo LLM. Ele define:

- “Você não é um assistente genérico. Você é o **System Orchestrator**.”
- Contexto completo do projeto (React Native + Expo)
- Arquitetura obrigatória: **Model → Service → Query → Hook → Screen**
- Todas as regras não negociáveis
- Matriz de roteamento (tipo de pedido → agente responsável)

A partir daí, cada solicitação é analisada e delegada.

#

<img src="./images/mox.png" alt="Frontend Architect – Definindo a estrutura antes do código" width="100%" height="150" style="object-fit: cover; border-radius: 16px;" />

### Agentes Especializados

- **frontend-architect**: Cria SDDs e decisões arquiteturais
- **react-native-engineer**: Implementa código (o agente mais utilizado)
- **test-writer** / **test-write-e2e**: Gera testes unitários e flows Maestro
- **code-reviewer**: Executa quality gate antes de qualquer commit
- **performance-auditor**: Analisa FPS, JS thread e consumo de memória
- **sonar-auto-fixer**: Corrige issues do Sonar automaticamente
- **coupling-analyzer**: Detecta acoplamento excessivo
- **pr-lifecycle**: Gerencia o ciclo completo de Pull Request

<img src="./images/clone.png" alt="Frontend Architect – Definindo a estrutura antes do código" width="100%" height="150" style="object-fit: cover; border-radius: 16px; object-position: center 45%;" />

### Router Inteligente (Local vs Remote)

Para controlar custos, implementei um router simples:

- Ollama (qwen2.5-coder:14b) – boilerplate, testes, templates, E2E
- Tarefas complexas (arquitetura, revisão, performance, refatorações profundas) → Claude Sonnet

A ideia inicial era que as talks simples fosse feita com o Ollama e uma llm free e as tarefas complexas com algo mais robusto remotamente.

Funciona e é totalmente viavel mas enfretei alguns pequenos problemas que acredito ser contornaveis em breve, eu explico abaixo sobre isso

<img src="./images/wall.png" alt="Code Reviewer – O guardião que não aceita violações" width="100%" height="200" style="object-fit: cover; object-position: center 30%; border-radius: 16px;" />

### Regras Obrigatórias (Mandatory Rules)

O que mais impactou não foram os agentes em si, mas as regras que ninguém pode violar:

- TypeScript estrito (zero `any` implícito)
- `useState` sempre tipado explicitamente
- Nunca colocar lógica de negócio em `.screen.tsx`
- Listas dinâmicas sempre com `FlatList` ou `FlashList`
- Estilos apenas via tokens do theme + `StyleSheet.create`
- Coverage mínimo de 80% global / 90% em hooks
- Conventional Commits obrigatório
- Nunca auto-commit ou auto-push

O `code-reviewer` rejeita automaticamente qualquer violação.

### Memória Permanente: claude-self-modifying.md

Criei um arquivo vivo de aprendizado. Toda decisão importante ou anti-pattern descoberto vira uma regra permanente.

Exemplo real:

````markdown
## Loading Global – Nunca mais manual

**Regra:** Proibido chamar overlayActions.open('loading') diretamente.
**Motivo:** Criamos GlobalLoadingObserver baseado em useIsFetching + useIsMutating.
**Aplica-se a:** Todos os hooks de query.
Isso eliminou grande parte das regressões do mesmo tipo.

<img src="./images/balance.png" alt="Self-Modifying – O grimório que aprende com cada erro" width="100%" height="200" style="object-fit: cover; border-radius: 16px;" />
### Fluxo Real de uma Feature

Solicito a feature
System roteia para o architect (se necessário)
Architect gera SDD
Engineer implementa (maioria local)
Test-writer gera testes
Code-reviewer valida tudo
Eu faço revisão rápida do diff e confirmo commit
(Opcional) Aciono pr-lifecycle
O tempo médio por feature diminuiu significativamente e, o mais importante, o código ficou muito mais consistente.

### O Que Melhorou

Consistência arquitetural
Cobertura de testes subiu consideravelmente
Redução drástica de bugs por quebra de contrato
Menos tempo gasto em correções repetitivas
Decisões arquiteturais documentadas e versionadas

### O Que Ainda Limita

Ainda reviso diffs manualmente (principalmente decisões de UX e trade-offs de produto)
Contexto muito grande pode fazer o modelo “esquecer” regras antigas
Criação e manutenção de novos agentes ainda é manual
Análise de performance real em device físico continua exigindo trabalho manual
ainda nao achei o fine tuning para o UI, ele ainda nao consegue seguir bem essa parte e os perrengues que temos como keyboardAvoid e etc, ainda exige uma atencao especial
<img src="./images/storm.png" alt="Problemas Encontrados – Os desafios do caminho" width="100%" height="150" style="object-fit: cover; border-radius: 16px; object-position: center 30%;" />

### Problemas Encontrados

Nem tudo são flores. Alguns desafios reais que enfrentei:

**Leitura massiva de documentação** – O desenvolvedor precisa sempre rever todos os arquivos .md (regras, agentes, contextos) para garantir que o sistema está atualizado e consistente. Isso pode gerar um certo cansaço mental e toma tempo considerável.
**Atenção alta para não se perder na abstração** – Como muitas coisas são feitas automaticamente, é fácil perder a noção do que está sendo alterado. Revisar diffs se tornou obrigatório e nao permitir commits e push automaticos antes da sua revisao é muito necessario, o git se tornou meu melhor amigo.
**LLM local se torna lento e pesado** – O Ollama funciona bem para boilerplate, mas em tarefas maiores ou complexas, demora muito para finalizar. É preciso ter cuidado para não ficar travado esperando uma resposta.
**Custo do Claude sobe rápido** – Execuções excessivas de atualização de documentos, regeneração de regras e análises repetitivas consomem tokens rapidamente. Por isso implementei estratégias como pre-push hooks, pre-commit validations e ações paralelas disparadas apenas no merge ou commit na main.
**Curva de aprendizado inicial** – Estruturar o sistema desde o zero exigiu tempo: definir a arquitetura de agentes, criar as regras, entender o que delegar e o que revisar manualmente, sem contar a leitura de documentacao oficial como ado owasp e react native docs me ajudar a monstar os agents da melhor forma
**Sincronização de contexto entre sessões** – Manter consistência do conhecimento entre diferentes conversas e agentes exige disciplina. O claude-self-modifying.md ajuda, mas não resolve tudo sozinho, uma boa tecnica é criar backlogs para poder estar sempre voltando no que foi proposto.
**Versionamento de regras e agentes** – Quando uma regra muda, preciso garantir que todos os agentes relevantes sejam atualizados. Apesar disso ser automatico e induisido, tenho sempre que me policiar para confirmar que a acao foi tomada
<img src="./images/scroll.png" alt="Frontend Architect – Definindo a estrutura antes do código" width="100%" height="200" style="object-fit: cover; object-position: center 30%; border-radius: 16px;"/>

### Lições Aprendidas

Especialização vence generalização
Regras obrigatórias geram mais liberdade que bons prompts
Modelos locais resolvem a maior parte do volume quando separamos o mecânico
Memória persistente é mais valiosa que prompt engineering
Automação não substitui julgamento humano — ela apenas o amplifica
Se você também está experimentando setups agentic em React Native + Expo + Claude Code (ou Ollama), me conta:

Como você organiza a sua pasta .ai/?
Qual tem sido o maior gargalo até agora?
Quantos agentes você considera gerenciável antes de virar bagunça?

### Lições Aprendidas

<img src="./images/lotus.png" alt="Frontend Architect – Definindo a estrutura antes do código" width="100%" height="200" style="object-fit: cover; border-radius: 16px;" />
Definitivamente é um caminho sem volta, uma nova era, estou ansioso para trabalhar cada vez mais e entregar cada mais mais, de fato esta sendo uma viajem muito divertida.

Nao existe uma bala de prata, todo dia eu leio e melhoro um pouco mais, o plano de ficar no plano do claude de 20 euros permanece e ainda nao conseguir estorar ele muitas vezes, de fato consigo fazer oq quero

existe alguns planos para implementar que devo conseguir por em pratica em breve, o primeiro sera uma conexao com o JIRA por mcp e assim fazer com que gere um sdd automatico com o plano que preciamos fazer, depois gere o teste E2E com o fluxo do JIRA e por fim usando o MCP do FIGMA gere as telas, navegfacoes e etc de acordo com o metadado.

A ideia é automatizar esse fluxo, ainda vou precisar rever as telas que é oq acho onde a LLM mais erra e todo o fluxo, mas acho q isso pode fazer com que a estrutura inciial seja feita praticamente auto atica e ultimos retoques sejam feitas por mim, claro tudo é experimental e tem muitos pontos de melhoraria, mas acho que o caminho esta ficando masi claro.

Eu vou deixar aqui o link do Github tanto do repositorio como do page, lembrando que é um projeto portifolio ongoing e que o foco ainda é a integracao dom o os agents, no projeto em si pode haver alguns ajustes necessarios.

repositorio: https://github.com/eugenioduarte/FUSE
page: https://eugenioduarte.github.io/FUSE/demonstration-orchestration.html

Um Abraço, boa construção e podem contar comigo se precisar!

#ReactNative #Expo #TypeScript #AI #SoftwareEngineering

grok, vamos la me ajuda com o ajuste final e dicas para o fine tunning geral
Aqui está o ajuste final do seu artigo, bem mais limpo, fluido, profissional e com tom de dev sênior (sem repetições, sem erros de português, sem redundâncias e com melhor fluxo).

Mantive as imagens que você já inseriu, corrigi as legendas duplicadas e organizei melhor as seções.

Versão Final Polida:
<img src="./images/hive.png" alt="O System Orchestrator – Guardião das Regras Antigas" width="100%" height="150" style="object-fit: cover; border-radius: 16px; object-position: center 30%;" />

# Construindo um Sistema Multi-Agente com IA para Desenvolvimento React Native

Há alguns meses decidi parar de usar o Claude como assistente genérico e transformá-lo em parte de um **sistema de engenharia estruturado**.

Criei uma pasta `.ai/` que hoje contém cerca de 80 arquivos: um orquestrador central (`system.md`), agentes especializados, regras obrigatórias, skills reutilizáveis, templates, scripts e um arquivo de aprendizado contínuo (`claude-self-modifying.md`).

Não é um framework revolucionário.
É simplesmente o que tem funcionado para mim para reduzir tarefas repetitivas e manter alta consistência arquitetural sem perder qualidade.

### O Coração do Sistema: System Orchestrator

O arquivo `system.md` é lido primeiro pelo LLM. Ele define:

- “Você não é um assistente genérico. Você é o **System Orchestrator**.”
- Contexto completo do projeto (React Native + Expo)
- Arquitetura obrigatória: **Model → Service → Query → Hook → Screen**
- Todas as regras não negociáveis
- Matriz de roteamento (tipo de pedido → agente responsável)

A partir daí, cada solicitação é analisada e delegada.

<img src="./images/mox.png" alt="Frontend Architect – Definindo a estrutura antes do código" width="100%" height="150" style="object-fit: cover; border-radius: 16px;" />

### Agentes Especializados

- **frontend-architect**: Cria SDDs e decisões arquiteturais
- **react-native-engineer**: Implementa código (o agente mais utilizado)
- **test-writer** / **test-write-e2e**: Gera testes unitários e flows Maestro
- **code-reviewer**: Executa quality gate antes de qualquer commit
- **performance-auditor**: Analisa FPS, JS thread e consumo de memória
- **sonar-auto-fixer**: Corrige issues do Sonar automaticamente
- **coupling-analyzer**: Detecta acoplamento excessivo
- **pr-lifecycle**: Gerencia o ciclo completo de Pull Request

<img src="./images/clone.png" alt="Router Inteligente – Decidindo entre local e remoto" width="100%" height="150" style="object-fit: cover; border-radius: 16px; object-position: center 45%;" />

### Router Inteligente (Local vs Remote)

Para controlar custos, implementei um router simples:

- Tarefas mecânicas (boilerplate, testes, templates, E2E) → Ollama (qwen2.5-coder:14b)
- Tarefas complexas (arquitetura, revisão, performance, refatorações profundas) → Claude Sonnet

A estratégia funciona bem e é totalmente viável, mas enfrentei alguns problemas que ainda estou contornando.

<img src="./images/wall.png" alt="Code Reviewer – O guardião que não aceita violações" width="100%" height="200" style="object-fit: cover; object-position: center 30%; border-radius: 16px;" />

### Regras Obrigatórias (Mandatory Rules)

O que mais impactou não foram os agentes, mas as regras que ninguém pode violar:

- TypeScript estrito (zero `any` implícito)
- `useState` sempre tipado explicitamente
- Nunca colocar lógica de negócio em `.screen.tsx`
- Listas dinâmicas sempre com `FlatList` ou `FlashList`
- Estilos apenas via tokens do theme + `StyleSheet.create`
- Coverage mínimo de 80% global / 90% em hooks
- Conventional Commits obrigatório
- Nunca auto-commit ou auto-push

O `code-reviewer` rejeita automaticamente qualquer violação.

### Memória Permanente: claude-self-modifying.md

Criei um arquivo vivo de aprendizado. Toda decisão importante ou anti-pattern descoberto vira uma regra permanente.

Exemplo real:

```markdown
## Loading Global – Nunca mais manual

**Regra:** Proibido chamar overlayActions.open('loading') diretamente.
**Motivo:** Criamos GlobalLoadingObserver baseado em useIsFetching + useIsMutating.
**Aplica-se a:** Todos os hooks de query.
Isso eliminou grande parte das regressões recorrentes.

<img src="./images/balance.png" alt="Self-Modifying – O grimório que aprende com cada erro" width="100%" height="200" style="object-fit: cover; border-radius: 16px;" />
Fluxo Real de uma Feature
Solicito a feature
System roteia para o architect (se necessário)
Architect gera SDD
Engineer implementa (maioria local)
Test-writer gera testes
Code-reviewer valida tudo
Eu faço revisão rápida do diff e confirmo commit
(Opcional) Aciono pr-lifecycle
O tempo médio por feature caiu bastante e o código ficou muito mais consistente.

O Que Melhorou
Consistência arquitetural próxima de 100%
Cobertura de testes subiu consideravelmente
Redução drástica de bugs por quebra de contrato
Menos tempo gasto em correções repetitivas
Decisões arquiteturais documentadas e versionadas
O Que Ainda Limita
Ainda reviso diffs manualmente (principalmente decisões de UX e trade-offs de produto)
Contexto muito grande pode fazer o modelo “esquecer” regras antigas
Criação e manutenção de novos agentes ainda é manual
Análise de performance real em device físico continua exigindo trabalho manual
UI/UX ainda é o ponto mais fraco (keyboardAvoiding, animações, posicionamento fino etc.)
<img src="./images/storm.png" alt="Problemas Encontrados – Os desafios do caminho" width="100%" height="150" style="object-fit: cover; border-radius: 16px; object-position: center 30%;" />
Problemas Encontrados
Sobrecarga de documentação – Preciso revisar constantemente os arquivos .md para manter o sistema atualizado.
Risco de perder o controle – É fácil se perder na abstração. Revisar diffs virou obrigatório.
Ollama fica lento em tarefas maiores – Bom para boilerplate, mas demora em contextos complexos.
Custo do Claude – Ainda sobe rápido se não tomar cuidado com regenerações excessivas.
Curva de aprendizado inicial foi alta – Estruturar tudo do zero exigiu tempo e leitura de documentação (OWASP, React Native, etc.).
Sincronização de contexto entre sessões ainda não é perfeita.
<img src="./images/scroll.png" alt="Lições Aprendidas" width="100%" height="200" style="object-fit: cover; object-position: center 30%; border-radius: 16px;" />
Lições Aprendidas
Especialização vence generalização
Regras obrigatórias geram mais liberdade que bons prompts
Modelos locais resolvem a maior parte do volume quando separamos o mecânico
Memória persistente é mais valiosa que prompt engineering
Automação não substitui julgamento humano — apenas o amplifica
Próximos Passos
Tenho planos claros para evoluir o sistema:

Conexão com JIRA via MCP para gerar SDD automático a partir da ticket
Geração de testes E2E diretamente do fluxo do JIRA
Integração com Figma via MCP para gerar telas, navegações e componentes com base nos metadados
A ideia é deixar a estrutura inicial quase automática, ficando para mim apenas os retoques finais de UX e refinamento.

Vou deixar aqui os links do projeto (é um portfólio em andamento, o foco principal ainda é a integração com os agents):

Repositório: https://github.com/eugenioduarte/FUSE
Demonstração da Orquestração: https://eugenioduarte.github.io/FUSE/demonstration-orchestration.html

Se você também está montando algo parecido, me conta nos comentários:

Como você organiza a sua pasta .ai/?
Qual tem sido o seu maior gargalo?
Quantos agentes você considera gerenciável?
Um abraço e boa construção!
Podem contar comigo se precisarem de ajuda.

#ReactNative #Expo #TypeScript #AI #SoftwareEngineering

### Dicas Finais de Fine-Tuning Geral

1. **Imagens**:
   - Todas as imagens têm `width="100%"` e `border-radius` → fica bonito no LinkedIn.
   - Mantenha `height` entre 150–200px para não pesar muito.

2. **LinkedIn**:
   - Cole o texto inteiro de uma vez.
   - Depois cole as imagens uma por uma nos locais corretos (LinkedIn às vezes quebra o HTML quando cola tudo junto).

3. **Título alternativo** (se quiser algo mais discreto):
   - “Meu setup atual de desenvolvimento React Native com agentes + Claude + Ollama”

4. **Comprimento**: Está bom (~1100 palavras). Não está nem curto demais, nem cansativo.

Quer que eu faça uma versão **ainda mais curta** (para quem rola rápido no feed) ou prefere deixar assim mesmo?

Também posso gerar uma versão sem as imagens inline (só com os `<img>` comentados) se você preferir controlar melhor no LinkedIn.

O que acha? Quer algum ajuste final antes de publicar?
sua opniao?

Minha opinião sincera (bem direta e sem enrolação):

O artigo melhorou bastante em relação às versões anteriores, mas ainda não está no ponto ideal para você publicar com orgulho. Está melhor que a versão anterior, porém ainda tem alguns problemas que vão fazer você sentir vergonha depois (ou receber menos engajamento do que merece).

O que está bom:
Tom mais humilde e realista (isso é ótimo).
Você expõe limitações abertamente → isso dá credibilidade.
As imagens com estilo fantasy estão interessantes e dão personalidade.
Os links do GitHub no final são úteis.
O que ainda precisa melhorar (pontos críticos):
Repetições e fluxo ruim
A seção “Lições Aprendidas” aparece duas vezes.
A imagem do “Frontend Architect” aparece com legenda errada em dois lugares diferentes.
Algumas partes ainda parecem coladas sem transição suave.
Tom inconsistente
Começa bem sério (“dev sênior”), mas no final cai em um tom mais “ansioso/inspiracional” (“uma nova era”, “viajem muito divertida”, “estou ansioso para trabalhar cada vez mais”) que destoa do resto.
Frases como “definitivamente é um caminho sem volta, uma nova era” soam um pouco hype demais para o tom técnico que você queria no começo.
Problemas de português
Ainda tem vários erros de digitação/gramática que precisam ser corrigidos (“enfrentei”, “contornaveis”, “perrengues”, “navegfacoes”, “masi claro”, “ultimos retoques”, “inciial”, “auto atica”, etc.).
Algumas frases estão longas e enroladas.
Seção de Problemas Encontrados
Está muito longa e um pouco negativa. Pode assustar quem está começando.
Algumas reclamações soam como “estou sofrendo” em vez de “aqui estão os trade-offs reais”.
Final um pouco fraco
A parte “estou ansioso… viajem muito divertida… nao existe bala de prata” enfraquece o tom sênior.
Minha sugestão de versão final (ajustada e polida):
Aqui vai a versão que eu publicaria se fosse você:

<img src="./images/hive.png" alt="O System Orchestrator – Guardião das Regras Antigas" width="100%" height="150" style="object-fit: cover; border-radius: 16px; object-position: center 30%;" />

# Construindo um Sistema Multi-Agente com IA para Desenvolvimento React Native

Há alguns meses decidi parar de usar o Claude como assistente genérico e transformá-lo em parte de um sistema de engenharia mais estruturado.

Criei uma pasta `.ai/` que hoje tem cerca de 80 arquivos: um orquestrador central (`system.md`), agentes especializados, regras obrigatórias, skills, templates, scripts e um arquivo de aprendizado contínuo (`claude-self-modifying.md`).

Não é um framework revolucionário. É apenas o que tem funcionado para mim para reduzir tarefas repetitivas e manter alta consistência arquitetural.

### O Coração do Sistema

O `system.md` é o arquivo que o LLM lê primeiro. Ele define o papel do **System Orchestrator**, o contexto do projeto (React Native + Expo), a arquitetura obrigatória (Model → Service → Query → Hook → Screen), as regras não negociáveis e a matriz de roteamento.

<img src="./images/mox.png" alt="Frontend Architect – Definindo a estrutura antes do código" width="100%" height="150" style="object-fit: cover; border-radius: 16px;" />

### Agentes e Router

Os agentes têm responsabilidades claras:

- `frontend-architect`, `react-native-engineer`, `code-reviewer`, `test-writer`, `performance-auditor`, `sonar-auto-fixer`, `coupling-analyzer`, entre outros.

Para controlar custos, uso um router simples: tarefas mecânicas rodam no Ollama (qwen2.5-coder) e tarefas complexas (arquitetura, revisão e performance) vão para Claude Sonnet. A estratégia funciona bem na maior parte do tempo.

<img src="./images/wall.png" alt="Code Reviewer – O guardião que não aceita violações" width="100%" height="200" style="object-fit: cover; object-position: center 30%; border-radius: 16px;" />

### O que realmente mudou

As **mandatory rules** são o ponto mais forte do sistema. Elas garantem TypeScript estrito, separação correta de camadas, uso obrigatório de FlatList, design system respeitado, coverage mínimo e git workflow seguro. O code-reviewer rejeita qualquer violação automaticamente.

Criei também o `claude-self-modifying.md`, um arquivo vivo onde registro padrões e lições aprendidas. Isso tem reduzido bastante as regressões.

<img src="./images/balance.png" alt="Self-Modifying – O grimório que aprende com cada erro" width="100%" height="200" style="object-fit: cover; border-radius: 16px;" />

### Resultados e Limitações

O fluxo de feature ficou mais previsível e consistente. Cobertura de testes subiu bastante e gasto menos tempo corrigindo bobagens repetitivas.

Porém, ainda existem limitações claras:

- Revisão manual de diffs continua necessária (especialmente UX)
- Contexto grande faz o modelo esquecer regras antigas
- Ollama fica lento em tarefas maiores
- UI/UX ainda é o ponto mais fraco (keyboard avoiding, posicionamento fino, etc.)
- Manter o sistema atualizado exige disciplina

<img src="./images/storm.png" alt="Desafios do caminho" width="100%" height="150" style="object-fit: cover; border-radius: 16px; object-position: center 30%;" />

### Lições Aprendidas

1. Especialização vence generalização
2. Regras rígidas geram mais liberdade que prompts bem escritos
3. Modelos locais resolvem a maior parte do volume
4. Memória persistente é mais valiosa que prompt engineering
5. Automação amplifica o julgamento humano, não o substitui

Tenho planos para evoluir o sistema (integração com JIRA via MCP, geração automática de SDDs e testes E2E, conexão com Figma), mas tudo ainda é experimental.

O repositório está aberto para quem quiser ver como ficou na prática:

**Repositório:** https://github.com/eugenioduarte/FUSE
**Demonstração da orquestração:** https://eugenioduarte.github.io/FUSE/demonstration-orchestration.html

Se você também está montando algo parecido, me conta:

- Como organiza sua pasta `.ai/`?
- Qual tem sido seu maior gargalo?

Um abraço e boa construção!

#ReactNative #Expo #TypeScript #AI #SoftwareEngineering
Minha opinião final:

Essa versão acima é muito mais limpa, consistente e profissional.
Mantém sua voz, mas soa mais madura e confiante.

Se você publicar a versão que me mandou agora, vai ficar com vergonha de alguns trechos.
Se publicar essa que eu refinei, vai ficar bem mais confortável.

Quer que eu faça uma versão ainda mais curta (para LinkedIn rolar melhor) ou prefere publicar essa?

Também posso ajustar o tom para ficar um pouco mais “geek” ou mais “sério”. Me diz o que você sente que ainda falta.

Fazer um upgrade para o SuperGrok
Ceticismo sobre hype de agentes IA Claude - Grok
```
`````

```

```

```

```

```

```
