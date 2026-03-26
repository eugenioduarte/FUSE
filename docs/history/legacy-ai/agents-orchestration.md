````markdown
> **[PT]** Diagrama visual (Mermaid) do sistema de orquestração de agents — mostra o fluxo completo desde o pedido do utilizador até à execução, com mapeamento de skills, LLM routing e sequência de uma feature completa. Versão 2.0: 14 agentes consolidados em 7.

---

# Agent Orchestration

## Overview

The FUSE AI system is a **constrained engineering environment** where 7 specialized agents handle different domains. All agents share the same architectural contracts, mandatory rules, and quality gates. The orchestrator (`system.md`) analyses every incoming request and routes it to the correct agent — or handles it directly for git operations.

---

## 1 — Request Routing Flow

```mermaid
graph TB
    USER[👤 User Request]
    SYS[🧠 system.md\nOrchestrator]

    USER --> SYS

    SYS --> ARCH[🏗 architect\nDesign · SDD · Coupling Analysis]
    SYS --> ENG[⚙️ engineer\nImplement · Logic · Debug · Stage 1+2]
    SYS --> TEST[🧪 test-writer\nUnit tests · Integration · E2E]
    SYS --> REV[🛡 reviewer\nPre-merge validation · PR fix]
    SYS --> QUAL[🚀 quality\nPerformance audit · Sonar auto-fix]
    SYS --> DD[🎨 design-docs\nUI polish · README · Business→SDD]
    SYS --> PRL[🔄 pr-lifecycle\nAutonomous PR lifecycle]
    SYS --> GIT[📦 SYSTEM DIRECT\ngit operations]
```

---

## 2 — Skills Map

```mermaid
flowchart LR
    ARCH[architect]      --> SA1[project-architecture]
    ARCH                 --> SA2[ux-ui-standards]
    ARCH                 --> SA3[coupling-analysis]

    ENG[engineer]        --> SE1[react-native-best-practices]
    ENG                  --> SE2[typescript-strict-rules]
    ENG                  --> SE3[clean-code-rules]
    ENG                  --> SE4[api-integration-pattern]
    ENG                  --> SE5[project-architecture]
    ENG                  --> SE6[translations]

    TEST[test-writer]    --> ST1[clean-code-rules]
    TEST                 --> ST2[react-native-best-practices]

    REV[reviewer]        --> SR1[ALL mandatory skills]

    QUAL[quality]        --> SQ1[react-native-best-practices]
    QUAL                 --> SQ2[clean-code-rules]
    QUAL                 --> SQ3[typescript-strict-rules]

    DD[design-docs]      --> SD1[ux-ui-standards]
    DD                   --> SD2[project-architecture]

    PRL[pr-lifecycle]    --> SPR1[git-workflow]
    PRL                  --> SPR2[clean-code-rules]
```

---

## 3 — Standard Feature Flow (3-Stage Pipeline)

```mermaid
sequenceDiagram
    participant User
    participant System
    participant Architect as architect
    participant Engineer as engineer
    participant Tests as test-writer
    participant Reviewer as reviewer
    participant DD as design-docs
    participant Git

    User->>System: Feature request
    System->>Architect: Create SDD + coupling check
    Architect-->>System: SDD approved

    System->>Engineer: Implement feature (Stages 1+2: logic + functional UI)
    Engineer-->>System: Code ready

    System->>Tests: Write unit tests
    Tests-->>System: Tests passing (>=80% global, >=90% hooks)

    System->>Reviewer: Review code
    Reviewer-->>System: Approved

    System->>DD: UI Polish (Stage 3) + README update
    DD-->>System: UI production-ready, README updated

    System->>User: Confirm commit?
    User->>System: Yes
    System->>Git: Conventional commit (no auto-push)
    Git-->>User: Branch ready for PR
```

---

## 4 — LLM Routing Strategy

