---
title: Configuration Management Template
description: Create a comprehensive configuration management solution with environment-specific configs, feature flags, and secure credential storage
version: 1.0.0
author: Prompt Manager MCP
created: 2026-01-18
tags:
  role: [developer]
  task-type: [code-generation]
  module: [config]
  compliance: []
  complexity: [intermediate]
  ai-agent-persona: [code-generator]
---

# Configuration Management Template

You are tasked with creating a comprehensive configuration management solution for the application.

## Requirements

### 1. Configuration Structure
- Environment-specific configurations (dev, staging, production)
- Feature flags and toggles
- Third-party service credentials
- Application settings and parameters

### 2. Security Considerations
- Sensitive data encryption at rest
- Secure credential storage (use environment variables or secrets manager)
- No hardcoded secrets in code
- Access control and audit logging

### 3. Configuration Schema
```typescript
interface AppConfig {
  environment: 'development' | 'staging' | 'production';
  database: DatabaseConfig;
  api: ApiConfig;
  features: FeatureFlags;
  logging: LoggingConfig;
}
```

### 4. Implementation Guidelines
- Use environment variables for sensitive data
- Validate configuration on application startup
- Provide sensible defaults
- Document all configuration options
- Support hot-reloading where appropriate

### 5. Best Practices
- Separate config from code
- Use type-safe configuration objects
- Implement configuration validation
- Provide clear error messages for invalid config
- Version control configuration schemas (not values)

### 6. Testing
- Unit tests for configuration loading
- Validation tests for all config schemas
- Integration tests with different environments

## Deliverables

1. Configuration schema definitions
2. Configuration loader with validation
3. Environment-specific config files (templates)
4. Documentation for all configuration options
5. Migration guide for existing configurations
