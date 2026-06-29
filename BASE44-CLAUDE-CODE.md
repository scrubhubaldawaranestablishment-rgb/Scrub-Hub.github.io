# Connect Claude Code to Base44

This project is configured to use the official **Base44 MCP server** with [Claude Code](https://code.claude.com/).

## What this gives you

Once connected, Claude Code can:

- Create and edit Base44 apps (`create_base44_app`, `edit_base44_app`)
- List your apps (`list_user_apps`)
- Read/write app data (`list_entity_schemas`, `query_entities`, `create_entities`, `update_entities`)
- Inspect and edit app source files (`read_file`, `write_file`, `edit_file`, `grep`, `run_command`)
- Check build status and preview URLs (`get_app_status`, `get_app_preview_url`)

**CompliGuard app ID:** `6a3bd901574ca39ed1b9289d`  
**Live URL:** https://compliguard-platform.base44.app  
**Editor:** https://app.base44.com/apps/6a3bd901574ca39ed1b9289d/editor/preview

## Already configured in this repo

| File | Purpose |
|------|---------|
| [`.mcp.json`](./.mcp.json) | Base44 MCP server URL |
| [`.claude/settings.json`](./.claude/settings.json) | Auto-approve `base44` MCP server |

```json
// .mcp.json
{
  "mcpServers": {
    "base44": {
      "type": "http",
      "url": "https://app.base44.com/mcp"
    }
  }
}
```

```json
// .claude/settings.json
{
  "enableAllProjectMcpServers": true,
  "enabledMcpjsonServers": ["base44"]
}
```

## Finish setup (one step on your side)

### 1. Install Claude Code (if needed)

```bash
npm install -g @anthropic-ai/claude-code
```

### 2. Sign in to Claude Code

```bash
claude
```

Sign in with your Anthropic account when prompted.

### 3. Complete Base44 OAuth (required once)

From this project directory:

```bash
cd /path/to/your/repo
claude mcp login base44
```

Sign in with **scrubhubaldawaranestablishment@gmail.com** (Google or email). Approve access when asked.

### 4. Verify the connection

Exit the session, then run:

```bash
claude mcp list
```

You should see:

```text
base44: https://app.base44.com/mcp (HTTP) - ✓ Connected
```

If it shows `! Needs authentication`, run `/mcp` again and complete OAuth.

## Optional: use Base44 in all projects

To add Base44 globally (not just this repo):

```bash
claude mcp add --scope user --transport http base44 https://app.base44.com/mcp
```

## Example prompts in Claude Code

```text
List all my Base44 apps.
```

```text
Edit my CompliGuard app (6a3bd901574ca39ed1b9289d) to add toast notifications on every save action.
```

```text
Query ComplianceRecord entities in app 6a3bd901574ca39ed1b9289d and show expired records.
```

```text
Check build status for app 6a3bd901574ca39ed1b9289d.
```

## Troubleshooting

| Symptom | Fix |
|--------|-----|
| `Pending approval` | Run `claude`, then `/mcp` → approve **base44** |
| `Needs authentication` | `/mcp` → **base44** → **Authenticate** (browser OAuth) |
| `Failed to connect` | Check network; confirm `https://app.base44.com/mcp` is reachable |
| Changes not picked up | Restart the `claude` session after editing `.mcp.json` |
| Server already exists | `claude mcp remove base44 -s project` then re-add |

Reset project approvals if you rejected the server earlier:

```bash
claude mcp reset-project-choices
```

## References

- [Base44 MCP server docs](https://docs.base44.com/developers/backend/overview/mcp-server)
- [Claude Code MCP quickstart](https://code.claude.com/docs/en/mcp-quickstart)
- [Claude Code MCP reference](https://code.claude.com/docs/en/mcp)
