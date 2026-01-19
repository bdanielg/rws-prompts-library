# Prompt Manager MCP Server - Architecture Guide

## Overview

The Prompt Manager MCP Server is a Model Context Protocol (MCP) implementation that provides centralized management of hierarchical prompts for CMS development teams. It enables developers, architects, testers, and security specialists to store, search, and retrieve role-specific prompts through MCP-compatible IDEs.

## System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     MCP Clients                             │
│  (VSCode, Cursor, Claude Desktop, Other MCP-compatible)     │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │ MCP Protocol (stdio or HTTP Stream)
                         │
┌────────────────────────▼────────────────────────────────────┐
│                   FastMCP Server                            │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              Tool Registry                           │  │
│  │  • search-prompts                                    │  │
│  │  • list-prompts                                      │  │
│  │  • add-prompt                                        │  │
│  │  • update-prompt                                     │  │
│  └────────────────────┬─────────────────────────────────┘  │
│                       │                                     │
│  ┌────────────────────▼─────────────────────────────────┐  │
│  │           Prompt Service (Business Logic)            │  │
│  │  • CRUD Operations                                   │  │
│  │  • Search with Relevance Scoring                     │  │
│  │  • Hierarchy Validation                              │  │
│  │  • In-Memory Index Management                        │  │
│  └────────────────────┬─────────────────────────────────┘  │
│                       │                                     │
│  ┌────────────────────▼─────────────────────────────────┐  │
│  │           File Manager (I/O Operations)              │  │
│  │  • File Read/Write                                   │  │
│  │  • Metadata Management                               │  │
│  │  • Directory Operations                              │  │
│  └────────────────────┬─────────────────────────────────┘  │
└────────────────────────┼─────────────────────────────────────┘
                         │
                         │ File System
                         │
┌────────────────────────▼─────────────────────────────────────┐
│                  File System Storage                         │
│  prompts/                                                    │
│    {role}/                                                   │
│      {taskType}/                                             │
│        {module}/                                             │
│          {promptId}.md                                       │
│          {promptId}.metadata.json                            │
└──────────────────────────────────────────────────────────────┘
```

## Component Architecture

### 1. Transport Layer

**FastMCP Server**
- Entry point for MCP communication
- Handles protocol negotiation
- Manages tool registration
- Supports stdio and httpStream transports

**Transport Types:**
- **stdio**: Default, used for local connections (Claude Desktop, local IDE)
- **httpStream**: Optional, used for networked access (web clients, remote IDEs)

### 2. Application Layer

#### Tool Implementations

**search-prompts**
- Accepts search criteria (role, taskType, module, keywords, tags)
- Delegates to PromptService for search execution
- Formats results with relevance scores and match highlights
- Returns markdown-formatted response

**list-prompts**
- Accepts optional filters (role, taskType, module)
- Supports multiple output formats (tree, table, detailed)
- Delegates to PromptService for prompt retrieval
- Formats hierarchical structure for display

**add-prompt**
- Validates input parameters using Zod schemas
- Checks role/taskType combination validity
- Delegates to PromptService for prompt creation
- Returns success confirmation with prompt details

**update-prompt**
- Validates update parameters
- Handles partial updates (any field optional)
- Supports hierarchy changes with file relocation
- Increments version number
- Returns change summary

#### Business Logic Layer

**PromptService**
- Centralized business logic for all prompt operations
- Maintains in-memory index for fast searching
- Implements search algorithm with relevance scoring
- Handles CRUD operations
- Manages hierarchy validation
- Coordinates with FileManager for persistence

**Key Algorithms:**

*Relevance Scoring*
```typescript
Score Calculation:
- Exact role match: +10 points
- Exact taskType match: +10 points  
- Exact module match: +10 points
- Per matching tag: +5 points
- Keyword in name: +15 points
- Keyword in description: +5 points
- Results sorted by total score (descending)
```

*Index Management*
```typescript
Index Structure:
Map<promptId, {
  metadata: PromptMetadata,
  filePath: string
}>

