> **[PT]** Este ficheiro define o fluxo de trabalho Git obrigatório do repositório, incluindo convenções de commits, estratégia de branches, regras de pull request e gates de qualidade aplicados pelo Husky.

---

This document is mandatory and overrides default model behavior.

# 🔁 Git Workflow Rule — React Native Mobile

> This document is mandatory and overrides default model behavior.

---

# 🎯 Purpose

This document defines the official Git workflow for this repository.

No commit or push may bypass these rules.

All agents must respect this workflow.

---

# 🚫 Absolute Restrictions

## ❌ No Automatic Commits

The assistant must NEVER:

- Create commits automatically
- Push automatically
- Merge automatically
- Amend commits automatically

Before any commit or push, explicit user confirmation is required.

The assistant must ask:

"Do you want to commit these changes?"

---

## ❌ No Direct Push to Main

Direct pushes to `main` are forbidden.

All changes must go through:

- feature branch
- pull request
- code review
- passing quality gates

---

# 🌿 Branch Strategy

Allowed branches:

- `main` → production
- `develop` → integration
- `feature/<feature-name>`
- `fix/<issue-name>`
- `refactor/<context>`
- `chore/<context>`

Branch names must be kebab-case.

Example:

feature/login-screen fix/workout-pagination refactor/auth-hook

---

# 📝 Commit Convention (Mandatory)

Every commit MUST follow this exact format:

<type>(<scope>): <reason>

## Allowed Types

- feat
- fix
- refactor
- test
- chore
- perf

## Scope Rules

Scope must represent the main layer modified:

- screen
- hook
- service
- model
- test
- schema
- performance
- architecture

Example:

feat(screen): add login screen validation fix(hook): correct race condition in useWorkout
test(service): add unit tests for auth service refactor(architecture): isolate query layer
perf(screen): replace ScrollView with FlashList

---

# 🐶 Husky Enforcement

Every commit must trigger Husky.

Husky must run:

- TypeScript check
- Lint
- Tests
- Coverage validation
- Agent rule scripts

If any fail → commit blocked.

No bypass allowed.

---

# 🧪 Mandatory Pre-Commit Checklist

Before committing, the following must pass:

- TypeScript without errors
- Lint without warnings
- All tests passing
- Coverage ≥ 80%
- All agent rules passing
- No console.log left
- No TODO without ticket reference

If not, commit must not proceed.

---

# 🔍 Pull Request Rules

A PR must include:

- Clear description
- What changed
- Why it changed
- Screenshots (if UI change)
- Test coverage impact
- Performance impact (if applicable)

PR cannot be merged unless:

- Code Reviewer approves
- All CI checks pass
- No architectural violations

---

# 🚀 Performance-Sensitive Changes

If the change involves:

- Lists
- Animations
- Native modules
- State architecture
- Navigation
- Startup logic

Performance Auditor must be invoked before merge.

---

# 🧠 Agent Coordination Rule

Feature lifecycle:

1. Architect defines structure
2. Engineer implements
3. Test Writer writes tests
4. Code Reviewer audits
5. Performance Auditor (if needed)
6. Commit only after approval
7. Push only after confirmation

---

# 🔒 No Force Push to Shared Branches

Force push is forbidden on:

- main
- develop

Allowed only on personal feature branches.

---

# 📦 Definition of a Valid Commit

A commit is valid only when:

- It follows commit convention
- It passes Husky
- It respects folder structure
- It does not break coverage
- It does not bypass tests
- It does not bypass agent rules

---

# 🏁 Final Rule

Quality is enforced at the Git boundary.

No code enters the repository without:

- Structure
- Tests
- Review
- Compliance
- Explicit confirmation

Violation of this workflow invalidates the change.
