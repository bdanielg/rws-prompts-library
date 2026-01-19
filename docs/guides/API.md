# Prompt Manager MCP Server - API Reference

## Overview

This document provides complete API reference for all MCP tools available in the Prompt Manager server. Each tool is accessible through MCP-compatible clients like VSCode, Cursor, Claude Desktop, and others.

## Tools

The server provides four main tools:

1. [search-prompts](#search-prompts) - Find prompts by criteria
2. [list-prompts](#list-prompts) - Browse prompts hierarchically
3. [add-prompt](#add-prompt) - Create new prompts
4. [update-prompt](#update-prompt) - Modify existing prompts

---

## search-prompts

Search for prompts using various criteria with relevance scoring.

### Description

Finds prompts matching the specified criteria and returns results sorted by relevance. Supports filtering by role, task type, module, keywords, and tags. Results include relevance scores and matching snippets.

### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `role` | enum | No | Filter by role: `developer`, `architect`, `tester`, `security-specialist` |
| `taskType` | enum | No | Filter by task type: `code-generation`, `refactoring`, `testing`, `debugging`, `documentation`, `architecture-review` |
| `module` | enum | No | Filter by module: `cashiering`, `gaming-ops`, `membership`, `reporting`, `security`, `shared` |
| `keywords` | string | No | Space-separated keywords to search in name, description, and content |
| `tags` | string[] | No | Array of tags to match |
| `maxResults` | number | No | Maximum results to return (default: 20, max: 100) |

**Note:** At least one search criterion must be provided.

### Examples

**Search by role and module:**
```json
{
  "role": "developer",
  "module": "cashiering"
}
```

**Search by keywords:**
```json
{
  "keywords": "payment transaction API"
}
```

**Search by tags:**
```json
{
  "tags": ["security", "authentication"]
}
```

**Combined search:**
```json
{
  "role": "developer",
  "taskType": "code-generation",
  "module": "cashiering",
  "keywords": "payment",
  "maxResults": 10
}
```

### Response

Returns markdown-formatted search results with:
- Total number of matches
- Search criteria summary
- For each result:
  - Name and relevance score
  - Complete metadata (ID, role, task type, module, tags, version)
  - Description
  - Matching fields with snippets
  - Content preview (first 200 characters)

**Example Response:**
```markdown
# Search Results

Found **2** matching prompts.

**Search Criteria:**
- **Role:** developer
- **Module:** cashiering

---

## 1. Payment Transaction Handler

**Relevance Score:** 35

**Details:**
- **ID:** `550e8400-e29b-41d4-a716-446655440001`
- **Role:** developer
- **Task Type:** code-generation
- **Module:** cashiering
- **Tags:** payment, transaction, api, security
- **Version:** 1
- **Updated:** 1/17/2026, 12:00:00 AM

**Description:**
Implement a robust payment transaction handler...

**Matches:**
- **module:** cashiering
- **tags:** payment, transaction

**Content Preview:**
```
# Payment Transaction Handler

You are tasked with implementing...
```
---
```

### Error Responses

**No criteria provided:**
```markdown
# Search Error

❌ **Error:** At least one search criterion must be provided

Please check your search criteria and try again.
```

**No results:**
```markdown
# Search Results

No prompts found matching your criteria.

**Search Criteria:**
- **Keywords:** nonexistent
```

### Relevance Scoring

Results are scored and sorted by relevance:

- **Exact role match**: +10 points
- **Exact taskType match**: +10 points
- **Exact module match**: +10 points
- **Per matching tag**: +5 points
- **Keyword in name**: +15 points
- **Keyword in description**: +5 points

---

## list-prompts

List prompts with optional filtering and multiple output formats.

### Description

Browse the prompt library with optional filters. Supports three output formats: tree view (hierarchical), table view (compact), and detailed view (full metadata).

### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `role` | enum | No | Filter by role |
| `taskType` | enum | No | Filter by task type |
| `module` | enum | No | Filter by module |
| `format` | enum | No | Output format: `tree`, `table`, `detailed` (default: `tree`) |

### Examples

**List all prompts (tree view):**
```json
{
  "format": "tree"
}
```

**List developer prompts in table format:**
```json
{
  "role": "developer",
  "format": "table"
}
```

**List code-generation prompts for cashiering module:**
```json
{
  "taskType": "code-generation",
  "module": "cashiering",
  "format": "detailed"
}
```

### Response Formats

#### Tree Format

Hierarchical view of the prompt library:

```markdown
# Prompt Library

**Total Prompts:** 5

```
📁 developer/
  📁 code-generation/
    📁 cashiering/
      📄 Payment Transaction Handler (v1)
      📄 Refund Processor (v1)
    📁 gaming-ops/
      📄 Gaming Machine Integration API (v1)
  📁 refactoring/
    📁 membership/
      📄 Legacy Member Tracking System Refactoring (v1)
📁 architect/
  📁 architecture-review/
    📁 security/
      📄 Security Architecture Review (v1)
```
```

#### Table Format

Compact table view:

```markdown
# Prompt Library

**Total Prompts:** 5

| Name | Role | Task Type | Module | Tags | Version | Updated |
|------|------|-----------|--------|------|---------|---------|
| Payment Transaction Handler | developer | code-generation | cashiering | payment, transaction, api... | 1 | 1/17/2026 |
| Gaming Machine Integration | developer | code-generation | gaming-ops | gaming, api, integration... | 1 | 1/17/2026 |
...
```

#### Detailed Format

Full metadata for each prompt:

```markdown
# Prompt Library - Detailed View

**Total Prompts:** 5

---

## 1. Payment Transaction Handler

**Metadata:**
- **ID:** `550e8400-e29b-41d4-a716-446655440001`
- **Role:** developer
- **Task Type:** code-generation
- **Module:** cashiering
- **Tags:** payment, transaction, api, security
- **Version:** 1
- **Created:** 1/17/2026, 12:00:00 AM
- **Updated:** 1/17/2026, 12:00:00 AM
- **File Path:** `prompts/developer/code-generation/cashiering/550e8400...md`

**Description:**
Implement a robust payment transaction handler...

**Content Preview:**
```
# Payment Transaction Handler

You are tasked with implementing a robust payment...
```

---
```

### Error Responses

**No prompts found:**
```markdown
# Prompt Library

No prompts found matching the specified filters.
```

---

## add-prompt

Create a new prompt with validation.

### Description

Creates a new prompt in the library with automatic ID generation, hierarchy validation, and file system organization. Validates role/task type combinations and all input parameters.

### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `name` | string | Yes | Prompt name (3-100 characters) |
| `description` | string | Yes | Detailed description (10-500 characters) |
| `role` | enum | Yes | Role classification |
| `taskType` | enum | Yes | Task type classification |
| `module` | enum | Yes | Module classification |
| `tags` | string[] | Yes | Tags for search (1-10 tags) |
| `content` | string | Yes | Markdown prompt content (50-50,000 characters) |

### Examples

**Create payment handler prompt:**
```json
{
  "name": "Payment Transaction Handler",
  "description": "Implement a robust payment transaction handler for the cashiering module with atomic operations, security, and error handling",
  "role": "developer",
  "taskType": "code-generation",
  "module": "cashiering",
  "tags": ["payment", "transaction", "api", "security"],
  "content": "# Payment Transaction Handler\n\nYou are tasked with implementing..."
}
```

**Create security review prompt:**
```json
{
  "name": "Authentication Security Review",
  "description": "Comprehensive security review of authentication implementation covering OAuth, JWT, and session management",
  "role": "security-specialist",
  "taskType": "architecture-review",
  "module": "security",
  "tags": ["security", "authentication", "review", "oauth", "jwt"],
  "content": "# Authentication Security Review\n\nConduct a thorough review..."
}
```

### Response

Success confirmation with complete prompt details:

```markdown
# ✅ Prompt Created Successfully

A new prompt has been created and saved to the library.

## Prompt Details

**Name:** Payment Transaction Handler

**ID:** `550e8400-e29b-41d4-a716-446655440001`

**Hierarchy:**
- **Role:** developer
- **Task Type:** code-generation
- **Module:** cashiering

**Metadata:**
- **Description:** Implement a robust payment transaction handler...
- **Tags:** payment, transaction, api, security
- **Version:** 1
- **Created:** 1/17/2026, 12:00:00 AM

**File Location:**
`prompts/developer/code-generation/cashiering/550e8400-e29b-41d4-a716-446655440001.md`

**Content Length:** 1234 characters

---

**Next Steps:**
- Use `search-prompts` to find this prompt
- Use `update-prompt` to modify it
- Use `list-prompts` to see it in the library
```

### Error Responses

**Invalid role/task type combination:**
```markdown
# ❌ Failed to Create Prompt

**Error:** Invalid combination: tester cannot have task type code-generation. Valid task types for tester are: testing, debugging, documentation

**Hint:** This role/task type combination is not allowed. Use valid combinations according to the hierarchy configuration.

**Common Valid Combinations:**
- **developer:** code-generation, refactoring, debugging, testing, documentation
- **architect:** architecture-review, documentation, code-generation, refactoring
- **tester:** testing, debugging, documentation
- **security-specialist:** architecture-review, code-generation, testing, documentation
```

**Validation error:**
```markdown
# ❌ Failed to Create Prompt

**Error:** Name must be at least 3 characters

**Hint:** Please check that all required fields are provided and meet the validation rules:
- Name: 3-100 characters
- Description: 10-500 characters
- Tags: 1-10 tags
- Content: 50-50,000 characters
```

### Validation Rules

- **Name**: 3-100 characters, required
- **Description**: 10-500 characters, required
- **Role**: Must be valid enum value
- **Task Type**: Must be valid enum value
- **Module**: Must be valid enum value
- **Role + Task Type**: Must be valid combination
- **Tags**: 1-10 tags, each tag sanitized and deduplicated
- **Content**: 50-50,000 characters, required

---

## update-prompt

Update an existing prompt with support for partial updates and hierarchy changes.

### Description

Modifies an existing prompt. Supports partial updates (only provide fields to change). Automatically handles file relocation when hierarchy (role, taskType, module) changes. Increments version number on update.

### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string (UUID) | Yes | Prompt ID to update |
| `name` | string | No | New name (3-100 characters) |
| `description` | string | No | New description (10-500 characters) |
| `role` | enum | No | New role |
| `taskType` | enum | No | New task type |
| `module` | enum | No | New module |
| `tags` | string[] | No | New tags (1-10 tags) |
| `content` | string | No | New content (50-50,000 characters) |

**Note:** At least one field (besides `id`) must be provided.

### Examples

**Update name only:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440001",
  "name": "Enhanced Payment Transaction Handler"
}
```

**Update content and tags:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440001",
  "content": "# Enhanced Payment Handler\n\nNew implementation with...",
  "tags": ["payment", "transaction", "api", "security", "enhanced"]
}
```

**Change hierarchy (move to different module):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440001",
  "module": "shared"
}
```

**Change role and task type:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440002",
  "role": "architect",
  "taskType": "architecture-review"
}
```

### Response

Success confirmation with change summary:

```markdown
# ✅ Prompt Updated Successfully

The prompt has been updated. Version incremented to **2**.

## Updated Prompt Details

**Name:** Enhanced Payment Transaction Handler
**ID:** `550e8400-e29b-41d4-a716-446655440001`

**Current Hierarchy:**
- **Role:** developer
- **Task Type:** code-generation
- **Module:** cashiering

**Metadata:**
- **Description:** Implement a robust payment transaction handler...
- **Tags:** payment, transaction, api, security, enhanced
- **Version:** 2
- **Updated:** 1/17/2026, 1:30:00 PM

**New File Location:**
`prompts/developer/code-generation/cashiering/550e8400-e29b-41d4-a716-446655440001.md`

**Changes Applied:** name, tags

---

**Change Summary:**
- Name: "Payment Transaction Handler" → "Enhanced Payment Transaction Handler"
- Tags added: enhanced
```

**Response with hierarchy change:**
```markdown
# ✅ Prompt Updated Successfully

The prompt has been updated. Version incremented to **2**.

## Updated Prompt Details

**Name:** Payment Transaction Handler
**ID:** `550e8400-e29b-41d4-a716-446655440001`

**Current Hierarchy:**
- **Role:** developer
- **Task Type:** code-generation
- **Module:** shared

**Metadata:**
- **Description:** Implement a robust payment transaction handler...
- **Tags:** payment, transaction, api, security
- **Version:** 2
- **Updated:** 1/17/2026, 1:30:00 PM

**⚠️ Hierarchy Changed:**
Files have been moved to the new location.

**Before:**
- Role: developer
- Task Type: code-generation
- Module: cashiering

**After:**
- Role: developer
- Task Type: code-generation
- Module: shared

**New File Location:**
`prompts/developer/code-generation/shared/550e8400-e29b-41d4-a716-446655440001.md`

**Changes Applied:** module
```

### Error Responses

**Prompt not found:**
```markdown
# ❌ Failed to Update Prompt

**Error:** Prompt not found: 550e8400-e29b-41d4-a716-446655440099

**Hint:** The prompt with the specified ID does not exist. Use `search-prompts` or `list-prompts` to find valid prompt IDs.
```

**Invalid combination after update:**
```markdown
# ❌ Failed to Update Prompt

**Error:** Invalid combination: tester cannot have task type code-generation. Valid task types for tester are: testing, debugging, documentation

**Hint:** The new role/task type combination is not allowed...
```

**No fields provided:**
```markdown
# ❌ Failed to Update Prompt

**Error:** At least one field must be provided for update

**Hint:** Provide at least one field to update (name, description, role, taskType, module, tags, or content)
```

### Version Management

- Version number is automatically incremented on each update
- `updatedAt` timestamp is automatically set to current time
- `createdAt` timestamp remains unchanged
- Version history is not tracked (only current version stored)

---

## Common Workflows

### Workflow 1: Finding and Using a Prompt

1. **Search for relevant prompts:**
   ```json
   {
     "tool": "search-prompts",
     "arguments": {
       "role": "developer",
       "keywords": "payment API"
     }
   }
   ```

2. **View results and copy content**
   - Results include content preview
   - Full content available in markdown

### Workflow 2: Creating a New Prompt

1. **Prepare prompt content:**
   - Write prompt in Markdown
   - Define metadata (name, description, tags)
   - Determine hierarchy (role, taskType, module)

2. **Create prompt:**
   ```json
   {
     "tool": "add-prompt",
     "arguments": {
       "name": "My New Prompt",
       "description": "Description of what this prompt does",
       "role": "developer",
       "taskType": "code-generation",
       "module": "cashiering",
       "tags": ["api", "payment"],
       "content": "# My Prompt\n\nPrompt content..."
     }
   }
   ```

3. **Note the returned ID** for future updates

### Workflow 3: Updating an Existing Prompt

1. **Find prompt ID** (if unknown):
   ```json
   {
     "tool": "search-prompts",
     "arguments": {
       "keywords": "payment handler"
     }
   }
   ```

2. **Update specific fields:**
   ```json
   {
     "tool": "update-prompt",
     "arguments": {
       "id": "550e8400-e29b-41d4-a716-446655440001",
       "content": "Updated content..."
     }
   }
   ```

### Workflow 4: Browsing the Library

1. **Get overview:**
   ```json
   {
     "tool": "list-prompts",
     "arguments": {
       "format": "tree"
     }
   }
   ```

2. **Filter by role:**
   ```json
   {
     "tool": "list-prompts",
     "arguments": {
       "role": "developer",
       "format": "table"
     }
   }
   ```

3. **View details:**
   ```json
   {
     "tool": "list-prompts",
     "arguments": {
       "role": "developer",
       "taskType": "code-generation",
       "format": "detailed"
     }
   }
   ```

---

## Error Handling

All tools return errors in a consistent format:

```markdown
# [Tool Name] Error

❌ **Error:** [Error message]

[Optional hint or guidance]
```

### Common Error Types

1. **Validation Errors**: Input doesn't meet validation rules
2. **Not Found Errors**: Prompt ID doesn't exist
3. **Hierarchy Errors**: Invalid role/taskType combination
4. **File System Errors**: Permission or I/O issues

### Error Response Property

All error responses include `isError: true` in the tool response metadata.

---

## Rate Limits and Performance

### Current Limits

- No rate limiting implemented
- No concurrent request limits
- Search results limited to configured max (default 20, max 100)

### Performance Characteristics

- **Search**: <100ms for typical queries
- **List**: <200ms for full hierarchy
- **Add**: <50ms
- **Update**: <100ms (without hierarchy change), <200ms (with hierarchy change)

### Best Practices

- Use appropriate `maxResults` to limit search response size
- Filter searches with role/taskType/module when possible
- Use table format for large lists (more compact than detailed)
- Cache prompt IDs when working with same prompts repeatedly

---

## API Versioning

Current API version: **1.0.0**

The server version is reported in MCP initialization. Breaking changes will increment major version.

---

## Support and Resources

- **Architecture Guide**: [ARCHITECTURE.md](ARCHITECTURE.md)
- **Prompt Structure Guide**: [PROMPT_STRUCTURE.md](PROMPT_STRUCTURE.md)
- **Quick Start**: [QUICK_START.md](QUICK_START.md)
- **Main README**: [README.md](../../README.md)
