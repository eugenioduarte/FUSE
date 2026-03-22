# FUSE — React Native Mobile Application

<!-- Brief: AI-powered learning app built with React Native (Expo) — topics, summaries, AI-generated challenges, offline-first SQLite persistence, and a full AI-assisted engineering system. -->

<div align="center">

![React Native](https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Expo](https://img.shields.io/badge/Expo-000020?style=for-the-badge&logo=expo&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![SQLite](https://img.shields.io/badge/SQLite-003B57?style=for-the-badge&logo=sqlite&logoColor=white)
![Jest](https://img.shields.io/badge/Jest-C21325?style=for-the-badge&logo=jest&logoColor=white)

</div>

---

## 📸 Screenshots

<div align="center">

| Dashboard | Topic Details | Challenge |
|:---:|:---:|:---:|
| _(screenshot coming soon)_ | _(screenshot coming soon)_ | _(screenshot coming soon)_ |
| [`dashboard.png`](docs/screenshots/dashboard.png) | [`topic-details.png`](docs/screenshots/topic-details.png) | [`challenge-quiz.png`](docs/screenshots/challenge-quiz.png) |

| Calendar | Summary | Profile |
|:---:|:---:|:---:|
| _(screenshot coming soon)_ | _(screenshot coming soon)_ | _(screenshot coming soon)_ |
| [`calendar.png`](docs/screenshots/calendar.png) | [`summary.png`](docs/screenshots/summary.png) | [`profile.png`](docs/screenshots/profile.png) |

> Screenshots live in [`docs/screenshots/`](docs/screenshots/). See the [guide](docs/screenshots/README.md) for capture instructions.

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [AI-Assisted Engineering System](#-ai-assisted-engineering-system)
- [Tech Stack](#️-tech-stack)
- [Architecture](#-architecture)
- [Getting Started](#-getting-started)
- [Project Structure](#-project-structure)
- [Agent Orchestration](#-agent-orchestration)
- [Development Workflow](#-development-workflow)
- [Testing](#-testing)
- [CI/CD](#-cicd)
- [Contributing](#-contributing)

---

## 🎯 Overview

FUSE is an **AI-powered mobile learning application** built with React Native (Expo). Users create topics, generate AI-written summaries, and practice with automatically generated challenges — quizzes, hangman, matrix, and text-answer games.

The project also serves as a reference implementation of a **full AI-assisted engineering system**: every part of the development lifecycle (architecture, implementation, testing, code review, performance, documentation) is handled by specialized AI agents.

### What Makes FUSE Different

| Capability | Description |
|---|---|
| 🧠 **AI-generated content** | Summaries and challenges created by AI from user topics |
| 📴 **Offline-first** | SQLite is the single source of truth — the app works with no network |
| 🤖 **Agent system** | 10 specialized AI agents covering the full engineering lifecycle |
| 🏗️ **Strict architecture** | Enforced layer separation: Screen → Hook → Repository → DAO → SQLite |
| 🔀 **Hybrid LLM routing** | Local Ollama for mechanical tasks, Claude for architectural decisions |
| 📊 **Living documentation** | README auto-updates on every push via the doc-designer agent |

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
- 👤 **Profiles** — Avatar generation, connections, payment screens

### For Developers

- 🤖 **10 Specialized AI Agents** — Architecture, engineering, testing, review, auditing, docs, PR lifecycle
- 📝 **SDD-driven development** — Every feature starts with a Software Design Document
- 🗄️ **SQLite + DAO pattern** — Typed data access objects, versioned migrations, ACID offline queue
- 🛠️ **Hybrid LLM** — Local model (Ollama) for speed; Claude for reasoning
- 🔧 **Git quality gates** — TypeScript, ESLint, Jest, token tracking, README auto-update on pre-push
- 📊 **Token tracking** — Daily AI cost monitoring across Claude and Ollama

---

## 🤖 AI-Assisted Engineering System

Every development task is routed to a specialized agent. No shortcuts.

### Agent Roster

| Agent | Responsibility | Model | Trigger |
|---|---|---|---|
| **frontend-architect** | Define architecture, write SDDs, structural decisions | Claude Sonnet (always) | Feature planning, refactoring |
| **react-native-engineer** | Implement screens, hooks, components, services | Local → Claude (escalation) | Feature implementation |
| **test-writer** | Unit tests (≥80% coverage) | Local (always) | After implementation |
| **test-write-e2e** | Maestro E2E scenarios | Local (always) | Complete user flows |
| **code-reviewer** | Quality gates, architectural compliance | Claude Sonnet (always) | PR review, pre-merge |
| **performance-auditor** | Profiling, re-render analysis, optimization | Claude Sonnet (always) | Performance issues |
| **sonar-auto-fixer** | Auto-fix SonarQube quality gate failures | Local → Claude | Sonar gate failure |
| **coupling-analyzer** | Dependency graph analysis, architectural violations | Claude Sonnet (always) | Architecture reviews |
| **pr-lifecycle** | Autonomous PR: create → CI monitor → fix → review → merge | Claude Sonnet (always) | `/pr-lifecycle [PR]` |
| **doc-designer** | Keep README.md accurate and beautiful on every push | Claude Haiku (always) | Auto: pre-push hook |

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

See [Agent Documentation](.ai/agents/README.md) for full agent specifications.

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

- **Claude Sonnet 4.6** (Anthropic) — Architectural reasoning, code review
- **Claude Haiku 4.5** (Anthropic) — Documentation updates (doc-designer)
- **Ollama** (`qwen2.5-coder:14b`) — Local mechanical tasks (tests, boilerplate)

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
API_BASE_URL=https://your-api.com
FIREBASE_API_KEY=your_key_here
# See .env.example for the full list
```

---

## 📁 Project Structure

```
FUSE/
├── .ai/                      # AI Engineering System
│   ├── agents/               # 10 specialized AI agents
│   ├── skills/               # Reusable agent skills
│   ├── rules/                # Naming, git, folder conventions
│   ├── router/               # LLM routing + token-usage.csv
│   ├── scripts/              # Automation scripts
│   ├── _sdd/                 # Software Design Documents
│   └── system.md             # Master orchestration document
│
├── src/                      # Application source code
├── docs/
│   └── screenshots/          # App screenshots for README
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

## 🎭 Agent Orchestration

### LLM Routing Strategy

```
Request arrives
     ↓
Is it architecture / structural / cross-cutting?
     → YES → Claude Sonnet (remote)
     → NO  →
          Is it mechanical? (tests, boilerplate, simple fixes)
               → YES → Ollama local (qwen2.5-coder:14b)
               → NO  → Claude Sonnet (remote)
```

### View System Stats

```bash
# Agent usage statistics (last 7 days)
.ai/scripts/show-orchestration-stats.sh 7

# Token usage totals
.ai/router/update-token-totals.sh

# Coupling analysis (full codebase)
.ai/scripts/analyze-coupling.sh full

# Future improvements progress
.ai/scripts/count-improvements-progress.sh
```

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

# 6. Commit + push + PR
# → "commit, push, pr"
# Claude handles commit message, pre-push gates run, doc-designer checks README,
# then pr-lifecycle creates and manages the PR autonomously
```

### Quality Gates

**Pre-commit** (`.husky/pre-commit`):
- ESLint + Prettier
- TypeScript compilation
- Staged file tests

**Pre-push** (`.husky/pre-push`):
1. TypeScript check (full)
2. ESLint (full)
3. Tests + coverage
4. Token usage report
5. **doc-designer** — README auto-update if code changed

**CI/CD** (GitHub Actions):
- All pre-push checks
- SonarCloud quality gate
- Build validation
- E2E tests

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

**Release Pipeline** — manual trigger:
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

## 🤝 Contributing

### Adding a New Agent

1. Create `/.ai/agents/<name>.md` following the standard structure
2. Add routing logic to `.ai/router/router.md`
3. Register in `.ai/agents/README.md`
4. Add a row to the agent table in this README (or let doc-designer handle it on next push)
5. Document in `.ai/_sdd/future-improvements.md`

### Adding Screenshots

1. Capture on iPhone 15 Pro simulator (PNG, max 800px wide)
2. Drop into `docs/screenshots/` with the correct filename (see [guide](docs/screenshots/README.md))
3. The screenshot grid in this README will auto-render — no manual edit needed

### Code Style

- Follow `.ai/rules/naming-conventions.md` — kebab-case files, no PascalCase filenames
- All new screens require: `*.screen.tsx`, `*.hook.ts`, `__tests__/`
- Repository interface: `list()`, `getById()`, `upsert()`, `deleteById()`, `onChange()`
- No business logic in screens. No direct SQLite access outside DAOs.

---

<div align="center">

**README auto-maintained by the [doc-designer](.ai/agents/doc-designer.md) agent on every push.**

</div>
