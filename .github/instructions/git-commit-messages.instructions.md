---
applyTo: "manual-only"
---

# Git Commit Message Guidelines

## Format Requirements

All commit messages must follow the Conventional Commits + Gitmoji format:

```
<type>(<scope>): <gitmoji> <description>
```

## Project Scopes

Use these specific scopes for this MCP project:

- `auth` - Authentication and authorization (OAuth, JWT, login, permissions)
- `tools` - MCP tools implementation (tool definitions, handlers)
- `resources` - MCP resources and content (resource files, rule sets)
- `prompts` - Prompt templates and management (prompt files, handlers)
- `sampling` - MCP sampling capabilities (sampling workflows, LLM interactions)
- `roots` - MCP roots capabilities (boundaries where servers can operate)

## Common Gitmojis for MCP Development

| Emoji | Type         | Usage                    |
| ----- | ------------ | ------------------------ |
| ✨    | `feat`       | New features             |
| 🐛    | `fix`        | Bug fixes                |
| 📝    | `docs`       | Documentation            |
| 🔌    | `feat`/`fix` | MCP tools changes        |
| 📋    | `feat`/`fix` | MCP resources changes    |
| 💬    | `feat`/`fix` | Prompt template changes  |
| 🤖    | `feat`/`fix` | AI/LLM sampling features |
| 🔐    | `feat`/`fix` | Authentication changes   |
| ⚙️    | `feat`/`fix` | MCP server configuration |
| 🔧    | `fix`        | Bug fixes and patches    |
| 🚀    | `feat`       | Performance improvements |
| 📦    | `build`      | Build system changes     |

## Examples

```
feat(auth): 🔐 add OAuth 2.1 PKCE flow implementation
fix(tools): 🐛 handle empty parameters in generate-plan tool
feat(resources): 📋 add Vue.js development rules
feat(prompts): 💬 add code review prompt template
feat(sampling): 🤖 implement recursive prompt processing
feat(roots): ⚙️ configure MCP server operational boundaries
docs(readme): 📝 update installation instructions
```

## Breaking Changes

For breaking changes, add `!` after the scope:

```
feat(auth)!: 🔐 redesign authentication system
fix(tools)!: 🐛 remove deprecated tool parameters
```

## Validation Checklist

Before committing, ensure your message:

- [ ] Uses a valid conventional commit type (`feat`, `fix`, `docs`, etc.)
- [ ] Includes a scope when applicable
- [ ] Has an appropriate gitmoji after the colon and space
- [ ] Has a clear, imperative description after the gitmoji
- [ ] Stays under 72 characters for the subject line
- [ ] Uses `!` after scope for breaking changes
- [ ] References relevant issues in the footer (if applicable)
- [ ] Uses imperative mood ("add feature" not "added feature")

## Visual Benefits

This format provides better visual scanning in:

- **Git logs**: Clear type/scope followed by visual gitmoji
- **Changelogs**: Enhanced readability with emoji highlighting
- **IDE integration**: Better syntax highlighting support
- **Release notes**: AI enhancement can use gitmoji context

## Complete Reference

For comprehensive guidelines including all gitmojis, commit types, and detailed examples, see [resources/rules/git/commit-message-rules.md](mdc:resources/rules/git/commit-message-rules.md).

## Release Automation Integration

Our Release Management workflow uses conventional commits to automatically:

- **Determine version bumps**: `feat:` → minor, `fix:` → patch, `BREAKING CHANGE` → major
- **Generate changelogs**: Commit messages become changelog entries
- **Trigger deployments**: Releases automatically deploy to Azure

### Critical for Release Automation

```bash
# These commit types trigger different version bumps:
git commit -m "feat: ✨ add new feature"           # Minor version bump (x.Y.0)
git commit -m "fix: 🐛 resolve critical bug"       # Patch version bump (x.x.Z)
git commit -m "feat!: 🔐 redesign API"            # Major version bump (X.0.0)

# Breaking changes can also be in the body:
git commit -m "feat(auth): 🔐 new auth system

BREAKING CHANGE: All existing auth tokens will be invalidated"
```

### AI Enhancement Considerations

Since commits become AI-enhanced changelog entries:

- **Write descriptive messages**: AI enhances based on your commit content
- **Include context**: Explain the "why" not just the "what"
- **Reference issues**: Include issue numbers for better context
- **Use clear subjects**: Avoid cryptic abbreviations or internal jargon
- **Leverage gitmoji context**: AI can use emoji meaning for better descriptions

### Example Commit for Release Quality

```bash
# Good for AI enhancement
git commit -m "feat(auth): 🔐 implement OAuth 2.0 with Azure AD integration

Adds comprehensive OAuth 2.0 authentication system supporting:
- PKCE flow for security
- Azure AD as identity provider
- Session management with JWT tokens
- Automatic token refresh

Resolves #123, #124"

# Less ideal (but still functional)
git commit -m "feat: ✨ add auth"
```

## Git Hook Integration

The release workflow automatically normalizes various commit formats to this standard, but using the correct format from the start ensures:

- Better changelog generation
- Proper version bump detection
- Enhanced AI processing
- Consistent
