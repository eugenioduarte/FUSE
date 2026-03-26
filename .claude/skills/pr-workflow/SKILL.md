---
name: pr-workflow
description: Deterministic PR workflow skill for explicit /create-pr, /fix-pr, and /merge-pr command handling.
context: fork
allowed-tools: Read, Bash
disable-model-invocation: true
---

# PR Workflow

Use only on explicit PR lifecycle commands.

Phases:

1. create or inspect PR
2. monitor CI
3. address comments and failures
4. evaluate merge gate

Never merge autonomously.
