---
applyTo: '**'
---
# MCP Server Project Structure

This is a Model Context Protocol (MCP) server implementation that provides SDLC (Software Development Life Cycle) automation workflows, tools, resources, and prompts for development teams working in VSCode, Cursor, and other MCP-compatible IDEs.

## Core Files
- @src/index.ts - Main MCP server entry point with FastMCP and httpStream transport
- @package.json - Project dependencies and build scripts
- @tsconfig.json - TypeScript configuration

## Project Structure

### `/src/` - Main Source Directory
- **@src/index.ts** - Server initialization, transport setup, and session management
- **@src/mcp-server-adapter.ts** - Adapter bridging FastMCP with legacy tool/resource registration
- **@src/auth/** - Authentication system with Azure AD JWT validation
- **@src/config/** - Configuration management for authentication and server settings
- **@src/tools/** - MCP tool implementations (modern architecture)
- **@src/resources/** - MCP resource registration and management
- **@src/prompts/** - MCP prompt templates and handlers

### `/resources/` - Content Repository
- **@resources/prompts/** - Prompt template files (.prompt.md)
- **@resources/rules/** - Framework-specific development rules
  - `nextjs/` - Next.js development guidelines
  - `flutter/` - Flutter development guidelines

### `/docs/` - Documentation
- **@docs/mcp-typescript-sdk-readme.md** - Local MCP SDK documentation
- **@docs/llms-full.txt** - LLM-optimized MCP documentation
- Various OAuth and architecture documentation

## Server Architecture

### Transport Layer
- **FastMCP httpStream Transport**: Modern MCP transport using FastMCP with session management
- **Session-based Architecture**: Each client connection gets a unique session with metadata tracking
- **Client Detection**: Automatically detects VSCode, Cursor, and other MCP clients for adaptive responses

### Authentication System
- **Azure AD Integration**: Enterprise-ready authentication with Entra ID
- **JWT Validation**: Secure token validation using `jose` library (no local token issuance)
- **Optional Authentication**: Can run in open mode or with authentication enabled
- **FastMCP Integration**: Authentication handled via FastMCP's `authenticate` hook

### Core Components
1. **MCP Server**: Handles protocol communication and capability negotiation via FastMCP
2. **Server Adapter**: Bridges FastMCP with tool/resource/prompt registries
3. **Tool Registry**: Dynamic tool registration with modern implementations
4. **Resource Registry**: Static and dynamic resource management
5. **Prompt Registry**: Interactive prompt templates with parameter validation

## MCP Tools (SDLC Automation)

### Analysis Tools
- **`analyse-transcript`** - Extract epics, stories, and features from meeting transcripts
- **`analyse-request`** - Perform gap analysis between new and existing features
- **`model-suggestion`** - Provide AI model recommendations for specific tasks

### Planning & Design Tools
- **`generate-implementation-plan`** - Create structured implementation plans for user stories
- **`extract-figma-metadata`** - Guide extraction of UI information from Figma designs
- **`get-nextjs-rules`** - Deliver Next.js specific development rules

### Development Tools
- **`execute-implementation-plan`** - Generate code and deliver features based on plans
- **`initialize-project`** - Set up new projects with best practices and folder structures

## MCP Resources

### Static Resources
- **Gene2 Prompts**: Pre-built prompt templates for SDLC workflows
  - `gene2://prompts/analyse-transcript`
  - `gene2://prompts/analyse-request`
  - `gene2://prompts/generate-implementation-plan`
  - `gene2://prompts/execute-implementation-plan`

### Framework Rules
- **Next.js Rules**: `gene2://rules/nextjs` - Comprehensive Next.js development guidelines
- **Flutter Rules**: `gene2://rules/flutter` - Flutter development best practices

### Dynamic Resources
- **Overview Resource**: `gene2://overview` - Complete workflow documentation
- **Framework-agnostic Rules**: Extensible rule system for additional frameworks

## MCP Prompts

### Interactive Prompt Templates
- **`analyse-transcript`** - Structured transcript analysis with focus options
- **`analyse-request`** - Feature gap analysis with context awareness
- **`generate-implementation-plan`** - Plan generation with framework and complexity parameters
- **`execute-implementation-plan`** - Code generation with style preferences

### Prompt Features
- **Parameter Validation**: Zod schema validation for all prompt arguments
- **Dynamic Content**: Context-aware prompt generation based on parameters
- **File-based Templates**: Markdown templates loaded from filesystem
- **Fallback Handling**: Graceful degradation when template files are missing

## Client Compatibility & Adaptation

### Supported Clients
- **Claude Desktop**: Full MCP support (tools + resources + prompts)
- **VSCode with MCP Extension**: Tool-based delivery with GitHub Copilot format
- **Cursor**: Tool-based delivery with Cursor rules format
- **Other MCP Clients**: Graceful fallback to universal tool-based delivery

### Adaptive Response Formatting
- **Session-based Detection**: Identifies client type during initialization
- **Format Adaptation**: Automatically formats responses for optimal client experience
- **Content Delivery**: Resources delivered via tools for universal compatibility

## Development Features

### Modern Architecture
- **TypeScript**: Full type safety with Zod validation
- **Modular Design**: Separate files for each tool, resource, and prompt
- **Error Handling**: Comprehensive error handling with user-friendly messages
- **Logging**: Detailed logging for debugging and monitoring

### Security & Authentication
- **Azure AD Integration**: Enterprise-ready authentication backend
- **JWT Validation**: Secure token validation using `jose` library
- **Optional Security**: Can run in development mode without authentication
- **No Local Auth Server**: Relies entirely on external identity provider

### Extensibility
- **Dynamic Registration**: Tools, resources, and prompts can be added/removed at runtime
- **Plugin Architecture**: Easy to extend with new frameworks and workflows
- **Content Management**: File-based content system for easy updates
- **Session Management**: Stateful sessions for complex workflows