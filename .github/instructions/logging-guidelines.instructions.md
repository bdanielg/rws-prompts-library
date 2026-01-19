---
applyTo: '**'
---
# MCP Server Logging Guidelines

## Overview

This MCP server implements a comprehensive multi-tier logging strategy using Winston for structured JSON logging. The logging system is designed to track usage patterns, performance metrics, and operational health while maintaining privacy and security standards.

## Logging Architecture

### Multi-Tier Logging Strategy

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   MCP Client    │    │  FastMCP Server  │    │  Log Storage    │
│  (VSCode/etc)   │───▶│  (FastMCP)       │───▶│  (Console/File) │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                               │
                       ┌──────────────────┐
                       │  Analytics       │
                       │  Service         │
                       └──────────────────┘
```

### Tier 1: Structured JSON Logs (Primary)
- **Format**: JSON Lines via Winston
- **Output**: Console (captured by container runtime)
- **Retention**: Container lifecycle + Azure persistent storage
- **Cost**: Free

### Tier 2: Analytics Events (Operational)
- **Format**: Structured analytics events
- **Purpose**: MCP-specific usage tracking
- **Output**: Console via Winston
- **Integration**: Middleware-based event capture

## Logger Types and Usage

### 1. Startup Logger (`createStartupLogger()`)
**Purpose**: Early application startup, configuration loading, and initialization

```typescript
import { createStartupLogger } from '../helpers/logger';

const logger = createStartupLogger();

// Usage examples
logger.info({
    eventType: 'startup_success',
    message: 'MCP server initialized successfully',
    version: '1.0.0',
    port: 3000,
    authEnabled: true
});

logger.warn({
    eventType: 'startup_warning',
    message: 'Environment variable missing, using default',
    variable: 'GITHUB_APP_ID',
    defaultValue: 'none'
});

logger.error({
    eventType: 'startup_error',
    message: 'Failed to initialize OAuth server',
    error: error.message,
    stack: error.stack
});
```

### 2. Middleware Logger (`createMiddlewareLogger()`)
**Purpose**: HTTP requests, authentication, and middleware operations

```typescript
import { createMiddlewareLogger } from '../helpers/logger';

const logger = createMiddlewareLogger();

// Usage examples
logger.info({
    eventType: 'http_request',
    method: req.method,
    path: req.path,
    sessionId: sessionId,
    userAgent: req.headers['user-agent'],
    clientType: 'Visual Studio Code'
});

logger.warn({
    eventType: 'auth_failure',
    reason: 'invalid_token',
    sessionId: sessionId,
    userAgent: req.headers['user-agent']
});
```

### 3. Analytics Logger (Analytics Service)
**Purpose**: MCP-specific analytics events for usage tracking

```typescript
import { AnalyticsService } from '../analytics/analytics-service';

const analyticsService = new AnalyticsService();

// Tool execution tracking
analyticsService.logEvent(analyticsService.createEvent(
    'mcp_tool_call',
    sessionId,
    {
        toolName: 'generate-implementation-plan',
        parameters: { framework: 'nextjs', complexity: 'medium' },
        clientType: 'Visual Studio Code',
        success: true,
        duration: 1250
    },
    userId
));

// Resource access tracking
analyticsService.logEvent(analyticsService.createEvent(
    'mcp_resource_access',
    sessionId,
    {
        resourceUri: 'gene2://rules/nextjs',
        clientType: 'cursor-vscode',
        success: true,
        duration: 89
    }
));
```

## Event Types and Structure

### Standard Event Fields
All log events should include these base fields:

```typescript
interface BaseLogEvent {
    timestamp: string;          // ISO 8601 timestamp (auto-generated)
    eventType: string;          // Event classification
    message?: string;           // Human-readable description
    sessionId?: string;         // Session identifier for request tracking
    userId?: string;            // User identifier (hashed for privacy)
    success?: boolean;          // Operation success status
    duration?: number;          // Operation duration in milliseconds
    error?: string;             // Error message (if applicable)
    stack?: string;             // Error stack trace (if applicable)
}
```

### MCP-Specific Event Types

#### 1. Server Lifecycle
```typescript
eventType: 'server_startup' | 'server_shutdown' | 'server_error'

// Example
{
    eventType: 'server_startup',
    message: 'MCP server started successfully',
    version: '1.0.0',
    port: 3000,
    authEnabled: true,
    oauth_provider: 'azure_ad'
}
```

#### 2. MCP Tool Operations
```typescript
eventType: 'mcp_tool_call'

// Example
{
    eventType: 'mcp_tool_call',
    toolName: 'analyse-transcript',
    parameters: { focus: 'features', includeMetadata: true },
    clientType: 'Visual Studio Code',
    clientVersion: '1.95.0',
    success: true,
    duration: 2341,
    sessionId: 'sess_abc123',
    userId: 'hash_def456'
}
```

#### 3. MCP Resource Access
```typescript
eventType: 'mcp_resource_access'

