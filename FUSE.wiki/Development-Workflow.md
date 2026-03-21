# Development Workflow

## Branching and Commits

- Work on feature branches from `setup` or the default branch.
- Use Conventional Commits (linted by commit hooks).
  - Examples:
    - `feat(sync): add syncing overlay`
    - `fix(challenges): backfill list from Firestore`

## Lint, Tests, and Hooks

- `lint-staged` and `husky` run on commit.
- Pre-push hook runs `yarn test` (Jest). All suites should pass.

## Running Locally

- See [[Getting Started]]. Typical flow:
  - `yarn start` (Metro)
  - `yarn ios` or `yarn android`

## Code Style and Patterns

- Prefer repository methods over direct local storage access.
- When writing to repo methods from Firestore listeners, pass `{ fromSync: true }`.
- Avoid writing to Firestore directly from UI flows; prefer the central flush service.

## PRs and Reviews

- Keep changes small and focused.
- Include notes if altering sync behavior.
- Add or update tests where possible.
