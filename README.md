## FUSE — React Native Mobile Application

### STATUS - Ongoing Evolution

<!-- Brief: AI-powered learning app built with React Native (Expo) — topics, summaries, AI-generated challenges, offline-first SQLite persistence, and a full AI-assisted engineering system. -->

<img src=".ai/docs/screenshots/01_presentation.png" width="100%" />

<div align="center">

![React Native](https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Expo](https://img.shields.io/badge/Expo-000020?style=for-the-badge&logo=expo&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![SQLite](https://img.shields.io/badge/SQLite-003B57?style=for-the-badge&logo=sqlite&logoColor=white)
![Jest](https://img.shields.io/badge/Jest-C21325?style=for-the-badge&logo=jest&logoColor=white)

</div>

---

## 🤖 AI Agents Dashboard

Live orchestration dashboard — agents, token usage, routing strategy:
👉 https://eugenioduarte.github.io/FUSE/demonstration-orchestration.html

---

## 📋 Table of Contents

- [Overview](#-overview)
- [AI-Assisted Engineering System](#-ai-assisted-engineering-system)
- [Agent Deep Dive](#-agent-deep-dive)
- [Development Workflow](#-development-workflow)
- [Quality Gates](#-quality-gates)
- [Key Features](#-key-features)
- [Tech Stack](#️-tech-stack)
- [System Architecture & Documentation](#-system-architecture--documentation)
- [Architecture](#-architecture)
- [Getting Started](#-getting-started)
- [Project Structure](#-project-structure)
- [Testing](#-testing)
- [CI/CD](#-cicd)
- [Recent Updates](#-recent-updates-2026-03-23)

---

## 🎯 Overview

FUSE is an **AI-powered mobile learning application** built with React Native (Expo). Users create topics, generate AI-written summaries, and practice with automatically generated challenges — quizzes, hangman, matrix, and text-answer games.

The project also serves as a **reference implementation of a full AI-assisted engineering system**: every part of the development lifecycle is handled by specialized AI agents — from writing code and tests, to managing commits, creating PRs, monitoring CI, fixing Sonar issues, addressing code reviews, and merging.

### What Makes FUSE Different

| Capability                     | Description                                                             |
| ------------------------------ | ----------------------------------------------------------------------- |
| 🧠 **AI-generated content**    | Summaries and challenges created by AI from user topics                 |
| 📴 **Offline-first**           | SQLite is the single source of truth — works with no network            |
| 🤖 **7 specialized agents**    | Full engineering lifecycle covered end-to-end (v2.0.0)                  |
| 🔄 **Autonomous PR lifecycle** | Agent creates PR, monitors CI, fixes failures, resolves reviews, merges |
| 🔧 **Sonar auto-fixer**        | Quality gate failures resolved automatically without human intervention |
| 🏗️ **Strict architecture**     | Enforced layer separation: Screen → Hook → Repository → DAO → SQLite    |
| 📊 **Living documentation**    | README auto-updates on every push via the design-docs agent             |
| 💰 **Token economics**         | 65% local routing (Ollama) with ~35% cost savings vs Claude-only        |
| 📐 **Architecture as code**    | 10 Mermaid diagrams with complete system visualization                  |

---

## 🤖 AI-Assisted Engineering System

Every development task is routed to a specialized agent. No shortcuts.

### Agent Roster (v2.0.0)

> **Version tracking:** All agents versioned with [semantic versioning](.ai/agents/CHANGELOG.md) · Skills have [YAML metadata headers](.ai/skills/)

| Agent            | Responsibility                                               | Model          | Trigger                                 |
| ---------------- | ------------------------------------------------------------ | -------------- | --------------------------------------- |
| **architect**    | Architecture design, SDDs, coupling analysis                 | Claude Sonnet  | Feature planning, architecture review   |
| **engineer**     | Screens, hooks, components, services, business logic         | Local → Claude | Feature implementation                  |
| **reviewer**     | Quality gates, architectural compliance, fix review comments | Claude Sonnet  | PR review, pre-merge, `/fix-pr`         |
| **test-writer**  | Unit tests (≥80% coverage) + Maestro E2E scenarios           | Local (Ollama) | After implementation, `/test-e2e`       |
| **quality**      | Performance auditing + SonarCloud auto-fixer                 | Local → Claude | `/audit-performance`, `/fix-sonar`      |
| **design-docs**  | UI/UX, README auto-update, business requirements → SDD       | Sonnet / Haiku | UI polish, pre-push, `/business-to-sdd` |
| **pr-lifecycle** | Full PR: create → CI → fix → reviews → merge                 | Claude Sonnet  | `/pr-lifecycle [PR]`                    |

### Token Economics

**Period:** 16-23 March 2026 · **[Full analysis →](.ai/router/token-analysis.md)**

| Metric                  | Value     | Description                              |
| ----------------------- | --------- | ---------------------------------------- |
| 🏠 **Local routing**    | 65%       | Requests handled by Ollama (llama3.2)    |
| ☁️ **Remote routing**   | 35%       | Complex tasks escalated to Claude Sonnet |
| 💰 **Cost savings**     | ~35%      | vs Claude-only architecture              |
| ⚡ **Cache efficiency** | 173x      | Multiplier on Claude (prompt reuse)      |
| 📈 **ROI break-even**   | < 1 month | Investment recovered                     |

**How it works:** The [LLM router](.ai/router/router.md) analyzes request complexity (keywords: `refactor`, `debug`, `architecture`, `integration`) and routes to local (fast, free) or remote (reasoning-heavy) models automatically.

### Standard Feature Flow

```
User Request
     ↓
architect  →  Creates SDD (.ai/_sdd/)
     ↓
engineer  →  Implements feature
     ↓
test-writer  →  Adds unit tests
     ↓
reviewer  →  Validates quality gates
     ↓
commit + push
     ↓
design-docs  →  Updates README if needed  (automatic, pre-push)
     ↓
pr-lifecycle  →  Creates PR, monitors CI, addresses reviews, merges
```

---

## 🔍 Agent Deep Dive

### 🔄 PR Lifecycle Agent

The most powerful agent in the system. Invoked with `/pr-lifecycle` (or `/pr-lifecycle 123` to resume an existing PR), it handles the **complete pull request lifecycle with no human intervention**:

**Phase 1 — Create PR**

- Reads the commit history from the current branch
- Derives a meaningful PR title and writes a structured body (summary + test plan)
- Pushes the branch and creates the PR via `gh pr create`

**Phase 2 — Monitor CI and Fix Failures**

- Watches the GitHub Actions pipeline (`gh pr checks --watch`)
- On failure, fetches the full run logs (`gh run view --log-failed`)
- Identifies the failure type and applies the correct fix strategy:

| Failure            | Detection          | Fix                                              |
| ------------------ | ------------------ | ------------------------------------------------ |
| ESLint violation   | `yarn lint` output | Reads file → fixes violation → verifies          |
| Test failure       | Jest output        | Reads test + source → fixes code → re-runs       |
| TypeScript error   | `tsc` errors       | Reads file → fixes type → re-runs lint           |
| Sonar quality gate | SonarCloud API     | Delegates to `quality` agent (`/fix-sonar` mode) |

- After fixing, commits and pushes (`fix: <description>`) then re-polls CI
- Max 3 fix attempts per unique failure before stopping and reporting

**Phase 3 — Address Review Comments**

- Fetches all review comments via `gh api` and `gh pr view`
- For each unresolved comment: reads the referenced file and line, applies the change, commits
- Replies to each comment with the commit SHA and explanation
- Creates a single focused commit per review round

**Phase 4 — Merge**

- Waits for `reviewDecision === "APPROVED"` and all checks green
- Squash-merges and deletes the branch (`gh pr merge --squash --delete-branch`)
- Confirms final state (`gh pr view --json state`)

**Safety rules:** Never force-pushes. Never modifies `services/firebase/` or auth/payment flows without explicit confirmation. Always creates new commits — never amends published ones.

---

### 🔧 Quality Agent (Performance + Sonar)

Invoked with `/fix-sonar <PR_NUMBER>` when a SonarCloud quality gate fails, or `/audit-performance` for profiling. Also called internally by pr-lifecycle when it detects Sonar gate failures. Consolidated into the `quality` agent.

**What it does:**

1. Fetches all open Sonar issues via the SonarCloud API for the PR branch
2. Categorizes each issue into **auto-fixable** vs. **manual review required**
3. Applies fixes for auto-fixable issues:
   - Unused imports and variables
   - Cognitive complexity (extracts nested logic into functions)
   - Code duplication (extracts shared code)
   - Magic numbers (extracts named constants)
   - Missing TypeScript types
   - Empty functions, formatting issues
4. Validates all fixes pass `typecheck + lint + tests` before committing
5. Creates a dedicated fix branch (`fix/sonar-pr-<NUMBER>`) and PR
6. Comments on the original PR with a summary: what was fixed, what needs manual review, quality score before/after

**What it never auto-fixes:** Security vulnerabilities, authentication/authorization logic, cryptographic operations, anything in `services/firebase/`.

**Model routing:** Local Ollama (`llama3.2`) for mechanical fixes. Escalates to Claude Sonnet for complex refactoring or architectural smells.

---

### 📝 Design & Docs Agent

Handles three modes — UI polish, documentation, and business analysis. The doc mode runs automatically on every `git push` via the pre-push hook (`.husky/pre-push` → `.ai/scripts/update-readme.sh`). Skips automatically if only lock files, test files, or non-source files changed.

**What it updates:**

- Agent table when new agents are added or updated
- Feature descriptions when new features ship
- Tech Stack section when new packages are added to `package.json`
- Architecture diagram when layer boundaries change
- Presentation image and screenshots when new assets are added

**What it never does:** Removes existing sections. Mentions AsyncStorage as the persistence layer (it's SQLite). Runs on test-only commits.

---

### 🏗️ Architect Agent

Invoked before any non-trivial feature. Produces a **Software Design Document (SDD)** in `.ai/_sdd/` before a single line of code is written.

**SDD structure:**

- Problem statement and context
- Proposed architecture with layer diagram
- Critical file list (new + modified)
- Data models and TypeScript interfaces
- Migration strategy (if existing code changes)
- Verification checklist

Every feature implementation must reference its SDD. The engineer agent reads the SDD before writing any code.

---

### 🔍 Reviewer Agent

Validates every feature before it merges. Checks:

- Architecture compliance (no screen touching SQLite, no business logic in screens)
- TypeScript strict mode compliance
- Test coverage thresholds (≥80%)
- Naming conventions (kebab-case files, no PascalCase filenames)
- Import path discipline (`@/` aliases, no `../../` relative paths)
- No direct AsyncStorage calls in repositories (SQLite only)

---

### 📊 Coupling Analysis (via Architect Agent)

Runs on demand or weekly. Uses [Madge](https://github.com/pahen/madge) to generate the full dependency graph, then analyzes:

| Metric                       | Target    |
| ---------------------------- | --------- |
| Fan-Out (deps per file)      | < 7       |
| Fan-In (dependents per file) | < 15      |
| Instability                  | 0.3 – 0.7 |
| Circular dependencies        | 0         |
| Architectural violations     | 0         |

Generates a full coupling report in `.ai/analysis/coupling-report-<date>.md` with a prioritized refactoring roadmap. Invoked via the `architect` agent.

---

## 🔄 Development Workflow

### Standard Feature Development

```bash
# 1. Create feature branch
git checkout -b feature/notification-center

# 2. Architecture (invokes architect)
# → "Create SDD for notification center"

# 3. Implementation (invokes engineer)
# → "Implement notification center following SDD"

# 4. Tests (invokes test-writer)
# → "Add unit tests for notification hooks"

# 5. Review (invokes reviewer)
# → "Review notification feature code"

# 6. Commit + push + PR (fully autonomous from here)
# → "commit, push, pr"
# Claude handles the commit message, pre-push gates run,
# design-docs updates the README if needed,
# then pr-lifecycle creates and manages the full PR lifecycle
```

### Viewing System Stats

```bash
# Agent usage statistics (last 7 days)
.ai/scripts/show-orchestration-stats.sh 7

# Token usage totals (Claude + Ollama)
.ai/router/update-token-totals.sh

# Token economics analysis
cat .ai/router/token-analysis.md

# Architecture diagrams (10 Mermaid diagrams)
cat .ai/docs/architecture.md

# Agent version history
cat .ai/agents/CHANGELOG.md

# Coupling analysis (full codebase)
.ai/scripts/analyze-coupling.sh full

# PR lifecycle status check
.ai/scripts/pr-lifecycle.sh 123
```

---

## 🛡️ Quality Gates

### Pre-commit (`.husky/pre-commit`)

- ESLint + Prettier on staged files
- TypeScript compilation check
- Jest tests for staged files only

### Pre-push (`.husky/pre-push`)

1. TypeScript check (full project)
2. ESLint (full project)
3. Jest tests + coverage report
4. Token usage report (daily AI cost monitoring)
5. **design-docs** — README auto-update if source files changed

### CI/CD (GitHub Actions — every PR and push to `main`)

1. ESLint + TypeScript check
2. Jest tests + coverage
3. **SonarCloud analysis** — quality gate must pass
4. Build validation
5. E2E tests (Maestro)

If SonarCloud fails on a PR, the quality agent (/fix-sonar mode) is triggered to create a fix PR automatically.

---

## ✨ Key Features

### For Users

- 📚 **Topics & Summaries** — Create learning topics; AI generates structured summaries with expandable terms
- 🎮 **Challenges** — Practice with 4 game types: Quiz, Hangman, Matrix, Text Answer
- 📅 **Calendar** — Schedule and track study sessions
- 📴 **Offline-First** — Full app functionality without a network connection (SQLite + background sync)
- 🔄 **Auto-Sync** — Background sync indicator shows live state: syncing / error / offline
- 🌍 **Multi-language** — Full internationalization (EN + PT)
- 🎨 **Theming** — Dynamic color theming per topic; dark/light mode support
- 👤 **Profiles** — Avatar, connections, payment screens

### For Developers

- 🤖 **7 Specialized AI Agents (v2.0.0)** — Architecture, engineering, testing, review, auditing, docs, PR lifecycle
- 📝 **SDD-driven development** — Every feature starts with a Software Design Document
- 🗄️ **SQLite + DAO pattern** — Typed data access objects, versioned migrations, ACID offline queue
- 🛠️ **Hybrid LLM** — Local model (Ollama) for speed; Claude for reasoning (65% local / 35% remote)
- 🔧 **Full CI automation** — TypeScript, ESLint, Jest, Sonar, token tracking, README auto-update
- 📊 **Token economics** — ~35% cost savings with 173x cache efficiency (full ROI analysis)
- 📐 **Architecture visualization** — 10 Mermaid diagrams (system flows, routing, CI/CD)
- 🔖 **Versioned system** — Semantic versioning for agents + YAML headers for skills

---

## 🛠️ Tech Stack

### Core

| Library                 | Version | Purpose                               |
| ----------------------- | ------- | ------------------------------------- |
| React Native            | 0.81+   | Mobile framework                      |
| Expo                    | ~54     | Development platform + native modules |
| TypeScript              | 5+      | Type safety                           |
| Zustand                 | 5+      | Client state management               |
| React Navigation        | 7       | Navigation                            |
| React Query (@tanstack) | 5+      | Server state + background sync        |

### Persistence

| Library              | Purpose                                                         |
| -------------------- | --------------------------------------------------------------- |
| **expo-sqlite** (v2) | Primary DB — offline-first single source of truth               |
| AsyncStorage         | Zustand `persist` middleware only (auth, theme, small UI state) |

### UI & Animations

- **React Native Reanimated** — Performant animations
- **React Native Skia** — 2D graphics and arcs
- **Expo Blur** — Native blur effects
- **Victory Native** — Charts and data visualization

### Development Tools

- **Jest** + **Testing Library** — Unit and integration tests
- **Maestro** — E2E testing
- **ESLint** + **Prettier** — Code quality
- **Husky** + **lint-staged** — Git hooks
- **SonarCloud** — Static analysis and quality gates
- **Madge** — Dependency graph analysis

### AI

- **Claude Sonnet 4** (Anthropic) — Architectural reasoning, code review, PR lifecycle (35% of requests)
- **Claude Haiku 4** (Anthropic) — Documentation updates (design-docs)
- **Ollama llama3.2** — Local mechanical tasks (tests, boilerplate, Sonar fixes) (65% of requests)

**Token Economics ([full analysis →](.ai/router/token-analysis.md)):**

- 65% local routing saves ~35% vs Claude-only
- 173x cache efficiency on Claude (prompt reuse)
- ROI break-even in < 1 month

---

## 📐 System Architecture & Documentation

The complete system architecture is documented with **10 Mermaid diagrams** in [.ai/docs/architecture.md](.ai/docs/architecture.md):

| Diagram                         | Purpose                                                  |
| ------------------------------- | -------------------------------------------------------- |
| **1. System Overview**          | Orchestrator → Agents → Skills → LLM layers              |
| **2. Request Routing Flow**     | How `system.md` distributes requests to agents           |
| **3. LLM Router Decision Tree** | Local vs Cloud complexity-based routing                  |
| **4. Agent-Skills Map**         | Which skills each agent loads                            |
| **5. Standard Feature Flow**    | SDD → Implementation → Tests → Review → PR               |
| **6. Inter-Agent Coordination** | Multi-agent workflows (refactoring, performance, design) |
| **7. Security Audit Pipeline**  | OWASP MAS with 7 parallel sub-agents                     |
| **8. Data Flow Architecture**   | Model → Service → Query → Hook → Screen                  |
| **9. Token Economics Flow**     | Cost tracking and LLM router decisions                   |
| **10. CI/CD Integration**       | PR lifecycle with GitHub Actions automation              |

### Key Documentation

- **[Architecture Diagrams](.ai/docs/architecture.md)** — Complete system visualization
- **[Agent Changelog](.ai/agents/CHANGELOG.md)** — Version history for all agents
- **[Token Analysis](.ai/router/token-analysis.md)** — Economic analysis and ROI (16-23 March 2026)
- **[Orchestrator Reference](.ai/docs/orchestrator-quick-reference.md)** — Fast decision tree
- **[Skills](.ai/skills/)** — 9 reusable knowledge modules (all with YAML version headers)

---

## 🏗 Architecture

### Layer Model

```
┌─────────────────────────────────────────────┐
│  Screen Layer                               │
│  Pure presentation. No business logic.      │
└──────────────────────┬──────────────────────┘
                       ↓
┌─────────────────────────────────────────────┐
│  Hook Layer                                 │
│  Business logic. Calls repositories.        │
└──────────────────────┬──────────────────────┘
                       ↓
┌─────────────────────────────────────────────┐
│  Repository Layer                           │
│  Reads from SQLite. Syncs with API in bg.   │
│  Enqueues mutations to offline queue.       │
└──────────────────────┬──────────────────────┘
                       ↓
┌─────────────────────────────────────────────┐
│  DAO Layer  (src/lib/db/dao/)               │
│  Typed SQL wrappers per entity.             │
│  JSON column serialisation / deserialisation│
└──────────────────────┬──────────────────────┘
                       ↓
┌─────────────────────────────────────────────┐
│  SQLite  (fuse.db — expo-sqlite v2)         │
│  Single source of truth.                    │
│  Tables: topics · summaries · challenges    │
│          calendar_events · offline_queue    │
└─────────────────────────────────────────────┘
```

### Offline-First Pattern

```
Screen Entry
     ↓
Repository.list()  →  reads SQLite instantly (works offline)
     ↓ (parallel background task)
API fetch success  →  Repository.upsert()  →  writes SQLite  →  UI refreshes
API fetch failure  →  app shows last SQLite state + SyncIndicator (red dot)
```

**Rule:** No layer imports from a layer above it. No screen touches SQLite directly.

### Folder Structure

```
src/
├── screens/          # Feature screens (one folder per screen)
├── components/       # Reusable UI components
├── hooks/            # Shared business logic hooks
├── services/
│   ├── repositories/ # Data access (reads SQLite, syncs API)
│   ├── firebase/     # Firebase integration
│   ├── ai/           # AI content generation
│   └── sync/         # Offline queue processor
├── lib/
│   └── db/
│       ├── db.ts         # SQLite singleton + migration runner
│       ├── migrations.ts # Versioned schema migrations
│       └── dao/          # One DAO file per entity
├── store/            # Zustand stores (UI state, sync status)
├── navigation/       # Navigation configuration + manager
├── locales/          # i18n translation files (EN, PT)
├── types/            # TypeScript domain models
└── storage/          # offlineQueue.ts (SQLite-backed)
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ (use [nvm](https://github.com/nvm-sh/nvm))
- **Yarn** 4+ (corepack enabled)
- **Xcode** 15+ (for iOS) + CocoaPods
- **Android Studio** (for Android)
- **Expo CLI** (`npx expo`)

### Installation

```bash
# Clone repository
git clone https://github.com/eugenioduarte/FUSE.git
cd FUSE

# Install dependencies
yarn install

# Install iOS pods
cd ios && pod install && cd ..

# Start Expo development server
yarn start

# Run on iOS simulator
yarn ios

# Run on Android emulator
yarn android
```

### Environment Variables

```bash
# Copy example config
cp .env.example .env

# Required variables
EXPO_PUBLIC_ANTHROPIC_API_KEY=your_key_here
EXPO_PUBLIC_FIREBASE_API_KEY=your_key_here
# See .env.example for the full list
```

---

## 📁 Project Structure

```
FUSE/
├── .ai/                      # AI Engineering System
│   ├── agents/               # 7 specialized AI agents (v2.0.0)
│   │   └── CHANGELOG.md      # Version tracking for all agents
│   ├── skills/               # 9 reusable agent skills (all v1.0.0 with YAML headers)
│   ├── rules/                # Naming, git, folder conventions
│   ├── router/               # LLM routing logic
│   │   ├── token-usage.csv   # Raw token logs (Claude + Ollama)
│   │   ├── token-usage.md    # Token summary report
│   │   └── token-analysis.md # Economic analysis (ROI, cost savings)
│   ├── docs/                 # System documentation
│   │   ├── architecture.md   # 10 Mermaid diagrams (consolidated)
│   │   └── orchestrator-quick-reference.md
│   ├── scripts/              # Automation scripts
│   ├── _sdd/                 # Software Design Documents
│   └── system.md             # Master orchestration document
│
├── src/                      # Application source code
├── assets/                   # Static assets (icons, images, fonts)
├── __mocks__/                # Centralized Jest mocks
├── .husky/                   # Git hooks (pre-commit, pre-push)
├── .maestro/                 # E2E test scenarios
│
├── App.tsx                   # Application entry point
├── app.config.js             # Expo config (dynamic)
├── package.json
├── tsconfig.json
├── jest.config.js
└── README.md                 # Auto-maintained by design-docs agent
```

---

## 🧪 Testing

### Strategy

| Level       | Tool                     | Target                    |
| ----------- | ------------------------ | ------------------------- |
| Unit        | Jest + Testing Library   | ≥80% coverage             |
| Integration | Jest (real repositories) | Service + hook boundaries |
| E2E         | Maestro                  | Critical user flows       |

### Running Tests

```bash
# All tests
yarn test

# Watch mode
yarn test:watch

# Coverage report
yarn test:coverage

# Single file
yarn test src/services/repositories/topics.repository.test.ts

# E2E
yarn e2e
```

---

## 🚀 CI/CD

### GitHub Actions

**CI Pipeline** — triggers on PR and push to `main`:

1. Lint
2. TypeScript check
3. Tests + coverage
4. SonarCloud analysis

**Release Pipeline** — automatic (configuration in progress):

1. EAS Build (development / preview / production)
2. Submit to App Store Connect + Google Play

### Required Secrets

| Secret                       | Purpose             |
| ---------------------------- | ------------------- |
| `SONAR_TOKEN`                | SonarCloud analysis |
| `EXPO_TOKEN`                 | EAS Build           |
| `APPLE_ID` / `APPLE_TEAM_ID` | iOS submission      |
| `GOOGLE_SERVICE_ACCOUNT_KEY` | Android submission  |

---

## 📝 Recent Updates (2026-03-23)

**System now production-ready with full governance and audit trail:**

✅ **Versioning System**

- All 7 agents tracked with semantic versioning (v2.0.0)
- All 9 skills have YAML metadata headers (name, version, author, dates)
- [CHANGELOG.md](.ai/agents/CHANGELOG.md) for complete version history

✅ **Architecture Documentation**

- [10 Mermaid diagrams](.ai/docs/architecture.md) covering complete system
- System Overview, Request Routing, LLM Router, Agent-Skills Map, Feature Flow, CI/CD, etc.
- Consolidated documentation replaces scattered diagrams

✅ **Token Economics**

- [Detailed analysis](.ai/router/token-analysis.md) with real data (16-23 March)
- 65% local routing (Ollama) / 35% remote (Claude)
- ~35% cost savings vs Claude-only setup
- 173x cache efficiency multiplier
- ROI break-even < 1 month

✅ **GitHub Pages Updates**

- [Dashboard](https://eugenioduarte.github.io/FUSE/demonstration-orchestration.html) with Architecture & Versioning section
- [Analytics](https://eugenioduarte.github.io/FUSE/analytics.html) with Token Economics KPIs

---

<div align="center">

**README auto-maintained by the [design-docs](.ai/agents/design-docs.md) agent on every push.**

</div>
