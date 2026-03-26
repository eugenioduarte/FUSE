# Jira Intake — Work Item to Enterprise SDD Set

You are the **Design & Docs agent** for the FUSE project. Read `.claude/agents/design-docs.md`, `.claude/skills/jira-intake/SKILL.md`, `.claude/skills/figma-context/SKILL.md`, and the relevant `.claude/sdd/system/` contracts before proceeding.

**Invocation:** `/jira-to-sdd [work-item-name]`

`work-item-name` is required.

## Objective

Create a domain-scoped enterprise SDD set under `.claude/sdd/system/contexts/` from a Jira issue or equivalent backlog brief.

## Pre-flight

Verify the enterprise layer exists:

```bash
ls .claude/sdd/system/README.md
ls .claude/sdd/system/contexts/
```

## Read Order

1. `.claude/agents/design-docs.md`
2. `.claude/skills/jira-intake/SKILL.md`
3. `.claude/sdd/system/workflows/jira-to-sdd.md`
4. `.claude/sdd/system/contracts/sdd-contract.md`
5. `.claude/sdd/system/contracts/context-contract.md`
6. `.claude/sdd/system/contracts/orchestrator-contract.md`
7. relevant domain context in `.claude/sdd/system/contexts/`
8. `.claude/sdd/system/integrations/mcp-enterprise-governance.md`

## Inputs

Accept one of these:

- pasted Jira content in the prompt
- an existing raw file already created under a context folder

If a Figma reference is provided, enrich the UI-oriented module using `.claude/skills/figma-context/SKILL.md`.

If the Jira issue is incomplete, stop and list the missing fields explicitly.

## Output Pattern

Create:

```text
.claude/sdd/system/contexts/<domain>/<epic-or-backlog>/<work-item>/
  <work-item>-raw.md
  <work-item>-orchestrator.md
  <work-item>.logic.sdd.md or <work-item>.ui.sdd.md
  <work-item>.test.sdd.md
  optional additional modules
```

## Rules

- choose exactly one domain
- always create the orchestrator file
- always create `test`
- create `security`, `analytics`, `api`, `state`, `infra`, or `performance` only when the work item justifies them
- align all notes with the active `.claude` architecture contract
- if Jira or Figma MCP is unavailable, continue with explicit manual inputs instead of blocking the workflow

## Report

```text
✅ Jira work item mapped to domain: <domain>
✅ Orchestrator created: <path>
✅ SDD modules created: <list>
```
