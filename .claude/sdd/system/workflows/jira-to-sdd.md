# Jira to SDD Workflow

## Objective

Turn a Jira work item into a domain-scoped modular SDD set that `.claude/` agents can execute.

## Pipeline

1. ingest Jira issue into a raw brief
2. classify domain
3. create or reuse epic folder
4. create orchestrator file
5. scaffold mandatory SDD modules
6. scaffold conditional modules when needed
7. enrich using repo context, API context, and design context
8. hand off to execution agents

## Inputs

- Jira ticket title
- Jira description
- acceptance criteria
- labels
- linked design or API references

## Outputs

- `*-raw.md`
- `*-orchestrator.md`
- one or more `*.sdd.md` modules

## Minimum Decision Logic

Create `api` if:

- new endpoint
- changed contract
- repository/service boundary changes

Create `state` if:

- cache behaviour
- offline/persistence
- global state
- multi-screen coordination

Create `security` if:

- auth
- tokens
- PII
- secrets
- payment-like flow

Create `analytics` if:

- new tracked event
- dashboard metrics change
- funnel impact

Create `performance` if:

- lists
- animations
- large payloads
- render-sensitive screens

## Governance

- never create modules mechanically without signal
- never skip `test`
- prefer a smaller accurate SDD set over a bloated one
