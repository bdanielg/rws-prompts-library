# MCP Integration Guide

## Overview

This guide explains how to integrate the Prompt Manager MCP Server with various MCP clients using the `mcp.json` configuration format.

## Configuration File Locations

Different MCP clients look for configuration in different locations:

### Claude Desktop
```
~/Library/Application Support/Claude/claude_desktop_config.json
```

### VSCode with GitHub Copilot
```
~/Library/Application Support/Code/User/settings.json
```

### Cursor
```
~/.cursor/config.json
```

### Cline (VSCode Extension)
```
~/Library/Application Support/Code/User/globalStorage/saoudrizwan.claude-dev/settings/cline_mcp_settings.json
```

## Setup Instructions

### 1. Using the Provided mcp.json

The project includes a pre-configured [`mcp.json`](../../mcp.json) file. You can:

**Option A: Copy to Client Config Location**

```bash
# For Claude Desktop
cat mcp.json > ~/Library/Application\ Support/Claude/claude_desktop_config.json

# For Cursor
mkdir -p ~/.cursor
cat mcp.json > ~/.cursor/config.json
```

**Option B: Merge with Existing Config**

If you already have other MCP servers configured, merge the `prompt-manager` entry:

```json
{
  "mcpServers": {
    "existing-server": {
      "command": "...",
      "args": ["..."]
    },
    "prompt-manager": {
      "command": "node",
      "args": [
        "/Users/dbaylon/Desktop/Development/00 Workspaces/developments/palo-it/rws-palo/rws-prompts-library/build/index.js"
      ]
    }
  }
}
```

### 2. VSCode with GitHub Copilot

Edit VSCode settings (`Cmd+Shift+P` → "Preferences: Open User Settings (JSON)"):

```json
{
  "github.copilot.chat.mcp.servers": {
    "prompt-manager": {
      "command": "node",
      "args": [
        "/Users/dbaylon/Desktop/Development/00 Workspaces/developments/palo-it/rws-palo/rws-prompts-library/build/index.js"
      ]
    }
  }
}
```

### 3. Using Relative Paths (Recommended for Portability)

If you want the configuration to work across different machines or users, use a helper script:

**Create `run-server.sh`:**

```bash
#!/bin/bash
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
node "$DIR/build/index.js"
```

**Make it executable:**

```bash
chmod +x run-server.sh
```

**Update mcp.json:**

```json
{
  "mcpServers": {
    "prompt-manager": {
      "command": "/absolute/path/to/run-server.sh",
      "args": []
    }
  }
}
```

## Configuration Options

### Basic Configuration

Minimal configuration for stdio transport (default):

```json
{
  "mcpServers": {
    "prompt-manager": {
      "command": "node",
      "args": ["path/to/build/index.js"]
    }
  }
}
```

### With Environment Variables

Add environment variables for logging or other settings:

```json
{
  "mcpServers": {
    "prompt-manager": {
      "command": "node",
      "args": ["path/to/build/index.js"],
      "env": {
        "LOG_LEVEL": "debug",
        "TRANSPORT": "stdio"
      }
    }
  }
}
```

### HTTP Stream Transport (Alternative)

For HTTP-based communication instead of stdio:

```json
{
  "mcpServers": {
    "prompt-manager": {
      "command": "node",
      "args": ["path/to/build/index.js"],
      "env": {
        "TRANSPORT": "httpStream",
        "PORT": "3000",
        "HOST": "localhost"
      }
    }
  }
}
```

**Note:** Most MCP clients expect stdio transport. Use HTTP Stream only if your client specifically supports it.

## Testing Your Configuration

### 1. Validate Configuration File

Check if your JSON is valid:

```bash
# For Claude Desktop
cat ~/Library/Application\ Support/Claude/claude_desktop_config.json | jq .

# For project mcp.json
cat mcp.json | jq .
```

### 2. Test Server Starts

Verify the server starts with your configuration:

```bash
node build/index.js
```

You should see no errors. Press `Ctrl+C` to stop.

### 3. Test with MCP Inspector

Use the inspector to verify the configuration works:

```bash
npx @modelcontextprotocol/inspector node build/index.js
```

### 4. Restart Your MCP Client

After updating configuration:

- **Claude Desktop**: Quit and restart the app
- **VSCode**: Reload window (`Cmd+Shift+P` → "Developer: Reload Window")
- **Cursor**: Restart the app

## Verification

Once configured, verify the integration:

### In Claude Desktop

