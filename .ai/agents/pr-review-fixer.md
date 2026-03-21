> **[PT]** Agente responsável por corrigir automaticamente comentários de revisão de PRs, incluindo issues do Sonar, lint e feedback de code reviewers.

---

# Agent: pr-review-fixer

**Status:** TODO — implement after Sonar and other quality gates are in the CI pipeline

---

## Objective

Agent that, after a PR is opened, automatically fetches all review comments (Sonar, CI linters, code reviewers), fixes the identified issues, and pushes the corrections to the same branch.

---

## Expected Flow

1. Receives the PR number as an argument (e.g. `/fix-pr 42`)
2. Fetches all PR comments via `gh pr view <number> --comments`
3. Fetches the CI check status via `gh pr checks <number>` (Sonar Quality Gate, ESLint CI, etc.)
4. For each identified issue:
   - Reads the affected file
   - Applies the fix (lint, smell, code review feedback)
   - Runs tests locally to ensure nothing is broken
5. Creates a commit with the fixes and pushes to the PR branch
6. Adds a comment to the PR describing what was fixed

---

## Trigger

- **Manual:** `/fix-pr <number>` — invokes the agent in a Claude Code conversation
- **Automatic (future):** `PostToolUse` hook after `gh pr create` that fires the agent in the background

---

## Required Dependencies

- `gh` CLI authenticated with read/write permissions on the repo
- Sonar configured in the pipeline (webhook or API key to read issues)
- The agent must have access to the tools: `Bash`, `Read`, `Edit`, `Grep`, `Glob`

---

## Implementation Notes

- Use `gh api repos/{owner}/{repo}/pulls/{number}/comments` for inline comments (annotations on specific lines)
- For Sonar issues: use the SonarQube/SonarCloud API to list issues by branch
- The agent must run `pnpm typecheck && pnpm lint && pnpm test` before pushing
- If tests fail after the fixes, the agent must report and not push

---

## References

- `gh pr view --help`
- `gh pr checks --help`
- SonarCloud API: `https://sonarcloud.io/web_api`
