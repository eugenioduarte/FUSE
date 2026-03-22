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
- [Architecture](#-architecture)
- [Getting Started](#-getting-started)
- [Project Structure](#-project-structure)
- [Testing](#-testing)
- [CI/CD](#-cicd)

---

## 🎯 Overview

FUSE is an **AI-powered mobile learning application** built with React Native (Expo). Users create topics, generate AI-written summaries, and practice with automatically generated challenges — quizzes, hangman, matrix, and text-answer games.

The project also serves as a **reference implementation of a full AI-assisted engineering system**: every part of the development lifecycle is handled by specialized AI agents — from writing code and tests, to managing commits, creating PRs, monitoring CI, fixing Sonar issues, addressing code reviews, and merging.

### What Makes FUSE Different

| Capability | Description |
|---|---|
| 🧠 **AI-generated content** | Summaries and challenges created by AI from user topics |
| 📴 **Offline-first** | SQLite is the single source of truth — works with no network |
| 🤖 **11 specialized agents** | Full engineering lifecycle covered end-to-end |
| 🔄 **Autonomous PR lifecycle** | Agent creates PR, monitors CI, fixes failures, resolves reviews, merges |
| 🔧 **Sonar auto-fixer** | Quality gate failures resolved automatically without human intervention |
| 🏗️ **Strict architecture** | Enforced layer separation: Screen → Hook → Repository → DAO → SQLite |
| 📊 **Living documentation** | README auto-updates on every push via the doc-designer agent |

---

## 🤖 AI-Assisted Engineering System

Every development task is routed to a specialized agent. No shortcuts.

### Agent Roster

| Agent | Responsibility | Model | Trigger |
|---|---|---|---|
| **frontend-architect** | Define architecture, write SDDs, structural decisions | Claude Sonnet | Feature planning, refactoring |
| **react-native-engineer** | Implement screens, hooks, components, services | Local → Claude | Feature implementation |
| **test-writer** | Unit tests (≥80% coverage) | Local (Ollama) | After implementation |
| **test-write-e2e** | Maestro E2E scenarios | Local (Ollama) | Complete user flows |
| **code-reviewer** | Quality gates, architectural compliance | Claude Sonnet | PR review, pre-merge |
| **performance-auditor** | Profiling, re-render analysis, optimization | Claude Sonnet | Performance issues |
| **sonar-auto-fixer** | Auto-fix SonarCloud quality gate failures | Local → Claude | Sonar gate failure |
| **coupling-analyzer** | Dependency graph analysis, architectural violations | Claude Sonnet | Architecture reviews |
| **pr-lifecycle** | Full PR: create → CI → fix → reviews → merge | Claude Sonnet | `/pr-lifecycle [PR]` |
| **pr-review-fixer** | Fix review comments on existing PRs | Local → Claude | PR review received |
| **doc-designer** | README auto-update on every push | Claude Haiku | Auto: pre-push hook |

### Standard Feature Flow

```
User Request
     ↓
frontend-architect  →  Creates SDD (.ai/_sdd/)
     ↓
react-native-engineer  →  Implements feature
     ↓
test-writer  →  Adds unit tests
     ↓
code-reviewer  →  Validates quality gates
     ↓
commit + push
     ↓
doc-designer  →  Updates README if needed  (automatic, pre-push)
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

| Failure | Detection | Fix |
|---|---|---|
| ESLint violation | `yarn lint` output | Reads file → fixes violation → verifies |
| Test failure | Jest output | Reads test + source → fixes code → re-runs |
| TypeScript error | `tsc` errors | Reads file → fixes type → re-runs lint |
| Sonar quality gate | SonarCloud API | Delegates to sonar-auto-fixer strategies |

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

### 🔧 Sonar Auto-Fixer Agent

Invoked with `/fix-sonar <PR_NUMBER>` when a SonarCloud quality gate fails. Also called internally by pr-lifecycle when it detects Sonar gate failures.

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

**Model routing:** Local Ollama (`qwen2.5-coder:14b`) for mechanical fixes. Escalates to Claude Sonnet for complex refactoring or architectural smells.

---

### 📝 Doc-Designer Agent

Runs automatically on every `git push` via the pre-push hook (`.husky/pre-push` → `.ai/scripts/update-readme.sh`). Skips automatically if only lock files, test files, or non-source files changed.

**What it updates:**
- Agent table when new agents are added or updated
- Feature descriptions when new features ship
- Tech Stack section when new packages are added to `package.json`
- Architecture diagram when layer boundaries change
- Presentation image and screenshots when new assets are added

**What it never does:** Removes existing sections. Mentions AsyncStorage as the persistence layer (it's SQLite). Runs on test-only commits.

---

### 🏗️ Frontend Architect Agent

Invoked before any non-trivial feature. Produces a **Software Design Document (SDD)** in `.ai/_sdd/` before a single line of code is written.

**SDD structure:**
- Problem statement and context
- Proposed architecture with layer diagram
- Critical file list (new + modified)
- Data models and TypeScript interfaces
- Migration strategy (if existing code changes)
- Verification checklist

Every feature implementation must reference its SDD. The react-native-engineer agent reads the SDD before writing any code.

---

### 🔍 Code Reviewer Agent

Validates every feature before it merges. Checks:
- Architecture compliance (no screen touching SQLite, no business logic in screens)
- TypeScript strict mode compliance
- Test coverage thresholds (≥80%)
- Naming conventions (kebab-case files, no PascalCase filenames)
- Import path discipline (`@/` aliases, no `../../` relative paths)
- No direct AsyncStorage calls in repositories (SQLite only)

---

### 📊 Coupling Analyzer Agent

Runs on demand or weekly. Uses [Madge](https://github.com/pahen/madge) to generate the full dependency graph, then analyzes:

| Metric | Target |
|---|---|
| Fan-Out (deps per file) | < 7 |
| Fan-In (dependents per file) | < 15 |
| Instability | 0.3 – 0.7 |
| Circular dependencies | 0 |
| Architectural violations | 0 |

Generates a full coupling report in `.ai/analysis/coupling-report-<date>.md` with a prioritized refactoring roadmap.

---

## 🔄 Development Workflow

### Standard Feature Development

```bash
# 1. Create feature branch
git checkout -b feature/notification-center

# 2. Architecture (invokes frontend-architect)
# → "Create SDD for notification center"

# 3. Implementation (invokes react-native-engineer)
# → "Implement notification center following SDD"

# 4. Tests (invokes test-writer)
# → "Add unit tests for notification hooks"

# 5. Review (invokes code-reviewer)
# → "Review notification feature code"

# 6. Commit + push + PR (fully autonomous from here)
# → "commit, push, pr"
# Claude handles the commit message, pre-push gates run,
# doc-designer updates the README if needed,
# then pr-lifecycle creates and manages the full PR lifecycle
```

### Viewing System Stats

```bash
# Agent usage statistics (last 7 days)
.ai/scripts/show-orchestration-stats.sh 7

# Token usage totals (Claude + Ollama)
.ai/router/update-token-totals.sh

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
5. **doc-designer** — README auto-update if source files changed

### CI/CD (GitHub Actions — every PR and push to `main`)

1. ESLint + TypeScript check
2. Jest tests + coverage
3. **SonarCloud analysis** — quality gate must pass
4. Build validation
5. E2E tests (Maestro)

If SonarCloud fails on a PR, the sonar-auto-fixer agent is triggered to create a fix PR automatically.

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

- 🤖 **11 Specialized AI Agents** — Architecture, engineering, testing, review, auditing, docs, PR lifecycle
- 📝 **SDD-driven development** — Every feature starts with a Software Design Document
- 🗄️ **SQLite + DAO pattern** — Typed data access objects, versioned migrations, ACID offline queue
- 🛠️ **Hybrid LLM** — Local model (Ollama) for speed; Claude for reasoning
- 🔧 **Full CI automation** — TypeScript, ESLint, Jest, Sonar, token tracking, README auto-update
- 📊 **Token tracking** — Daily AI cost monitoring across Claude and Ollama

---

## 🛠️ Tech Stack

### Core

| Library | Version | Purpose |
|---|---|---|
| React Native | 0.81+ | Mobile framework |
| Expo | ~54 | Development platform + native modules |
| TypeScript | 5+ | Type safety |
| Zustand | 5+ | Client state management |
| React Navigation | 7 | Navigation |
| React Query (@tanstack) | 5+ | Server state + background sync |

### Persistence

| Library | Purpose |
|---|---|
| **expo-sqlite** (v2) | Primary DB — offline-first single source of truth |
| AsyncStorage | Zustand `persist` middleware only (auth, theme, small UI state) |

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

- **Claude Sonnet 4.6** (Anthropic) — Architectural reasoning, code review, PR lifecycle
- **Claude Haiku 4.5** (Anthropic) — Documentation updates (doc-designer)
- **Ollama** (`qwen2.5-coder:14b`) — Local mechanical tasks (tests, boilerplate, Sonar fixes)

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
│   ├── agents/               # 11 specialized AI agents
│   ├── skills/               # Reusable agent skills
│   ├── rules/                # Naming, git, folder conventions
│   ├── router/               # LLM routing + token-usage.csv
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
└── README.md                 # Auto-maintained by doc-designer agent
```

---

## 🧪 Testing

### Strategy

| Level | Tool | Target |
|---|---|---|
| Unit | Jest + Testing Library | ≥80% coverage |
| Integration | Jest (real repositories) | Service + hook boundaries |
| E2E | Maestro | Critical user flows |

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

| Secret | Purpose |
|---|---|
| `SONAR_TOKEN` | SonarCloud analysis |
| `EXPO_TOKEN` | EAS Build |
| `APPLE_ID` / `APPLE_TEAM_ID` | iOS submission |
| `GOOGLE_SERVICE_ACCOUNT_KEY` | Android submission |

---

<div align="center">

**README auto-maintained by the [doc-designer](.ai/agents/doc-designer.md) agent on every push.**

</div>
