> **[PT]** Visão geral de todos os agentes de IA disponíveis no projeto FUSE, com descrição de responsabilidades e modelo LLM utilizado.

---

# Agents Overview

This directory contains all AI agents that assist with development, code quality, and architectural decisions for the FUSE React Native application.

---

## 🤖 Available Agents

### 🏗️ Architecture & Design

#### **frontend-architect**

- **Role:** Define architecture, create SDDs, make structural decisions
- **Model:** Claude Sonnet (always remote)
- **When to use:** Feature planning, architectural decisions, cross-cutting concerns
- **Triggers:** Manual invocation for feature design

---

### 👨‍💻 Development

#### **react-native-engineer**

- **Role:** Implement features, components, hooks following project patterns
- **Model:** Local (simple) / Claude (complex)
- **When to use:** Feature implementation, component creation, hook development
- **Triggers:** Manual invocation for development tasks

---

### ✅ Quality Assurance

#### **code-reviewer**

- **Role:** Enforce quality gates, detect violations, approve/reject changes
- **Model:** Claude Sonnet (always remote)
- **When to use:** PR review, pre-merge validation
- **Triggers:** Manual review, pre-merge checks

#### **performance-auditor**

- **Role:** Profile performance, identify bottlenecks, optimize
- **Model:** Claude Sonnet (always remote)
- **When to use:** Performance issues, optimization needs, profiling
- **Triggers:** Performance problems detected

---

### 🧪 Testing

#### **test-writer**

- **Role:** Create unit tests with high coverage
- **Model:** Local (always)
- **When to use:** Writing unit tests for hooks, utilities, services
- **Triggers:** After feature implementation

#### **test-write-e2e**

- **Role:** Create E2E tests with Maestro
- **Model:** Local (always)
- **When to use:** Testing complete user flows
- **Triggers:** After feature completion

---

### 🔧 Automation & Analysis

#### **sonar-auto-fixer** ⭐ NEW

- **Role:** Automatically fix SonarQube issues in PRs
- **Model:** Local (mechanical) / Claude (complex)
- **When to use:** After Sonar quality gate fails on PR
- **Triggers:** `/fix-sonar <PR_NUMBER>` or automatic on quality gate failure
- **Documentation:** [sonar-auto-fixer.md](./sonar-auto-fixer.md)
- **Script:** [.ai/scripts/trigger-sonar-fix.sh](../scripts/trigger-sonar-fix.sh)

**Features:**

- Monitors PR Sonar quality gates
- Auto-fixes mechanical issues (unused imports, complexity, duplicates)
- Creates follow-up PR with fixes
- Comments on original PR with summary
- Flags security/architectural issues for manual review

**Usage:**

```bash
# Manual trigger
/fix-sonar 123

# Or run script directly
.ai/scripts/trigger-sonar-fix.sh 123
```

---

#### **coupling-analyzer** ⭐ NEW

- **Role:** Analyze code coupling and suggest balanced refactoring
- **Model:** Claude Sonnet (always remote)
- **When to use:** Before refactoring, architecture reviews, weekly audits
- **Triggers:** Manual analysis commands or scheduled runs
- **Documentation:** [coupling-analyzer.md](./coupling-analyzer.md)
- **Skills:** [coupling-analysis.md](../skills/coupling-analysis.md)
- **Script:** [.ai/scripts/analyze-coupling.sh](../scripts/analyze-coupling.sh)

**Features:**

- Analyzes dependency graphs
- Detects coupling anti-patterns (god objects, feature envy, shotgun surgery)
- Identifies architectural violations (Screen → Service)
- Tracks coupling metrics over time
- Generates refactoring roadmaps with priorities

**Usage:**

```bash
# Full codebase analysis
/analyze-coupling
.ai/scripts/analyze-coupling.sh full

# Feature-specific
/analyze-coupling feature:auth
.ai/scripts/analyze-coupling.sh feature:auth

# File-specific
/analyze-coupling file:src/screens/Dashboard.tsx

# PR impact analysis
/analyze-coupling pr:123
```

**Metrics Tracked:**

- Fan-Out (dependencies per file) - Target: < 7
- Fan-In (dependents per file) - Target: < 15
- Instability - Target: 0.3-0.7
- Circular Dependencies - Target: 0
- Architectural Violations - Target: 0

---

### 🔄 PR Management

#### **pr-lifecycle** ⭐ NEW

- **Role:** Autonomous end-to-end PR lifecycle — create, monitor CI, fix failures, address reviews, merge
- **Model:** Claude Sonnet (always remote)
- **When to use:** Any time you push a branch and want the full PR process handled autonomously
- **Triggers:** `/pr-lifecycle [PR_NUMBER]` slash command
- **Documentation:** [pr-lifecycle.md](./pr-lifecycle.md)
- **Script:** [.ai/scripts/pr-lifecycle.sh](../scripts/pr-lifecycle.sh) (status check helper)

**Features:**

- Creates PR with meaningful title and body from commit history
- Monitors CI pipeline (lint, tests, Sonar) — auto-fixes failures
- Reads PR review comments and addresses each one
- Replies to comments with explanation of changes
- Squash-merges and deletes branch when fully approved
- Stops safely if a fix is ambiguous or touches security-sensitive files

**Usage:**

```bash
# Create new PR and manage full lifecycle
/pr-lifecycle

# Resume lifecycle for an existing PR
/pr-lifecycle 123

# Check status manually
.ai/scripts/pr-lifecycle.sh 123
```

#### **pr-review-fixer**

