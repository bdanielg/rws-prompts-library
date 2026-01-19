---
title: Project Scaffolding Generator
description: Create a comprehensive project scaffolding system that generates starter projects with best practices, configurations, and folder structures
version: 1.0.0
author: Prompt Manager MCP
created: 2026-01-18
tags:
  role: [developer]
  task-type: [code-generation]
  module: [scaffolds]
  compliance: []
  complexity: [advanced]
  ai-agent-persona: [code-generator]
---

# Project Scaffolding Generator

You are tasked with creating a comprehensive project scaffolding generator.

## Requirements

### 1. Project Templates

Support multiple project types:
- **Web Application**: Next.js, React, Vite
- **API Server**: Express, Fastify, NestJS
- **Mobile App**: React Native, Flutter
- **Library/Package**: npm, PyPI, Maven
- **Microservice**: Docker, Kubernetes ready

### 2. Core Features

**Directory Structure**:
```
project-name/
├── src/
│   ├── components/
│   ├── services/
│   ├── utils/
│   └── index.ts
├── tests/
├── docs/
├── .github/
│   └── workflows/
├── package.json
├── tsconfig.json
├── .gitignore
├── .env.example
└── README.md
```

**Configuration Files**:
- Build tools (Webpack, Vite, tsconfig)
- Linting (ESLint, Prettier)
- Testing (Jest, Vitest)
- CI/CD (GitHub Actions, GitLab CI)
- Docker (Dockerfile, docker-compose)

**Boilerplate Code**:
- Entry points
- Example components/services
- Test examples
- Configuration utilities
- Error handling setup

### 3. CLI Interface

```bash
# Interactive mode
npx create-project

# With options
npx create-project my-app --template=nextjs --typescript --tailwind

# Available options
--template: Project template (required)
--typescript: Use TypeScript (default: true)
--styling: CSS framework (tailwind, styled-components, etc.)
--testing: Testing framework (jest, vitest)
--git: Initialize git repository (default: true)
--install: Run npm install after generation (default: true)
```

### 4. Template Variables

Support customization:
```typescript
interface ProjectConfig {
  name: string;
  description: string;
  author: string;
  license: 'MIT' | 'Apache-2.0' | 'GPL-3.0';
  version: string;
  repository?: string;
}
```

### 5. Post-Generation Tasks

After scaffolding:
1. Initialize Git repository
2. Install dependencies
3. Run initial build/test
4. Generate documentation
5. Display next steps

## Implementation

### Core Generator

```typescript
class ProjectScaffold {
  async generate(config: ProjectConfig): Promise<void> {
    // 1. Validate configuration
    // 2. Create directory structure
    // 3. Copy template files
    // 4. Process templates (replace variables)
    // 5. Run post-generation tasks
    // 6. Display success message
  }

  private async copyTemplate(
    source: string,
    destination: string,
    variables: Record<string, string>
  ): Promise<void> {
    // Process template files with variable substitution
  }
}
```

### Template System

```typescript
// templates/nextjs/package.json.template
{
  "name": "{{PROJECT_NAME}}",
  "version": "{{VERSION}}",
  "description": "{{DESCRIPTION}}",
  "author": "{{AUTHOR}}",
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start"
  }
}
```

### Validation

- Check Node.js version compatibility
- Verify package name availability
- Validate project directory doesn't exist
- Check required system dependencies

## Best Practices

1. **Opinionated Defaults**: Sensible configurations out of the box
2. **Extensible**: Easy to add new templates
3. **Well-Documented**: Inline comments and README
4. **Testing**: Include test setup and examples
5. **Modern Stack**: Use latest stable versions
6. **Security**: No vulnerabilities in dependencies
7. **Performance**: Optimized build configuration
8. **Developer Experience**: Clear error messages, helpful CLI

## Deliverables

1. CLI tool source code
2. Template directory structure
3. Configuration schemas
4. Documentation
5. Example projects
6. Test suite
