# MCP Enterprise Governance

## Objective

Define how Jira and Figma MCP integrations are configured for the FUSE enterprise agent system.

## Principles

- project-shared MCP definitions live in `.mcp.json`
- credentials never live in git
- environment variables provide deployment-specific URLs and bearer tokens
- only approved project MCP servers are enabled in `.claude/settings.json`
- `.claude` commands and skills may depend on Jira and Figma conceptually, but must degrade gracefully when MCP is unavailable

## Active Project MCPs

- `jira`
- `figma`

## Configuration Model

Project-scoped MCP definitions:

- [`.mcp.json`](/Users/eugeniosilva/Project/FUSE/.mcp.json)

Project approval surface:

- [`.claude/settings.json`](/Users/eugeniosilva/Project/FUSE/.claude/settings.json)

Environment placeholders:

- [`.env.example`](/Users/eugeniosilva/Project/FUSE/.env.example)

Local developer override example:

- [`.claude/settings.local.example.json`](/Users/eugeniosilva/Project/FUSE/.claude/settings.local.example.json)

Operational onboarding:

- [`.claude/sdd/system/integrations/mcp-onboarding.md`](/Users/eugeniosilva/Project/FUSE/.claude/sdd/system/integrations/mcp-onboarding.md)

## Why HTTP MCP

HTTP is the recommended transport for remote MCP services and best fits enterprise gateway patterns.

Recommended deployment shape:

- internal Jira MCP gateway
- internal Figma MCP gateway
- org-managed auth and rotation outside the repo

## Required Environment Variables

### Jira

- `FUSE_MCP_JIRA_URL`
- `FUSE_MCP_JIRA_BEARER`
- `FUSE_MCP_JIRA_WORKSPACE`

### Figma

- `FUSE_MCP_FIGMA_URL`
- `FUSE_MCP_FIGMA_BEARER`
- `FUSE_MCP_FIGMA_TEAM`

## Operational Rules

- if Jira MCP is unavailable, intake can still proceed from pasted issue content
- if Figma MCP is unavailable, UI planning can still proceed from links and manually extracted notes
- do not block the full SDD pipeline on MCP availability
- do not store OAuth tokens or API tokens in tracked project files

## Future Hardening

- managed MCP allowlists for enterprise machines
- dedicated auth helper or OAuth flow where supported
- channel-based MCP notifications for PR and delivery events
- telemetry around MCP usage and failure modes
