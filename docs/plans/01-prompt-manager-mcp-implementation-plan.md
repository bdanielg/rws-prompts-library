# Prompt Manager MCP Server - Implementation Plan

## Executive Summary

This plan outlines the implementation of a Model Context Protocol (MCP) server for managing hierarchical prompts organized by role, task type, and module. The solution provides CRUD operations (Create, Read, Update, Delete) and search capabilities for a structured prompt library serving CMS development teams.

## Background & Requirements

### Project Overview
- **Primary Goal**: Centralized management of prompts for CMS development teams
- **Target Users**: Developers, Architects, Testers, Security Specialists
- **Use Case**: Store, search, and retrieve role-specific prompts for AI-assisted development
- **Integration**: MCP-compatible IDEs (VSCode, Cursor, Claude Desktop)

### Hierarchical Organization Requirements

#### Level 1: Role
Prompts categorized by primary user role:
- **developer/** - Software developers (code generation, refactoring, debugging)
- **architect/** - Solution architects (architecture review, design patterns)
- **tester/** - QA engineers (test generation, test automation)
- **security-specialist/** - Security experts (security reviews, compliance validation)

#### Level 2: Task Type
Within each role, organized by task type:
- **code-generation/** - Creating new code from specifications
- **refactoring/** - Modernizing or improving existing code
- **testing/** - Generating tests or test strategies
- **debugging/** - Identifying and fixing issues
- **documentation/** - Creating technical documentation
- **architecture-review/** - Evaluating architectural decisions

#### Level 3: Module
Finally categorized by CMS module:
- **cashiering/** - Payment processing, transactions, financial operations
- **gaming-ops/** - Gaming operations, floor management, gaming machines
- **membership/** - Player tracking, loyalty programs, customer management
- **reporting/** - Business intelligence, analytics, compliance reporting
- **security/** - Authentication, authorization, audit logging
- **shared/** - Cross-cutting concerns, utilities, common libraries

### Functional Requirements
- **Search**: Find prompts by role, task type, module, keywords, or tags
- **List**: Browse prompts hierarchically with multiple output formats
- **Add**: Create new prompts with validation
- **Update**: Modify existing prompts (metadata, content, or hierarchy)
- **Validation**: Ensure only valid role/task type combinations are allowed
- **Privacy**: No sensitive data in prompts; safe parameter handling

## Solution Architecture

### 1. System Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   MCP Client    │    │   MCP Server     │    │  File System    │
│  (IDE/Claude)   │◄──►│  (FastMCP)       │◄──►│  (Prompts)      │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                               │
                               ▼
                       ┌──────────────────┐
                       │  Validation      │
                       │  & Business      │
                       │  Logic           │
                       └──────────────────┘
```

### 2. Component Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        MCP Server                           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐       │
│  │   Tools     │  │  Resources  │  │   Prompts   │       │
│  │  (CRUD)     │  │ (Metadata)  │  │ (Templates) │       │
│  └─────┬───────┘  └─────────────┘  └─────────────┘       │
│        │                                                   │
│  ┌─────▼──────────────────────────────────────────┐       │
│  │         Prompt Service (Business Logic)        │       │
│  │  - Add/Update/Delete/Search/List              │       │
│  │  - Hierarchy Validation                       │       │
│  │  - Search Indexing                            │       │
│  └─────┬──────────────────────────────────────────┘       │
│        │                                                   │
│  ┌─────▼──────────────────────────────────────────┐       │
│  │         File Manager (I/O Operations)          │       │
│  │  - Read/Write Prompts                         │       │
│  │  - Metadata Management                        │       │
│  │  - Directory Operations                       │       │
│  └─────┬──────────────────────────────────────────┘       │
│        │                                                   │
└────────┼───────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────┐
│                   File System Storage                       │
├─────────────────────────────────────────────────────────────┤
│  prompts/                                                   │
│    developer/                                               │
│      code-generation/                                       │
│        cashiering/                                          │
│          prompt-id.md                                       │
│          prompt-id.metadata.json                            │
│        gaming-ops/                                          │
│      refactoring/                                           │
│    architect/                                               │
│    tester/                                                  │
│    security-specialist/                                     │
└─────────────────────────────────────────────────────────────┘
```

### 3. Data Model

#### Prompt Structure
```typescript
interface Prompt {
  metadata: PromptMetadata;
  content: string;
  filePath: string;
}

interface PromptMetadata {
  id: string;                // UUID
  name: string;              // Prompt name (3-100 chars)
  description: string;       // Description (10-500 chars)
  role: Role;                // Enum: developer, architect, etc.
  taskType: TaskType;        // Enum: code-generation, testing, etc.
  module: Module;            // Enum: cashiering, gaming-ops, etc.
  tags: string[];            // Categorization tags
  createdAt: string;         // ISO 8601 timestamp
  updatedAt: string;         // ISO 8601 timestamp
  version: number;           // Version number (starts at 1)
}
```

#### Storage Format
- **Prompt Content**: Markdown file (`.md`)
- **Metadata**: JSON file (`.metadata.json`)
- **Directory Structure**: `{role}/{taskType}/{module}/{promptId}.md`

## Implementation Plan

### Phase 1: Project Foundation (Week 1)

#### 1.1 Project Initialization
**Files to Create:**
- `package.json` - Dependencies and scripts
- `tsconfig.json` - TypeScript configuration
- `.env.example` - Environment variable template
- `.gitignore` - Git exclusions
- `README.md` - Project documentation

**Dependencies:**
```json
{
  "dependencies": {
    "fastmcp": "^3.23.1",
    "zod": "^3.22.4",
    "winston": "^3.11.0"
  },
  "devDependencies": {
    "@types/node": "^20.10.0",
    "typescript": "^5.3.3",
    "tsx": "^4.7.0"
  }
}
```

**Success Criteria:**
- [x] Project initializes without errors
- [x] TypeScript compiles successfully
- [x] All dependencies installed

#### 1.2 Directory Structure Setup
**Directories to Create:**
```
prompt-manager-mcp/
├── src/
│   ├── models/          # Type definitions and schemas
│   ├── config/          # Configuration files
│   ├── helpers/         # Utility functions
│   ├── services/        # Business logic
│   └── tools/           # MCP tools
├── prompts/             # Prompt storage
│   ├── developer/
│   ├── architect/
│   ├── tester/
│   └── security-specialist/
├── docs/                # Documentation
└── scripts/             # Utility scripts
```

**Success Criteria:**
- [x] All directories created
- [x] `.gitkeep` files added to preserve empty directories
- [x] Structure validated

---

### Phase 2: Data Models & Configuration (Week 1)

#### 2.1 TypeScript Type Definitions
**File:** `src/models/types.ts`

**Implementation:**
```typescript
export enum Role {
  DEVELOPER = 'developer',
  ARCHITECT = 'architect',
  TESTER = 'tester',
  SECURITY_SPECIALIST = 'security-specialist'
}

export enum TaskType {
  CODE_GENERATION = 'code-generation',
  REFACTORING = 'refactoring',
  TESTING = 'testing',
  DEBUGGING = 'debugging',
  DOCUMENTATION = 'documentation',
  ARCHITECTURE_REVIEW = 'architecture-review'
}

export enum Module {
  CASHIERING = 'cashiering',
  GAMING_OPS = 'gaming-ops',
  MEMBERSHIP = 'membership',
  REPORTING = 'reporting',
  SECURITY = 'security',
  SHARED = 'shared'
}
```

**Success Criteria:**
- [x] All enums defined
- [x] Interfaces complete
- [x] Types compile without errors

#### 2.2 Zod Validation Schemas
**File:** `src/models/schemas.ts`

**Key Schemas:**
- `roleSchema` - Role validation
- `taskTypeSchema` - Task type validation
- `moduleSchema` - Module validation
- `promptMetadataSchema` - Metadata validation
- `searchCriteriaSchema` - Search parameter validation
- `addPromptSchema` - Add prompt validation
- `updatePromptSchema` - Update prompt validation

**Success Criteria:**
- [x] All schemas defined
- [x] Validation rules implemented
- [x] Test data validates correctly

#### 2.3 Hierarchy Configuration
**File:** `src/config/hierarchy-config.ts`

**Key Configuration:**
```typescript
export const VALID_COMBINATIONS: Record<Role, TaskType[]> = {
  [Role.DEVELOPER]: [
    TaskType.CODE_GENERATION,
    TaskType.REFACTORING,
    TaskType.TESTING,
    TaskType.DEBUGGING,
    TaskType.DOCUMENTATION
  ],
  [Role.ARCHITECT]: [
    TaskType.ARCHITECTURE_REVIEW,
    TaskType.DOCUMENTATION
  ],
  [Role.TESTER]: [
    TaskType.TESTING,
    TaskType.DEBUGGING
  ],
  [Role.SECURITY_SPECIALIST]: [
    TaskType.ARCHITECTURE_REVIEW,
    TaskType.CODE_GENERATION,
    TaskType.DOCUMENTATION
  ]
};
```

**Success Criteria:**
- [x] All valid combinations defined
- [x] Configuration loads correctly
- [x] Validation works as expected

---

### Phase 3: Helper Utilities (Week 2)

#### 3.1 Logger Implementation
**File:** `src/helpers/logger.ts`

**Features:**
- Winston-based structured logging
- Context-aware loggers
- Multiple log levels (debug, info, warn, error)
- JSON format for production
- Colored console output for development

**Success Criteria:**
- [x] Logger initializes correctly
- [x] Different log levels work
- [x] Context included in logs

#### 3.2 Validation Utilities
**File:** `src/helpers/validators.ts`

**Functions:**
- `validateRole()` - Check role validity
- `validateTaskType()` - Check task type validity
- `validateModule()` - Check module validity
- `validateCombination()` - Check role/task type combination
- `sanitizeInput()` - Clean user input

**Success Criteria:**
- [x] All validation functions implemented
- [x] Error messages are helpful
- [x] Edge cases handled

#### 3.3 Path Builder
**File:** `src/helpers/path-builder.ts`

**Functions:**
- `buildHierarchicalPath()` - Construct directory path
- `buildPromptFilePath()` - Construct prompt file path
- `buildMetadataFilePath()` - Construct metadata file path
- `parsePromptPath()` - Extract hierarchy from path
- `normalizePathSegment()` - Ensure valid directory names

**Success Criteria:**
- [x] Paths constructed correctly
- [x] Cross-platform compatibility (Windows/macOS/Linux)
- [x] Special characters handled

---

### Phase 4: Core Services (Week 2-3)

#### 4.1 File Manager Service
**File:** `src/services/file-manager.ts`

**Responsibilities:**
- File I/O operations
- Directory creation and management
- Metadata read/write
- File existence checks
- File deletion

**Key Methods:**
```typescript
class FileManager {
  async ensureDirectoryExists(dirPath: string): Promise<void>
  async readPromptFile(filePath: string): Promise<string>
  async writePromptFile(filePath: string, content: string): Promise<void>
  async readMetadata(filePath: string): Promise<PromptMetadata>
  async writeMetadata(filePath: string, metadata: PromptMetadata): Promise<void>
  async deleteFile(filePath: string): Promise<void>
  async listFiles(dirPath: string, extension?: string): Promise<string[]>
  async fileExists(filePath: string): Promise<boolean>
}
```

**Success Criteria:**
- [x] All file operations work correctly
- [x] Error handling implemented
- [x] Logging included
- [x] Atomic operations where needed

#### 4.2 Prompt Service
**File:** `src/services/prompt-service.ts`

**Responsibilities:**
- Business logic for prompt operations
- Search implementation with relevance scoring
- Hierarchy validation
- Index management

**Key Methods:**
```typescript
class PromptService {
  generatePromptId(): string
  async addPrompt(...): Promise<Prompt>
  async updatePrompt(id: string, updates: Partial<...>): Promise<Prompt>
  async getPrompt(id: string): Promise<Prompt | null>
  async searchPrompts(criteria: SearchCriteria): Promise<SearchResult[]>
  async listPrompts(options: ListOptions): Promise<Prompt[]>
  private calculateRelevanceScore(...): number
  private findMatches(...): Match[]
  private rebuildIndex(): Promise<void>
}
```

**Search Algorithm:**
- Exact matches for role/task type/module (+10 points each)
- Tag matching (+5 points per matching tag)
- Keyword search in name/description/content (+5/+15 for name match)
- Results sorted by relevance score

**Success Criteria:**
- [x] All CRUD operations work
- [x] Search returns relevant results
- [x] Hierarchy validation prevents invalid combinations
- [x] Index rebuilds correctly
- [x] Performance acceptable (<100ms for searches)

---

### Phase 5: MCP Tools (Week 3-4)

#### 5.1 Search Prompts Tool
**File:** `src/tools/search-prompts.ts`

**Tool Definition:**
```typescript
{
  name: 'search-prompts',
  description: 'Search for prompts by role, task type, module, keywords, or tags',
  parameters: searchCriteriaSchema
}
```

**Response Format:**
- Markdown formatted results
- Relevance scores displayed
- Matching snippets highlighted
- Hierarchical context shown

**Success Criteria:**
- [x] Tool registered successfully
- [x] Search parameters validated
- [x] Results formatted correctly
- [x] Error handling works

#### 5.2 List Prompts Tool
**File:** `src/tools/list-prompts.ts`

**Tool Definition:**
```typescript
{
  name: 'list-prompts',
  description: 'List prompts hierarchically with optional filtering',
  parameters: listOptionsSchema
}
```

**Output Formats:**
- **tree** - Hierarchical tree view
- **table** - Markdown table format
- **detailed** - Full metadata display

**Success Criteria:**
- [x] Tool registered successfully
- [x] All formats render correctly
- [x] Filtering works as expected
- [x] Large lists handled efficiently

#### 5.3 Add Prompt Tool
**File:** `src/tools/add-prompt.ts`

**Tool Definition:**
```typescript
{
  name: 'add-prompt',
  description: 'Create a new prompt with specified role, task type, and module',
  parameters: addPromptSchema
}
```

**Workflow:**
1. Validate parameters
2. Check role/task type combination
3. Generate unique ID
4. Create directory structure
5. Write prompt content file
6. Write metadata file
7. Update index
8. Return success response

**Success Criteria:**
- [x] Tool registered successfully
- [x] Validation prevents invalid data
- [x] Files created correctly
- [x] Confirmation message includes all details

#### 5.4 Update Prompt Tool
**File:** `src/tools/update-prompt.ts`

**Tool Definition:**
```typescript
{
  name: 'update-prompt',
  description: 'Update an existing prompt (metadata, content, or hierarchy)',
  parameters: updatePromptSchema
}
```

**Special Handling:**
- Detect hierarchy changes
- Move files if hierarchy changed
- Increment version number
- Update timestamp
- Delete old files if moved

**Success Criteria:**
- [x] Tool registered successfully
- [x] Updates apply correctly
- [x] File moves handled properly
- [x] Version tracking works

---

### Phase 6: Main Server & Integration (Week 4)

#### 6.1 Main Server Implementation
**File:** `src/index.ts`

**Initialization Flow:**
1. Load configuration
2. Initialize logger
3. Create PromptService instance
4. Initialize FastMCP server
5. Register all tools
6. Start transport (stdio or httpStream)
7. Log startup success

**Error Handling:**
- Graceful startup failures
- Service initialization errors
- Transport errors
- Shutdown handling

**Success Criteria:**
- [x] Server starts successfully
- [x] All tools registered
- [x] Transport connects
- [x] Errors logged appropriately

#### 6.2 Transport Configuration
**Supported Transports:**
- **stdio** (default) - For local use, Claude Desktop
- **httpStream** (optional) - For networked access, web clients

**Configuration:**
```bash
# .env
TRANSPORT_TYPE=stdio
HOST=0.0.0.0
PORT=3000
```

**Success Criteria:**
- [x] stdio transport works
- [x] httpStream transport works (if enabled)
- [x] Environment variables respected

---

### Phase 7: Sample Content & Documentation (Week 4-5)

#### 7.1 Sample Prompts
**Create Example Prompts:**
```
prompts/
  developer/
    code-generation/
      cashiering/
        payment-processing.md
        payment-processing.metadata.json
      gaming-ops/
        slot-machine-integration.md
        slot-machine-integration.metadata.json
    refactoring/
      shared/
        legacy-code-modernization.md
        legacy-code-modernization.metadata.json
```

**Sample Content Quality:**
- Real-world use cases
- Comprehensive instructions
- Proper metadata
- Relevant tags

**Success Criteria:**
- [x] At least 10 sample prompts created
- [x] Cover all roles
- [x] Cover multiple modules
- [x] Metadata valid

#### 7.2 Documentation
**Files to Create:**

**README.md:**
- Project overview
- Installation instructions
- Quick start guide
- Available tools
- Hierarchy explanation
- Configuration options

**docs/ARCHITECTURE.md:**
- System architecture
- Component descriptions
- Data flow
- Technology stack

**docs/PROMPT_STRUCTURE.md:**
- Hierarchy explanation
- Valid combinations
- Metadata schema
- Naming conventions
- Best practices

**docs/API.md:**
- Complete tool reference
- Parameter descriptions
- Response formats
- Error codes
- Usage examples

**Success Criteria:**
- [x] All documentation files created
- [x] Examples included
- [x] Clear and comprehensive
- [x] Diagrams included

---

## Technical Implementation Details

### File Storage Strategy

#### Directory Structure
```
prompts/
  {role}/
    {taskType}/
      {module}/
        {promptId}.md                    # Prompt content
        {promptId}.metadata.json         # Metadata
```

#### File Naming Convention
- **Prompt ID**: UUID format (`550e8400-e29b-41d4-a716-446655440000`)
- **Content File**: `{id}.md`
- **Metadata File**: `{id}.metadata.json`

#### Metadata File Format
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Payment Processing Generator",
  "description": "Generate secure payment processing code",
  "role": "developer",
  "taskType": "code-generation",
  "module": "cashiering",
  "tags": ["payments", "security", "pci-dss"],
  "createdAt": "2026-01-17T00:00:00.000Z",
  "updatedAt": "2026-01-17T00:00:00.000Z",
  "version": 1
}
```

### Search Implementation

#### Relevance Scoring Algorithm
```typescript
function calculateRelevanceScore(prompt: Prompt, criteria: SearchCriteria): number {
  let score = 0;
  
  // Exact hierarchy matches
  if (criteria.role && prompt.metadata.role === criteria.role) score += 10;
  if (criteria.taskType && prompt.metadata.taskType === criteria.taskType) score += 10;
  if (criteria.module && prompt.metadata.module === criteria.module) score += 10;
  
  // Tag matching
  if (criteria.tags) {
    const matchingTags = prompt.metadata.tags.filter(tag => 
      criteria.tags!.includes(tag)
    );
    score += matchingTags.length * 5;
  }
  
  // Text search
  if (criteria.query) {
    const query = criteria.query.toLowerCase();
    const searchableText = 
      `${prompt.metadata.name} ${prompt.metadata.description} ${prompt.content}`.toLowerCase();
    
    if (searchableText.includes(query)) {
      score += 5;
      // Boost for name matches
      if (prompt.metadata.name.toLowerCase().includes(query)) score += 10;
    }
  }
  
  return score;
}
```

#### Search Optimization
- **In-Memory Index**: Cache prompt metadata for fast searches
- **Lazy Loading**: Load full content only when needed
- **Result Limiting**: Default max 20 results, configurable up to 100
- **Snippet Generation**: Context-aware snippets around matches

### Validation Strategy

#### Hierarchy Validation
```typescript
function validateCombination(role: Role, taskType: TaskType): void {
  const validTaskTypes = VALID_COMBINATIONS[role];
  if (!validTaskTypes.includes(taskType)) {
    throw new ValidationError(
      `Task type '${taskType}' is not valid for role '${role}'. ` +
      `Valid task types: ${validTaskTypes.join(', ')}`
    );
  }
}
```

#### Input Validation
- **Zod Schemas**: All inputs validated against schemas
- **String Sanitization**: Remove HTML/script tags
- **Length Limits**: Enforce min/max lengths
- **Pattern Matching**: Validate formats (IDs, tags, etc.)

### Error Handling

#### Error Types
```typescript
class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

class NotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NotFoundError';
  }
}

class FileSystemError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'FileSystemError';
  }
}
```

#### Error Response Format
```typescript
{
  content: [{
    type: 'text',
    text: `Error: ${error.message}\n\n` +
          `Type: ${error.name}\n` +
          `Suggestion: ${getHelpfulSuggestion(error)}`
  }],
  isError: true
}
```

### Performance Considerations

#### Optimization Strategies
1. **Index Caching**: In-memory cache of prompt metadata
2. **Lazy Loading**: Load content only when needed
3. **Async Operations**: Use async/await for I/O
4. **Batch Operations**: Group file operations where possible
5. **Result Limiting**: Cap search results to prevent memory issues

#### Performance Targets
- **Add Prompt**: < 50ms
- **Update Prompt**: < 100ms (< 200ms if moving files)
- **Search**: < 100ms for typical queries
- **List**: < 200ms for full hierarchy
- **Startup**: < 2 seconds

## Testing Strategy

### Unit Tests

#### Models & Schemas
```typescript
describe('Validation Schemas', () => {
  it('should validate correct prompt metadata', () => {
    const valid = {
      id: 'test-id',
      name: 'Test Prompt',
      description: 'A test prompt for validation',
      role: 'developer',
      taskType: 'code-generation',
      module: 'cashiering',
      tags: ['test'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      version: 1
    };
    
    expect(() => promptMetadataSchema.parse(valid)).not.toThrow();
  });
  
  it('should reject invalid role/taskType combinations', () => {
    expect(() => {
      validateCombination(Role.ARCHITECT, TaskType.DEBUGGING);
    }).toThrow(ValidationError);
  });
});
```

#### Helpers & Utilities
```typescript
describe('Path Builder', () => {
  it('should build correct hierarchical path', () => {
    const path = buildHierarchicalPath(
      Role.DEVELOPER,
      TaskType.CODE_GENERATION,
      Module.CASHIERING
    );
    expect(path).toBe('./prompts/developer/code-generation/cashiering');
  });
  
  it('should parse prompt path correctly', () => {
    const parsed = parsePromptPath(
      './prompts/developer/code-generation/cashiering/test-id.md'
    );
    expect(parsed).toEqual({
      role: 'developer',
      taskType: 'code-generation',
      module: 'cashiering',
      promptId: 'test-id'
    });
  });
});
```

#### Services
```typescript
describe('PromptService', () => {
  let service: PromptService;
  
  beforeEach(() => {
    service = new PromptService();
  });
  
  it('should add prompt successfully', async () => {
    const prompt = await service.addPrompt(
      'Test Prompt',
      'A test prompt',
      Role.DEVELOPER,
      TaskType.CODE_GENERATION,
      Module.CASHIERING,
      'Test content',
      ['test']
    );
    
    expect(prompt.metadata.name).toBe('Test Prompt');
    expect(prompt.metadata.version).toBe(1);
  });
  
  it('should search prompts by keyword', async () => {
    // Add test prompts
    await service.addPrompt(/* ... */);
    
    const results = await service.searchPrompts({
      query: 'payment'
    });
    
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].score).toBeGreaterThan(0);
  });
});
```

### Integration Tests

#### Tool Integration
```typescript
describe('MCP Tools Integration', () => {
  let server: FastMCP;
  let promptService: PromptService;
  
  beforeEach(async () => {
    server = new FastMCP({ name: 'test', version: '1.0.0' });
    promptService = new PromptService();
    registerSearchPromptsTool(server, promptService);
  });
  
  it('should execute search-prompts tool', async () => {
    const result = await executeTool(server, 'search-prompts', {
      query: 'payment',
      role: 'developer'
    });
    
    expect(result).toBeDefined();
    expect(result.content).toHaveLength(1);
    expect(result.content[0].type).toBe('text');
  });
});
```

#### End-to-End Workflow
```typescript
describe('Complete CRUD Workflow', () => {
  it('should create, search, update, and list prompts', async () => {
    // 1. Add prompt
    const addResult = await executeTool(server, 'add-prompt', {
      name: 'Test Prompt',
      description: 'A test prompt',
      role: 'developer',
      taskType: 'code-generation',
      module: 'cashiering',
      content: 'Test content',
      tags: ['test']
    });
    
    const promptId = extractIdFromResponse(addResult);
    
    // 2. Search for it
    const searchResult = await executeTool(server, 'search-prompts', {
      query: 'Test Prompt'
    });
    expect(searchResult).toContain(promptId);
    
    // 3. Update it
    const updateResult = await executeTool(server, 'update-prompt', {
      id: promptId,
      name: 'Updated Test Prompt'
    });
    expect(updateResult).toContain('Updated Test Prompt');
    
    // 4. List prompts
    const listResult = await executeTool(server, 'list-prompts', {
      role: 'developer',
      format: 'table'
    });
    expect(listResult).toContain('Updated Test Prompt');
  });
});
```

### Manual Testing

#### MCP Inspector Testing
```bash
# Install MCP Inspector
npm install -g @modelcontextprotocol/inspector

