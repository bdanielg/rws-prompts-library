---
applyTo: '**'
---
# MCP Development Guide

## Overview
This guide consolidates all MCP (Model Context Protocol) development practices for our TypeScript server implementation. It combines flow understanding, resource management, and tool design principles.

## Documentation Reference
- **Local SDK Documentation**: [docs/mcp-typescript-sdk-readme.md](mdc:docs/mcp-typescript-sdk-readme.md)
- **LLM-Optimized Documentation**: [docs/llms-full.txt](mdc:docs/llms-full.txt)
- **Current SDK Version**: fastmcp v3.23.1 (as specified in package.json)
- **Official Specification**: https://spec.modelcontextprotocol.io
- **Building with LLMs Tutorial**: https://modelcontextprotocol.io/tutorials/building-mcp-with-llms

> **Important**: When upgrading fastmcp in package.json, update the local documentation:
> ```bash
> # Update documentation based on fastmcp changes
> ```
> 
> **For LLM Development**: The `docs/llms-full.txt` file contains comprehensive MCP documentation optimized for LLM consumption, as recommended in the [official tutorial](mdc:https:/modelcontextprotocol.io/tutorials/building-mcp-with-llms). Use this when working with Claude or other LLMs to build MCP servers.

## MCP Architecture Flow

### Complete Flow Diagram
```
┌─────────────┐       ┌──────────────┐       ┌───────────────┐       ┌──────────────────┐
│             │       │              │       │               │       │                  │
│  Cursor/    │ (1)   │  IDE         │ (2)   │  MCP Server   │ (5)   │  LLM Provider    │
│  VSCode     │◄─────►│  Extension   │◄─────►│  (TypeScript) │◄─────►│  (Claude/GPT/etc)│
│  (Client)   │       │  (MCP Client)│       │               │       │                  │
│             │       │              │       │               │       │                  │
└─────────────┘       └──────────────┘       └───────┬───────┘       └──────────────────┘
                                                     │ (3)                     ▲
                                                     │                         │
                                                     ▼                         │ (4)
                                            ┌──────────────────┐               │
                                            │                  │               │
                                            │  External        │───────────────┘
                                            │  Resources       │
                                            │  (File System,   │
                                            │   APIs, etc)     │
                                            │                  │
                                            └──────────────────┘
```

### Flow Description
1. **IDE → Extension**: User interacts with IDE (Cursor/VSCode), which passes requests to its MCP client extension
2. **Extension ↔ MCP Server**: The extension communicates with your MCP server using the protocol
3. **MCP Server → Resources**: Your server loads resources from file system or external APIs
4. **Resources → LLM**: Some resources may be processed by LLMs (optional path)
5. **MCP Server ↔ LLM**: Your server may interact with LLMs directly (optional, implementation-specific)

## Tool Design Principles

### Core Principles
- **Single Responsibility**: Each tool should do one thing well
- **Clear Naming**: Tool names should clearly indicate functionality
- **Parameter Validation**: Use Zod for robust parameter validation
- **Graceful Error Handling**: Provide helpful messages on failure
- **IDE-Aware Output**: Format content for optimal IDE display

### Standard Tool Structure
```typescript
import { LegacyMcpServer } from '../mcp-server-adapter';
import { z } from 'zod';

export function registerMyTool(server: LegacyMcpServer): void {
    server.registerTool(
        'tool-name',                   // Short, descriptive name
        {
            title: 'Tool Title',
            description: 'Detailed tool description',
            inputSchema: {
                // Parameters with Zod validation
                requiredParam: z.string(),
                optionalParam: z.enum(['option1', 'option2']).optional(),
            }
        },
        async (args, extra) => {
            // extra contains: sessionId, session, client, log, reportProgress, streamContent
            try {
                // 1. Parameter checking/validation
                // 2. Resource loading if needed
                // 3. Business logic
                // 4. Response formatting
                
                return {
                    content: [
                        {
                            type: 'text',
                            text: 'Formatted markdown response'
                        }
                        // Can include multiple content blocks
                    ]
                };
            } catch (error) {
                console.error(`Error in tool-name:`, error);
                return {
                    content: [
                        {
                            type: 'text',
                            text: `Error: ${error.message || 'An unexpected error occurred'}`
                        }
                    ],
                    isError: true
                };
            }
        }
    );
}
```

### Parameter Design Guidelines
- Use descriptive parameter names that indicate their purpose
- Make parameters optional where appropriate with `.optional()`
- Provide sensible defaults for optional parameters
- Use appropriate Zod validators:
  - `z.string()` - For text inputs
  - `z.enum()` - For fixed option lists
  - `z.boolean()` - For flags
  - `z.number()` - For numeric inputs
  - `z.object()` - For structured data

### ResourceLinks in Tools
Tools can return `ResourceLink` objects to reference resources without embedding their full content:

