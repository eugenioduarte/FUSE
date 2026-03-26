# FUSE Agent System — Enterprise Architecture Extension

Status: Proposed Evolution (v2)  
Base: Existing Skills-First System (`.claude/`)  
Author: Senior Enterprise Architect  
Date: 2026-03-26

## 1. Executive Positioning

The current FUSE agent system is already structurally strong, modular, and production-ready.

This extension does not replace `.claude/`. It extends the operating model so the system can scale across domains, preserve long-lived context, and support end-to-end traceability from Jira to PR analytics.

## 2. Core Evolution Principle

From:

`Agents operate per request`

To:

`Agents operate per domain with persistent context`

That shift is the foundation for everything else in this layer.

## 3. New Layer

The new layer lives in `.claude/sdd/system/`.

It introduces:

- domain contexts
- orchestrator contracts
- modular SDD contracts
- delivery separation
- integration-ready workflow definitions

## 4. Context Model

Each business domain becomes a long-lived knowledge boundary.

Recommended initial domains:

- `auth`
- `dashboard`

Later domains:

- `profile`
- `payments`
- `notifications`
- `subscription`

## 5. Operating Roles

Existing runtime roles in `.claude/` remain active.

New logical roles added by this layer:

- `context-orchestrator`
- `delivery-agent`

These do not invalidate the current agent set. They coordinate or package work around it.

## 6. Modular SDD Model

A work item can produce multiple SDD modules.

Mandatory:

- orchestrator
- one of `ui` or `logic`
- test

Conditional:

- api
- state
- infra
- security
- analytics
- performance

## 7. Governance

- contexts own accumulated domain decisions
- orchestrators own planning and execution sequencing
- execution agents own code and analysis
- delivery owns branch, commit, PR, and evidence packaging

## 8. Non-Goals

- replacing `CLAUDE.md`
- replacing current skills
- forcing every task to generate all SDD modules
- activating Jira or Figma MCP before contracts are stable

## 9. Adoption Path

Phase 1:

- establish `.claude/sdd/system/`
- define contexts
- standardize contracts and templates

Phase 2:

- add `.claude` command surface for Jira intake
- scaffold modular SDDs from a Jira brief

Phase 3:

- activate orchestrator and delivery roles

Phase 4:

- connect Jira/Figma MCP

## 10. One-Line Summary

From request-driven agents to domain-driven intelligent systems.
