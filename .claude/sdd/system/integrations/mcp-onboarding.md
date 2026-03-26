# MCP Onboarding

## Objective

Enable Jira and Figma MCP access for a developer without changing the shared project contract.

## Files Involved

- [`.mcp.json`](/Users/eugeniosilva/Project/FUSE/.mcp.json)
- [`.claude/settings.json`](/Users/eugeniosilva/Project/FUSE/.claude/settings.json)
- [`.claude/settings.local.example.json`](/Users/eugeniosilva/Project/FUSE/.claude/settings.local.example.json)
- [`.env.example`](/Users/eugeniosilva/Project/FUSE/.env.example)

## 5-Minute Setup

1. Create a local env file from [`.env.example`](/Users/eugeniosilva/Project/FUSE/.env.example) if you do not have one yet.
2. Fill only the MCP variables you actually need:
   `FUSE_MCP_JIRA_URL`, `FUSE_MCP_JIRA_BEARER`, `FUSE_MCP_JIRA_WORKSPACE`, `FUSE_MCP_FIGMA_URL`, `FUSE_MCP_FIGMA_BEARER`, `FUSE_MCP_FIGMA_TEAM`.
3. Copy [`.claude/settings.local.example.json`](/Users/eugeniosilva/Project/FUSE/.claude/settings.local.example.json) to `.claude/settings.local.json` only if you need personal local overrides.
4. Start Claude Code in the repo and run `/mcp`.
5. Confirm that `jira` and `figma` appear and authenticate if the gateway requires it.

## Expected Result

- the project recognizes the shared MCP definitions from [`.mcp.json`](/Users/eugeniosilva/Project/FUSE/.mcp.json)
- Claude Code approves the project MCP names declared in [`.claude/settings.json`](/Users/eugeniosilva/Project/FUSE/.claude/settings.json)
- credentials remain local and untracked

## Validation

Use `/mcp` and verify:

- `jira` is connected or ready to authenticate
- `figma` is connected or ready to authenticate

Then test the workflow with:

```text
/jira-to-sdd auth-login-refresh
```

and provide either:

- pasted Jira issue content
- a Jira link plus structured summary
- a Figma link when UI context is required

## Troubleshooting

### MCP server does not appear

- verify the JSON in [`.mcp.json`](/Users/eugeniosilva/Project/FUSE/.mcp.json)
- verify the server name is included in [`.claude/settings.json`](/Users/eugeniosilva/Project/FUSE/.claude/settings.json)
- verify the required env vars are set in your local environment

### Authentication fails

- confirm the bearer token is valid
- confirm the gateway URL is reachable
- retry via `/mcp` if the server uses an interactive auth step

### Jira or Figma is temporarily unavailable

- continue with pasted issue content
- continue with manual Figma notes or design screenshots
- do not block SDD creation on MCP availability alone
