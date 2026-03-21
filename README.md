# FUSE - React Native Mobile Application

<!-- Brief: Professional React Native (Expo) mobile application featuring an innovative AI-assisted engineering system with specialized agents for development, testing, and quality assurance -->

![React Native](https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Expo](https://img.shields.io/badge/Expo-000020?style=for-the-badge&logo=expo&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Jest](https://img.shields.io/badge/Jest-C21325?style=for-the-badge&logo=jest&logoColor=white)

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [AI-Assisted Engineering System](#-ai-assisted-engineering-system)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Getting Started](#-getting-started)
- [Project Structure](#-project-structure)
- [Agent Orchestration](#-agent-orchestration)
- [Development Workflow](#-development-workflow)
- [Testing](#-testing)
- [CI/CD](#-cicd)
- [Documentation](#-documentation)
- [Contributing](#-contributing)

---

## 🎯 Overview

FUSE is a **production-ready React Native (Expo) mobile application** that showcases modern software engineering practices with an innovative twist: a comprehensive **AI-assisted engineering system** powered by specialized agents.

The project demonstrates how AI agents can be systematically integrated into the development lifecycle to handle architecture, implementation, testing, code review, performance auditing, and more—while maintaining strict architectural boundaries and quality standards.

### What Makes This Project Different

- ✨ **Agent Orchestration System** - Intelligent routing to specialized AI agents
- 🏗️ **Strict Architecture** - Enforced layer separation (Model → Service → Query → Hook → Screen)
- 🔒 **Type Safety** - Strict TypeScript with runtime validation
- 🎨 **Design System** - Consistent UI patterns and components
- 🧪 **High Test Coverage** - ≥80% coverage requirement
- 📊 **Automated Quality Gates** - Pre-commit and pre-push validations
- 🔄 **Hybrid LLM Routing** - Local (Ollama) for mechanical tasks, Claude for architectural decisions
- 📈 **Token Usage Tracking** - Monitor AI usage and cost optimization

---

## ✨ Key Features

### For Users

- 📱 **Cross-Platform** - iOS, Android, and Web support via Expo
- 🎨 **Modern UI** - Smooth animations with React Native Reanimated
- 📅 **Calendar & Challenges** - Interactive features with real-time updates
- 👤 **User Profiles** - Avatar generation, customization, authentication
- 🔄 **Offline Support** - AsyncStorage for local data persistence
- 🌍 **Internationalization** - Multi-language support (EN, PT)

### For Developers

- 🤖 **8 Specialized AI Agents** - Architecture, engineering, testing, review, auditing, auto-fixing
- 📝 **Comprehensive Documentation** - System contracts, skills, rules, and guides
- 🛠️ **Developer Tools** - Scripts for coupling analysis, token tracking, orchestration stats
- 🔧 **Git Workflow** - Conventional commits, Husky hooks, automated quality gates
- 📊 **Metrics & Analytics** - Track coupling, token usage, orchestration patterns

---

## 🤖 AI-Assisted Engineering System

This project features a **unique AI orchestration system** that delegates tasks to specialized agents:

### Available Agents

| Agent                     | Purpose                                                | LLM             | Trigger                        |
| ------------------------- | ------------------------------------------------------ | --------------- | ------------------------------ |
| **frontend-architect**    | Define architecture, create SDDs, structural decisions | Claude (always) | Feature planning, refactoring  |
| **react-native-engineer** | Implement features following patterns                  | Local/Claude    | Component/hook/screen creation |
| **test-writer**           | Generate unit tests with high coverage                 | Local (always)  | After implementation           |
| **test-write-e2e**        | Create E2E tests with Maestro                          | Local (always)  | Complete user flows            |
| **code-reviewer**         | Enforce quality gates, detect violations               | Claude (always) | PR review, pre-merge           |
| **performance-auditor**   | Profile and optimize performance                       | Claude (always) | Performance issues             |
| **sonar-auto-fixer**      | Auto-fix SonarQube issues                              | Local/Claude    | Quality gate failures          |
| **coupling-analyzer**     | Analyze and improve code coupling                      | Claude (always) | Architecture reviews           |

### Agent Orchestration Flow

```
User Request
     ↓
System Orchestrator (analyzes & routes)
     ↓
┌────────────────────────────────────────┐
│  1. frontend-architect → Creates SDD   │
│  2. react-native-engineer → Implements │
│  3. test-writer → Adds tests           │
│  4. code-reviewer → Validates          │
│  5. User confirms → Commit             │
└────────────────────────────────────────┘
```

**Key Principle:** The system orchestrator routes requests to appropriate agents, validates results against rules, and ensures quality gates pass before any commit.

See [Agent Documentation](.ai/agents/README.md) for details.

---

## 🛠 Tech Stack

### Core

- **React Native** 0.81+ - Mobile framework
- **Expo** ~54 - Development platform
- **TypeScript** - Type safety
- **Zustand** - State management
- **React Navigation** 7 - Navigation
- **React Query** (@tanstack) - Server state

### UI & Animations

- **React Native Reanimated** - Performant animations
- **React Native Skia** - 2D graphics
- **Expo Blur** - Native blur effects
- **Victory Native** - Data visualization

### Development Tools

- **Jest** + **Testing Library** - Unit testing
- **Maestro** - E2E testing
- **ESLint** + **Prettier** - Code quality
- **Husky** + **lint-staged** - Git hooks
- **SonarCloud** - Code analysis

### AI Integration

- **Claude Sonnet 4.6** (Anthropic) - Architectural reasoning
- **Ollama** (qwen2.5-coder:14b) - Local mechanical tasks
- **Madge** - Dependency analysis
- **Custom Scripts** - Token tracking, coupling analysis

---

## 🏗 Architecture

### Layer Separation

```
┌─────────────────────────────────────────┐
│ Screen Layer (UI + Navigation)          │
│  - Pure presentation                    │
│  - No business logic                    │
└──────────────┬──────────────────────────┘
               ↓
┌─────────────────────────────────────────┐
│ Hook Layer (Business Logic)             │
│  - Orchestrates queries/mutations       │
│  - Transforms data for UI               │
└──────────────┬──────────────────────────┘
               ↓
┌─────────────────────────────────────────┐
│ Query Layer (Async Orchestration)       │
│  - React Query hooks                    │
│  - Cache management                     │
└──────────────┬──────────────────────────┘
               ↓
┌─────────────────────────────────────────┐
│ Service Layer (Data Transformation)     │
│  - API calls                            │
│  - DTO → Model transformation           │
└──────────────┬──────────────────────────┘
               ↓
┌─────────────────────────────────────────┐
│ Model Layer (Domain Logic)              │
│  - Pure TypeScript types                │
│  - Business domain models               │
└─────────────────────────────────────────┘
```

**Rule:** No layer can skip or import from layers above it.

### Folder Structure

```
src/
├── screens/          # UI screens (by feature)
├── components/       # Reusable UI components
├── hooks/            # Business logic hooks
├── services/         # API integration & data services
│   ├── firebase/     # Firebase integration
│   ├── repositories/ # Data repositories
│   ├── ai/           # AI service integration
│   └── sync/         # Sync mechanisms
├── store/            # Zustand stores
├── navigation/       # Navigation configuration
├── constants/        # App constants (theme, routes)
├── locales/          # i18n translations
├── types/            # TypeScript types
├── utils/            # Pure utility functions
└── assets/           # Static assets (icons, images)
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ (use [nvm](https://github.com/nvm-sh/nvm))
- **Yarn** 1.22+ or npm 8+
- **Expo CLI** (optional, included with npx)
- **Xcode** (for iOS) + CocoaPods
- **Android Studio** (for Android)

### Installation

```bash
# Clone repository
git clone https://github.com/your-org/fuse.git
cd fuse

# Install dependencies
yarn install

# Start Expo development server
yarn start

# Run on iOS/Android
yarn ios
yarn android

# Run on Web
yarn web
```

### Environment Variables

Create `.env` file:

```bash
# Copy example
cp .env.example .env

# Configure required variables
API_BASE_URL=https://your-api.com
FIREBASE_API_KEY=your_key_here
# ... see .env.example for all variables
```

---

## 📁 Project Structure

```
.
├── .ai/                      # AI-Assisted Engineering System
│   ├── agents/               # Specialized AI agents
│   ├── skills/               # Reusable agent skills
│   ├── rules/                # Enforcement rules
│   ├── router/               # LLM routing & metrics
│   ├── scripts/              # Automation scripts
│   ├── docs/                 # System documentation
│   ├── _sdd/                 # Software Design Documents
│   └── system.md             # Master orchestrator
│
├── src/                      # Application source code
├── assets/                   # Static assets
├── __mocks__/                # Test mocks
├── .husky/                   # Git hooks
├── .maestro/                 # E2E test scenarios
├── Syntry.wiki/              # Project wiki
│
├── App.tsx                   # Application entry point
├── package.json              # Dependencies & scripts
├── tsconfig.json             # TypeScript configuration
├── jest.config.js            # Jest configuration
├── eas.json                  # Expo build configuration
└── README.md                 # This file
```

### AI System Files

- **`.ai/system.md`** - Master orchestration system, routing matrix
- **`.ai/agents/`** - Agent specifications and workflows
- **`.ai/skills/`** - Reusable patterns (clean code, architecture, React Native best practices)
- **`.ai/rules/`** - Enforcement rules (folder structure, naming conventions, git workflow)
- **`.ai/router/router.md`** - LLM routing strategy (local vs remote)
- **`.ai/router/token-usage.csv`** - Token consumption tracking

---

## 🎭 Agent Orchestration

### How It Works

The **System Orchestrator** (`.ai/system.md`) analyzes requests and routes to appropriate agents:

```typescript
// Conceptual flow
function handleRequest(userInput: string) {
  const requestType = classifyRequest(userInput)

  if (requestType === 'feature_implementation') {
    // Multi-agent workflow
    await runAgent('frontend-architect') // Create SDD
    await runAgent('react-native-engineer') // Implement
    await runAgent('test-writer') // Add tests
    await runAgent('code-reviewer') // Validate
    await requestUserCommitConfirmation()
  }

  if (requestType === 'git_operation') {
    // System handles directly (never delegated)
    await validateQualityGates()
    await requestUserConfirmation()
    await executeCommit() // Never auto-push
  }
}
```

### Request Classification

| Request Keywords                | Routed To               | Example                         |
| ------------------------------- | ----------------------- | ------------------------------- |
| "create feature", "implement"   | `react-native-engineer` | "Create login screen"           |
| "architecture", "sdd", "design" | `frontend-architect`    | "Design notification system"    |
| "test", "coverage"              | `test-writer`           | "Add tests for auth hook"       |
| "review", "validate"            | `code-reviewer`         | "Review this PR"                |
| "sonar", "code smell"           | `sonar-auto-fixer`      | "Fix sonar issues in PR #42"    |
| "coupling", "dependencies"      | `coupling-analyzer`     | "Analyze auth feature coupling" |
| "performance", "slow"           | `performance-auditor`   | "Profile feed screen"           |
| "commit", "push", "pr"          | `SYSTEM_DIRECT`         | "Commit changes"                |

### Dynamic Agent Creation

If no agent exists for a request pattern, the system **automatically creates** a new agent:

```
User: "Generate security audit report"
  ↓
System: No agent found for "security audit"
  ↓
System: Creates security-auditor agent
  ↓
System: Creates security-patterns skill
  ↓
System: Updates routing matrix
  ↓
System: Executes new agent
  ↓
User: "New agent 'security-auditor' created and executed"
```

### View Orchestration Stats

```bash
# View agent usage statistics
.ai/scripts/show-orchestration-stats.sh 7  # Last 7 days

# View token usage
.ai/router/update-token-totals.sh

# View coupling analysis
.ai/scripts/analyze-coupling.sh full

# View future improvements progress
.ai/scripts/count-improvements-progress.sh
```

---

## 🔄 Development Workflow

### Standard Feature Development

```bash
# 1. Create feature branch
git checkout -b feature/user-notifications

# 2. Request architecture (invokes frontend-architect)
# "Create SDD for notification center feature"

# 3. Implement (invokes react-native-engineer)
# "Implement notification center following SDD"

# 4. Add tests (invokes test-writer)
# "Add unit tests for notification hooks"

# 5. Review (invokes code-reviewer)
# "Review notification feature code"

# 6. Commit (System handles directly)
# "commit these changes"
# System validates quality gates → requests confirmation → commits

# 7. Push and create PR
git push origin feature/user-notifications
gh pr create --title "feat: add notification center"
```

### Quality Gates (Automated)

**Pre-commit** (`.husky/pre-commit`):

- ESLint
- Prettier
- TypeScript compilation
- Staged file tests

**Pre-push** (`.husky/pre-push`):

- Full TypeScript check
- Full ESLint run
- Complete test suite with coverage
- Token usage report (displays daily totals)

**CI/CD** (GitHub Actions):

- All pre-push checks
- SonarCloud analysis
- Build validation
- E2E tests (if configured)

---

## 🧪 Testing

### Test Strategy

- **Unit Tests** - Jest + Testing Library (≥80% coverage required)
- **Integration Tests** - Testing complex hooks and services
- **E2E Tests** - Maestro for critical user flows
- **Snapshot Tests** - Component rendering validation

### Running Tests

```bash
# Run all tests
yarn test

# Watch mode
yarn test:watch

# Coverage report
yarn test:coverage

# Run specific test file
yarn test src/hooks/useAuth.test.ts

# Run E2E tests
yarn e2e

# Open Maestro studio
yarn e2e:open
```

### Test Structure

```typescript
// Example: Hook test with test-writer agent patterns
describe('useAuth', () => {
  it('should handle login successfully', async () => {
    const { result } = renderHook(() => useAuth())

    await act(async () => {
      await result.current.login('user@example.com', 'password')
    })

    expect(result.current.isAuthenticated).toBe(true)
    expect(result.current.user).toBeDefined()
  })

  it('should handle login error', async () => {
    mockAuthService.login.mockRejectedValue(new Error('Invalid credentials'))

    const { result } = renderHook(() => useAuth())

    await act(async () => {
      await result.current.login('wrong@example.com', 'wrong')
    })

    expect(result.current.error).toBe('Invalid credentials')
    expect(result.current.isAuthenticated).toBe(false)
  })
})
```

---

## 🚀 CI/CD

### GitHub Actions Workflows

**CI Pipeline** (`.github/workflows/ci.yml`):

- Triggers on PR and push to `main`
- Runs lint, tests, and SonarCloud analysis
- Validates build integrity

**Release Pipeline** (`.github/workflows/release.yml`):

- Manual trigger for builds
- Uses EAS Build for production
- Submits to App Store Connect and Google Play
- Supports development, preview, and production profiles

### EAS Build Profiles

```json
{
  "development": { "developmentClient": true },
  "preview": { "distribution": "internal" },
  "production": { "autoIncrement": true }
}
```

### Required Secrets

Configure in GitHub Settings > Secrets:

- **SonarCloud**: `SONAR_TOKEN`
- **Expo/EAS**: `EXPO_TOKEN`
- **Apple** (iOS submit): `APPLE_ID`, `APPLE_TEAM_ID`, `APPLE_APP_SPECIFIC_PASSWORD`
- **Android** (submit): `GOOGLE_SERVICE_ACCOUNT_KEY`

### Deployment

```bash
# Build for development
eas build --profile development --platform all

# Build for production
eas build --profile production --platform all

# Submit to stores
eas submit --profile production --platform ios
eas submit --profile production --platform android
```

---

## 📚 Documentation

### Primary Documentation

- **[Agent System](.ai/agents/README.md)** - Complete agent overview and usage
- **[System Orchestrator](.ai/system.md)** - Master orchestration system
- **[Quick Reference](.ai/docs/orchestrator-quick-reference.md)** - Decision tree and commands
- **[Router Strategy](.ai/router/router.md)** - LLM routing logic (local vs remote)
- **[Future Improvements](.ai/_sdd/future-improvements.md)** - Roadmap with progress tracking

### Skills & Rules

- **[Project Architecture](.ai/skills/project-architecture.md)** - Layer separation and boundaries
- **[Clean Code Rules](.ai/skills/clean-code-rules.md)** - Code quality standards
- **[React Native Best Practices](.ai/skills/react-native-best-practices.md)** - Mobile-specific patterns
- **[Coupling Analysis](.ai/skills/coupling-analysis.md)** - Coupling principles for React Native
- **[Naming Conventions](.ai/rules/naming-conventions.md)** - Consistent naming patterns
- **[Folder Structure](.ai/rules/folder-structure.md)** - Project organization rules
- **[Git Workflow](.ai/rules/git-workflow.md)** - Commit and branch standards

### Wiki

Comprehensive guides in [Syntry.wiki/](Syntry.wiki/):

- [Getting Started](Syntry.wiki/Getting-Started.md)
- [Project Structure](Syntry.wiki/Project-Structure.md)
- [Development Workflow](Syntry.wiki/Development-Workflow.md)
- [Testing & Quality](Syntry.wiki/Testing-and-Quality.md)
- [Release & Deployment](Syntry.wiki/Release-and-Deployment.md)

---

## 🤝 Contributing

### Before Contributing

1. **Read the documentation** - Familiarize yourself with the agent system
2. **Understand the architecture** - Review layer separation rules
3. **Check existing agents** - See if your task maps to an existing agent
4. **Follow conventions** - Respect naming, folder structure, and git workflow

### Contribution Workflow

```bash
# 1. Create feature branch
git checkout -b feature/your-feature

# 2. Make changes (agents assist as needed)
# 3. Ensure tests pass
yarn test

# 4. Ensure quality gates pass
yarn lint && yarn format

# 5. Commit with conventional commits
git commit -m "feat: add your feature description"

# 6. Push and create PR
git push origin feature/your-feature
gh pr create

# 7. Request code review (code-reviewer agent assists)
```

### Commit Message Format

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation
- `style:` Formatting
- `refactor:` Code restructuring
- `test:` Tests
- `chore:` Maintenance

---

## 🎓 Learning Resources

### For Understanding the Codebase

1. Start with [.ai/system.md](.ai/system.md) - Understand the orchestration system
2. Review [.ai/agents/README.md](.ai/agents/README.md) - Learn about available agents
3. Explore [src/navigation/](src/navigation/) - Understand app navigation
4. Check [src/screens/](src/screens/) - See screen implementations

### For AI-Assisted Development

1. [Agent Orchestrator Quick Reference](.ai/docs/orchestrator-quick-reference.md) - Fast lookup
2. [Router Strategy](.ai/router/router.md) - When tasks use local vs remote LLMs
3. [Coupling Analysis](.ai/skills/coupling-analysis.md) - Code quality principles
4. Run `.ai/scripts/` tools to see metrics and progress

### For Architecture Decisions

1. [Project Architecture Skill](.ai/skills/project-architecture.md)
2. [frontend-architect agent](.ai/agents/frontend-architect.md)
3. [Software Design Documents](.ai/_sdd/)

---

## 📊 Metrics & Tracking

### View Project Health

```bash
# Token usage (AI costs)
.ai/router/update-token-totals.sh

# Output:
📊 Token Usage for 2026-03-21
CLAUDE:  Input: 1,500 | Output: 800 | Total: 2,600
OLLAMA:  Input: 5,000 | Output: 3,000 | Total: 8,000
OVERALL TOTAL: 10,600 tokens

# Coupling analysis (code health)
.ai/scripts/analyze-coupling.sh full

# Output:
Coupling Analysis Report
Health Score: 85/100 ✅
Circular Dependencies: 0
Violations: 2

# Agent orchestration stats
.ai/scripts/show-orchestration-stats.sh 7

# Output:
Agent Usage (Last 7 days)
react-native-engineer: 18 (40%)
code-reviewer: 12 (26%)
test-writer: 10 (22%)

# Future improvements progress
.ai/scripts/count-improvements-progress.sh

# Output:
Total Tasks: 10
Completed: 4 ✅
Pending: 6 📋
Completion: 40%
```

---

## 🔒 License

This project is proprietary and confidential.

---

## 🙋 Support

For questions, issues, or contributions:

- **Documentation**: Check [Syntry.wiki/](Syntry.wiki/)
- **Agent Help**: Review [.ai/agents/README.md](.ai/agents/README.md)
- **Issues**: Open a GitHub issue
- **Discussions**: Use GitHub Discussions

---

## 🎯 Roadmap

See [Future Improvements](.ai/_sdd/future-improvements.md) for planned enhancements:

- [ ] Internationalization - Move all text to translation files
- [ ] Tailwind CSS Migration - Convert to Tailwind styling
- [ ] Offline-First with SQLite - Local-first architecture
- [x] Agent Orchestration System - ✅ Complete
- [x] Token Usage Tracking - ✅ Complete
- [x] Sonar Auto-Fixer Agent - ✅ Complete
- [x] Coupling Analysis Agent - ✅ Complete

Track progress: `.ai/scripts/count-improvements-progress.sh`

---

**Built with ❤️ using React Native, Expo, and AI-Assisted Engineering**

_This project demonstrates the future of software development: human expertise augmented by specialized AI agents working in harmony._

Notas técnicas:

- Autenticação e perfil via Firebase Auth (updateProfile, updateEmail, updatePassword, reauthenticate).
- Estado do utilizador persistido com Zustand + AsyncStorage (`src/store/useAuthStore.ts`).
- Serviço de avatares em `src/services/profile/avatar.service.ts` (DiceBear, PNG).
