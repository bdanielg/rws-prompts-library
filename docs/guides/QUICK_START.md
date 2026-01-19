# Quick Start Guide

Get started with the Prompt Manager MCP Server in minutes.

## Prerequisites

- **Node.js**: Version 20.0.0 or higher
- **npm**: Comes with Node.js
- **MCP-compatible client**: VSCode with MCP extension, Cursor, Claude Desktop, or similar

## Installation

### 1. Install Dependencies

```bash
cd rws-prompts-library
npm install
```

### 2. Build the Server

```bash
npm run build
```

This compiles TypeScript to JavaScript in the `build/` directory.

### 3. Start the Server

**Stdio mode (default for MCP clients):**
```bash
npm start
```

**HTTP Stream mode (for web clients):**
```bash
npm run dev
```

The server will start on `http://localhost:3000` in HTTP Stream mode.

## Configuration

### MCP Client Configuration

Add the server to your MCP client configuration:

**VSCode with MCP Extension** (`settings.json`):
```json
{
  "mcp.servers": {
    "prompt-manager": {
      "command": "node",
      "args": ["/path/to/rws-prompts-library/build/index.js"],
      "transport": "stdio"
    }
  }
}
```

**Cursor** (`.cursor/config.json`):
```json
{
  "mcpServers": {
    "prompt-manager": {
      "command": "node",
      "args": ["/path/to/rws-prompts-library/build/index.js"]
    }
  }
}
```

**Claude Desktop** (`claude_desktop_config.json`):
```json
{
  "mcpServers": {
    "prompt-manager": {
      "command": "node",
      "args": ["/path/to/rws-prompts-library/build/index.js"]
    }
  }
}
```

### Environment Variables

Create `.env` file (optional):

```bash
# Logging
LOG_LEVEL=info          # debug, info, warn, error
LOG_FORMAT=json         # json or simple

# Server (for HTTP Stream mode)
PORT=3000
HOST=localhost

# Transport
TRANSPORT=stdio         # stdio or httpStream
```

## First Steps

### 1. Browse the Library

See what's available in the prompt library:

**In your MCP client**, call the `list-prompts` tool:

```json
{
  "format": "tree"
}
```

**Response:**
```
📁 developer/
  📁 code-generation/
    📁 cashiering/
      📄 Payment Transaction Handler (v1)
    📁 gaming-ops/
      📄 Gaming Machine Integration API (v1)
  📁 refactoring/
    📁 membership/
      📄 Legacy Member Tracking System (v1)
📁 architect/
  📁 architecture-review/
    📁 security/
      📄 Security Architecture Review (v1)
📁 tester/
  📁 testing/
    📁 reporting/
      📄 Automated Test Suite (v1)
```

### 2. Search for a Prompt

Find prompts related to payments:

**Call the `search-prompts` tool:**

```json
{
  "keywords": "payment"
}
```

**Response includes:**
- Relevance scores
- Full metadata
- Content preview
- Matching fields

### 3. Create Your First Prompt

Add a new prompt to the library:

**Call the `add-prompt` tool:**

```json
{
  "name": "Database Migration Script",
  "description": "Create a safe database migration script for the membership module with rollback support",
  "role": "developer",
  "taskType": "code-generation",
  "module": "membership",
  "tags": ["database", "migration", "sql"],
  "content": "# Database Migration Script\n\nYou are tasked with creating a database migration script for the membership module.\n\n## Requirements\n\n1. Add new columns to member_profiles table\n2. Migrate existing data safely\n3. Include rollback script\n4. Test on staging first\n\n## Schema Changes\n\n```sql\nALTER TABLE member_profiles\nADD COLUMN tier VARCHAR(20) DEFAULT 'standard',\nADD COLUMN points_balance INT DEFAULT 0;\n```\n\n## Migration Steps\n\n1. Backup current table\n2. Run ALTER TABLE\n3. Update existing rows\n4. Verify data integrity\n5. Document changes\n\n## Rollback Plan\n\nProvide a rollback script in case of issues."
}
```

**Success response shows:**
- Generated prompt ID
- File location
- Full metadata
- Next steps

### 4. Update a Prompt

Modify an existing prompt (use the ID from step 3):

**Call the `update-prompt` tool:**

```json
{
  "id": "YOUR-PROMPT-ID-HERE",
  "tags": ["database", "migration", "sql", "safety", "rollback"]
}
```

**Response shows:**
- Version increment (now v2)
- Change summary
- Updated metadata

## Common Use Cases

### Use Case 1: Team Prompt Library

**Scenario**: Your team needs standardized prompts for code generation.

**Steps:**

