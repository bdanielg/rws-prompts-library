---
title: Configuration Refactoring: Environment Variables to Centralized Config
description: Refactor scattered environment variable usage into a centralized, type-safe configuration system with validation
version: 1.0.0
author: Prompt Manager MCP
created: 2026-01-18
tags:
  role: [developer]
  task-type: [refactoring]
  module: [config]
  compliance: []
  complexity: [advanced]
  ai-agent-persona: [refactoring-agent]
---

# Configuration Refactoring: Environment Variables to Centralized Config

You are tasked with refactoring scattered environment variable usage into a centralized, type-safe configuration system.

## Current State Analysis

### Problems with Current Approach

**Scattered Usage**:
```typescript
// ❌ Environment variables used directly throughout codebase
const dbHost = process.env.DATABASE_HOST || 'localhost';
const apiKey = process.env.API_KEY;
const port = parseInt(process.env.PORT || '3000');
```

**Issues**:
- No type safety
- Inconsistent defaults
- Hard to test
- No validation
- Scattered across files

## Refactoring Strategy

### 1. Create Configuration Schema

```typescript
// config/schema.ts
import { z } from 'zod';

export const configSchema = z.object({
  environment: z.enum(['development', 'staging', 'production']),
  
  server: z.object({
    port: z.number().int().min(1).max(65535).default(3000),
    host: z.string().default('localhost'),
    timeout: z.number().int().positive().default(30000)
  }),
  
  database: z.object({
    host: z.string(),
    port: z.number().int().default(5432),
    name: z.string(),
    user: z.string(),
    password: z.string(),
    ssl: z.boolean().default(false)
  }),
  
  api: z.object({
    key: z.string(),
    secret: z.string(),
    baseUrl: z.string().url(),
    timeout: z.number().int().default(10000)
  }),
  
  logging: z.object({
    level: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
    format: z.enum(['json', 'text']).default('json')
  }),
  
  features: z.object({
    debugMode: z.boolean().default(false),
    analytics: z.boolean().default(true),
    experimentalFeatures: z.boolean().default(false)
  })
});

export type AppConfig = z.infer<typeof configSchema>;
```

### 2. Configuration Loader

```typescript
// config/loader.ts
import { configSchema, AppConfig } from './schema';

export function loadConfig(): AppConfig {
  const rawConfig = {
    environment: process.env.NODE_ENV || 'development',
    
    server: {
      port: process.env.PORT ? parseInt(process.env.PORT) : undefined,
      host: process.env.HOST,
      timeout: process.env.TIMEOUT ? parseInt(process.env.TIMEOUT) : undefined
    },
    
    database: {
      host: process.env.DATABASE_HOST,
      port: process.env.DATABASE_PORT 
        ? parseInt(process.env.DATABASE_PORT) 
        : undefined,
      name: process.env.DATABASE_NAME,
      user: process.env.DATABASE_USER,
      password: process.env.DATABASE_PASSWORD,
      ssl: process.env.DATABASE_SSL === 'true'
    },
    
    api: {
      key: process.env.API_KEY,
      secret: process.env.API_SECRET,
      baseUrl: process.env.API_BASE_URL,
      timeout: process.env.API_TIMEOUT 
        ? parseInt(process.env.API_TIMEOUT) 
        : undefined
    },
    
    logging: {
      level: process.env.LOG_LEVEL as any,
      format: process.env.LOG_FORMAT as any
    },
    
    features: {
      debugMode: process.env.DEBUG_MODE === 'true',
      analytics: process.env.ANALYTICS !== 'false',
      experimentalFeatures: process.env.EXPERIMENTAL === 'true'
    }
  };

  try {
    return configSchema.parse(rawConfig);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('Configuration validation failed:');
      error.errors.forEach(err => {
        console.error(`  ${err.path.join('.')}: ${err.message}`);
      });
    }
    throw new Error('Invalid configuration');
  }
}

// Singleton instance
let configInstance: AppConfig | null = null;

export function getConfig(): AppConfig {
  if (!configInstance) {
    configInstance = loadConfig();
  }
  return configInstance;
}

// For testing: reset singleton
export function resetConfig(): void {
  configInstance = null;
}
```

### 3. Update Code to Use New Config

**Before**:
```typescript
// ❌ Old way - scattered env var usage
const dbConnection = createConnection({
  host: process.env.DATABASE_HOST || 'localhost',
  port: parseInt(process.env.DATABASE_PORT || '5432'),
  database: process.env.DATABASE_NAME
});

const server = app.listen(
  parseInt(process.env.PORT || '3000')
);
```

**After**:
```typescript
// ✅ New way - centralized, type-safe config
import { getConfig } from './config/loader';

const config = getConfig();

const dbConnection = createConnection({
  host: config.database.host,
  port: config.database.port,
  database: config.database.name
});

const server = app.listen(config.server.port);
```

### 4. Migration Plan

**Step 1**: Identify all environment variable usage
```bash
# Find all process.env references
grep -r "process\.env\." src/
```

**Step 2**: Group by domain (database, server, api, etc.)

**Step 3**: Create schema for each domain

**Step 4**: Update code file by file
- Import config
- Replace `process.env.X` with `config.domain.x`
- Test each module

**Step 5**: Remove old env var usage
```bash
# Verify no direct env var usage remains
grep -r "process\.env\." src/ --exclude-dir=config
```

### 5. Testing Updates

**Before**:
```typescript
// ❌ Mocking env vars
it('should connect to database', () => {
  process.env.DATABASE_HOST = 'test-db';
  process.env.DATABASE_PORT = '5433';
  // test...
});
```

**After**:
```typescript
// ✅ Mocking config
import { resetConfig } from './config/loader';

beforeEach(() => {
  resetConfig();
});

it('should connect to database', () => {
  jest.mock('./config/loader', () => ({
    getConfig: () => ({
      database: {
        host: 'test-db',
        port: 5433,
        // ...
      }
    })
  }));
  // test...
});
```

### 6. Documentation Updates

Create `.env.example`:
```bash
# Server Configuration
PORT=3000
HOST=localhost

# Database Configuration
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=myapp
DATABASE_USER=admin
DATABASE_PASSWORD=secret

# API Configuration
API_KEY=your-api-key
API_SECRET=your-api-secret
API_BASE_URL=https://api.example.com
```

## Benefits of Refactoring

1. **Type Safety**: TypeScript knows all config types
2. **Validation**: Zod validates on startup
3. **Defaults**: Centralized default values
4. **Testing**: Easy to mock entire config
5. **Documentation**: Schema serves as documentation
6. **IDE Support**: Autocomplete for all config values
7. **Error Handling**: Clear validation errors

## Rollout Strategy

1. **Phase 1**: Create config infrastructure (schema, loader)
2. **Phase 2**: Migrate one module at a time
3. **Phase 3**: Update tests
4. **Phase 4**: Remove old env var usage
5. **Phase 5**: Update documentation

## Deliverables

1. Configuration schema with Zod
2. Configuration loader with validation
3. Migrated codebase
4. Updated tests
5. `.env.example` template
6. Migration documentation