// Example
{
    eventType: 'mcp_resource_access',
    resourceUri: 'gene2://prompts/generate-implementation-plan',
    clientType: 'cursor-vscode',
    success: true,
    duration: 45,
    sessionId: 'sess_xyz789'
}
```

#### 4. MCP Prompt Usage
```typescript
eventType: 'mcp_prompt_use'

// Example
{
    eventType: 'mcp_prompt_use',
    promptName: 'analyse-request',
    parameters: { focus: 'gaps', framework: 'nextjs' },
    success: true,
    duration: 156,
    sessionId: 'sess_prompt123'
}
```

#### 5. HTTP Request Tracking
```typescript
eventType: 'http_request'

// Example
{
    eventType: 'http_request',
    method: 'POST',
    endpoint: '/mcp',
    statusCode: 200,
    clientType: 'Visual Studio Code',
    userAgent: 'Visual Studio Code/1.95.0',
    success: true,
    duration: 423,
    sessionId: 'sess_http456'
}
```

#### 6. Authentication Events
```typescript
eventType: 'auth_success' | 'auth_failure' | 'token_refresh'

// Example
{
    eventType: 'auth_success',
    method: 'oauth2_bearer',
    userId: 'hash_user789',
    scopes: ['mcp:tools', 'mcp:resources'],
    sessionId: 'sess_auth123'
}
```

## Implementation Patterns

### 1. Tool Registration with Analytics
Tools are automatically wrapped with analytics middleware:

```typescript
// src/tools/your-tool.ts
import { LegacyMcpServer } from '../mcp-server-adapter';
import { z } from 'zod';

export function registerYourTool(server: LegacyMcpServer) {
    server.registerTool(
        'your-tool-name',
        {
            title: 'Your Tool',
            description: 'Your tool description',
            inputSchema: {
                parameter: z.string().describe('Parameter description')
            }
        },
        async (args, extra) => {
            // Tool implementation
            // Analytics are automatically logged by middleware
            return {
                content: [{ type: 'text', text: 'Tool result' }]
            };
        }
    );
}
```

### 2. Resource Registration with Analytics
Resources are automatically wrapped with analytics middleware:

```typescript
// src/resources/index.ts
import { LegacyMcpServer } from '../mcp-server-adapter';

export function registerYourResource(server: LegacyMcpServer) {
    server.registerResource(
        "your-resource",
        "gene2://your-resource",
        {
            title: "Your Resource",
            description: "Resource description",
            mimeType: "text/plain"
        },
        async (uri) => {
            // Resource implementation
            // Analytics are automatically logged by middleware
            return {
                contents: [{ uri: uri.href, text: 'Resource content' }]
            };
        }
    );
}
```

### 3. Manual Logging in Services
For custom services and business logic:

```typescript
// src/services/your-service.ts
import { createStartupLogger } from '../helpers/logger';

const logger = createStartupLogger();

export class YourService {
    async performOperation(): Promise<void> {
        const startTime = Date.now();
        
        try {
            // Perform operation
            await this.doSomething();
            
            logger.info({
                eventType: 'service_operation_success',
                operation: 'performOperation',
                duration: Date.now() - startTime,
                success: true
            });
            
        } catch (error) {
            logger.error({
                eventType: 'service_operation_error',
                operation: 'performOperation',
                duration: Date.now() - startTime,
                success: false,
                error: error instanceof Error ? error.message : String(error),
                stack: error instanceof Error ? error.stack : undefined
            });
            throw error;
        }
    }
}
```

## Privacy and Security Guidelines

### 1. User ID Handling
- **Storage**: Only hashed user IDs in logs (first 12 characters of SHA-256)
- **Source**: Entra ID Object Identifier (OID) for privacy
- **Access**: Only administrators can map hashed IDs back to users

```typescript
// Automatic hashing in Analytics Service
const hashedUserId = createHash('sha256').update(userId).digest('hex').substring(0, 12);
```

### 2. Parameter Sanitization
Sensitive parameters are automatically sanitized:

```typescript
// Automatically redacted
const sensitiveKeys = ['password', 'secret', 'token', 'key', 'auth', 'credential'];

// Example output
{
    parameters: {
        framework: 'nextjs',
        apiKey: '[REDACTED]',
        config: 'valid-config-value'
    }
}
```

### 3. Data Truncation
Long strings are automatically truncated to prevent log bloat:

```typescript
// Strings longer than 200 characters
{
    longParameter: "Very long string content...[TRUNCATED]"
}
```

## Configuration

### Analytics Configuration
Configure analytics behavior via environment variables or service initialization:

```typescript
const analyticsService = new AnalyticsService({
    enableParameterLogging: true,     // Log tool/resource parameters
    enableUserTracking: true,         // Track user IDs
    logLevel: 'info',                 // Winston log level
    anonymizeUserId: true,            // Hash user IDs
    sanitizeParameters: true          // Remove sensitive values
});
```

### Environment Variables
```bash
# Logging configuration
ANALYTICS_ENABLED=true              # Enable/disable analytics
LOG_LEVEL=info                      # Winston log level

