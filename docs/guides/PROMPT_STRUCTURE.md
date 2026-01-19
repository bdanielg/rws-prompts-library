# Prompt Structure Guide

## Overview

This guide explains the hierarchical structure used to organize prompts in the Prompt Manager system, the valid combinations of role and task types, and best practices for creating effective prompts.

## Hierarchical Organization

Prompts are organized in a three-level hierarchy:

```
Role → Task Type → Module
```

This structure ensures prompts are:
- Easy to discover and search
- Logically organized by responsibility
- Properly categorized by use case
- Isolated by module boundaries

## Level 1: Role

The first level categorizes prompts by the primary user role:

### Developer (`developer`)
**Target Audience:** Software developers, engineers

**Responsibilities:**
- Writing production code
- Implementing features
- Fixing bugs
- Creating unit tests
- Refactoring existing code
- Writing technical documentation

**Example Use Cases:**
- "Generate a payment processing API"
- "Refactor legacy authentication code"
- "Create unit tests for user service"

### Architect (`architect`)
**Target Audience:** Solution architects, system designers, tech leads

**Responsibilities:**
- Reviewing system architecture
- Designing system components
- Evaluating technology choices
- Creating architectural documentation
- Conducting code reviews from architectural perspective

**Example Use Cases:**
- "Review microservices architecture for scalability"
- "Design event-driven messaging system"
- "Evaluate database migration strategy"

### Tester (`tester`)
**Target Audience:** QA engineers, test automation engineers

**Responsibilities:**
- Writing automated tests
- Creating test plans
- Performing quality assurance
- Debugging test failures
- Documenting test procedures

**Example Use Cases:**
- "Generate integration tests for API endpoints"
- "Create E2E test scenarios for checkout flow"
- "Debug intermittent test failures"

### Security Specialist (`security-specialist`)
**Target Audience:** Security engineers, security architects, compliance officers

**Responsibilities:**
- Conducting security reviews
- Performing threat modeling
- Reviewing code for vulnerabilities
- Ensuring compliance
- Creating security tests
- Documenting security requirements

**Example Use Cases:**
- "Review authentication implementation for vulnerabilities"
- "Generate security test cases for API"
- "Assess GDPR compliance of data handling"

## Level 2: Task Type

The second level categorizes prompts by the type of task being performed:

### Code Generation (`code-generation`)
Creating new code from specifications or requirements.

**Applicable Roles:** developer, architect, security-specialist

**Examples:**
- Implementing new features
- Creating API endpoints
- Building data models
- Writing utilities and helpers

### Refactoring (`refactoring`)
Improving existing code structure without changing behavior.

**Applicable Roles:** developer, architect

**Examples:**
- Modernizing legacy code
- Improving code organization
- Optimizing performance
- Applying design patterns

### Testing (`testing`)
Creating or executing tests for validation.

**Applicable Roles:** developer, tester, security-specialist

**Examples:**
- Writing unit tests
- Creating integration tests
- Building E2E test suites
- Generating security tests

### Debugging (`debugging`)
Identifying and fixing issues in code.

**Applicable Roles:** developer, tester

**Examples:**
- Troubleshooting errors
- Analyzing stack traces
- Fixing bugs
- Investigating test failures

### Documentation (`documentation`)
Creating technical documentation.

**Applicable Roles:** developer, architect, tester, security-specialist

**Examples:**
- Writing API documentation
- Creating architecture diagrams
- Documenting procedures
- Writing user guides

### Architecture Review (`architecture-review`)
Evaluating and improving system architecture.

**Applicable Roles:** architect, security-specialist

**Examples:**
- Reviewing system design
- Assessing scalability
- Evaluating security architecture
- Analyzing technology choices

## Level 3: Module

The third level categorizes prompts by the CMS module or domain:

### Cashiering (`cashiering`)
**Domain:** Payment processing, financial transactions

**Covers:**
- Payment gateway integration
- Transaction processing
- Refund handling
- Currency conversion
- Financial reconciliation
- Audit trails

### Gaming Operations (`gaming-ops`)
**Domain:** Casino floor management, gaming machines

**Covers:**
- Gaming machine integration
- Floor monitoring
- Progressive jackpots
- Machine configuration
- Meter readings
- Compliance reporting

### Membership (`membership`)
**Domain:** Player tracking, loyalty programs

**Covers:**
- Member enrollment
- Points and rewards
- Tier management
- Member preferences
- Communication preferences
- Promotional campaigns

### Reporting (`reporting`)
**Domain:** Business intelligence, analytics

**Covers:**
- Financial reports
- Gaming reports
- Compliance reports
- Custom analytics
- Dashboard creation
- Data visualization

### Security (`security`)
**Domain:** Authentication, authorization, audit

