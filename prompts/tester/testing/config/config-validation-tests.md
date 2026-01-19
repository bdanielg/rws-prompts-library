---
title: Configuration Validation Testing
description: Create comprehensive test coverage for application configuration validation including schema, environment-specific, and security tests
version: 1.0.0
author: Prompt Manager MCP
created: 2026-01-18
tags:
  role: [tester]
  task-type: [testing]
  module: [config]
  compliance: []
  complexity: [intermediate]
  ai-agent-persona: [test-generator]
---

# Configuration Validation Testing

You are tasked with creating comprehensive test coverage for application configuration validation.

## Testing Objectives

Ensure configuration is validated correctly across all environments and edge cases.

## Test Categories

### 1. Schema Validation Tests

```typescript
describe('Configuration Schema Validation', () => {
  it('should accept valid configuration', () => {
    const validConfig = {
      environment: 'production',
      database: {
        host: 'localhost',
        port: 5432,
        name: 'app_db'
      }
    };
    
    expect(() => validateConfig(validConfig)).not.toThrow();
  });

  it('should reject missing required fields', () => {
    const invalidConfig = {
      environment: 'production'
      // Missing database config
    };
    
    expect(() => validateConfig(invalidConfig))
      .toThrow('Database configuration is required');
  });

  it('should reject invalid enum values', () => {
    const invalidConfig = {
      environment: 'invalid-env', // Not in enum
      database: { /* ... */ }
    };
    
    expect(() => validateConfig(invalidConfig))
      .toThrow('Environment must be one of: development, staging, production');
  });
});
```

### 2. Environment-Specific Tests

Test configuration for each environment:

```typescript
describe('Environment Configurations', () => {
  describe('Development', () => {
    it('should load development config', () => {
      process.env.NODE_ENV = 'development';
      const config = loadConfig();
      
      expect(config.environment).toBe('development');
      expect(config.logging.level).toBe('debug');
      expect(config.features.debugMode).toBe(true);
    });
  });

  describe('Production', () => {
    it('should load production config with security enabled', () => {
      process.env.NODE_ENV = 'production';
      const config = loadConfig();
      
      expect(config.environment).toBe('production');
      expect(config.logging.level).toBe('error');
      expect(config.security.enforceHttps).toBe(true);
      expect(config.features.debugMode).toBe(false);
    });
    
    it('should require all secrets to be set', () => {
      process.env.NODE_ENV = 'production';
      delete process.env.DATABASE_PASSWORD;
      
      expect(() => loadConfig())
        .toThrow('DATABASE_PASSWORD is required in production');
    });
  });
});
```

### 3. Type Safety Tests

```typescript
describe('Type Safety', () => {
  it('should enforce correct types', () => {
    const config = {
      port: '3000', // String instead of number
      database: { /* ... */ }
    };
    
    expect(() => validateConfig(config))
      .toThrow('Port must be a number');
  });

  it('should handle optional fields correctly', () => {
    const config = {
      // Optional fields omitted
      environment: 'development',
      database: { /* required fields only */ }
    };
    
    const validated = validateConfig(config);
    expect(validated.cache).toBeUndefined(); // Optional field
  });
});
```

### 4. Default Values Tests

```typescript
describe('Default Values', () => {
  it('should apply defaults for missing optional fields', () => {
    const minimalConfig = {
      environment: 'development',
      database: { host: 'localhost', port: 5432 }
    };
    
    const config = applyDefaults(minimalConfig);
    
    expect(config.logging.level).toBe('info'); // Default
    expect(config.server.timeout).toBe(30000); // Default
  });
});
```

### 5. Sensitive Data Tests

```typescript
describe('Sensitive Data Handling', () => {
  it('should not log sensitive values', () => {
    const spy = jest.spyOn(console, 'log');
    const config = {
      database: {
        password: 'secret123',
        host: 'localhost'
      }
    };
    
    logConfig(config);
    
    expect(spy).not.toHaveBeenCalledWith(
      expect.stringContaining('secret123')
    );
    expect(spy).toHaveBeenCalledWith(
      expect.stringContaining('[REDACTED]')
    );
  });
});
```

### 6. Override Tests

```typescript
describe('Configuration Overrides', () => {
  it('should allow environment variable overrides', () => {
    process.env.PORT = '8080';
    const config = loadConfig();
    
    expect(config.server.port).toBe(8080);
  });

  it('should prioritize env vars over config files', () => {
    process.env.DATABASE_HOST = 'prod-db.example.com';
    const config = loadConfig();
    
    expect(config.database.host).toBe('prod-db.example.com');
  });
});
```

### 7. Error Message Tests

```typescript
describe('Error Messages', () => {
  it('should provide helpful validation errors', () => {
    const invalidConfig = {
      database: {
        port: 'not-a-number'
      }
    };
    
    try {
      validateConfig(invalidConfig);
      fail('Should have thrown');
    } catch (error) {
      expect(error.message).toContain('database.port');
      expect(error.message).toContain('must be a number');
    }
  });
});
```

## Integration Tests

```typescript
describe('Full Configuration Flow', () => {
  it('should load, validate, and apply config successfully', async () => {
    // 1. Load from file
    const rawConfig = await loadConfigFile('config/production.json');
    
    // 2. Merge with env vars
    const merged = mergeWithEnvironment(rawConfig);
    
    // 3. Validate
    const validated = validateConfig(merged);
    
    // 4. Apply defaults
    const final = applyDefaults(validated);
    
    expect(final).toBeDefined();
    expect(final.environment).toBe('production');
  });
});
```

## Test Coverage Goals

- **Schema Validation**: 100%
- **Type Checking**: 100%
- **Error Handling**: >95%
- **Edge Cases**: >90%

## Deliverables

1. Complete test suite for configuration module
2. Test coverage report
3. CI integration for config validation
4. Documentation of tested scenarios
