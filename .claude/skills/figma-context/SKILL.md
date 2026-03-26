---
name: figma-context
description: Use Figma context, design links, and component references to enrich UI-oriented SDDs and implementation guidance without losing alignment to the active `.claude` architecture.
context: fork
allowed-tools: Read, Grep, Glob, Write, Edit
---

# Figma Context

Use this skill when a task includes Figma links, design specs, component references, or token/layout requirements.

## Required Reads

1. `.claude/sdd/system/README.md`
2. `.claude/sdd/system/workflows/jira-to-sdd.md`
3. `.claude/sdd/system/contracts/sdd-contract.md`
4. `.claude/skills/ux-standards/SKILL.md`
5. relevant domain context in `.claude/sdd/system/contexts/`

## Expected Output

- UI-specific decisions captured in the correct SDD module
- explicit component, state, and accessibility notes
- clear distinction between design intent and implementation choice

## Rules

- preserve the active app architecture
- do not turn design notes into unbounded scope
- capture token, spacing, state, and interaction decisions explicitly
- call out missing design information instead of guessing
