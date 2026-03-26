# Orchestrator Contract

The `context-orchestrator` is the planning brain for a domain-scoped work item.

## Responsibilities

- map input to domain
- decide which SDD modules are required
- sequence execution
- identify dependencies and blockers
- define validation gates
- track status changes

## Non-Responsibilities

- writing production code
- making direct git decisions
- self-approving implementation quality

## Required Output

Each orchestrator file must define:

- work item identity
- mapped domain and epic
- requested modules
- execution order
- handoff checklist
- acceptance gate summary
- current status

## Statuses

- `draft`
- `ready`
- `in_progress`
- `blocked`
- `awaiting_validation`
- `done`
