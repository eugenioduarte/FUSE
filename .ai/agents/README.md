# 🤖 AI Agents — FUSE Engineering System

> **[PT]** Catalog dos 7 agentes especializados do sistema FUSE AI (v2.0.0). Consolidados de 14 agentes para reduzir overhead cognitivo em equipa pequena.

---

## Overview

The FUSE AI orchestration system uses **7 specialized agents** to handle all engineering tasks. Each agent has a defined domain, LLM assignment, and invocation trigger.

For the full routing logic, see `.ai/system.md`. For Mermaid diagrams and flow sequences, see `.ai/agents-orchestration.md`.

---

## Agent Catalog

---

### 🏗 Architecture & Design

---

#### **architect**

- **Role:** Define SDDs, make cross-cutting architectural decisions, enforce layer integrity, analyze coupling patterns
- **Model:** `claude-sonnet-4-6` (always)
- **Triggers:** Feature design requests, `/analyze-coupling`, pre-refactor audits
- **Absorbs:** `frontend-architect` + `coupling-analyzer`
- **Documentation:** [architect.md](./architect.md)

---

### ⚙️ Development

---

#### **engineer**

- **Role:** Implement complete features — data layer (model, DTO, DAO, repository, service), business logic (hooks), and functional screens (Stage 1+2). No design system applied at this stage.
- **Model:** Dynamic — local `qwen2.5-coder:14b` for boilerplate; `claude-sonnet-4-6` for refactor/integration
- **Triggers:** After SDD exists from `architect`; feature implementation, component/hook creation, bug fixes
- **Absorbs:** `react-native-engineer` + `logic-engineer`
- **Documentation:** [engineer.md](./engineer.md)

---

### 🧪 Testing

---

#### **test-writer**

- **Role:** Write unit tests, integration tests, and E2E tests. Unit/integration mode is template-driven. E2E mode strictly follows `*.flow.md` files — one flow = one test, no invented scenarios.
- **Model:** `qwen2.5-coder:14b` (local, always)
- **Triggers (unit mode):** After Engineer delivers code
- **Triggers (E2E mode):** `/test-e2e <feature>` — requires `feature.flow.md`
- **Absorbs:** `test-writer` (unit) + `test-write-e2e` (E2E)
- **Documentation:** [test-writer.md](./test-writer.md)

---

### 🛡 Quality & Review

---

#### **reviewer**

- **Role:** Pre-merge code review across 13 dimensions (TypeScript, architecture, lists, state, animations, memory, performance, native, concurrency, Android safety). Also fixes resolvable PR review comments in fix mode.
- **Model:** `claude-sonnet-4-6` (always)
- **Triggers:** After Engineer + Test Writer complete; `/fix-pr <PR_NUMBER>` for auto-fix mode
- **Absorbs:** `code-reviewer` + `pr-review-fixer`
- **Documentation:** [reviewer.md](./reviewer.md)

---

#### **quality**

- **Role:** Two modes — Performance Audit (FPS, memory, TTI, re-renders — measure before recommending) and Sonar Auto-Fix (auto-fix SonarQube issues in PRs, create fix PR, comment summary).
- **Model:** Dynamic — local for mechanical Sonar fixes; `claude-sonnet-4-6` for architectural performance analysis
- **Triggers:** `/audit-performance` for perf issues; `/fix-sonar <PR_NUMBER>` when Sonar gate fails
- **Absorbs:** `performance-auditor` + `sonar-auto-fixer`
- **Documentation:** [quality.md](./quality.md)

---

### 🎨 Design, Docs & Business

---

#### **design-docs**

- **Role:** Three modes:
  - **UI Polish (Stage 3):** Apply design system to functional screens from Engineer — replace all `// TODO: ui-polish` markers with design system components, theme tokens, accessibility labels
  - **Doc Update:** Maintain `README.md` after every `git push` via pre-push hook
  - **Business Analysis:** Convert `*.summary.md` from `.ai/business/inbox/` into implementation-ready SDDs
- **Model:** `claude-sonnet-4-6` for UI Polish + Business Analysis; `claude-haiku-4-5-20251001` for Doc Update
- **Triggers:** `/ui-polish <feature>` after reviewer approves; pre-push hook for Doc Update; `/business-to-sdd` for summaries
- **Absorbs:** `ui-designer` + `doc-designer` + `business-analyst`
- **Documentation:** [design-docs.md](./design-docs.md)

---

### 🔄 PR Lifecycle

---

#### **pr-lifecycle** ⭐ STANDALONE

- **Role:** Autonomous end-to-end PR lifecycle management: create PR → monitor CI → fix failures → address review comments → merge when ready. **Kept separate** due to its autonomous, long-running nature.
- **Model:** `claude-sonnet-4-6` (always)
- **Triggers:** `/pr-lifecycle [PR_NUMBER]` slash command
- **Documentation:** [pr-lifecycle.md](./pr-lifecycle.md)
- **Script:** [.ai/scripts/pr-lifecycle.sh](../scripts/pr-lifecycle.sh) (status check helper)

**Usage:**
```bash
# Create new PR from current branch
/pr-lifecycle

# Manage existing PR
/pr-lifecycle 123

# Via script
.ai/scripts/pr-lifecycle.sh 123
```

---

## Quick Command Reference

| Command | Agent | Description |
|---|---|---|
| `/analyze-coupling` | `architect` | Full codebase coupling analysis |
| `/analyze-coupling feature:<name>` | `architect` | Feature-specific coupling |
| `/test-e2e <feature>` | `test-writer` | Generate E2E tests from flow.md |
| `/fix-pr <PR_NUMBER>` | `reviewer` | Auto-fix PR review comments |
| `/fix-sonar <PR_NUMBER>` | `quality` | Auto-fix Sonar quality gate issues |
| `/audit-performance` | `quality` | Performance profiling + recommendations |
| `/ui-polish <feature>` | `design-docs` | Apply design system (Stage 3) |
| `/business-to-sdd` | `design-docs` | Convert business summary to SDD |
| `/pr-lifecycle [PR_NUMBER]` | `pr-lifecycle` | Autonomous PR management |

---

## 3-Stage Feature Pipeline

```
Stage 1+2: engineer
  → Model, DTO, DAO, Repository, Service, Hook, functional screen

Stage 3: design-docs (UI Polish)
  → Apply design system, theme, accessibility

Throughout:
  → test-writer: unit tests (after Stage 2), E2E tests (from flow.md)
  → reviewer: pre-merge review
  → quality: Sonar fixes, performance audits
  → architect: SDD upfront, coupling analysis on demand
  → pr-lifecycle: autonomous PR management
```

---

## LLM Cost Strategy

| Tier | Agents | Token spend |
|---|---|---|
| Always Claude Sonnet | `architect`, `reviewer`, `design-docs` (UI/BA), `pr-lifecycle` | High-value reasoning |
| Dynamic (mostly local) | `engineer`, `quality` | Escalate only on complexity |
| Always local | `test-writer` | Template-driven, no judgment needed |
| Claude Haiku | `design-docs` (Doc Update) | Low-complexity writing |

---

**Last updated:** 2026-03-24 — v2.0.0 consolidation (14 → 7 agents)
