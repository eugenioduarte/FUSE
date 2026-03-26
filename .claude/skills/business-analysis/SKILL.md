---
name: business-analysis
description: Convert raw product summaries into implementation-grade SDDs aligned with the active `.claude` architecture.
context: fork
allowed-tools: Read, Write, Edit, Grep, Glob
model: sonnet
---

# Business Analysis

Use this skill when a raw feature brief needs to become an execution-ready design document.

Process:

- read the summary fully before proposing structure
- inspect adjacent SDDs in `.claude/sdd/` to preserve naming and granularity
- align scope with the layer contract in `CLAUDE.md`
- capture user flows, domain entities, integration boundaries, migration impact, rollout, and verification
- mark unknowns as `TBD` instead of inventing requirements

Required SDD sections:

- objective and business context
- scope and out-of-scope
- user flows and screens
- data model and persistence impact
- API or service integration impact
- architecture decisions and constraints
- implementation plan
- rollout, verification, risks, and open questions