# Privacy settings
ANONYMIZE_USER_ID=true              # Hash user IDs
SANITIZE_PARAMETERS=true            # Sanitize sensitive parameters
```

## Monitoring and Analysis

### 1. Log Aggregation
Logs are output to console in JSON format for easy aggregation:

```bash
# Container runtime captures JSON logs
docker logs mcp-server | jq '.eventType' | sort | uniq -c

# Example output
  15 auth_success
 142 http_request
  89 mcp_tool_call
  23 mcp_resource_access
   7 server_startup
```

### 2. Common Queries

#### Tool Usage Analysis
```bash
# Most used tools
cat logs.jsonl | jq -r 'select(.eventType=="mcp_tool_call") | .toolName' | sort | uniq -c | sort -nr

# Tool success rates
cat logs.jsonl | jq -r 'select(.eventType=="mcp_tool_call") | "\(.toolName),\(.success)"' | sort | uniq -c
```

#### Performance Analysis
```bash
# Average tool execution time
cat logs.jsonl | jq -r 'select(.eventType=="mcp_tool_call" and .duration) | .duration' | awk '{sum+=$1; count++} END {print "Average:", sum/count, "ms"}'

# Slow operations (>2s)
cat logs.jsonl | jq 'select(.duration > 2000)'
```

#### Client Analysis
```bash
# Client type distribution
cat logs.jsonl | jq -r 'select(.clientType) | .clientType' | sort | uniq -c

# Authentication success rate
cat logs.jsonl | jq -r 'select(.eventType | startswith("auth_")) | .eventType' | sort | uniq -c
```

## Best Practices

### 1. Structured Logging
- Always use structured JSON format
- Include relevant context fields
- Use consistent event type naming
- Add timing information for operations

### 2. Error Handling
- Log errors with full context
- Include error messages and stack traces
- Mark operations as failed with `success: false`
- Provide actionable error information

### 3. Performance Tracking
- Log operation start and end times
- Calculate and log duration
- Track resource usage where relevant
- Monitor slow operations

### 4. Privacy Compliance
- Never log raw user credentials
- Hash user identifiers
- Sanitize sensitive parameters
- Respect user privacy settings

### 5. Log Maintenance
- Monitor log volume and storage
- Implement log rotation as needed
- Archive important logs for analysis
- Clean up old log data regularly

## Troubleshooting

### Common Issues

#### 1. Missing Analytics Events
Check if analytics is enabled and middleware is properly registered:

```typescript
// Verify analytics service initialization
const analyticsService = initializeAnalytics();

// Verify middleware registration
const mcpAnalyticsMiddleware = createMCPAnalyticsMiddleware(
    analyticsService,
    getSessionMetadata,
    getCurrentSessionId
);
mcpAnalyticsMiddleware(server);
```

#### 2. Incomplete Log Data
Ensure all required context is available:

```typescript
// Check session metadata availability
const session = getSessionMetadata(sessionId);
if (!session) {
    logger.warn({
        eventType: 'session_missing',
        sessionId: sessionId,
        message: 'Session metadata not found'
    });
}
```

#### 3. Performance Impact
Monitor logging overhead and adjust configuration:

```typescript
// Reduce parameter logging for performance
const analyticsService = new AnalyticsService({
    enableParameterLogging: false,  // Disable parameter logging
    logLevel: 'error'               // Only log errors
});
```

## Integration Examples

### Adding Logging to New Tools
```typescript
// src/tools/new-tool.ts
import { LegacyMcpServer } from '../mcp-server-adapter';
import { z } from 'zod';

export function registerNewTool(server: LegacyMcpServer) {
    server.registerTool(
        'new-tool',
        {
            description: 'A new MCP tool',
            inputSchema: {
                input: z.string()
            }
        },
        async (args, extra) => {
            // Analytics are automatically handled by middleware
            // No manual logging needed for standard success/failure
            
            // Optional: Add custom context logging
            const logger = createStartupLogger();
            logger.debug({
                eventType: 'new_tool_debug',
                customData: 'additional context'
            });
            
            return {
                content: [{ type: 'text', text: 'Result' }]
            };
        }
    );
}
```

### Adding Logging to Services
```typescript
// src/services/external-service.ts
import { createStartupLogger } from '../helpers/logger';

const logger = createStartupLogger();

export class ExternalService {
    async callAPI(endpoint: string): Promise<any> {
        const startTime = Date.now();
        
        logger.info({
            eventType: 'external_api_call',
            endpoint: endpoint,
            message: 'Starting external API call'
        });
        
        try {
            const response = await fetch(endpoint);
            const duration = Date.now() - startTime;
            
            logger.info({
                eventType: 'external_api_success',
                endpoint: endpoint,
                statusCode: response.status,
                duration: duration,
                success: true
            });
            
            return await response.json();
            
        } catch (error) {
            const duration = Date.now() - startTime;
            
            logger.error({
                eventType: 'external_api_error',
                endpoint: endpoint,
                duration: duration,
                success: false,
                error: error instanceof Error ? error.message : String(error)
            });
            
            throw error;
        }
    }
}
```

This logging system provides comprehensive observability while maintaining privacy, security, and performance standards for the MCP server implementation.