**Covers:**
- User authentication
- Access control
- Audit logging
- Encryption
- Security monitoring
- Compliance validation

### Shared (`shared`)
**Domain:** Cross-cutting concerns, utilities

**Covers:**
- Common utilities
- Shared libraries
- Infrastructure code
- Configuration management
- Error handling
- Logging frameworks

## Valid Combinations

Not all role/task type combinations are valid. The system enforces these rules:

### Developer
✅ **Valid Task Types:**
- code-generation
- refactoring
- debugging
- testing
- documentation

❌ **Invalid Task Types:**
- architecture-review (use `architect` role)

### Architect
✅ **Valid Task Types:**
- architecture-review
- documentation
- code-generation
- refactoring

❌ **Invalid Task Types:**
- testing (use `tester` role)
- debugging (use `developer` role)

### Tester
✅ **Valid Task Types:**
- testing
- debugging
- documentation

❌ **Invalid Task Types:**
- code-generation (use `developer` role)
- refactoring (use `developer` role)
- architecture-review (use `architect` role)

### Security Specialist
✅ **Valid Task Types:**
- architecture-review
- code-generation (for security tooling)
- testing (for security testing)
- documentation

❌ **Invalid Task Types:**
- refactoring (use `developer` role)
- debugging (use `developer` role)

## Prompt File Structure

Each prompt consists of two files:

### Content File (`{id}.md`)
The actual prompt content in Markdown format.

**Example:**
```markdown
# Generate Payment API

You are tasked with creating a payment processing API...

## Requirements
- Support multiple payment methods
- Implement proper error handling
...

## Output Format
Provide:
1. Complete API implementation
2. Error handling
3. Unit tests
```

### Metadata File (`{id}.metadata.json`)
Structured metadata about the prompt.

**Example:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Payment API Generator",
  "description": "Generate a payment processing API with multiple payment methods",
  "role": "developer",
  "taskType": "code-generation",
  "module": "cashiering",
  "tags": ["payment", "api", "transaction", "security"],
  "createdAt": "2026-01-17T10:00:00.000Z",
  "updatedAt": "2026-01-17T10:00:00.000Z",
  "version": 1
}
```

## Best Practices

### Naming Conventions

**Prompt Names:**
- Clear and descriptive
- Action-oriented (use verbs)
- Include key context
- Keep under 100 characters

**Good Examples:**
- "Generate Payment Transaction Handler"
- "Refactor Legacy Member Tracking System"
- "Review Security Architecture for Authentication Module"

**Bad Examples:**
- "Prompt1" (not descriptive)
- "Code" (too vague)
- "This is a prompt for generating a really complex payment processing system with many features" (too long)

### Description Guidelines

**Characteristics:**
- Summarizes the prompt's purpose
- Mentions key requirements or constraints
- 10-500 characters
- Complete sentences

**Good Example:**
```
"Implement a robust payment transaction handler for the cashiering module 
with atomic operations, security measures, and comprehensive error handling"
```

**Bad Example:**
```
"Payment stuff" (too vague)
```

### Tag Selection

**Purpose:**
- Enable keyword-based search
- Group related prompts
- Surface in relevant contexts

**Guidelines:**
- Use 1-10 tags per prompt
- Include technical terms
- Add domain concepts
- Use lowercase
- Be specific but not overly narrow

**Good Example:**
```json
["payment", "transaction", "api", "security", "pci-dss", "error-handling"]
```

**Bad Example:**
```json
["stuff", "code"] (too generic)
["payment", "payments", "pay", "paying"] (too much duplication)
```

### Content Structure

**Recommended Sections:**

1. **Title/Header**
   - Clear statement of the task

2. **Context**
   - Background information
   - Current situation
   - Problem statement

3. **Requirements**
   - Functional requirements
   - Technical constraints
   - Quality standards

4. **Specifications**
   - Data models
   - API contracts
   - Architecture diagrams
   - Code examples

5. **Deliverables**
   - Expected outputs
   - Artifacts to produce
   - Success criteria

6. **Examples** (optional)
   - Sample inputs
   - Sample outputs
   - Code snippets

**Example Structure:**
```markdown
# [Title of Task]

## Context
[Background and problem statement]

## Requirements
1. [Requirement 1]
2. [Requirement 2]

## Technical Specifications
```typescript
// Data models, interfaces, etc.
```

## Deliverables
- [ ] Item 1
- [ ] Item 2