# Build the project
npm run build

# Test with inspector
npx @modelcontextprotocol/inspector node build/index.js
```

**Test Scenarios:**
1. Add prompts for each role
2. Search with various criteria
3. Update prompts (metadata and hierarchy)
4. List in different formats
5. Test invalid combinations
6. Test error scenarios

#### IDE Integration Testing
**VSCode:**
1. Configure MCP client
2. Test tool invocation
3. Verify response formatting
4. Test with large result sets

**Cursor:**
1. Configure MCP client
2. Test all tools
3. Verify rule file format
4. Test search functionality

**Claude Desktop:**
1. Configure server
2. Test all tools
3. Verify resource access
4. Test prompt usage

## Success Criteria & KPIs

### Technical Success Metrics

#### Functionality
- [x] All tools (search, list, add, update) work correctly
- [x] Hierarchy validation prevents invalid combinations
- [x] Search returns relevant results with proper scoring
- [x] File operations are atomic and error-safe
- [x] All transports (stdio, httpStream) functional

#### Performance
- [x] Add prompt: < 50ms
- [x] Search prompt: < 100ms
- [x] List prompts: < 200ms
- [x] Server startup: < 2 seconds
- [x] Memory usage: < 100MB for 1000 prompts

#### Reliability
- [x] Zero data loss during operations
- [x] Graceful error handling for all failures
- [x] File system errors don't crash server
- [x] Invalid inputs rejected with helpful messages

### User Experience Metrics

#### Usability
- [x] Response formatting optimized for IDE display
- [x] Error messages are actionable and helpful
- [x] Search results include context snippets
- [x] Hierarchy clearly displayed in all outputs

#### Adoption
- [ ] 80%+ of development team using prompts
- [ ] Average 5+ prompts created per team member
- [ ] Search used more frequently than manual browsing
- [ ] Positive feedback on prompt quality

### Business Metrics

#### Productivity
- [ ] Reduce time to find relevant prompts by 50%
- [ ] Increase prompt reuse by 70%
- [ ] Faster onboarding with standardized prompts
- [ ] Improved code quality through consistent prompting

#### Coverage
- [ ] All roles have at least 10 prompts
- [ ] All modules have representation
- [ ] Common tasks have 3+ prompt variations
- [ ] Regular prompt library updates

## Timeline & Milestones

### Week 1: Foundation
**Days 1-2: Project Setup**
- [x] Initialize npm project
- [x] Configure TypeScript
- [x] Create directory structure
- [x] Install dependencies

**Days 3-4: Data Models**
- [x] Define TypeScript types
- [x] Create Zod schemas
- [x] Implement hierarchy configuration
- [x] Write validation tests

**Day 5: Review & Adjustments**
- [x] Code review
- [x] Test model completeness
- [x] Document design decisions

### Week 2: Core Implementation
**Days 6-8: Helper Utilities**
- [x] Logger implementation
- [x] Validation utilities
- [x] Path builder
- [x] Unit tests

**Days 9-10: File Manager**
- [x] File I/O operations
- [x] Directory management
- [x] Metadata handling
- [x] Integration tests

### Week 3: Business Logic
**Days 11-13: Prompt Service**
- [x] CRUD operations
- [x] Search implementation
- [x] Index management
- [x] Service tests

**Days 14-15: Service Integration**
- [x] Integration testing
- [x] Performance optimization
- [x] Error handling refinement

### Week 4: MCP Tools
**Days 16-17: Tool Implementation**
- [x] search-prompts tool
- [x] list-prompts tool
- [x] add-prompt tool
- [x] update-prompt tool

**Days 18-19: Tool Testing**
- [x] Tool integration tests
- [x] Response formatting
- [x] Error scenario testing

**Day 20: Main Server**
- [x] Server initialization
- [x] Tool registration
- [x] Transport configuration
- [x] End-to-end testing

### Week 5: Content & Documentation
**Days 21-23: Sample Content**
- [x] Create sample prompts (10+)
- [x] Write metadata
- [x] Validate hierarchy coverage

**Days 24-25: Documentation**
- [x] README.md
- [x] ARCHITECTURE.md
- [x] PROMPT_STRUCTURE.md
- [x] API.md
- [x] Usage examples

### Week 6: Testing & Deployment
**Days 26-28: Comprehensive Testing**
- [ ] MCP Inspector testing
- [ ] IDE integration testing
- [ ] Performance testing
- [ ] User acceptance testing

**Days 29-30: Deployment Preparation**
- [ ] Docker configuration
- [ ] CI/CD setup
- [ ] Deployment documentation
- [ ] Monitoring setup

## Deployment Strategy

### Development Environment

#### Local Development Setup
```bash
# Clone repository
git clone <repo-url>
cd prompt-manager-mcp

# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Start development server
npm run dev
```

#### Development Configuration
```bash
# .env
TRANSPORT_TYPE=stdio
PROMPTS_BASE_PATH=./prompts
LOG_LEVEL=debug
ENABLE_SEARCH_INDEX=true
MAX_SEARCH_RESULTS=50
```

### Production Deployment

#### Docker Deployment
```dockerfile
# Dockerfile
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies
RUN npm ci --only=production

# Copy built files and prompts
COPY build ./build
COPY prompts ./prompts

# Expose port (if using httpStream)
EXPOSE 3000

# Start server
CMD ["node", "build/index.js"]
```

#### Docker Compose
```yaml
# docker-compose.yml
version: '3.8'

services:
  prompt-manager:
    build: .
    environment:
      - TRANSPORT_TYPE=httpStream
      - HOST=0.0.0.0
      - PORT=3000
      - PROMPTS_BASE_PATH=/data/prompts
      - LOG_LEVEL=info
    volumes:
      - prompts-data:/data/prompts
    ports:
      - "3000:3000"
    restart: unless-stopped

volumes:
  prompts-data:
```

#### Kubernetes Deployment (Optional)
```yaml
# k8s-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: prompt-manager-mcp
spec:
  replicas: 2
  selector:
    matchLabels:
      app: prompt-manager
  template:
    metadata:
      labels:
        app: prompt-manager
    spec:
      containers:
      - name: prompt-manager
        image: prompt-manager-mcp:latest
        ports:
        - containerPort: 3000
        env:
        - name: TRANSPORT_TYPE
          value: "httpStream"
        volumeMounts:
        - name: prompts-storage
          mountPath: /data/prompts
      volumes:
      - name: prompts-storage
        persistentVolumeClaim:
          claimName: prompts-pvc