Ask Claude:
```
List all available tools
```

You should see: `search-prompts`, `list-prompts`, `add-prompt`, `update-prompt`

Then try:
```
Use the list-prompts tool to show me all prompts
```

### In VSCode/Cursor with Copilot

Open Copilot Chat and ask:
```
Show me all prompts in the library
```

Copilot should automatically use the `list-prompts` tool.

## Troubleshooting

### Server Not Appearing

1. **Check file path**: Ensure the absolute path to `build/index.js` is correct
2. **Verify build**: Run `npm run build` to ensure latest code is compiled
3. **Check JSON syntax**: Use `jq` or an online JSON validator
4. **Review logs**: Check client logs for connection errors

### Connection Errors

1. **Ensure Node.js is in PATH**: Test with `which node`
2. **Check file permissions**: Ensure `build/index.js` is readable
3. **Verify dependencies**: Run `npm install` to ensure all packages are installed

### Tools Not Working

1. **Check server logs**: Logs are written to stderr
2. **Test with Inspector**: Use MCP Inspector to debug
3. **Verify prompt files**: Ensure sample prompts exist in `prompts/` directory

## Advanced Configuration

### Multiple Environments

Create separate configurations for development and production:

**Development** (`mcp.dev.json`):
```json
{
  "mcpServers": {
    "prompt-manager-dev": {
      "command": "node",
      "args": ["build/index.js"],
      "env": {
        "LOG_LEVEL": "debug"
      }
    }
  }
}
```

**Production** (`mcp.prod.json`):
```json
{
  "mcpServers": {
    "prompt-manager": {
      "command": "node",
      "args": ["build/index.js"],
      "env": {
        "LOG_LEVEL": "error"
      }
    }
  }
}
```

### Automatic Rebuild on Changes

For development, create a wrapper script that rebuilds before starting:

**`run-dev.sh`:**
```bash
#!/bin/bash
cd "$(dirname "$0")"
npm run build && node build/index.js
```

Update mcp.json:
```json
{
  "mcpServers": {
    "prompt-manager": {
      "command": "/path/to/run-dev.sh",
      "args": []
    }
  }
}
```

## Team Deployment

### Shared Configuration Template

Create a template that team members can customize:

**`mcp.template.json`:**
```json
{
  "mcpServers": {
    "prompt-manager": {
      "command": "node",
      "args": [
        "${PROJECT_PATH}/build/index.js"
      ],
      "env": {
        "LOG_LEVEL": "${LOG_LEVEL:-info}"
      }
    }
  }
}
```

**Team instructions:**
1. Clone repository
2. Run `npm install && npm run build`
3. Copy `mcp.template.json` and replace `${PROJECT_PATH}` with actual path
4. Copy to client config location

### Docker Deployment (Advanced)

For containerized deployment:

**Dockerfile:**
```dockerfile
FROM node:20-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY build ./build
COPY prompts ./prompts

CMD ["node", "build/index.js"]
```

**docker-compose.yml:**
```yaml
version: '3.8'
services:
  prompt-manager:
    build: .
    environment:
      - LOG_LEVEL=info
      - TRANSPORT=httpStream
      - PORT=3000
    ports:
      - "3000:3000"
```

## Quick Reference

### File Paths

| Client | Config Location |
|--------|----------------|
| Claude Desktop | `~/Library/Application Support/Claude/claude_desktop_config.json` |
| VSCode | `~/Library/Application Support/Code/User/settings.json` |
| Cursor | `~/.cursor/config.json` |
| Cline | `~/Library/Application Support/Code/User/globalStorage/saoudrizwan.claude-dev/settings/cline_mcp_settings.json` |

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `LOG_LEVEL` | `info` | Logging level (debug, info, warn, error) |
| `TRANSPORT` | `stdio` | Transport type (stdio, httpStream) |
| `PORT` | `3000` | HTTP port (when using httpStream) |
| `HOST` | `localhost` | HTTP host (when using httpStream) |

### Commands

```bash
# Build project
npm run build

# Test server
node build/index.js

# Test with inspector
npx @modelcontextprotocol/inspector node build/index.js

# Validate JSON
cat mcp.json | jq .

# Install dependencies
npm install
```

## Additional Resources

- [MCP Documentation](https://modelcontextprotocol.io)
- [Claude Desktop Guide](https://support.anthropic.com/en/articles/claude-desktop)
- [Project Documentation](../guides/QUICK_START.md)
