# Packaging for npm/npx

Your MCP server is now packaged for distribution via npm and can be used with `npx`.

## Configuration Added

### package.json Updates
- **bin field**: Makes the package executable via `npx prompt-manager-mcp`
- **files field**: Specifies what gets published (build, prompts, README, LICENSE)
- **prepublishOnly script**: Ensures build runs before publishing
- **repository info**: Added PALO IT as author and repository URL
- **Additional keywords**: For better npm discoverability

### New Files
- **.npmignore**: Excludes source files and development files from npm package
- **mcp-config.example.json**: Example configuration for Claude Desktop/MCP clients

## Usage

### For Users (after publishing to npm)

Add to your MCP client configuration (e.g., Claude Desktop's `~/Library/Application Support/Claude/claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "prompt-manager": {
      "command": "npx",
      "args": ["-y", "prompt-manager-mcp@latest"],
      "type": "stdio"
    }
  }
}
```

### Local Testing (before publishing)

Test locally using npm link:

```bash
# In this directory
npm link

# Test it
npx prompt-manager-mcp
```

Or test directly:
```bash
node build/index.js
```

### Publishing to npm

When ready to publish:

```bash
# Login to npm (first time only)
npm login

# Publish the package
npm publish

# Or for scoped packages
npm publish --access public
```

### Version Updates

```bash
# Update version and publish
npm version patch  # 1.0.0 -> 1.0.1
npm version minor  # 1.0.0 -> 1.1.0
npm version major  # 1.0.0 -> 2.0.0
npm publish
```

## What Gets Published

Only these files/folders will be included in the npm package:
- `build/` - Compiled JavaScript
- `prompts/` - All prompt files and metadata
- `README.md` - Documentation
- `LICENSE` - License file
- `package.json` - Package metadata

Source files (`src/`), development files, and docs are excluded.

## Testing the Package

Before publishing, you can test the package locally:

```bash
# Create a test package
npm pack

# This creates a .tgz file you can install elsewhere
# Install it in another project:
npm install /path/to/prompt-manager-mcp-1.0.0.tgz
```