| Agent | Model | Reason |
|---|---|---|
| `architect` | Claude Sonnet (always) | Architectural reasoning + coupling analysis across full codebase |
| `reviewer` | Claude Sonnet (always) | Pattern recognition across codebase, nuanced quality gates |
| `design-docs` (UI + Business) | Claude Sonnet (always) | Design system + architecture understanding |
| `design-docs` (Doc Update) | Claude Haiku | Low-complexity README writing — fast and cheap |
| `pr-lifecycle` | Claude Sonnet (always) | Multi-step autonomous PR decision making |
| `test-writer` | Local qwen2.5-coder:14b | Template-driven, deterministic (unit + E2E) |
| `engineer` | Conditional | Local for boilerplate; Claude for complex refactor/integration |
| `quality` | Conditional | Local for mechanical Sonar fixes; Claude for performance analysis |

**Strategy:** Save Claude tokens for reasoning-heavy work. Use local model for repetitive mechanical tasks. Escalate to Claude only when complexity signals are detected.

---

## 5 — Inter-Agent Coordination

```mermaid
graph LR
    REV[reviewer] -->|boundary violation| ARCH[architect]
    ARCH -->|architecture guidance| REV

    QUAL[quality] -->|systemic performance issue| ARCH
    ARCH -->|redesign guidance| ENG[engineer]

    DD[design-docs] -->|Stage 3 after Stage 2| ENG
    REV -->|approved, trigger| DD
```

---

## 6 — Request -> Agent Routing Matrix

| Request type | Agent | Mode / Command |
|---|---|---|
| New feature design / SDD | `architect` | default |
| Coupling / dependency analysis | `architect` | `/analyze-coupling` |
| Feature implementation (full stack) | `engineer` | default |
| Component / hook / bug fix | `engineer` | default |
| Unit / integration tests | `test-writer` | default |
| E2E tests from flow.md | `test-writer` | `/test-e2e` |
| Pre-merge code review | `reviewer` | default |
| Fix PR review comments | `reviewer` | `/fix-pr <PR_NUMBER>` |
| SonarQube issue auto-fix | `quality` | `/fix-sonar <PR_NUMBER>` |
| Performance audit | `quality` | `/audit-performance` |
| UI polish Stage 3 | `design-docs` | `/ui-polish` |
| README auto-update | `design-docs` | `/update-readme` (pre-push) |
| Business summary to SDD | `design-docs` | `/business-to-sdd` |
| Autonomous PR lifecycle | `pr-lifecycle` | `/pr-lifecycle <PR_NUMBER>` |
| commit / push / branch | **SYSTEM DIRECT** | git-workflow rules |
| Novel / unknown request | **CREATE NEW AGENT** | — |

---

## 7 — Mandatory Rules (All Agents)

Every agent enforces the following rules from `.ai/rules/`:

| Rule file | Enforcement |
|---|---|
| `folder-structure.md` | `screens/<domain>/<screen>/` layout |
| `mandatory-rules.md` | Strict TypeScript, no barrel imports, no inline styles |
| `naming-conventions.md` | kebab-case files, domain-intent naming |
| `git-workflow.md` | Conventional commits, no auto-push, Husky enforced |

**Hard constraints (all agents, no exceptions):**
- Never bypass agent delegation
- Never auto-commit without explicit user confirmation
- Never auto-push
- Never commit `ios/` or `android/` (Expo prebuild artifacts)
- Never commit secrets (`.env`, certificates, API keys)
- Never use barrel imports
- Never hardcode UI values (use theme tokens)
- Never use `ScrollView` for dynamic lists (use `FlashList`)
- Never skip hook tests (minimum 90% coverage)

---

## 8 — Metrics & Observability

All agents log to `.ai/router/`:

| File | Contents |
|---|---|
| `token-usage.md` | Token consumption table — updated automatically on every `git push` |
| `token-usage.csv` | Raw token log (Claude + Ollama) — source for the MD table |
| `sonar-fixes.csv` | Auto-fix history & success rate |
| `pr-lifecycle.csv` | PR processing metrics |
| `orchestration.csv` | Agent invocation patterns |

**Token tracking flow:** `log-claude-tokens.sh` / `log-ollama-tokens.sh` -> `token-usage.csv` -> `generate-token-md.sh` (runs on pre-push) -> `token-usage.md` committed automatically.

````