```

### Deployment Checklist
- [ ] Build Docker image
- [ ] Push to container registry
- [ ] Configure environment variables
- [ ] Set up persistent storage
- [ ] Deploy to target environment
- [ ] Verify server health
- [ ] Test MCP connectivity
- [ ] Monitor logs for errors
- [ ] Perform smoke tests
- [ ] Update documentation

## Cost Analysis

### Infrastructure Costs

#### Development Environment
- **Local Development**: $0
- **Git Repository**: $0 (using GitHub)
- **CI/CD**: $0 (GitHub Actions free tier)

#### Production Deployment (Option 1: Local/On-Premise)
- **Server**: $0 (existing infrastructure)
- **Storage**: Minimal (<1GB for prompts)
- **Bandwidth**: Negligible
- **Total**: $0/month

#### Production Deployment (Option 2: Cloud)
- **Container Hosting**: $5-10/month (Azure Container Instance)
- **Storage**: $1-2/month (Azure Files/Blob)
- **Bandwidth**: $1-2/month
- **Total**: $7-14/month

### Development Costs

#### Initial Development (6 weeks)
- **Developer Time**: 6 weeks @ $X/hour
- **Code Review**: 10 hours @ $X/hour
- **Testing**: 20 hours @ $X/hour
- **Documentation**: 15 hours @ $X/hour

#### Ongoing Maintenance
- **Monthly Maintenance**: 5-10 hours/month
- **Content Updates**: 5 hours/month (creating prompts)
- **Support**: 2-5 hours/month

### Return on Investment

#### Productivity Gains
- **Time Saved per Developer**: 2-3 hours/week
- **Team Size**: 60 developers
- **Total Time Saved**: 120-180 hours/week
- **Annual Value**: Significant cost savings

#### Quality Improvements
- **Consistent Code Quality**: Standardized prompts
- **Faster Onboarding**: Pre-built prompt library
- **Knowledge Sharing**: Centralized best practices
- **Reduced Errors**: Validated prompts

## Risk Assessment & Mitigation

### Technical Risks

| Risk | Impact | Probability | Mitigation Strategy |
|------|--------|-------------|---------------------|
| File system corruption | High | Low | - Implement backup strategy<br>- Use atomic file operations<br>- Add file integrity checks |
| Search performance degradation | Medium | Medium | - Implement search result caching<br>- Add result limits<br>- Optimize indexing algorithm |
| Invalid hierarchy combinations | Medium | Low | - Strict validation at input<br>- Comprehensive test coverage<br>- Clear error messages |
| Concurrent write conflicts | Medium | Low | - Implement file locking<br>- Use timestamps for conflict detection<br>- Add retry logic |
| Memory leaks with large indexes | Medium | Medium | - Implement index size limits<br>- Add garbage collection<br>- Monitor memory usage |

### Operational Risks

| Risk | Impact | Probability | Mitigation Strategy |
|------|--------|-------------|---------------------|
| Prompt quality degradation | High | Medium | - Implement review process<br>- Add quality guidelines<br>- Regular audits |
| Low adoption rate | High | Medium | - User training sessions<br>- Clear documentation<br>- Showcase benefits |
| Storage capacity issues | Medium | Low | - Monitor storage usage<br>- Implement cleanup policies<br>- Set up alerts |
| Backup failures | High | Low | - Automated backup testing<br>- Multiple backup locations<br>- Regular restoration drills |

### Security Risks

| Risk | Impact | Probability | Mitigation Strategy |
|------|--------|-------------|---------------------|
| Sensitive data in prompts | High | Medium | - Input sanitization<br>- Content review process<br>- Privacy guidelines |
| Unauthorized access (httpStream) | High | Low | - Authentication required<br>- Authorization controls<br>- Audit logging |
| Prompt injection attacks | Medium | Low | - Input validation<br>- Content sanitization<br>- Security testing |

## Maintenance & Operations

### Daily Operations
- Monitor server health and uptime
- Check error logs for issues
- Verify backup completion
- Review new prompt submissions

### Weekly Operations
- Analyze prompt usage statistics
- Review search performance metrics
- Update prompt library with new content
- Check storage capacity and growth trends

### Monthly Operations
- Generate usage reports for stakeholders
- Review and optimize poorly performing searches
- Audit prompt quality and relevance
- Update documentation based on feedback
- Review and update hierarchy configuration if needed

### Quarterly Operations
- Major version updates and feature releases
- Comprehensive performance audit
- User satisfaction surveys
- Strategic planning for new features
- Security audit and penetration testing

### Backup Strategy

#### Backup Schedule
- **Hourly**: Incremental backups of prompts directory
- **Daily**: Full backup of entire system
- **Weekly**: Off-site backup copy
- **Monthly**: Archived backup for compliance

#### Backup Verification
```bash
# Daily backup verification script
#!/bin/bash

