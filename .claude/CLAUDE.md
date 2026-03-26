---
version: 3.0.0
system: FUSE AI Skills-First
status: active
---

# FUSE AI System

FUSE is a React Native (Expo) application operated with a Skills-First AI engineering system.

## Mission

Deliver production-grade mobile changes with explicit architecture, strong typing, predictable layering, and documentation that reflects the live system.

## Architecture Contract

Mandatory flow:

`Model -> Service -> Query -> Hook -> Screen`

Rules:

- Models represent app domain, never raw API payloads
- Services handle transport and DTO translation boundaries
- Query layer orchestrates async state and caching
- Hooks contain business logic and handlers
- Screens render presentation only

## Critical Invariants

- No barrel imports
- No inline styles
- DTOs never reach UI
- External data must be validated
- Coverage baseline: `>= 80%` global
- Hooks and services target: `>= 90%`
- No real API calls in unit tests
- No auto-commit or auto-push by agents

## Routing

| Request shape | Primary agent |
| --- | --- |
| SDD, system design, coupling, refactor strategy | `architect` |
| Feature implementation, bug fix, refactor execution | `engineer` |
| Code review, regression review, PR comments | `reviewer` |
| Unit/integration tests | `test-writer` |
| Quality gates, performance, static analysis | `quality` |
| Documentation, UX polish, business-to-SDD | `design-docs` |
| PR flow commands | `pr-lifecycle` |
| Security analysis | `security-analyst` |

## Operating Model

- `rules/` are path-scoped and must stay short
- `skills/` hold reusable domain knowledge and templates
- `agents/` define execution roles, tools, and default skill packs
- `agent-memory/` is reserved for persistent role memory

## Governance

- Structural changes to this file, skill taxonomy, or agent taxonomy are architecture changes
- Long examples and deep workflows belong in skills, not here
- Public documentation must match the active `.claude/` configuration

## Pointers

- Rules: `.claude/rules/`
- Skills: `.claude/skills/`
- Agents: `.claude/agents/`
- Memory: `.claude/agent-memory/`
