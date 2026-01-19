---
applyTo: '**/*.{ts,tsx,spec.ts}'
---
# TypeScript Best Practices for MCP Development (2025 Edition)

## 1. Type Safety First - Never Compromise

### 1.1 Strict Mode Configuration
Always enable strict mode in `tsconfig.json` for maximum type safety:

```json
{
  "compilerOptions": {
    "strict": true,
    "strictNullChecks": true,
    "strictPropertyInitialization": true,
    "noImplicitAny": true,
    "noImplicitReturns": true,
    "noImplicitThis": true,
    "exactOptionalPropertyTypes": true
  }
}
```

### 1.2 Prefer `unknown` Over `any`
Use `unknown` for flexible typing while maintaining type safety:

```typescript
// ❌ Avoid
let data: any;

// ✅ Prefer
let data: unknown;
if (typeof data === 'string') {
    console.log(data.toUpperCase()); // TypeScript knows it's a string
}
```

### 1.3 Explicit Type Annotations
Be explicit with types for function parameters, return values, and complex variables:

```typescript
// ✅ Good - Clear function signatures
function processUser(user: User): UserResponse {
    // Implementation
}

// ✅ Good - Explicit variable typing when inference isn't clear
const config: ServerConfig = loadConfiguration();
```

## 2. Advanced Type Features (2025)

### 2.1 Template Literal Types
Use template literal types for dynamic string-based types:

```typescript
type APIEndpoint = `api/${'users' | 'posts' | 'comments'}`;
type EventName = `on${Capitalize<string>}`;

function fetchFromAPI(endpoint: APIEndpoint) {
    // Type-safe API calls
}
```

### 2.2 `satisfies` Operator
Use `satisfies` for type constraints while maintaining flexibility:

```typescript
const config = {
    apiUrl: 'https://api.example.com',
    timeout: 5000,
    retries: 3
} satisfies ServerConfig;

// Maintains type inference while ensuring compliance
```

### 2.3 `as const` Assertions
Use `as const` for exact type inference:

```typescript
const themes = ['light', 'dark', 'auto'] as const;
type Theme = typeof themes[number]; // 'light' | 'dark' | 'auto'

const STATUS_CODES = {
    OK: 200,
    NOT_FOUND: 404,
    ERROR: 500
} as const;
```

## 3. Utility Types and Type Manipulation

### 3.1 Built-in Utility Types
Leverage TypeScript's utility types effectively:

```typescript
// Make properties optional
type PartialUser = Partial<User>;

// Make properties readonly
type ReadonlyUser = Readonly<User>;

// Pick specific properties
type UserPreview = Pick<User, 'id' | 'name'>;

// Omit specific properties
type UserWithoutPassword = Omit<User, 'password'>;

// Create record types
type UserRoles = Record<string, 'admin' | 'user' | 'guest'>;
```

### 3.2 Custom Utility Types
Create reusable utility types for common patterns:

```typescript
// Nullable wrapper
type Nullable<T> = T | null | undefined;

// Deep readonly
type DeepReadonly<T> = {
    readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P];
};

// Optional by keys
type OptionalByKeys<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
```

## 4. MCP Protocol Types

### 4.1 Core MCP Types
Define comprehensive MCP protocol types:

```typescript
// Request/Response types
interface MCPRequest {
    jsonrpc: "2.0";
    method: string;
    params: Record<string, unknown>;
    id?: string | number;
}

interface MCPResponse<T = unknown> {
    jsonrpc: "2.0";
    result?: T;
    error?: MCPError;
    id?: string | number;
}

interface MCPError {
    code: number;
    message: string;
    data?: unknown;
}

// Content types with discriminated unions
type MCPContent = 
    | { type: 'text'; text: string }
    | { type: 'image'; url: string; alt?: string }
    | { type: 'resource_link'; uri: string; name: string; mimeType?: string };

interface MCPToolResult {
    content: MCPContent[];
    isError?: boolean;
}
```

### 4.2 Session and Client Types
Type session management and client detection:

```typescript
interface SessionMetadata {
    clientType?: string;
    clientVersion?: string;
    protocolVersion?: string;
    sessionStartTime: Date;
    lastActivity: Date;
}

type ClientType = 'Visual Studio Code' | 'cursor-vscode' | 'unknown';
```

## 5. Error Handling Best Practices

### 5.1 Custom Error Types
Create specific error types for different scenarios:

```typescript
abstract class MCPError extends Error {
    abstract readonly code: number;
    
    constructor(message: string, public readonly data?: unknown) {
        super(message);
        this.name = this.constructor.name;
    }
}

class ValidationError extends MCPError {
    readonly code = -32602;
}

class ToolExecutionError extends MCPError {
    readonly code = -32603;
}
```

### 5.2 Result Types for Error Handling
Use Result types for explicit error handling:

