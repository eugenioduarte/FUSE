## FUSE — React Native Mobile Application

### STATUS - Ongoing Evolution

<!-- Brief: AI-powered learning app built with React Native (Expo) — topics, summaries, AI-generated challenges, offline-first SQLite persistence, and a full AI-assisted engineering system. -->

<img src="docs/history/legacy-ai/docs/screenshots/01_presentation.png" width="100%" />

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
| 🤖 **8 specialized agents**    | Full engineering lifecycle covered end-to-end in the `.claude/` system  |
| 🔄 **Autonomous PR lifecycle** | Agent creates PR, monitors CI, fixes failures, resolves reviews, merges |
| 🛡️ **Security specialization** | Dedicated security agent with modular OWASP-oriented skill packs        |
| 🏗️ **Strict architecture**     | Enforced layer separation: Screen → Hook → Repository → DAO → SQLite    |
| 📊 **Living documentation**    | README is checked by the design-docs agent during pre-push validation   |
| 💰 **Token economics**         | Historical usage and cost records tracked in `.claude/observability/`   |
| 📐 **Architecture as code**    | Public GitHub Pages generated directly from the live `.claude/` tree    |

---

## 🤖 AI-Assisted Engineering System

Every development task is routed to a specialized agent. No shortcuts.

### Agent Roster (v3.0.0)

> **Current source of truth:** `.claude/agents/`, `.claude/skills/`, `.claude/rules/`, `.claude/sdd/`, and the generated pages in `docs/`

| Agent                | Responsibility                                                | Model         | Trigger                                 |
| -------------------- | ------------------------------------------------------------- | ------------- | --------------------------------------- |
| **architect**        | Architecture design, SDDs, migration planning, coupling review| Claude Sonnet | Feature planning, architecture review   |
| **engineer**         | Screens, hooks, services, repositories, business logic        | Claude Sonnet | Feature implementation                  |
| **reviewer**         | Quality gates, architectural compliance, regression review    | Claude Sonnet | PR review, pre-merge                    |
| **test-writer**      | Unit and integration tests                                    | Claude Haiku  | After implementation                    |
| **quality**          | Performance analysis and engineering risk review              | Claude Sonnet | `/audit-performance`, quality gates     |
| **design-docs**      | UI polish, docs, business summary to SDD                      | Claude Haiku  | `/business-to-sdd`, `/ui-polish`        |
| **pr-lifecycle**     | Full PR: create → CI → fix → reviews → merge gate            | Claude Sonnet | `/pr-lifecycle [PR]`                    |
| **security-analyst** | OWASP-aligned security analysis across storage to resilience  | Claude Sonnet | Security audit, hardening review        |

### Token Economics

**Real sessions tracked since 2026-03-22 · [Full analysis →](.claude/observability/token-analysis.md)**

| Metric | Value | Description |
|---|---|---|
| Provider | Claude Sonnet 4.6 | Claude-only since 2026-03-25 |
| Sessions tracked | 2 | Real data only — mock data removed 2026-03-26 |
| Total tokens | 2,056,339 | Input + output across all real sessions |
| Cache reads | 369,762,715 | ~5,400x multiplier (prompt reuse via skills) |
| Total cost | $140.96 | Dominated by cache reads at $0.30/1M |

**How it works:** Stop hook (`settings.json`) fires on every session end, appends token counts to `token-usage.csv` and `orchestration.csv`. PR costs tracked separately in `pr-costs.csv` as PRs are merged.

### Standard Feature Flow