- **Role:** Fix issues from PR reviews automatically (superseded by pr-lifecycle)
- **Model:** Local (mechanical) / Claude (complex)
- **When to use:** Use `pr-lifecycle` instead
- **Status:** Superseded — kept for reference

---

## 📊 Agent Routing Strategy

The project uses a **hybrid routing strategy** to optimize cost and performance:

### Always Remote (Claude Sonnet)

- `frontend-architect` - Requires full context and architectural reasoning
- `code-reviewer` - Needs pattern recognition across codebase
- `performance-auditor` - Complex profiling and optimization decisions
- `coupling-analyzer` - Holistic codebase analysis

### Always Local (Ollama - qwen2.5-coder:14b)

- `test-writer` - Mechanical test generation
- `test-write-e2e` - Template-based E2E creation

### Conditional Routing

- `react-native-engineer` - Local for simple, Claude for complex
- `sonar-auto-fixer` - Local for mechanical fixes, Claude for refactoring

**Why?** Most development tasks are mechanical (boilerplate, tests, simple fixes). Reserve expensive Claude tokens for high-value architectural work.

See [router.md](../router/router.md) for detailed routing logic.

---

## 🎯 When to Use Which Agent

### Starting a New Feature

1. **frontend-architect** - Create SDD
2. **react-native-engineer** - Implement feature
3. **test-writer** - Add unit tests
4. **test-write-e2e** - Add E2E test
5. **code-reviewer** - Review before merge

### Fixing Quality Issues

1. **sonar-auto-fixer** - Auto-fix mechanical Sonar issues
2. **code-reviewer** - Validate fixes
3. **coupling-analyzer** - Check for architectural issues

### Performance Problems

1. **performance-auditor** - Profile and identify bottlenecks
2. **react-native-engineer** - Implement optimizations
3. **test-writer** - Add performance tests

### Refactoring

1. **coupling-analyzer** - Analyze current coupling
2. **frontend-architect** - Design refactoring strategy
3. **react-native-engineer** - Execute refactoring
4. **code-reviewer** - Validate architectural compliance

### Architecture Review (Weekly)

1. **coupling-analyzer** - Generate coupling report
2. **frontend-architect** - Review and plan improvements
3. Document findings in architecture decision records

---

## 📁 Agent File Structure

Each agent follows this structure:

```markdown
# Agent Name

<!-- Brief: One-line description -->

## 🎯 Role

Clear responsibility definition

## 🤖 LLM Routing

Which model and why

## 🚀 Triggers

How to invoke this agent

## 📋 Workflow

Step-by-step execution flow

## 🧪 Skills Referenced

Which skills this agent uses

## 📊 Metrics

What gets tracked

## 🎯 Success Criteria

How to measure success
```

---

## 🔗 Related Documentation

- [system.md](../system.md) - Master orchestration document
- [router.md](../router/router.md) - LLM routing strategy
- [skills/](../skills/) - Reusable skills for agents
- [rules/](../rules/) - Enforcement rules

---

## 🚀 Getting Started

### Prerequisites

```bash
# Ensure dependencies are installed
npm install -g madge  # For coupling analysis
brew install gh       # GitHub CLI for Sonar auto-fixer

# Configure authentication
gh auth login
export SONAR_TOKEN=your_token_here
```

### Quick Start

```bash
# Test coupling analyzer
.ai/scripts/analyze-coupling.sh full

# View latest coupling report
ls -t .ai/analysis/coupling-report-*.md | head -1 | xargs cat

# Test sonar fixer (dry run)
.ai/scripts/trigger-sonar-fix.sh <PR_NUMBER>
```

---

## 📈 Metrics & Tracking

All agents log their activities:

- **Token Usage:** `.ai/router/token-usage.csv`
- **Coupling Metrics:** `.ai/analysis/coupling-history.csv`
- **Sonar Fixes:** `.ai/router/sonar-fixes.csv` (planned)

View daily token usage:

```bash
.ai/router/update-token-totals.sh
```

---

## 🎓 Best Practices

### For Developers

1. Use local models for repetitive tasks
2. Reserve Claude for architectural decisions
3. Run coupling analysis before major refactoring
4. Let Sonar auto-fixer handle mechanical issues

### For Code Reviewers

1. Use `code-reviewer` agent for consistency
2. Check coupling analyzer reports before approving large changes
3. Validate that architectural boundaries are respected

### For Architects

1. Run `coupling-analyzer` weekly
2. Track coupling metrics trends
3. Update architectural patterns based on insights
4. Use findings to guide refactoring priorities

---

## 🔮 Future Enhancements

### Planned Agents

- **dependency-updater** - Auto-update dependencies with safety checks
- **migration-agent** - Assist with major library migrations
- **security-scanner** - Deep security analysis beyond Sonar
- **accessibility-auditor** - Ensure WCAG compliance

### Planned Features

- ML-based pattern learning from accepted fixes
- Automatic PR merging for high-confidence fixes
- Real-time coupling monitoring in IDE
- Integration with project management tools

---

## 🤝 Contributing

When adding a new agent:

1. Create agent file in `.ai/agents/`
2. Follow the standard structure
3. Create associated skills in `.ai/skills/`
4. Add routing logic to [router.md](../router/router.md)
5. Update this README
6. Add example script to `.ai/scripts/`
7. Document in [future-improvements.md](../_sdd/future-improvements.md)

---

**Last Updated:** 2026-03-21 (pr-lifecycle agent added)
**Maintained by:** Engineering Team
