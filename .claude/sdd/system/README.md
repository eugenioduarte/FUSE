# FUSE Enterprise SDD System

Status: active
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

## Active Integrations

- Jira MCP: configured in `.claude/settings.json`
- Figma MCP: configured in `.claude/settings.json`
- Intake workflow: `/jira-to-sdd` command
- Business intake: `/business-to-sdd` command

## Deferred Scope

- automated PR evidence attachment
- fully autonomous delivery pipeline
