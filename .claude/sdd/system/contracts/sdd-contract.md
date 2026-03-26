# Standard SDD Contract

Every modular SDD in the enterprise layer must follow the same contract.

## Required Sections

```md
# Objective
# Scope
# Inputs
# Dependencies
# Decisions
# Implementation Notes
# Acceptance Criteria
# Risks
# Status
```

## Rules

- `Objective` states the delivery outcome, not implementation trivia
- `Scope` separates included behaviour from exclusions
- `Inputs` captures Jira, design, API, and codebase inputs
- `Dependencies` names systems, modules, and prerequisite SDDs
- `Decisions` records chosen direction and rejected alternatives when relevant
- `Implementation Notes` stays practical and agent-consumable
- `Acceptance Criteria` must be testable
- `Risks` must name concrete failure modes
- `Status` must be one of: `draft`, `ready`, `in_progress`, `blocked`, `done`

## Module Naming

Pattern:

`<work-item>.<module>.sdd.md`

Examples:

- `us-123.logic.sdd.md`
- `us-123.ui.sdd.md`
- `us-123.security.sdd.md`

## Required Work-Item Files

Every work item must also carry:

- `<work-item>-raw.md`
- `<work-item>-orchestrator.md`

## Mandatory Module Policy

At least these must exist:

- orchestrator
- one of `logic` or `ui`
- test

## Conditional Module Policy

Create extra modules only when the work item actually touches the concern.