```typescript
export function registerListFilesTool(server: LegacyMcpServer): void {
    server.registerTool(
        "list-files",
        {
            title: "List Files",
            description: "List project files",
            inputSchema: { pattern: z.string() }
        },
        async ({ pattern }) => ({
            content: [
                { type: "text", text: `Found files matching "${pattern}":` },
                // ResourceLinks let tools return references without file content
                {
                    type: "resource_link",
                    uri: "file:///project/README.md",
                    name: "README.md",
                    mimeType: "text/markdown",
                    description: 'A README file'
                },
                {
                    type: "resource_link",
                    uri: "file:///project/src/index.ts",
                    name: "index.ts",
                    mimeType: "text/typescript",
                    description: 'An index file'
                }
            ]
        })
    );
}
```

## Resource Management

### Resource Concept
Resources in MCP represent static or dynamic content that clients can retrieve. Unlike tools which perform actions, resources provide data that can be used by clients or LLMs.

### Resource Types in Our Project
- **Prompt Templates**: Markdown files that guide LLM behavior
- **Rule Sets**: IDE-specific coding standards and conventions
- **Configuration Files**: Settings for tools and workflows
- **Implementation Templates**: Starter code for common patterns

### Resource Registration Pattern
```typescript
export function registerMyResources(server: LegacyMcpServer): void {
    // Static resource
    server.registerResource(
        "config",
        "config://app",
        {
            title: "Application Config",
            description: "Application configuration data",
            mimeType: "text/plain"
        },
        async (uri) => ({
            contents: [{ uri: uri.href, text: "App configuration here" }]
        })
    );

    // Dynamic resource with parameters
    server.registerResource(
        "user-profile",
        "users://{userId}/profile",
        {
            title: "User Profile",
            description: "User profile information"
        },
        async (uri, { userId }) => ({
            contents: [{ uri: uri.href, text: `Profile data for user ${userId}` }]
        })
    );
}
```

### Resource Loading Pattern
```typescript
// Recommended pattern for loading resources
const fs = await import('fs/promises');
const path = await import('path');
const fileContent = await fs.readFile(
    path.join(process.cwd(), 'src/resources/resource-name.md'),
    'utf-8'
);
```

## Prompt Management

### Prompt Registration
Prompts are reusable templates that help LLMs interact with your server effectively:

```typescript
export function registerMyPrompts(server: LegacyMcpServer): void {
    server.registerPrompt(
        "review-code",
        {
            title: "Code Review",
            description: "Review code for best practices and potential issues",
            argsSchema: { code: z.string() }
        },
        ({ code }) => ({
            messages: [{
                role: "user",
                content: {
                    type: "text",
                    text: `Please review this code:\n\n${code}`
                }
            }]
        })
    );
}
```

### Prompt Storage and Loading
- Store prompts separately in `src/prompts/` directory
- Load prompts dynamically at runtime
- Structure prompt content for LLM understanding
- Include clear headers and context in all prompts

### Prompt Loading Example
```typescript
const promptPath = path.join(process.cwd(), 'src/prompts/prompt-name.prompt.md');
const promptContent = await fs.readFile(promptPath, 'utf-8');
return {
    content: [
        {
            type: 'text',
            text: promptContent
        }
    ]
};
```

## Transport Options

### FastMCP HTTP Stream Transport
The server uses FastMCP's `httpStream` transport which handles SSE and HTTP POST internally:

```typescript
import { FastMCP } from 'fastmcp';
import { FastMcpServerAdapter, SessionAuthContext } from './mcp-server-adapter';

// Initialize FastMCP server
const fastMcpServer = new FastMCP<SessionAuthContext>({
    name: 'server-name',
    version: '1.0.0',
    // ... auth and other options
});

// Start with httpStream transport
await fastMcpServer.start({
    transportType: 'httpStream',
    httpStream: { 
        host: '0.0.0.0', 
        port: 3000, 
        endpoint: "/", 
        stateless: false 
    }
});
```

## Client-Specific Adaptations

### Session-Based Client Detection
```typescript
if (sessionId && sessionMetadata[sessionId]) {
    switch (sessionMetadata[sessionId].clientType) {
        case 'Visual Studio Code':
            // VSCode-specific handling
            outputPath = '.github/copilot-instructions.md';
            break;
        case 'cursor-vscode':
            // Cursor-specific handling
            outputPath = '.cursor/rules/resource-name.mdc';
            break;
        default:
            // Default handling
            outputPath = 'default-path.md';
            break;
    }
}
```

## Error Handling Standards

### Tool Error Handling
- Always wrap tool implementations in try/catch blocks
- Log errors with meaningful context
- Return user-friendly error messages
- Include `isError: true` in error responses
- Include debugging information where appropriate

### Resource Error Handling
```typescript
try {
    const content = await fs.readFile(resourcePath, 'utf-8');
    return {
        contents: [{ uri: uri.href, text: content }]
    };
} catch (error) {
    console.error(`Error loading resource ${resourcePath}:`, error);
    return {
        contents: [{ uri: uri.href, text: `Error: Could not load resource` }]
    };
}
```

