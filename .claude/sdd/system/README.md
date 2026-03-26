# FUSE Enterprise SDD System

Status: proposed extension
Base runtime: `.claude/`
Purpose: support domain-driven, Jira-ingested, modular SDD generation without turning `.claude/` into a monolith.

## Position

`.claude/` remains the active agent runtime.

`.claude/sdd/system/` is the enterprise design and orchestration layer for:

- domain contexts
- Jira ingestion
- modular SDD scaffolding
- orchestration contracts
- delivery traceability

## Target Model

Flow:

`Jira -> raw intake -> context classification -> orchestration plan -> modular SDD set -> implementation -> PR evidence`

## Top-Level Structure

```text
.claude/sdd/system/
  architecture/
  contracts/
  contexts/
  integrations/
  templates/
  workflows/
  registry/
  agents/
```

## Design Rules

- keep `.claude/` lean and operational
- put enterprise process contracts in `.claude/sdd/system/`
- keep SDD modules standardized and auditable
- model domain memory explicitly through `contexts/`
- do not couple Jira/Figma assumptions into every agent prompt

## Immediate Scope

- define the structure
- define the naming contract
- define the modular SDD contract
- define the context model
- define how `.claude` invokes the system

## Deferred Scope

- real Jira MCP wiring
- real Figma MCP wiring
- automated PR evidence attachment
- fully autonomous delivery pipeline