```
User Request
     ↓
architect  →  Creates SDD (.claude/sdd/)
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

**Model:** Claude Sonnet (Claude-only architecture since 2026-03-25).

---

### 📝 Design & Docs Agent

Handles three modes — UI polish, documentation, and business analysis. The doc mode runs automatically on every `git push` via the pre-push hook (`.husky/pre-push` → `.claude/scripts/update-readme.sh`). Skips automatically if only lock files, test files, or non-source files changed.

**What it updates:**

- Agent table when new agents are added or updated
- Feature descriptions when new features ship
- Tech Stack section when new packages are added to `package.json`
- Architecture diagram when layer boundaries change
- Presentation image and screenshots when new assets are added

**What it never does:** Removes existing sections. Mentions AsyncStorage as the persistence layer (it's SQLite). Runs on test-only commits.

---

### 🏗️ Architect Agent

Invoked before any non-trivial feature. Produces a **Software Design Document (SDD)** in `.claude/sdd/` before a single line of code is written.

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

Generates a coupling review and refactoring roadmap under the active architecture workflow, driven by the `architect` agent and the `coupling-analysis` skill.

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
# Token usage totals
.claude/observability/update-token-totals.sh

# Token economics analysis
cat .claude/observability/token-analysis.md

# Architecture diagrams (10 Mermaid diagrams)
cat docs/ai-system.html

# Active AI system overview
open docs/ai-system.html

# Active orchestration overview
open docs/demonstration-orchestration.html
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
5. **design-docs** — README drift check if source files changed

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

- 🤖 **8 Specialized AI Agents (v3.0.0)** — Architecture, engineering, review, tests, quality, docs, PR flow, security
- 📝 **SDD-driven development** — Every feature starts with a Software Design Document
- 🗄️ **SQLite + DAO pattern** — Typed data access objects, versioned migrations, ACID offline queue
- 🛠️ **Skills-first orchestration** — `.claude` holds live agents, skills, rules, SDDs, observability, and command entrypoints
- 🔧 **Full CI automation** — TypeScript, ESLint, Jest, Sonar, token tracking, README governance
- 📊 **Observability built in** — Token, orchestration, and PR cost records tracked in `.claude/observability`
- 📐 **Architecture visualization** — GitHub Pages generated directly from `.claude`
- 🔖 **Versioned system** — Structured agent, skill, rule, SDD, and template surfaces

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

- **Claude Sonnet 4.6** (Anthropic) — Architecture, implementation, review, security, PR lifecycle
- **Claude Haiku 4.5** (Anthropic) — Documentation and focused support flows

**Token Economics ([full analysis →](.claude/observability/token-analysis.md)):**

- Real session data tracked from 2026-03-22 via Stop hook
- CSV-backed: `token-usage.csv`, `orchestration.csv`, `pr-costs.csv`
- Claude-only architecture (no Ollama) since 2026-03-25

---

## 📐 System Architecture & Documentation

The active system architecture is documented in the generated GitHub Pages hub:

| Page                                 | Purpose                                                         |
| ------------------------------------ | --------------------------------------------------------------- |
| **docs/ai-system.html**              | Full `.claude` map: agents, skills, rules, hooks, SDDs, assets |
| **docs/demonstration-orchestration.html** | Operational view of routing, agent packs, and rule surfaces |
| **docs/analytics.html**              | Token, orchestration, and PR cost analytics                     |

### Key Documentation

- **[AI System](docs/ai-system.html)** — Complete `.claude` architecture visualization
- **[SDD System](docs/sdd-system.html)** — Enterprise design layer with domain contexts and contracts
- **[Orchestration View](docs/demonstration-orchestration.html)** — Live operational network
- **[Analytics](docs/analytics.html)** — Token, orchestration, and PR cost analytics
- **[Token Analysis](.claude/observability/token-analysis.md)** — Real session cost breakdown
- **[Agent Changelog](docs/history/legacy-ai/agents/CHANGELOG.md)** — Version history for all agents
- **[Skills](.claude/skills/)** — 23 reusable knowledge modules in the active system

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
├── .claude/                  # Active AI engineering system
│   ├── agents/               # 8 execution roles
│   ├── skills/               # Reusable knowledge modules
│   ├── rules/                # Path-scoped guardrails
│   ├── commands/             # Operational command entrypoints
│   ├── sdd/                  # Active Software Design Documents
│   ├── inbox/                # Raw summaries before SDD conversion
│   ├── observability/        # Token, orchestration, and PR telemetry
│   ├── templates/            # Reusable authoring assets
│   └── CLAUDE.md             # Primary AI entrypoint
├── docs/history/legacy-ai/   # Archived `.ai` generation for traceability
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

## 📝 Recent Updates (2026-03-26)

**Fidelity restoration, observability cleanup, and enterprise SDD layer activated:**

✅ **Skills-First Architecture (v3.0.0)**

- Active system consolidated under `.claude/` — 8 agents, 23 skills, 7 path-scoped rules
- Legacy `.ai` generation archived under `docs/history/legacy-ai/`
- `engineering-principles` and `coding-conventions` skills restored and wired to architect + engineer

✅ **Observability — Fresh Start**

- All mock/legacy CSV data removed — real sessions only from 2026-03-22
- `token-usage.csv`, `orchestration.csv`, `pr-costs.csv` — clean headers, real rows
- `token-analysis.md` rewritten for Claude-only architecture
- Stop hook active: every session end appends to CSV automatically

✅ **Enterprise SDD Layer — Active**

- `.claude/sdd/system/` confirmed active (not "proposed")
- 4 formal contracts: SDD, orchestrator, delivery, context
- Domain contexts bootstrapped: `auth`, `dashboard`
- Jira → raw intake → orchestrator → modular SDDs workflow defined

✅ **Agent Memory — Populated**

- `architect`: 3 real entries (layer contract, AI system decision, SDD status)
- `engineer`: 5 real entries (GlobalLoadingObserver, flat store, navigation, hydration, dependencies)
- `reviewer`: git commit authorship policy

✅ **GitHub Wiki — Removed**

- Wiki disabled and local wiki directory removed
- All documentation now lives in `docs/` (GitHub Pages) — single source of truth

---

<div align="center">

**README governed by the [design-docs](.claude/agents/design-docs.md) agent during pre-push validation.**

</div>
