# Testing and Quality

## Tests

- Jest tests live under `src/__tests__`.
- Pre-push hook runs all suites; the push is blocked if they fail.

## Linting and Commit Conventions

- ESLint and TypeScript are used across the project.
- Commit messages must follow Conventional Commits (enforced by commitlint).

## SonarQube (optional)

- The repo includes a `sonar-project.properties`. If using Sonar, configure your server and CI to run analysis.

## Tips

- Prefer small, focused tests on utilities and critical data flows (repositories, sync logic).
- When changing public behavior, add or update tests.