1. **Create developer prompts** for each module:
   ```json
   {
     "name": "API Endpoint Generator",
     "role": "developer",
     "taskType": "code-generation",
     "module": "shared",
     "tags": ["api", "rest", "endpoint"],
     "content": "..."
   }
   ```

2. **Search by module** when working on specific features:
   ```json
   {
     "module": "cashiering",
     "taskType": "code-generation"
   }
   ```

3. **Browse by role** to see all available prompts:
   ```json
   {
     "role": "developer",
     "format": "table"
   }
   ```

### Use Case 2: Code Review Prompts

**Scenario**: Standardize security reviews across projects.

**Steps:**

1. **Create security review prompts**:
   ```json
   {
     "name": "Authentication Security Review",
     "role": "security-specialist",
     "taskType": "architecture-review",
     "module": "security",
     "tags": ["security", "authentication", "review"],
     "content": "# Authentication Security Review\n\n## Review Checklist\n\n- [ ] Password storage (bcrypt/argon2)\n- [ ] Session management\n- [ ] JWT token validation\n- [ ] OAuth implementation\n- [ ] Rate limiting\n..."
   }
   ```

2. **Search during reviews**:
   ```json
   {
     "role": "security-specialist",
     "keywords": "authentication"
   }
   ```

### Use Case 3: Testing Standards

**Scenario**: Ensure consistent test coverage across modules.

**Steps:**

1. **Create test prompts**:
   ```json
   {
     "name": "Integration Test Suite",
     "role": "tester",
     "taskType": "testing",
     "module": "shared",
     "tags": ["testing", "integration", "automation"],
     "content": "..."
   }
   ```

2. **Filter by testing**:
   ```json
   {
     "taskType": "testing",
     "format": "detailed"
   }
   ```

### Use Case 4: Refactoring Guidelines

**Scenario**: Modernize legacy code with consistent patterns.

**Steps:**

1. **Create refactoring prompts**:
   ```json
   {
     "name": "Legacy Code Modernization",
     "role": "developer",
     "taskType": "refactoring",
     "module": "membership",
     "tags": ["refactoring", "modernization", "typescript"],
     "content": "..."
   }
   ```

2. **Update as patterns evolve**:
   ```json
   {
     "id": "prompt-id",
     "content": "Updated with new patterns...",
     "tags": ["refactoring", "modernization", "typescript", "patterns-2024"]
   }
   ```

## Understanding the Hierarchy

### Role → Task Type → Module

Every prompt is organized by three dimensions:

```
Role (Who uses it)
  └─ Task Type (What they're doing)
      └─ Module (Where they're doing it)
```

### Valid Combinations

Not all role/task type combinations are valid:

| Role | Valid Task Types |
|------|------------------|
| **developer** | code-generation, refactoring, debugging, testing, documentation |
| **architect** | architecture-review, documentation, code-generation, refactoring |
| **tester** | testing, debugging, documentation |
| **security-specialist** | architecture-review, code-generation, testing, documentation |

### Modules

Modules represent functional areas:

- **cashiering**: Payment processing, transactions
- **gaming-ops**: Gaming operations, machine integration
- **membership**: Member management, profiles
- **reporting**: Analytics, reports, dashboards
- **security**: Authentication, authorization, encryption
- **shared**: Cross-cutting concerns, utilities

## Tips and Best Practices

### Writing Effective Prompts

1. **Be Specific**: Include concrete requirements and examples
2. **Structure Clearly**: Use headers, lists, and code blocks
3. **Add Context**: Explain the why, not just the what
4. **Include Examples**: Show desired input/output
5. **Consider Edge Cases**: Address error handling and validation

### Organizing Prompts

1. **Use Descriptive Names**: Make prompts easy to find
2. **Tag Thoroughly**: Add 3-5 relevant tags minimum
3. **Write Clear Descriptions**: Summarize the prompt's purpose
4. **Choose Correct Hierarchy**: Place in appropriate role/task/module
5. **Update Regularly**: Keep prompts current as standards evolve

### Searching Effectively

1. **Start Broad**: Begin with role or module filters
2. **Add Keywords**: Refine with specific terms
3. **Use Tags**: Filter by cross-cutting concerns
4. **Check Relevance**: Higher scores = better matches
5. **Browse Tree View**: Get overview of available content

### Managing Prompts

1. **Version Consciously**: Update when changing behavior
2. **Track Changes**: Note what changed in description or content
3. **Test Before Sharing**: Verify prompts work as intended
4. **Move Carefully**: Hierarchy changes relocate files
5. **Backup Important Prompts**: Version control recommended

## Troubleshooting

### Server Won't Start

**Issue**: `Error: Cannot find module 'build/index.js'`

