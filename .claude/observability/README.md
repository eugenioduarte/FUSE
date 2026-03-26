# Observability

This directory is the runtime and reporting surface for the `.claude` agent system.

Contents:

- `log-claude-tokens.sh`: stop hook that appends session token data
- `update-token-totals.sh`: pre-push summary for today's token usage
- `generate-token-md.sh`: regenerates the markdown token report
- `token-usage.csv`: raw Claude token events
- `orchestration.csv`: per-agent orchestration and cost records
- `pr-costs.csv`: PR-level cost rollups

Rules:

- logs are append-only
- generated markdown should reflect the CSV source of truth
- analytics pages read from this directory, not from legacy paths