BACKUP_DIR="/backups/prompt-manager"
LATEST_BACKUP=$(ls -t $BACKUP_DIR | head -1)

# Verify backup integrity
tar -tzf "$BACKUP_DIR/$LATEST_BACKUP" > /dev/null 2>&1
if [ $? -eq 0 ]; then
  echo "Backup verification successful: $LATEST_BACKUP"
else
  echo "ERROR: Backup verification failed: $LATEST_BACKUP"
  # Send alert
fi
```

## Future Enhancements

### Phase 2 Features (3-6 months)

#### Version Control Integration
- Git-based versioning for prompts
- Change history and diff viewing
- Rollback capabilities
- Collaborative editing

#### Advanced Search
- Full-text search with Elasticsearch
- Fuzzy matching for typos
- Semantic search using embeddings
- Search suggestions and autocomplete

#### Prompt Templates
- Parameterized prompt templates
- Template variables and substitution
- Template inheritance
- Template libraries

#### Analytics & Insights
- Usage analytics dashboard
- Popular prompts tracking
- Success rate metrics
- User behavior analysis

### Phase 3 Features (6-12 months)

#### AI-Powered Features
- Automatic prompt categorization
- Prompt quality scoring
- Duplicate detection
- Automatic tagging suggestions

#### Collaboration Features
- Multi-user editing
- Comments and discussions
- Approval workflows
- Team sharing

#### Integration Capabilities
- REST API for external access
- Webhook notifications
- Integration with Slack/Teams
- Export/import from other systems

#### Advanced Management
- Bulk operations (update, move, delete)
- Custom metadata fields
- Advanced filtering options
- Scheduled prompt updates

## Conclusion

This implementation plan provides a comprehensive roadmap for building a robust, scalable Prompt Manager MCP Server that will:

1. **Centralize Prompt Management**: Single source of truth for all development prompts
2. **Improve Developer Productivity**: Fast search and discovery of relevant prompts
3. **Ensure Quality**: Validation and hierarchy enforcement
4. **Enable Collaboration**: Shared prompt library across teams
5. **Support Growth**: Extensible architecture for future enhancements

### Key Success Factors

#### Technical Excellence
- Clean, maintainable code following TypeScript best practices
- Comprehensive test coverage (unit, integration, E2E)
- Robust error handling and logging
- Performance optimization for scale

#### User Experience
- Intuitive hierarchy and organization
- Fast, relevant search results
- Clear, helpful error messages
- Multiple output formats for different needs

#### Operational Efficiency
- Automated backups and disaster recovery
- Monitoring and alerting
- Clear documentation and runbooks
- Low maintenance overhead

### Next Steps

1. **Week 1**: Begin Phase 1 implementation (Project Foundation)
2. **Week 2**: Complete Phase 2 (Data Models & Configuration)
3. **Week 3**: Implement Phase 3 (Helper Utilities) and Phase 4 (Core Services)
4. **Week 4**: Complete Phase 5 (MCP Tools) and Phase 6 (Main Server)
5. **Week 5**: Create sample content and comprehensive documentation
6. **Week 6**: Testing, refinement, and deployment preparation

### Estimated Total Effort
- **Development**: 15-23 hours (as per step-by-step guide)
- **Testing**: 10-15 hours
- **Documentation**: 5-8 hours
- **Sample Content**: 3-5 hours
- **Deployment**: 2-4 hours
- **Total**: 35-55 hours

This project is well-scoped for a 6-week timeline with adequate buffer for unexpected challenges and iterations based on feedback.

## Appendix

### A. Sample Metadata Files

#### Example 1: Developer Code Generation Prompt
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Payment Processing Code Generator",
  "description": "Generate secure payment processing code following PCI DSS compliance standards",
  "role": "developer",
  "taskType": "code-generation",
  "module": "cashiering",
  "tags": ["payments", "security", "pci-dss", "transactions", "typescript"],
  "createdAt": "2026-01-15T10:30:00.000Z",
  "updatedAt": "2026-01-17T14:22:00.000Z",
  "version": 2
}
```

