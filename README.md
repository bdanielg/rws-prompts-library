# Prompt Manager MCP Server

A Model Context Protocol (MCP) server for managing hierarchical prompts organized by role, task type, and module. This server provides CRUD operations and search capabilities for a structured prompt library serving CMS development teams.

## Features

- **Hierarchical Organization**: Prompts organized by Role → Task Type → Module
- **CRUD Operations**: Create, Read, Update, and Delete prompts
- **Advanced Search**: Find prompts by role, task type, module, keywords, or tags with relevance scoring
- **Multiple Output Formats**: Tree, table, or detailed list views
- **Validation**: Strict hierarchy validation to ensure data integrity
- **MCP Compatible**: Works with VSCode, Cursor, Claude Desktop, and other MCP-compatible IDEs

## Hierarchy Structure

### Roles
- `developer` - Software developers
- `architect` - Solution architects
- `tester` - QA engineers
- `security-specialist` - Security experts

### Task Types
- `code-generation` - Creating new code from specifications
- `refactoring` - Modernizing or improving existing code
- `testing` - Generating tests or test strategies
- `debugging` - Identifying and fixing issues
- `documentation` - Creating technical documentation
- `architecture-review` - Evaluating architectural decisions

### Modules
- `cashiering` - Payment processing and financial operations
- `gaming-ops` - Gaming operations and floor management
- `membership` - Player tracking and loyalty programs
- `reporting` - Business intelligence and analytics
- `security` - Authentication, authorization, and audit logging
- `shared` - Cross-cutting concerns and utilities

## Installation

```bash
# Clone the repository
git clone <repository-url>
cd prompt-manager-mcp

# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Build the project
npm run build
```

## Usage

### Development Mode

```bash
npm run dev
```

### Production Mode

```bash
npm run build
npm start
```

## Project Structure

```
prompt-manager-mcp/
├── src/
│   ├── models/          # Type definitions and validation schemas
│   ├── config/          # Hierarchy configuration
│   ├── helpers/         # Utility functions
│   ├── services/        # Business logic
│   └── tools/           # MCP tool implementations
├── prompts/             # Prompt storage directory
│   ├── developer/
│   ├── architect/
│   ├── tester/
│   └── security-specialist/
├── build/               # Compiled JavaScript output
└── docs/                # Documentation
```

## Configuration

Environment variables can be set in `.env`:

```bash
# MCP Server Configuration
TRANSPORT_TYPE=stdio
HOST=0.0.0.0
PORT=3000

# Prompts Storage
PROMPTS_BASE_PATH=./prompts

# Logging
LOG_LEVEL=debug

# Search Configuration
ENABLE_SEARCH_INDEX=true
MAX_SEARCH_RESULTS=50
```

## Development Status

### ✅ Stage 1: Foundation (Completed)
- [x] Project directory structure
- [x] TypeScript configuration
- [x] Environment template
- [x] Type definitions and enums
- [x] Zod validation schemas
- [x] Hierarchy configuration
- [x] Package scripts

### 🔲 Stage 2: Core Services (Pending)
- [ ] File Manager service
- [ ] Prompt Service
- [ ] Search implementation

### 🔲 Stage 3: MCP Tools (Pending)
- [ ] Search prompts tool
- [ ] List prompts tool
- [ ] Add prompt tool
- [ ] Update prompt tool

### 🔲 Stage 4: Integration & Testing (Pending)
- [ ] Main server implementation
- [ ] End-to-end testing
- [ ] Documentation

## License

MIT

## Contributing

Contributions are welcome! Please read the contributing guidelines before submitting pull requests.