## Advanced Features

### Dynamic Server Management
Add/update/remove tools, prompts, and resources after server connection:

```typescript
// Tools can be enabled/disabled dynamically
const putMessageTool = server.registerTool("putMessage", config, handler);
putMessageTool.disable(); // Won't show up in listTools

// Later, enable it
putMessageTool.enable();

// Update tool configuration
putMessageTool.update({
    inputSchema: { newParam: z.string() }
});

// Remove tool completely
putMessageTool.remove();
```

### User Input Elicitation
Request additional information from users during tool execution:

```typescript
server.registerTool(
    "book-restaurant",
    {
        title: "Book Restaurant",
        description: "Book a restaurant table",
        inputSchema: {
            restaurant: z.string(),
            date: z.string(),
            partySize: z.number()
        }
    },
    async ({ restaurant, date, partySize }) => {
        const available = await checkAvailability(restaurant, date, partySize);
        
        if (!available) {
            const result = await server.elicitInput({
                message: `No tables available at ${restaurant} on ${date}. Check alternatives?`,
                requestedSchema: {
                    type: "object",
                    properties: {
                        checkAlternatives: {
                            type: "boolean",
                            title: "Check alternative dates"
                        }
                    },
                    required: ["checkAlternatives"]
                }
            });

            if (result.action === "accept" && result.content?.checkAlternatives) {
                // Handle alternative search
            }
        }
    }
);
```

## Response Formatting Standards

### Content Structure
- Use Markdown for rich text formatting
- Include code blocks with appropriate syntax highlighting
- Structure responses with clear headings and sections
- Ensure responses render well in both VSCode and Cursor
- For complex responses, break content into multiple content blocks

### Content Types
- `text` - For markdown formatted text
- `resource_link` - For referencing other resources without embedding content
- `image` - For image content (when supported)

## Communication Protocol

### Initialization Flow
```json
IDE Extension (MCP Client) → MCP Server
{
  "jsonrpc": "2.0",
  "method": "initialize",
  "params": {
    "clientInfo": { "name": "cursor-vscode", "version": "1.0.0" },
    "protocolVersion": "2025-03-26",
    "capabilities": { ... }
  }
}
```

### Tool Request Flow
```json
IDE Extension → MCP Server
{
  "jsonrpc": "2.0",
  "method": "tools/call",
  "params": {
    "name": "tool-name",
    "arguments": { "param": "value" }
  }
}
```

## Development Workflow

### LLM-Assisted Development
When building MCP servers with LLMs like Claude, follow the [official tutorial](mdc:https:/modelcontextprotocol.io/tutorials/building-mcp-with-llms):

#### Preparing Documentation for LLMs
1. **Provide comprehensive context**: Share the `docs/llms-full.txt` file which contains MCP documentation optimized for LLM consumption
2. **Include SDK documentation**: Reference `docs/mcp-typescript-sdk-readme.md` for TypeScript-specific patterns
3. **Share project context**: Include relevant parts of this development guide

#### Describing Your Server to LLMs
Be specific about:
- What resources your server will expose
- What tools it will provide  
- Any prompts it should offer
- What external systems it needs to interact with

Example prompt:
```
Build an MCP server that:
- Connects to my company's PostgreSQL database
- Exposes table schemas as resources
- Provides tools for running read-only SQL queries
- Includes prompts for common data analysis tasks
```

#### Best Practices for LLM Development
- Start with core functionality first, then iterate to add features
- Ask the LLM to explain any code parts you don't understand
- Request modifications or improvements as needed
- Have the LLM help test the server and handle edge cases
- Break down complex servers into smaller, manageable pieces
- Keep security in mind - validate inputs and limit access appropriately

### Testing Guidelines
- Test tools with various parameter combinations
- Ensure prompts render correctly across different IDEs (VSCode, Cursor)
- Verify that error cases are handled appropriately
- For external information tools, check that prompt instructions lead to useful results
- Use the [MCP Inspector](mdc:https:/github.com/modelcontextprotocol/inspector) for debugging
- Test with the MCP Inspector tool before connecting to Claude.app or other clients

### Maintenance Tasks
- Update local documentation when upgrading MCP SDK
- Version resources when making significant changes
- Document your code well for future maintenance
- Test resources in all supported client environments
- Iterate based on real usage and feedback from MCP clients

## Key Components Summary

### Server Side (Our Implementation)
- FastMCP server with `httpStream` transport for communication
- Tool definitions using Zod schema validation
- Prompt and resource loading from filesystem
- Session management for client-specific adaptations
- Support for dynamic tool/resource management via `LegacyMcpServer` adapter

### Client Side (IDE Extensions)
- IDE Extensions (VSCode/Cursor) implement the MCP client protocol
- Extensions connect to your MCP server via HTTP Stream
- Extensions render returned content appropriately in the IDE
- Extensions may integrate with LLMs for enhanced functionality
- Support for elicitation and interactive workflows