Rebuild Triggers:
- Server startup
- First search/list operation
- Manual rebuild (optional)
```

#### Data Access Layer

**FileManager**
- Abstraction over Node.js fs/promises
- All file I/O operations go through this layer
- Handles directory creation (recursive)
- Manages both content (.md) and metadata (.json) files
- Provides atomic file operations where possible
- Implements error handling and logging

### 3. Data Layer

#### Storage Structure

```
prompts/
├── developer/
│   ├── code-generation/
│   │   ├── cashiering/
│   │   │   ├── {id}.md
│   │   │   └── {id}.metadata.json
│   │   ├── gaming-ops/
│   │   ├── membership/
│   │   ├── reporting/
│   │   ├── security/
│   │   └── shared/
│   ├── refactoring/
│   ├── testing/
│   ├── debugging/
│   └── documentation/
├── architect/
│   ├── architecture-review/
│   ├── documentation/
│   ├── code-generation/
│   └── refactoring/
├── tester/
│   ├── testing/
│   ├── debugging/
│   └── documentation/
└── security-specialist/
    ├── architecture-review/
    ├── code-generation/
    ├── testing/
    └── documentation/
```

#### File Formats

**Content File (.md)**
- Plain markdown text
- Contains the actual prompt content
- No metadata embedded
- Can be version controlled easily

**Metadata File (.metadata.json)**
```json
{
  "id": "uuid",
  "name": "string",
  "description": "string",
  "role": "enum",
  "taskType": "enum",
  "module": "enum",
  "tags": ["string"],
  "createdAt": "ISO8601",
  "updatedAt": "ISO8601",
  "version": "number"
}
```

## Data Flow

### Search Flow

```
1. Client → MCP Request
   - search-prompts tool invoked
   - Parameters: { role?, taskType?, module?, keywords?, tags? }

2. Tool → Input Validation
   - Zod schema validation
   - Parameter sanitization

3. Tool → PromptService.searchPrompts()
   - Check if index built, rebuild if needed
   - Apply filters (role, taskType, module)
   - Calculate relevance scores for matches
   - Sort by score
   - Limit results (maxResults)

4. PromptService → Return SearchResult[]
   - Each result includes prompt, score, matches

5. Tool → Format Response
   - Build markdown output
   - Include relevance scores
   - Add match highlights
   - Include content previews

6. Tool → MCP Response
   - Return formatted markdown to client
```

### Add Flow

```
1. Client → MCP Request
   - add-prompt tool invoked
   - Parameters: { name, description, role, taskType, module, tags, content }

2. Tool → Input Validation
   - Zod schema validation
   - Input sanitization

3. Tool → PromptService.addPrompt()
   - Validate role/taskType combination
   - Generate UUID for prompt ID
   - Create metadata object
   - Build file paths

4. PromptService → FileManager
   - ensureDirectoryExists(hierarchyPath)
   - writePromptContent(contentPath, content)
   - writeMetadata(metadataPath, metadata)

5. PromptService → Update Index
   - Add new entry to in-memory index

6. Tool → Format Response
   - Build success confirmation
   - Include all prompt details
   - Add file location

7. Tool → MCP Response
   - Return confirmation to client
```

### Update Flow

```
1. Client → MCP Request
   - update-prompt tool invoked
   - Parameters: { id, name?, description?, role?, taskType?, module?, tags?, content? }

2. Tool → PromptService.getPrompt(id)
   - Retrieve current prompt

3. Tool → PromptService.updatePrompt()
   - Check if hierarchy changed
   - Validate new role/taskType combination
   - Create updated metadata
   - Increment version number

4. PromptService → FileManager
   - If hierarchy changed:
     - moveFile(oldContentPath, newContentPath)
     - moveFile(oldMetadataPath, newMetadataPath)
   - Else:
     - writePromptContent(contentPath, content)
     - writeMetadata(metadataPath, metadata)

5. PromptService → Update Index
   - Update index entry with new metadata and path

6. Tool → Format Response
   - Build change summary
   - Show before/after comparison
   - List fields modified

7. Tool → MCP Response
   - Return confirmation to client