**Solution**: Run `npm run build` first

---

**Issue**: `Port 3000 already in use`

**Solution**: 
- Stop other server on port 3000, OR
- Change port: `PORT=3001 npm run dev`

---

**Issue**: `Module not found: zod`

**Solution**: Run `npm install`

### Tool Errors

**Issue**: `Invalid combination: tester cannot have task type code-generation`

**Solution**: Use valid combinations (see [Valid Combinations](#valid-combinations))

---

**Issue**: `At least one search criterion must be provided`

**Solution**: Add role, taskType, module, keywords, or tags to search

---

**Issue**: `Prompt not found: [id]`

**Solution**: 
- Verify ID is correct (use `search-prompts` or `list-prompts`)
- Check prompt hasn't been deleted

### File System Issues

**Issue**: `EACCES: permission denied`

**Solution**: 
- Check directory permissions
- Ensure server has write access to `prompts/` directory

---

**Issue**: `ENOENT: no such file or directory`

**Solution**: 
- Create missing directories: `mkdir -p prompts/developer/code-generation/cashiering`
- Run with proper working directory

## Next Steps

### Explore Further

1. **Read Architecture Guide**: [ARCHITECTURE.md](ARCHITECTURE.md)
   - Understand system design
   - Learn about design patterns
   - See data flow diagrams

2. **Study Prompt Structure**: [PROMPT_STRUCTURE.md](PROMPT_STRUCTURE.md)
   - Master the hierarchy
   - Learn best practices
   - See common patterns

3. **Review API Reference**: [API.md](API.md)
   - Complete tool documentation
   - Parameter details
   - Error handling

### Contribute

1. **Create Sample Prompts**: Add prompts for your domain
2. **Share Feedback**: Report issues or suggest improvements
3. **Extend the Server**: Add new tools or features
4. **Document Patterns**: Share your workflows

### Advanced Usage

1. **Batch Operations**: Script multiple prompts
2. **Integration**: Connect to CI/CD pipelines
3. **Custom Clients**: Build specialized UIs
4. **Analytics**: Track prompt usage and effectiveness

## Getting Help

### Resources

- **Documentation**: [docs/guides/](.)
- **Examples**: [prompts/](../../prompts/) directory
- **Source Code**: [src/](../../src/) directory

### Common Questions

**Q: Can I have multiple prompts with the same name?**  
A: Yes, but they must have different IDs. Names are for human readability.

**Q: What happens when I change a prompt's hierarchy?**  
A: Files are automatically moved to the new location. Version increments.

**Q: Can I delete prompts?**  
A: Currently, deletion is not supported via tools. Manually remove files if needed.

**Q: How do I backup my prompts?**  
A: The `prompts/` directory contains all prompt files. Use git or backup tool.

**Q: Can I import existing prompts?**  
A: Manually create files in the correct hierarchy, or use `add-prompt` tool.

**Q: What's the maximum prompt size?**  
A: 50,000 characters for content field.

## Example Session

Here's a complete example session from start to finish:

### 1. Start the Server

```bash
$ npm run build
$ npm start

✅ Prompt Manager MCP Server started
   Transport: stdio
   Version: 1.0.0
   PID: 12345
```

### 2. List Available Prompts

**Tool Call**: `list-prompts`
```json
{ "format": "tree" }
```

**Result**: See hierarchical tree of 5 sample prompts

### 3. Search for Payment Prompts

**Tool Call**: `search-prompts`
```json
{
  "module": "cashiering",
  "keywords": "payment"
}
```

**Result**: Found "Payment Transaction Handler" with score 35

### 4. Create API Documentation Prompt

**Tool Call**: `add-prompt`
```json
{
  "name": "API Documentation Generator",
  "description": "Generate comprehensive API documentation from code with examples and schemas",
  "role": "developer",
  "taskType": "documentation",
  "module": "shared",
  "tags": ["api", "documentation", "swagger", "openapi"],
  "content": "# API Documentation Generator\n\nGenerate API docs..."
}
```

**Result**: Prompt created with ID `abc-123...`

### 5. Update Prompt Tags

**Tool Call**: `update-prompt`
```json
{
  "id": "abc-123...",
  "tags": ["api", "documentation", "swagger", "openapi", "rest"]
}
```

**Result**: Updated to version 2, tag "rest" added

### 6. Search for Documentation Prompts

**Tool Call**: `search-prompts`
```json
{
  "taskType": "documentation",
  "format": "table"
}
```

**Result**: See all documentation prompts in table format

---

**You're ready to manage your prompt library!** Start creating, searching, and using prompts to standardize your team's AI-assisted development workflows.
