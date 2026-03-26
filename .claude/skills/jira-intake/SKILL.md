---
name: jira-intake
description: Convert a Jira issue or equivalent backlog item into a domain-scoped enterprise SDD set using the `.claude/sdd/system/` contracts, contexts, and templates.
context: fork
allowed-tools: Read, Grep, Glob, Write, Edit
---

# Jira Intake

Use this skill when a request starts from Jira, backlog text, or a work-item brief that needs to become modular SDDs.

## Required Reads

1. `.claude/sdd/system/README.md`
2. `.claude/sdd/system/workflows/jira-to-sdd.md`
3. `.claude/sdd/system/contracts/sdd-contract.md`
4. `.claude/sdd/system/contracts/context-contract.md`
5. relevant files in `.claude/sdd/system/contexts/`

## Expected Output

- one raw work-item file
- one orchestrator file
- mandatory SDD modules
- optional modules only when justified

## Rules

- map the work item to one domain
- reuse existing domain decisions before inventing new ones
- do not generate unnecessary modules
- keep the output agent-consumable, not essay-like