```

## Key Design Patterns

### Repository Pattern
FileManager acts as a repository, abstracting file system operations from business logic.

### Service Layer Pattern
PromptService contains all business logic, coordinating between tools and data access.

### Strategy Pattern
Search algorithm can be extended with different relevance scoring strategies.

### Factory Pattern
Prompt ID generation, path building use factory methods.

### Singleton Pattern
PromptService maintains a single in-memory index instance.

## Error Handling Strategy

### Custom Error Classes
```typescript
- ValidationError: Input validation failures
- NotFoundError: Prompt not found by ID
- FileSystemError: File I/O failures
- HierarchyValidationError: Invalid role/taskType combination
```

### Error Propagation
```
1. Low-level errors caught in FileManager
2. Converted to custom error types
3. Propagated to PromptService
4. Caught by tool handlers
5. Formatted as user-friendly error messages
6. Returned with isError: true flag
```

### Logging Strategy
```typescript
- Startup logger: Server initialization
- Middleware logger: Future HTTP middleware
- Service logger: Business logic operations
- Tool loggers: Individual tool operations

Log Levels:
- ERROR: Failures requiring attention
- WARN: Unexpected but handled situations
- INFO: Normal operations, key events
- DEBUG: Detailed execution flow
```

## Performance Considerations

### Indexing
- In-memory index prevents repeated file system scans
- Index built on first use or server startup
- Lazy loading of full content (index stores only metadata)

### Search Optimization
- Filter by exact matches first (role, taskType, module)
- Skip relevance scoring for filtered-out prompts
- Limit results to prevent excessive data transfer
- Load full content only for matching prompts

### File Operations
- Batch operations where possible
- Recursive directory creation in single call
- Atomic file writes where supported
- Caching could be added for frequently accessed prompts

## Security Considerations

### Input Validation
- All inputs validated with Zod schemas
- HTML/script tags stripped from strings
- Maximum length enforcement
- UUID format validation

### File System
- No path traversal vulnerabilities (fixed hierarchy)
- Directory operations limited to prompts base path
- No user-provided file paths
- Metadata stored separately from content

### Privacy
- No sensitive data in prompts (per design)
- All data stored locally
- No external service calls
- Audit logging via Winston

## Scalability

### Current Limits
- In-memory index (suitable for thousands of prompts)
- File system-based storage
- Single-server deployment

### Future Enhancements
- Database backend for large-scale deployments
- Distributed caching (Redis)
- Horizontal scaling with shared storage
- Full-text search engine (Elasticsearch)
- GraphQL API for advanced queries

## Technology Stack

- **Runtime**: Node.js 20+
- **Language**: TypeScript 5.9+
- **MCP Framework**: FastMCP 3.26+
- **Validation**: Zod 4.3+
- **Logging**: Winston 3.19+
- **Build**: TypeScript Compiler
- **Package Manager**: npm

## Configuration

### Environment Variables
```bash
TRANSPORT_TYPE=stdio|httpStream
HOST=0.0.0.0              # For httpStream
PORT=3000                 # For httpStream
PROMPTS_BASE_PATH=./prompts
LOG_LEVEL=debug|info|warn|error
ENABLE_SEARCH_INDEX=true
MAX_SEARCH_RESULTS=50
```

### Hierarchy Configuration
Centralized in `src/config/hierarchy-config.ts`:
- Defines valid role/taskType combinations
- Provides validation functions
- Generates helpful error messages

## Deployment Architecture

### Local Development
```
Developer Machine
├── MCP Server (stdio)
└── IDE (VSCode/Cursor) ─── MCP Client
```

### Remote Deployment
```
Server (Docker/K8s)
├── MCP Server (httpStream)
│   └── Port 3000
└── Reverse Proxy (nginx)
    └── SSL/TLS termination

Clients (over network)
└── IDE/Web Client ─── HTTPS ─── MCP Server
```

## Monitoring and Observability

### Logging
- Structured JSON logs via Winston
- Context-aware logging (startup, service, tool)
- Configurable log levels
- Timestamp and severity included

### Metrics (Future)
- Prompt count by role/taskType/module
- Search performance (latency, cache hit rate)
- Tool invocation counts
- Error rates
- Index size

### Health Checks (Future)
- Index status
- File system accessibility
- Memory usage
- Response time
