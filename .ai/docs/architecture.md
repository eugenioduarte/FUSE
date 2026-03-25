# 🏗️ FUSE AI System Architecture

> **[PT]** Documentação consolidada da arquitetura completa do sistema FUSE AI, incluindo orquestração de agents, routing de LLMs, fluxos de dados, e integração CI/CD. Todos os diagramas em Mermaid para versionamento e renderização no GitHub.

---

## 🎯 Purpose

This document provides a comprehensive visual map of the FUSE AI orchestration system architecture. It consolidates previously scattered diagrams into a single source of truth, covering:

- System layers and component relationships
- Request routing and LLM decision logic
- Agent-to-skills mappings
- Standard workflow sequences
- Token economics and cost tracking
- CI/CD pipeline integration

All diagrams use Mermaid syntax for version control and GitHub rendering.

---

## 📊 Diagram Index

1. [System Overview](#1-system-overview) — High-level layers
2. [Request Routing Flow](#2-request-routing-flow) — How system.md orchestrates
3. [LLM Router Decision Tree](#3-llm-router-decision-tree) — Local vs Cloud logic
4. [Agent-Skills Map](#4-agent-skills-map) — Which skills each agent loads
5. [Standard Feature Flow](#5-standard-feature-flow) — SDD → Implementation → Tests → Review
6. [Inter-Agent Coordination](#6-inter-agent-coordination) — Multi-agent workflows
7. [Security Audit Pipeline](#7-security-audit-pipeline) — OWASP MAS parallel execution
8. [Data Flow Architecture](#8-data-flow-architecture) — Model → Service → Query → Hook → Screen
9. [Token Economics Flow](#9-token-economics-flow) — Cost tracking and analysis
10. [CI/CD Integration](#10-cicd-integration) — PR lifecycle automation

---

## 1. System Overview

High-level view of the FUSE AI orchestration layers.

```mermaid
graph TB
    subgraph User["👤 Developer"]
        Request[User Request]
    end

    subgraph Orchestrator["🎭 Orchestrator Layer"]
        SystemMD[system.md<br/>Master Coordinator]
    end

    subgraph Agents["🤖 Agent Layer (7 Agents — v2.0.0)"]
        direction LR
        A1[architect]
        A2[engineer]
        A3[reviewer]
        A4[test-writer]
        A5[quality]
        A6[design-docs]
        A7[pr-lifecycle]
    end

    subgraph Skills["📚 Skills Layer (9 Skills)"]
        direction LR
        S1[project-architecture]
        S2[react-native-best-practices]
        S3[clean-code-rules]
        S4[typescript-strict-rules]
        S5[api-integration-pattern]
        S6[coupling-analysis]
        S7[ux-ui-standards]
        S8[translations]
        S9[gitignore-rules]
    end

    subgraph LLM["🧠 LLM Layer"]
        Router{LLM Router}
        Local[Ollama llama3.2<br/>🏠 Local]
        Cloud[Claude Sonnet 4<br/>☁️ Remote]
    end

    subgraph Output["📤 Output"]
        Result[Code/Documentation/Analysis]
    end

    Request --> SystemMD
    SystemMD --> |selects agent| Agents
    Agents --> |loads skills| Skills
    Skills --> Router
    Router -->|simple task| Local
    Router -->|complex task| Cloud
    Local --> Result
    Cloud --> Result

    style SystemMD fill:#FFD700
    style Router fill:#FF6B6B
    style Local fill:#4ECDC4
    style Cloud fill:#95E1D3
```

---

## 2. Request Routing Flow

How `system.md` analyzes requests and routes to appropriate agents.

```mermaid
flowchart TD
    Start([User Request]) --> Parse[Parse Intent<br/>Keywords & Context]
    Parse --> Classify{Request Type?}

    Classify -->|Feature/Architecture| ArchPath[Architecture Path]
    Classify -->|Implementation| DevPath[Development Path]
    Classify -->|Quality/Review| QAPath[Quality Path]
    Classify -->|Testing| TestPath[Testing Path]
    Classify -->|Documentation| DocPath[Documentation Path]
    Classify -->|PR Management| PRPath[PR Path]

    ArchPath --> SelectArch{Complexity?}
    SelectArch -->|Architecture/SDD| AR[architect]
    SelectArch -->|Business→SDD| DD[design-docs]

    DevPath --> SelectDev{Implementation Type?}
    SelectDev -->|Feature/Component/Logic| ENG[engineer]
    SelectDev -->|UI Polish/Docs| DD2[design-docs]

    QAPath --> SelectQA{Review Type?}
    SelectQA -->|Code Review| REV[reviewer]
    SelectQA -->|Performance + Sonar| QL[quality]

    TestPath --> SelectTest{Test Type?}
    SelectTest -->|Unit/Integration| TW[test-writer]
    SelectTest -->|E2E| TW[test-writer]

    DocPath --> DD3[design-docs]

    PRPath --> SelectPR{PR Operation?}
    SelectPR -->|Full Lifecycle| PRL[pr-lifecycle]
    SelectPR -->|Fix Review Issues| REV2[reviewer]

    BA --> LoadSkills[Load Required Skills]
    FA --> LoadSkills
    CA --> LoadSkills
    RNE --> LoadSkills
    LE --> LoadSkills
    UID --> LoadSkills
    CR --> LoadSkills
    PA --> LoadSkills
    SAF --> LoadSkills
    TW --> LoadSkills
    TE2E --> LoadSkills
    DD --> LoadSkills
    PRL --> LoadSkills
    PRF --> LoadSkills

    LoadSkills --> Execute[Execute Agent]
    Execute --> End([Result])

    style Start fill:#FFD700
    style Classify fill:#FF6B6B
    style LoadSkills fill:#4ECDC4
    style End fill:#95E1D3
```

---

## 3. LLM Router Decision Tree

Complexity-based routing logic: Local (Ollama) vs Cloud (Claude).

```mermaid
flowchart TD
    Request[Agent Request] --> Analyze[Analyze Complexity Signals]

    Analyze --> CheckKeywords{Contains Complexity<br/>Keywords?}

    CheckKeywords -->|Yes| ComplexSignals[Detected Signals:<br/>• refactor<br/>• debug<br/>• architecture<br/>• integration<br/>• performance<br/>• complex<br/>• analyze]
    CheckKeywords -->|No| CheckSize{Token Count<br/>> 5000?}

    ComplexSignals --> RouteCloud[Route to Claude]

    CheckSize -->|Yes| RouteCloud
    CheckSize -->|No| CheckAgent{Agent Always<br/>Remote?}

    CheckAgent -->|Yes| ForceCloud[Force Claude:<br/>• architect<br/>• reviewer<br/>• quality (perf mode)<br/>• pr-lifecycle<br/>• design-docs (UI/BA)]
    CheckAgent -->|No| CheckMechanical{Mechanical<br/>Task?}

    ForceCloud --> RouteCloud

    CheckMechanical -->|Yes| MechanicalTasks[Mechanical Tasks:<br/>• SonarQube fixes<br/>• Formatting<br/>• Type corrections<br/>• Import sorting]
    CheckMechanical -->|No| RouteLocal[Route to Ollama]

    MechanicalTasks --> RouteLocal

    RouteCloud --> LogCloudTokens[Log to token-usage.csv<br/>Provider: claude]
    RouteLocal --> LogOllamaTokens[Log to token-usage.csv<br/>Provider: ollama]

    LogCloudTokens --> Execute[Execute Request]
    LogOllamaTokens --> Execute

    Execute --> End([Return Result])

    style Request fill:#FFD700
    style CheckKeywords fill:#FF6B6B
    style RouteCloud fill:#95E1D3
    style RouteLocal fill:#4ECDC4
    style End fill:#FFD700
```

---

## 4. Agent-Skills Map

Matrix showing which skills each agent loads into context.

```mermaid
graph TD
    subgraph Agents["🤖 Agents"]
        AR[architect]
        ENG[engineer]
        REV[reviewer]
        TW[test-writer]
        QL[quality]
        PRL[pr-lifecycle]
        DD[design-docs]
    end

    subgraph CoreSkills["📚 Core Skills"]
        ProjArch[project-architecture<br/>v1.0.0]
        RNBest[react-native-best-practices<br/>v1.0.0]
        CleanCode[clean-code-rules<br/>v1.0.0]
        TSRules[typescript-strict-rules<br/>v1.0.0]
    end

    subgraph SpecializedSkills["🎯 Specialized Skills"]
        APIInt[api-integration-pattern<br/>v1.0.0]
        Coupling[coupling-analysis<br/>v1.0.0]
        UXUI[ux-ui-standards<br/>v1.0.0]
        Trans[translations<br/>v1.0.0]
        GitIgnore[gitignore-rules<br/>v1.0.0]
    end

    FA --> ProjArch
    FA --> CleanCode
    FA --> TSRules

    RNE --> ProjArch
    RNE --> RNBest
    RNE --> CleanCode
    RNE --> TSRules
    RNE --> APIInt

    CR --> ProjArch
    CR --> RNBest
    CR --> CleanCode
    CR --> TSRules

    TW --> ProjArch
    TW --> CleanCode
    TW --> TSRules

    TE2E --> ProjArch
    TE2E --> RNBest

    PA --> ProjArch
    PA --> RNBest
    PA --> CleanCode

    SAF --> CleanCode
    SAF --> TSRules

    CA --> ProjArch
    CA --> Coupling

    PRL --> ProjArch
    PRL --> GitIgnore

    PRF --> ProjArch
    PRF --> CleanCode
    PRF --> TSRules

    BA --> ProjArch
    BA --> APIInt

    DD --> CleanCode

    LE --> ProjArch
    LE --> CleanCode
    LE --> TSRules

    UID --> ProjArch
    UID --> RNBest
    UID --> UXUI
    UID --> Trans

    style ProjArch fill:#FFD700
    style RNBest fill:#4ECDC4
    style CleanCode fill:#95E1D3
    style TSRules fill:#FF6B6B
```

---

## 5. Standard Feature Flow

Complete workflow from SDD to production-ready code.

```mermaid
sequenceDiagram
    participant User
    participant System as system.md
    participant DD as design-docs
    participant ENG as engineer
    participant TW as test-writer
    participant REV as reviewer
    participant PRL as pr-lifecycle

    User->>System: Request new feature
    System->>BA: Route to business analyst

    Note over BA: Create SDD<br/>(Software Design Document)
    BA->>BA: Define requirements
    BA->>BA: Design architecture
    BA->>BA: Plan component structure
    BA-->>System: SDD ready

    System->>RNE: Route with SDD

    Note over RNE: Implement feature
    RNE->>RNE: Create components
    RNE->>RNE: Implement business logic
    RNE->>RNE: Add UI/UX
    RNE-->>System: Implementation complete

    System->>TW: Route with implementation

    Note over TW: Write tests
    TW->>TW: Unit tests
    TW->>TW: Integration tests
    TW->>TW: Coverage validation
    TW-->>System: Tests complete

    System->>CR: Route for review

    Note over CR: Quality gates
    CR->>CR: Architecture compliance
    CR->>CR: Best practices check
    CR->>CR: Performance validation

    alt Review Fails
        CR-->>System: Issues found
        System->>RNE: Route for fixes
        RNE->>RNE: Apply corrections
        RNE-->>System: Fixed
        System->>CR: Re-review
    end

    CR-->>System: Review approved

    System->>PRL: Route for PR

    Note over PRL: PR lifecycle
    PRL->>PRL: Commit with semantic message
    PRL->>PRL: Create PR
    PRL->>PRL: Wait for CI

    alt CI Fails
        PRL->>PRL: Auto-fix issues
        PRL->>PRL: Re-run CI
    end

    PRL->>PRL: Merge to main
    PRL-->>User: Feature complete ✅

    Note over User,PRL: Typical duration: 15-30 minutes<br/>(vs 2-4 hours manual)
```

---

## 6. Inter-Agent Coordination

Multi-agent workflows for complex tasks.

```mermaid
flowchart TD
    Start([Complex Task]) --> Coordinator[system.md<br/>Coordinator]

    Coordinator --> Scenario{Task Scenario?}

    Scenario -->|Refactoring| RefactorFlow[Refactoring Flow]
    Scenario -->|Performance Issue| PerfFlow[Performance Flow]
    Scenario -->|Feature with Design| DesignFlow[Design Flow]

    RefactorFlow --> AR[architect]
    AR --> |coupling report| ENG1[engineer]
    RNE1 --> |refactored code| TW1[test-writer]
    TW1 --> |tests| REV1[reviewer]
    CR1 --> RefactorEnd([Complete])

    PerfFlow --> QL[quality]
    QL --> |bottleneck report| ENG2[engineer]
    RNE2 --> |optimized code| TW2[test-writer]
    TW2 --> |perf tests| QL2[quality]
    PA2 --> |verification| PerfEnd([Complete])

    DesignFlow --> DD[design-docs]
    DD --> |design specs| ENG3[engineer]
    ENG3 --> |implementation| REV2[reviewer]
    CR2 --> |UI validation| DesignEnd([Complete])

    RefactorEnd --> Commit[pr-lifecycle<br/>Commit & Merge]
    PerfEnd --> Commit
    DesignEnd --> Commit

    Commit --> Final([Done])

    style Start fill:#FFD700
    style Scenario fill:#FF6B6B
    style Commit fill:#4ECDC4
    style Final fill:#95E1D3
```

---

## 7. Security Audit Pipeline

OWASP Mobile Application Security (MAS) parallel execution.

```mermaid
flowchart TB
    Trigger([Security Audit Trigger]) --> QL[quality<br/>Master Coordinator]

    PA --> Spawn[Spawn 7 Parallel Sub-Agents]

    Spawn --> S1[📦 STORAGE<br/>MAS-STORAGE-1/2]
    Spawn --> S2[🔐 CRYPTO<br/>MAS-CRYPTO-1/2]
    Spawn --> S3[🔒 AUTH<br/>MAS-AUTH-1/3]
    Spawn --> S4[🌐 NETWORK<br/>MAS-NETWORK-1/2]
    Spawn --> S5[🖥️ PLATFORM<br/>MAS-PLATFORM-1/3]
    Spawn --> S6[💻 CODE<br/>MAS-CODE-1/4]
    Spawn --> S7[🔄 RESILIENCE<br/>MAS-RESILIENCE-1/4]

    S1 --> |findings| Aggregate[Aggregate Results]
    S2 --> |findings| Aggregate
    S3 --> |findings| Aggregate
    S4 --> |findings| Aggregate
    S5 --> |findings| Aggregate
    S6 --> |findings| Aggregate
    S7 --> |findings| Aggregate

    Aggregate --> Prioritize[Prioritize by Severity:<br/>🔴 Critical<br/>🟠 High<br/>🟡 Medium<br/>🟢 Low]

    Prioritize --> Report[Generate Security Report<br/>security-audit-report.md]

    Report --> AutoFix{Auto-Fixable?}

    AutoFix -->|Yes| QL2[quality<br/>Apply Fixes]
    AutoFix -->|No| Manual[Flag for Manual Review]

    SAF --> Verify[Verify Fixes]
    Manual --> End([Audit Complete])
    Verify --> End

    style Trigger fill:#FFD700
    style PA fill:#FF6B6B
    style Aggregate fill:#4ECDC4
    style Report fill:#95E1D3
    style End fill:#FFD700
```

---

## 8. Data Flow Architecture

React Native layered architecture with strict boundaries.

```mermaid
flowchart TD
    subgraph External["🌐 External"]
        Backend[Backend API]
        SQLite[(SQLite<br/>Local DB)]
    end

    subgraph ServiceLayer["🔧 Service Layer"]
        API[api/<br/>HTTP Client]
        Query[query/<br/>TanStack Query]
        Sync[sync/<br/>Background Sync]
    end

    subgraph StateLayer["📦 State Layer"]
        Store[store/<br/>Zustand]
        Hook[hooks/<br/>Custom Hooks]
    end

    subgraph UILayer["🎨 UI Layer"]
        Screen[screens/<br/>Page Components]
        Component[components/<br/>Reusable UI]
    end

    subgraph ModelLayer["📋 Model Layer"]
        Model[types/<br/>Domain Models]
        DTO[schemas/<br/>Zod DTOs]
    end

    Backend -->|REST/GraphQL| API
    API -->|validate| DTO
    DTO -->|transform| Model
    Model -->|store| SQLite

    SQLite -->|read| Query
    Query -->|cache| Query
    API -->|cache| Query

    Query -->|provide data| Hook
    Store -->|global state| Hook

    Hook -->|reactive data| Screen
    Screen -->|compose| Component

    Sync -->|offline-first| SQLite
    Sync -->|sync| Backend

    style Backend fill:#FF6B6B
    style API fill:#FFD700
    style Query fill:#4ECDC4
    style Store fill:#95E1D3
    style Hook fill:#F38181
    style Screen fill:#AA96DA
    style Model fill:#FCBAD3
    style SQLite fill:#A8D8EA

    linkStyle 0,1,2,3 stroke:#FF6B6B,stroke-width:2px
    linkStyle 4,5,6 stroke:#4ECDC4,stroke-width:2px
    linkStyle 7,8 stroke:#95E1D3,stroke-width:2px
    linkStyle 9,10 stroke:#AA96DA,stroke-width:2px
```

---

## 9. Token Economics Flow

Cost tracking and router optimization.

```mermaid
flowchart LR
    Request[Agent Request] --> Router{LLM Router}

    Router -->|simple/mechanical| Ollama[Ollama llama3.2<br/>🏠 Local<br/>$0.00/M tokens]
    Router -->|complex/critical| Claude[Claude Sonnet 4<br/>☁️ Remote<br/>$3/$15 per M tokens]

    Ollama --> LogOllama[log-ollama-tokens.sh]
    Claude --> LogClaude[log-claude-tokens.sh]

    LogOllama --> CSV[(token-usage.csv)]
    LogClaude --> CSV

    CSV --> Generate[generate-token-md.sh]
    Generate --> Report[token-usage.md<br/>📊 Summary Report]

    CSV --> Analyze[Token Analysis]
    Analyze --> Economics[token-analysis.md<br/>💰 ROI Report]

    Report --> Metrics[Key Metrics:<br/>• Total tokens/day<br/>• Claude/Ollama split<br/>• Cache efficiency]

    Economics --> Insights[Insights:<br/>• 65% cost savings<br/>• Break-even < 1 month<br/>• Optimization opportunities]

    style Request fill:#FFD700
    style Router fill:#FF6B6B
    style Ollama fill:#4ECDC4
    style Claude fill:#95E1D3
    style CSV fill:#F38181
    style Economics fill:#AA96DA
```

**Token Distribution (16-23 March 2026):**

| Provider  |   Input |    Output |  Cache Read |     Total | Cost (USD) |
| --------- | ------: | --------: | ----------: | --------: | ---------: |
| Claude    | 288,371 | 1,886,757 | 329,113,032 | 2,175,128 |    ~$29.16 |
| Ollama    | 191,800 |    86,200 |           0 |   278,000 |      $0.00 |
| **Split** | **35%** |   **65%** |       **—** |     **—** |      **—** |

**ROI:** ~35% savings vs Claude-only setup ($44.90)

---

## 10. CI/CD Integration

PR lifecycle automation with git operations.

```mermaid
sequenceDiagram
    participant Dev as Developer
    participant PRL as pr-lifecycle
    participant Git as Git Operations
    participant GH as GitHub
    participant CI as GitHub Actions
    participant QL as quality
    participant SOnar as SonarQube

    Dev->>PRL: Request PR creation

    Note over PRL: Phase 1: Pre-commit validation
    PRL->>PRL: Run ESLint
    PRL->>PRL: Run TypeScript check
    PRL->>PRL: Run unit tests

    alt Validation Fails
        PRL-->>Dev: Fix errors first
    end

    Note over PRL: Phase 2: Commit
    PRL->>Git: git add .
    PRL->>Git: git commit -m "feat: semantic message"
    PRL->>Git: git push origin feature-branch

    Note over PRL: Phase 3: Create PR
    PRL->>GH: Create PR via API
    GH->>CI: Trigger workflows

    par CI Pipeline
        CI->>CI: Build check
        CI->>CI: Test suite
        CI->>CI: Type check
        CI->>SOnar: SonarQube analysis
    end

    alt CI Fails
        CI-->>PRL: Failure notification
        PRL->>SAF: Request auto-fix
        SAF->>SAF: Analyze issues
        SAF->>Git: git commit --amend
        SAF->>Git: git push --force-with-lease
        Git->>CI: Re-trigger CI
    end

    CI-->>PRL: All checks passed ✅

    Note over PRL: Phase 4: Merge
    PRL->>GH: Merge PR (squash)
    GH->>GH: Delete feature branch

    Note over PRL: Phase 5: Post-merge
    GH->>CI: Trigger dashboard update
    CI->>CI: generate-dashboard.sh
    CI->>CI: generate-analytics.sh
    CI->>GH: Deploy to GitHub Pages

    GH-->>Dev: Feature merged & deployed 🚀

    Note over Dev,GH: Typical duration: 3-5 minutes<br/>(vs 15-30 minutes manual)
```

---

## 🗺️ Quick Reference Guide

### Component Locations

| Component             | Location                                   | Purpose                           |
| --------------------- | ------------------------------------------ | --------------------------------- |
| **Orchestrator**      | `.ai/system.md`                            | Master coordinator, routing logic |
| **Agents**            | `.ai/agents/*.md`                          | 14 specialized agents             |
| **Skills**            | `.ai/skills/*.md`                          | 9 reusable knowledge modules      |
| **Router**            | `.ai/router/router.md`                     | LLM complexity routing            |
| **Token Tracking**    | `.ai/router/token-usage.csv`               | Raw token logs                    |
| **Token Analysis**    | `.ai/router/token-analysis.md`             | Economics & ROI                   |
| **Architecture**      | `.ai/docs/architecture.md`                 | This document                     |
| **Quick Reference**   | `.ai/docs/orchestrator-quick-reference.md` | Fast lookup guide                 |
| **Project Structure** | `.ai/docs/project-structure-snapshot.md`   | Codebase map                      |
| **Agent Changelog**   | `.ai/agents/CHANGELOG.md`                  | Version history                   |

### Symbol Legend

| Symbol | Meaning      | Usage                          |
| ------ | ------------ | ------------------------------ |
| 🎭     | Orchestrator | System coordinator             |
| 🤖     | Agent        | Specialized AI worker          |
| 📚     | Skill        | Reusable knowledge module      |
| 🧠     | LLM          | Language model (Ollama/Claude) |
| 🔄     | Flow         | Process sequence               |
| 📊     | Data         | Information/metrics            |
| 🔗     | Integration  | System connection              |
| ⚡     | Performance  | Speed/optimization focus       |
| 🔒     | Security     | Safety/validation              |
| ✅     | Success      | Completed/approved             |

---

## 📖 Related Documentation

- **[Orchestrator Quick Reference](orchestrator-quick-reference.md)** — Fast decision tree for routing
- **[Project Structure Snapshot](project-structure-snapshot.md)** — Detailed codebase map
- **[Agent Changelog](../agents/CHANGELOG.md)** — Version tracking for agents
- **[Token Analysis](../router/token-analysis.md)** — Economic analysis and ROI
- **[Router Logic](../router/router.md)** — LLM complexity routing details
- **[System Orchestrator](../system.md)** — Master coordinator implementation

---

## 🔄 Document Maintenance

**Version:** 1.0.0  
**Created:** 2026-03-23  
**Last Updated:** 2026-03-23  
**Author:** Eugénio Silva

**Update Frequency:** This document should be updated when:

- New agents are added or removed
- Agent responsibilities change significantly
- Skills are added, removed, or restructured
- Routing logic is modified
- New CI/CD integrations are added

**Validation:** After updates, ensure all Mermaid diagrams render correctly on GitHub by previewing in a Mermaid-compatible editor.

---

**End of Architecture Documentation**