## Success Criteria
- Criteria 1
- Criteria 2
```

### Version Control

**When to Increment Version:**
- Significant content changes
- Requirement updates
- Bug fixes in prompt logic
- Clarifications added

**What Not to Version:**
- Typo fixes (keep version same)
- Formatting changes
- Minor wording improvements

**Version History:**
- System automatically increments version on update
- UpdatedAt timestamp tracks last modification
- Consider adding changelog in prompt content for major versions

## Directory Structure Example

```
prompts/
├── developer/
│   ├── code-generation/
│   │   ├── cashiering/
│   │   │   ├── payment-handler.md
│   │   │   ├── payment-handler.metadata.json
│   │   │   ├── refund-processor.md
│   │   │   └── refund-processor.metadata.json
│   │   ├── gaming-ops/
│   │   │   ├── machine-integration.md
│   │   │   └── machine-integration.metadata.json
│   │   └── membership/
│   │       ├── enrollment-api.md
│   │       └── enrollment-api.metadata.json
│   ├── refactoring/
│   │   └── membership/
│   │       ├── legacy-tracking.md
│   │       └── legacy-tracking.metadata.json
│   └── testing/
│       └── cashiering/
│           ├── payment-tests.md
│           └── payment-tests.metadata.json
├── architect/
│   ├── architecture-review/
│   │   └── security/
│   │       ├── auth-review.md
│   │       └── auth-review.metadata.json
│   └── documentation/
│       └── shared/
│           ├── architecture-diagram.md
│           └── architecture-diagram.metadata.json
├── tester/
│   └── testing/
│       └── reporting/
│           ├── report-test-suite.md
│           └── report-test-suite.metadata.json
└── security-specialist/
    └── architecture-review/
        └── security/
            ├── security-audit.md
            └── security-audit.metadata.json
```

## Migration and Maintenance

### Moving Prompts Between Modules
If a prompt's module classification changes:
- Use `update-prompt` tool with new module
- System automatically moves files
- Version is incremented
- Path is updated in index

### Changing Hierarchy (Role/Task Type)
If a prompt's role or task type changes:
- Verify new combination is valid
- Use `update-prompt` tool
- Files are moved to new hierarchy path
- Old files are cleaned up automatically

### Archiving Old Prompts
Currently, prompts cannot be archived through tools. Options:
- Move files manually to archive directory outside `prompts/`
- Delete using file system (will be removed from index)
- Future enhancement: Add `archive` flag to metadata

## Validation Rules

The system enforces these validation rules:

### Metadata Validation
- **ID**: Must be valid UUID format
- **Name**: 3-100 characters
- **Description**: 10-500 characters
- **Tags**: 1-10 tags, each 1-50 characters
- **Version**: Positive integer
- **Timestamps**: ISO 8601 format

### Content Validation
- **Length**: 50-50,000 characters
- **Format**: Valid Markdown
- **Encoding**: UTF-8

### Hierarchy Validation
- **Role**: Must be valid enum value
- **Task Type**: Must be valid enum value
- **Module**: Must be valid enum value
- **Combination**: Role + Task Type must be valid per configuration

## Search and Discovery

### Finding Prompts

**By Hierarchy:**
```
list-prompts --role developer --taskType code-generation
```

**By Keywords:**
```
search-prompts --keywords "payment transaction"
```

**By Tags:**
```
search-prompts --tags payment,security
```

**By Module:**
```
search-prompts --module cashiering
```

**Combined:**
```
search-prompts --role developer --module cashiering --keywords "API"
```

### Search Tips

1. **Start Broad:** Begin with role or module, then refine
2. **Use Tags:** Tags are indexed and boost relevance
3. **Keywords:** Search looks in name, description, and tags
4. **Exact Matches:** Hierarchy filters (role, taskType, module) require exact match
5. **Relevance:** Results are scored and sorted by relevance

## Common Scenarios

### Scenario 1: Creating a New Feature Prompt

```bash
# Developer needs to create API endpoint
Role: developer
Task Type: code-generation
Module: cashiering (or appropriate module)
Tags: ["api", "endpoint", "rest", specific-domain-terms]
```

### Scenario 2: Architecture Review

```bash
# Architect reviewing security implementation
Role: architect
Task Type: architecture-review
Module: security
Tags: ["security", "authentication", "review", "compliance"]
```

### Scenario 3: Test Suite Creation

```bash
# Tester creating automated tests
Role: tester
Task Type: testing
Module: reporting (or appropriate module)
Tags: ["testing", "automation", "integration", "e2e"]
```

### Scenario 4: Refactoring Legacy Code

```bash
# Developer modernizing old code
Role: developer
Task Type: refactoring
Module: membership (or appropriate module)
Tags: ["refactoring", "legacy", "modernization", "typescript"]
```

## Conclusion

Following this hierarchical structure and best practices ensures:
- Prompts are easy to find and use
- Organization is consistent and logical
- Search results are relevant and accurate
- System validation prevents errors
- Collaboration is streamlined

For API usage details, see [API.md](API.md).
For architecture information, see [ARCHITECTURE.md](ARCHITECTURE.md).
