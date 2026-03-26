# Agent Flow — Complete Feature Cycle

---

## Branch Protection — Agent Rules

> **Agents are strictly prohibited from performing any of the following actions on protected branches.**

### Protected Branches

| Branch      | Purpose                                | Agent Access |
| ----------- | -------------------------------------- | ------------ |
| `main`      | Production / App Store releases        | ❌ Read-only |
| `developer` | Staging / internal builds              | ❌ Read-only |
| `release/*` | Version branches that generate APK/IPA | ❌ Read-only |
| `hotfix/*`  | Critical production patches            | ❌ Read-only |

### Prohibited Agent Actions

- `git push` directly to any protected branch
- `git merge` into any protected branch
- `gh pr merge` without explicit human approval
- Force push (`--force`) on any branch
- Deleting protected branches
- Bypassing branch protection rules via API

### Allowed Agent Scope

- Work exclusively on `feat/*`, `fix/*`, `chore/*`, `test/*`, `refactor/*` branches
- Push to feature branches only after **explicit user confirmation**
- Open PRs targeting `main` — but **never merge them autonomously**
- All merges into `main` require **human review, approval, and explicit written instruction to merge**
- Silence or inferred consent is never enough — the user must say yes

> This rule exists to guarantee that no automated agent can trigger a build, release, or deployment without explicit human sign-off.

---

## 1. Planning

- User describes feature in natural language
- Agent reads project context (wiki, structure, existing code)
- Agent generates SDD (Software Design Document)
  - Goal, scope, affected files, tech decisions

## 2. SDD Review

- User reviews and approves SDD
- Agent adjusts if needed

## 3. Implementation

- Agent creates/updates types (`src/types/`)
- Agent creates/updates schemas (`src/schemas/`)
- Agent creates service layer (`src/services/`)
- Agent creates store/state logic (`src/store/`)
- Agent creates hooks (`src/hooks/`)
- Agent creates screens/components (`src/screens/`, `src/components/`)
- Agent wires navigation (`src/navigation/`)

## 4. Tests

- Agent writes unit tests for services, hooks, utils
- Agent writes component tests
- Agent writes Maestro E2E flow (`maestro/flows/`)
  - Launch app
  - Navigate to feature
  - Interact with UI
  - Assert expected state
  - Handle error/edge cases

## 5. Quality

- Agent runs `jest` — fixes failures
- Agent runs `eslint` — fixes lint errors
- Agent checks TypeScript errors — fixes types

## 6. Commit

- Agent stages relevant files
- Agent writes conventional commit message
  - e.g. `feat(connections): add invite flow with deep link support`

## 7. Push

- Agent asks: _"Push branch `feat/<...>` to remote? (yes/no)"_
- Push only happens after **explicit user confirmation**
- Branch follows convention: `feat/<ticket>-<short-description>`
- ⛔ Agent **must never** push to `main` or any release-generating branch
- ⛔ Agent **must never** push automatically, even after all quality checks pass

## 8. Pull Request

- Agent creates PR via GitHub CLI (`gh pr create`)
  - Title: feature summary
  - Body: links SDD, lists changes, test coverage, Maestro flow reference
  - Labels: `feature`, `needs-review`
  - Assigns reviewer

## 9. CI Pipeline

- Lint + TypeScript check
- Unit tests + coverage threshold
- Maestro E2E on simulator (via EAS / Fastlane)
- SonarQube analysis

## 10. Merge

- Agent reports: _"PR #<N> is approved and all checks pass. Do you want me to merge? (yes/no)"_
- ⛔ Agent **does not merge unless user explicitly says yes**
- Squash merge into `main` — only after explicit user instruction
- Branch deleted after merge
- Version bump and release triggered by CI/CD — never by agent directly