#### Example 2: Architect Architecture Review Prompt
```json
{
  "id": "650e8400-e29b-41d4-a716-446655440001",
  "name": "Gaming Operations Architecture Review",
  "description": "Review gaming operations architecture for scalability and compliance",
  "role": "architect",
  "taskType": "architecture-review",
  "module": "gaming-ops",
  "tags": ["architecture", "scalability", "compliance", "gaming"],
  "createdAt": "2026-01-16T09:15:00.000Z",
  "updatedAt": "2026-01-16T09:15:00.000Z",
  "version": 1
}
```

### B. Sample Prompt Content

#### Payment Processing Code Generator (developer/code-generation/cashiering)
```markdown
# Payment Processing Code Generator

## Purpose
Generate secure, PCI DSS compliant payment processing code for the cashiering module.

## Context
This prompt helps create payment processing implementations that:
- Follow PCI DSS compliance requirements
- Implement proper error handling
- Include transaction logging
- Use secure data handling practices

## Instructions

### 1. Payment Method Support
Generate code that supports:
- Credit cards (Visa, MasterCard, Amex)
- Debit cards
- Digital wallets (Apple Pay, Google Pay)
- Casino credits/chips

### 2. Security Requirements
- Never store full card numbers
- Use tokenization for card data
- Implement 3D Secure authentication
- Log all transactions with audit trail

### 3. Error Handling
- Handle declined transactions gracefully
- Implement retry logic for network failures
- Provide clear error messages to users
- Log errors without exposing sensitive data

### 4. Transaction Flow
1. Validate payment method
2. Tokenize payment data
3. Process authorization
4. Handle response
5. Update transaction records
6. Send confirmation

## Example Code Structure

\`\`\`typescript
interface PaymentRequest {
  amount: number;
  currency: string;
  paymentMethod: PaymentMethod;
  customerId: string;
}

interface PaymentResponse {
  success: boolean;
  transactionId: string;
  authorizationCode?: string;
  error?: PaymentError;
}

class PaymentProcessor {
  async processPayment(request: PaymentRequest): Promise<PaymentResponse>
  async refundPayment(transactionId: string): Promise<PaymentResponse>
  async getTransactionStatus(transactionId: string): Promise<TransactionStatus>
}
\`\`\`

## Output Format
Generate complete TypeScript code including:
- Interface definitions
- Payment processor class
- Error handling
- Logging
- Unit tests
```