```typescript
type Result<T, E = Error> = 
    | { success: true; data: T }
    | { success: false; error: E };

async function safeToolExecution<T>(
    operation: () => Promise<T>
): Promise<Result<T, ToolExecutionError>> {
    try {
        const data = await operation();
        return { success: true, data };
    } catch (error) {
        return {
            success: false,
            error: new ToolExecutionError(
                error instanceof Error ? error.message : 'Unknown error'
            )
        };
    }
}
```

## 6. Function and Parameter Design

### 6.1 Function Overloads
Use function overloads for flexible APIs:

```typescript
function createTool(name: string, handler: ToolHandler): void;
function createTool(name: string, description: string, handler: ToolHandler): void;
function createTool(
    name: string,
    descriptionOrHandler: string | ToolHandler,
    handler?: ToolHandler
): void {
    // Implementation
}
```

### 6.2 Generic Constraints
Apply proper constraints to generics:

```typescript
interface Identifiable {
    id: string;
}

function updateEntity<T extends Identifiable>(
    entity: T,
    updates: Partial<Omit<T, 'id'>>
): T {
    return { ...entity, ...updates };
}
```

### 6.3 Zod Integration
Combine Zod with TypeScript for runtime validation:

```typescript
import { z } from 'zod';

const UserSchema = z.object({
    id: z.string(),
    name: z.string(),
    email: z.string().email(),
    age: z.number().min(0)
});

type User = z.infer<typeof UserSchema>;

// Tool parameter validation
const toolParamsSchema = z.object({
    query: z.string().min(1),
    limit: z.number().min(1).max(100).default(10),
    includeMetadata: z.boolean().default(false)
});

type ToolParams = z.infer<typeof toolParamsSchema>;
```

## 7. Async/Await and Promise Handling

### 7.1 Proper Async Function Typing
Always type async functions explicitly:

```typescript
// ✅ Explicit return type
async function fetchUserData(id: string): Promise<User | null> {
    try {
        const response = await fetch(`/api/users/${id}`);
        return response.ok ? await response.json() : null;
    } catch (error) {
        console.error('Failed to fetch user:', error);
        return null;
    }
}
```

### 7.2 Promise Utilities
Create typed utility functions for common Promise patterns:

```typescript
// Timeout wrapper
function withTimeout<T>(
    promise: Promise<T>,
    timeoutMs: number
): Promise<T> {
    return Promise.race([
        promise,
        new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error('Timeout')), timeoutMs)
        )
    ]);
}

// Retry logic
async function withRetry<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3
): Promise<T> {
    let lastError: Error;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            return await operation();
        } catch (error) {
            lastError = error instanceof Error ? error : new Error(String(error));
            if (attempt === maxRetries) break;
            await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        }
    }
    
    throw lastError!;
}
```

## 8. Code Organization and Module Design

### 8.1 Barrel Exports
Use barrel files for clean imports:

```typescript
// types/index.ts
export type { User, UserRole, UserPreferences } from './user';
export type { Session, SessionMetadata } from './session';
export type { MCPRequest, MCPResponse, MCPError } from './mcp';

// Usage
import type { User, Session, MCPRequest } from './types';
```

### 8.2 Namespace Organization
Use namespaces for logical grouping:

```typescript
namespace MCP {
    export interface Request {
        jsonrpc: "2.0";
        method: string;
        params: Record<string, unknown>;
    }
    
    export namespace Tools {
        export interface Definition {
            name: string;
            description: string;
            parameters: Record<string, unknown>;
        }
        
        export interface Result {
            content: Content[];
            isError?: boolean;
        }
    }
}
```

### 8.3 Declaration Merging
Use declaration merging for extensible interfaces:

```typescript
// Base interface
interface ToolContext {
    sessionId: string;
    clientType: string;
}

// Extend in different modules
declare module './types' {
    interface ToolContext {
        authToken?: string;
        userId?: string;
    }
}
```

## 9. Performance and Optimization

### 9.1 Lazy Loading with Dynamic Imports
Type dynamic imports properly:

```typescript
async function loadTool(toolName: string): Promise<ToolDefinition> {
    const toolModule = await import(`./tools/${toolName}`);
    return toolModule.default as ToolDefinition;
}

// Type the dynamic import
type ToolModule = typeof import('./tools/example-tool');
```

### 9.2 Type-Only Imports
Use type-only imports to avoid runtime dependencies:

```typescript
import type { User } from './types/user';
import type { Config } from './config';

// Runtime import only when needed
const { validateUser } = await import('./validators/user');
```

## 10. Testing and Documentation

### 10.1 Type-Safe Testing
Write type-safe tests:

```typescript
import { describe, it, expect } from 'vitest';
import type { User } from '../types';

describe('User operations', () => {
    it('should create user with correct type', () => {
        const user: User = {
            id: '123',
            name: 'Test User',
            email: 'test@example.com'
        };
        
        expect(user).toMatchObject<Partial<User>>({
            id: expect.any(String),
            name: expect.any(String)
        });
    });
});
```

