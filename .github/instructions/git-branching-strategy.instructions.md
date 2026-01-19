---
applyTo: "manual-only"
---

# Git Branching Strategy - GitHub Flow

## Overview

This project follows **GitHub Flow** with a protected `main` branch. All development work happens in feature branches that require Pull Request reviews before merging.

## Branch Naming Convention

Use this format for all branches:

```
<type>/<scope>-<short-description>
```

### Branch Types

- `feature` - New functionality
- `bugfix` - Bug fixes
- `hotfix` - Critical production fixes
- `docs` - Documentation updates
- `refactor` - Code refactoring
- `test` - Test improvements
- `chore` - Maintenance tasks

### Scopes (same as commit scopes)

- `auth` - Authentication and authorization
- `tools` - MCP tools implementation
- `resources` - MCP resources and content
- `prompts` - Prompt templates and management
- `sampling` - MCP sampling capabilities
- `roots` - MCP roots capabilities (boundaries where servers can operate)

## Branch Examples

```
feature/auth-pkce-implementation
bugfix/tools-empty-parameters
hotfix/roots-server-boundaries
docs/resources-loading-guide
refactor/prompts-template-structure
test/sampling-integration-tests
chore/roots-dependency-updates
```

## Workflow Process

### 1. Start New Work

```bash
# Ensure you're on main and up to date
git checkout main
git pull origin main

# Create and checkout feature branch
git checkout -b feature/auth-new-provider
```

### 2. Development

```bash
# Make changes and commit with proper format
git add .
git commit -m "🔐 feat(auth): add new OAuth provider support"

# Push branch
git push -u origin feature/auth-new-provider
```

### 3. Pull Request

```bash
# Create PR with proper title format
gh pr create --title "🔐 feat(auth): add new OAuth provider support" \
             --body "Implements support for additional OAuth providers..."
```

## Pull Request Requirements

### Title Format

Follow commit message format:

```
<gitmoji> <type>(<scope>): <description>
```

### Review Requirements

- ✅ Minimum 1 reviewer (enforced by branch protection)
- ✅ All CI/CD checks must pass
- ✅ Branch must be up to date with main
- ✅ Squash and merge (recommended)
- ✅ Delete branch after merge

## MCP-Specific Testing

Before creating a PR, ensure:

- [ ] Server starts without errors
- [ ] Tools respond correctly
- [ ] Resources load properly
- [ ] Prompts render as expected
- [ ] Client connections stable (VSCode, Cursor)
- [ ] Authentication flows work (if auth changes)
- [ ] No breaking changes to existing functionality

## Key Files to Consider

When making changes, consider impact on:

- [src/index.ts](mdc:src/index.ts) - Main MCP server entry point
- [src/mcp-server-adapter.ts](mdc:src/mcp-server-adapter.ts) - Adapter for FastMCP integration
- [src/tools/](mdc:src/tools) - MCP tool implementations
- [src/resources/](mdc:src/resources) - MCP resource handlers
- [src/prompts/](mdc:src/prompts) - Prompt management
- [src/auth/](mdc:src/auth) - Authentication system
- [package.json](mdc:package.json) - Dependencies and scripts

## Complete Reference

For detailed workflow processes, hotfix procedures, troubleshooting, and advanced Git operations, see [resources/rules/git/branching-strategy-rules.md](mdc:resources/rules/git/branching-strategy-rules.md).

## Release Integration

### Release Branch Strategy

- **No release branches**: Releases happen directly from `main`
- **Release preparation**: Ensure `main` is stable before triggering release workflow
- **Hotfixes**: Create hotfix branches that merge to `main`, then trigger patch release

### Pre-Release Checklist

Before triggering a release:

- [ ] All intended features/fixes are merged to `main`
- [ ] All commits follow conventional format
- [ ] No work-in-progress commits on `main`
- [ ] Any breaking changes are properly documented in commit messages

### Release Coordination

1. **Communicate intent**: Let team know a release is planned
2. **Freeze main**: Avoid merging new changes during release process
3. **Test thoroughly**: Use dry run to verify release content
4. **Monitor deployment**: Watch Azure deployment after release