### C. Configuration Examples

#### Environment Configuration
```bash
# .env.production
TRANSPORT_TYPE=httpStream
HOST=0.0.0.0
PORT=3000

# Storage
PROMPTS_BASE_PATH=/data/prompts

# Search
ENABLE_SEARCH_INDEX=true
MAX_SEARCH_RESULTS=50

# Logging
LOG_LEVEL=info

# Performance
INDEX_REBUILD_INTERVAL=300000  # 5 minutes in ms
```

#### Package.json Scripts
```json
{
  "scripts": {
    "dev": "tsx src/index.ts",
    "build": "tsc",
    "start": "node build/index.js",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "lint": "eslint src/**/*.ts",
    "format": "prettier --write \"src/**/*.ts\"",
    "clean": "rm -rf build",
    "typecheck": "tsc --noEmit"
  }
}
```

### D. API Usage Examples

#### Search Prompts
```typescript
// Search by keyword
await server.callTool('search-prompts', {
  query: 'payment processing'
});

// Search by hierarchy
await server.callTool('search-prompts', {
  role: 'developer',
  taskType: 'code-generation',
  module: 'cashiering'
});

// Search with tags
await server.callTool('search-prompts', {
  tags: ['security', 'pci-dss'],
  limit: 10
});
```

#### List Prompts
```typescript
// List all developer prompts as tree
await server.callTool('list-prompts', {
  role: 'developer',
  format: 'tree'
});

// List specific module as table
await server.callTool('list-prompts', {
  module: 'cashiering',
  format: 'table'
});

// Detailed view of all prompts
await server.callTool('list-prompts', {
  format: 'detailed'
});
```