### 10.2 JSDoc with TypeScript
Use JSDoc for enhanced documentation:

```typescript
/**
 * Processes user data with validation and transformation
 * @param user - The user object to process
 * @param options - Processing options
 * @returns Promise resolving to processed user data
 * @throws {ValidationError} When user data is invalid
 * @example
 * ```typescript
 * const result = await processUser(user, { validate: true });
 * ```
 */
async function processUser(
    user: User,
    options: ProcessingOptions = {}
): Promise<ProcessedUser> {
    // Implementation
}
```

## 11. Linting and Formatting

### 11.1 ESLint Configuration
Use comprehensive ESLint rules for TypeScript:

```json
{
    "extends": [
        "@typescript-eslint/recommended",
        "@typescript-eslint/recommended-requiring-type-checking"
    ],
    "rules": {
        "@typescript-eslint/no-unused-vars": "error",
        "@typescript-eslint/no-explicit-any": "warn",
        "@typescript-eslint/prefer-nullish-coalescing": "error",
        "@typescript-eslint/prefer-optional-chain": "error",
        "@typescript-eslint/consistent-type-imports": "error"
    }
}
```

### 11.2 Prettier Integration
Configure Prettier for consistent formatting:

```json
{
    "singleQuote": true,
    "trailingComma": "es5",
    "tabWidth": 4,
    "semi": true,
    "printWidth": 100
}
```

## 12. MCP-Specific Patterns

### 12.1 Tool Registration Pattern
Standardize tool registration with proper typing using the adapter pattern:

```typescript
import { LegacyMcpServer } from '../mcp-server-adapter';
import { z } from 'zod';

interface ToolDefinition<TParams extends z.ZodRawShape> {
    name: string;
    description: string;
    inputSchema: TParams;
    handler: (args: z.infer<z.ZodObject<TParams>>, extra: any) => Promise<any>;
}

function registerTool<TParams extends z.ZodRawShape>(
    server: LegacyMcpServer,
    definition: ToolDefinition<TParams>
): void {
    server.registerTool(
        definition.name,
        {
            title: definition.name,
            description: definition.description,
            inputSchema: definition.inputSchema
        },
        async (args, extra) => {
            try {
                return await definition.handler(args, extra);
            } catch (error) {
                return {
                    content: [{
                        type: 'text',
                        text: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
                    }],
                    isError: true
                };
            }
        }
    );
}
```

### 12.2 Session Management
Type session management properly:

```typescript
class SessionManager {
    private sessions = new Map<string, SessionMetadata>();
    
    createSession(sessionId: string, clientInfo: ClientInfo): SessionMetadata {
        const metadata: SessionMetadata = {
            clientType: clientInfo.name,
            clientVersion: clientInfo.version,
            sessionStartTime: new Date(),
            lastActivity: new Date()
        };
        
        this.sessions.set(sessionId, metadata);
        return metadata;
    }
    
    getSession(sessionId: string): SessionMetadata | undefined {
        return this.sessions.get(sessionId);
    }
    
    updateActivity(sessionId: string): void {
        const session = this.sessions.get(sessionId);
        if (session) {
            session.lastActivity = new Date();
        }
    }
}
```

## 13. Migration and Maintenance

### 13.1 Version Compatibility
Handle version compatibility gracefully:

```typescript
type APIVersion = 'v1' | 'v2' | 'v3';

interface VersionedRequest<T = unknown> {
    version: APIVersion;
    data: T;
}

function handleVersionedRequest<T>(
    request: VersionedRequest<T>
): Promise<unknown> {
    switch (request.version) {
        case 'v1':
            return handleV1Request(request.data);
        case 'v2':
            return handleV2Request(request.data);
        case 'v3':
            return handleV3Request(request.data);
        default:
            throw new Error(`Unsupported version: ${request.version}`);
    }
}
```

### 13.2 Deprecation Handling
Mark deprecated types and functions properly:

```typescript
/**
 * @deprecated Use NewUser interface instead. Will be removed in v2.0.0
 */
interface OldUser {
    name: string;
}

interface NewUser {
    id: string;
    name: string;
    email: string;
}
```

## 14. Key Takeaways

1. **Always enable strict mode** - It's your first line of defense
2. **Prefer `unknown` over `any`** - Maintain type safety while being flexible
3. **Use modern TypeScript features** - Template literals, `satisfies`, `as const`
4. **Leverage utility types** - Both built-in and custom ones
5. **Type your errors** - Don't let errors be the weak point
6. **Document with JSDoc** - Types + documentation = maintainable code
7. **Test your types** - Use type-level tests for complex type logic
8. **Keep learning** - TypeScript evolves rapidly, stay updated

Remember: TypeScript is not just about avoiding errors - it's about creating self-documenting, maintainable, and scalable code that your future self (and your team) will thank you for.