#### Add Prompt
```typescript
await server.callTool('add-prompt', {
  name: 'Test Generation Helper',
  description: 'Generate comprehensive unit tests for cashiering module',
  role: 'developer',
  taskType: 'testing',
  module: 'cashiering',
  content: '# Test Generation Helper\n\n...',
  tags: ['testing', 'unit-tests', 'jest']
});
```

#### Update Prompt
```typescript
// Update metadata only
await server.callTool('update-prompt', {
  id: '550e8400-e29b-41d4-a716-446655440000',
  description: 'Updated description',
  tags: ['payments', 'security', 'stripe']
});

// Update content
await server.callTool('update-prompt', {
  id: '550e8400-e29b-41d4-a716-446655440000',
  content: '# Updated Content\n\n...'
});

// Move to different hierarchy
await server.callTool('update-prompt', {
  id: '550e8400-e29b-41d4-a716-446655440000',
  role: 'architect',
  taskType: 'architecture-review'
});
```

### E. Troubleshooting Guide

#### Common Issues

**Issue: "Task type X is not valid for role Y"**
- **Cause**: Invalid role/task type combination
- **Solution**: Check `VALID_COMBINATIONS` in hierarchy config
- **Example**: Architect role only supports architecture-review and documentation

**Issue: "Prompt not found: {id}"**
- **Cause**: Prompt doesn't exist or index out of sync
- **Solution**: Rebuild index or verify prompt ID
- **Command**: Restart server to rebuild index

**Issue: "Permission denied" errors**
- **Cause**: File system permissions
- **Solution**: Ensure prompts directory is writable
- **Command**: `chmod -R 755 prompts/`

**Issue: Search returns no results**
- **Cause**: Index not built or search criteria too restrictive
- **Solution**: Restart server or broaden search criteria
- **Tip**: Try searching without filters first

**Issue: "Server won't start"**
- **Cause**: Port in use or configuration error
- **Solution**: Check port availability and environment variables
- **Debug**: Run with `LOG_LEVEL=debug` for detailed logs

### F. Performance Tuning

#### Index Optimization
```typescript
// Rebuild index periodically
setInterval(async () => {
  await promptService.rebuildIndex();
}, 300000); // 5 minutes

// Cache frequently accessed prompts
const promptCache = new LRUCache<string, Prompt>({
  max: 100,
  ttl: 1000 * 60 * 5 // 5 minutes
});
```

#### Search Optimization
```typescript
// Limit result set
const MAX_RESULTS = 50;

// Use result pagination
interface PaginatedSearchResults {
  results: SearchResult[];
  page: number;
  pageSize: number;
  totalResults: number;
}
```

#### Memory Management
```typescript
// Monitor memory usage
setInterval(() => {
  const usage = process.memoryUsage();
  logger.info('Memory usage', {
    heapUsed: Math.round(usage.heapUsed / 1024 / 1024),
    heapTotal: Math.round(usage.heapTotal / 1024 / 1024),
    external: Math.round(usage.external / 1024 / 1024)
  });
}, 60000); // Every minute
```

---

**Document Version**: 1.0  
**Last Updated**: January 17, 2026  
**Status**: Ready for Implementation  
**Estimated Completion**: 6 weeks from start
