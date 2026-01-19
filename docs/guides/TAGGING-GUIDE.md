# Prompt Tagging Guide

**Version**: 1.0.0  
**Last Updated**: 2026-01-02

---

## Overview

The tagging system enables filtering, searching, and categorizing prompts across multiple dimensions. Every prompt file includes tags in YAML frontmatter for automated processing and discoverability.

---

## Tagging Schema

Tags are organized into six categories:

```yaml
---
tags:
  role: [developer]
  task-type: [refactoring]
  module: [cashiering]
  compliance: [casino-control-act, audit-logging]
  complexity: [intermediate]
  ai-agent-persona: [refactoring-agent]
---
```

---

## Tag Categories

### 1. Role Tags

Identifies the primary user role for the prompt.

**Valid Values:**
- `developer` - Software developers
- `architect` - Solution architects
- `tester` - QA engineers
- `security-specialist` - Security experts
- `devops` - DevOps engineers
- `data-engineer` - Data engineers
- `business-analyst` - Business analysts

**Usage:**
- **Required**: Yes (select one primary role)
- **Multiple**: Allowed (if prompt serves multiple roles)

**Examples:**
```yaml
tags:
  role: [developer]  # Single role
  
tags:
  role: [developer, architect]  # Multiple roles
```

---

### 2. Task Type Tags

Categorizes the type of development task.

**Valid Values:**
- `code-generation` - Creating new code from specifications
- `refactoring` - Modernizing or improving existing code
- `testing` - Creating tests or test strategies
- `debugging` - Identifying and fixing issues
- `documentation` - Creating technical documentation
- `architecture-review` - Evaluating architectural decisions
- `code-review` - Reviewing code for quality/compliance
- `migration` - Moving to new technology/platform
- `optimization` - Performance or efficiency improvements
- `validation` - Compliance or correctness checking

**Usage:**
- **Required**: Yes (select one primary task)
- **Multiple**: Allowed (if prompt supports multiple tasks)

**Examples:**
```yaml
tags:
  task-type: [refactoring]  # Single task
  
tags:
  task-type: [refactoring, testing]  # Refactoring with test generation
```

---

### 3. Module Tags

Specifies which RWS CMS module(s) the prompt applies to.

**Valid Values:**
- `cashiering` - Payment processing, transactions, financial operations
- `gaming-ops` - Gaming operations, floor management, machines
- `membership` - Player tracking, loyalty programs
- `reporting` - Business intelligence, analytics, compliance reports
- `security` - Authentication, authorization, audit logging
- `shared` - Cross-cutting concerns, utilities, common libraries
- `database` - Database-specific operations
- `api` - API development/integration
- `infrastructure` - Infrastructure and deployment

**Usage:**
- **Required**: Yes (select at least one)
- **Multiple**: Recommended for cross-module prompts

**Examples:**
```yaml
tags:
  module: [cashiering]  # Single module
  
tags:
  module: [cashiering, security]  # Payment with security
  
tags:
  module: [shared]  # Applies to all modules
```

---

### 4. Compliance Tags

Maps prompts to regulatory requirements and security standards.

**Valid Values:**
- `casino-control-act` - NSW Casino Control Act compliance
- `pii-protection` - Personally Identifiable Information protection
- `audit-logging` - Comprehensive audit trail requirements
- `data-sovereignty` - Data must remain in Australia
- `gdpr` - General Data Protection Regulation (if applicable)
- `sox` - Sarbanes-Oxley compliance
- `financial-reporting` - Financial transaction integrity
- `responsible-gaming` - Responsible gambling requirements
- `aml-ctf` - Anti-Money Laundering / Counter-Terrorism Financing
- `security-baseline` - General security best practices

**Usage:**
- **Required**: Only if prompt involves compliance
- **Multiple**: Encouraged (prompts often satisfy multiple requirements)

**Examples:**
```yaml
tags:
  compliance: [casino-control-act, audit-logging]
  
tags:
  compliance: [pii-protection, data-sovereignty, gdpr]
  
tags:
  compliance: []  # Not compliance-related
```

**Compliance Descriptions:**

| Tag | Description | Key Requirements |
|-----|-------------|------------------|
| `casino-control-act` | NSW Casino Control Act 1992 | Integrity, fairness, financial controls |
| `pii-protection` | Personal data protection | Encryption, access control, consent |
| `audit-logging` | Comprehensive audit trails | Who, what, when, where tracking |
| `data-sovereignty` | Australian data residency | Data stored/processed in Australia |
| `financial-reporting` | Transaction integrity | ACID compliance, reconciliation |
| `responsible-gaming` | Player protection | Self-exclusion, limits, monitoring |
| `aml-ctf` | Financial crime prevention | Transaction monitoring, reporting |

---

### 5. Complexity Tags

Indicates the skill level required to effectively use the prompt.

**Valid Values:**
- `beginner` - Junior developers, straightforward scenarios
- `intermediate` - Mid-level developers, standard complexity
- `advanced` - Senior developers, complex scenarios
- `expert` - Architects/specialists, highly complex scenarios

**Usage:**
- **Required**: Yes (select one)
- **Multiple**: Not allowed

**Complexity Guidelines:**

| Level | Characteristics | User Profile |
|-------|----------------|--------------|
| **Beginner** | • Simple, well-defined task<br>• Clear instructions<br>• Minimal context needed<br>• Common scenarios | • Junior developers (0-2 years)<br>• New to RWS codebase<br>• Learning modernization patterns |
| **Intermediate** | • Moderate complexity<br>• Some context required<br>• Standard patterns<br>• Typical business logic | • Mid-level developers (2-5 years)<br>• Familiar with RWS modules<br>• Comfortable with modern practices |
| **Advanced** | • High complexity<br>• Deep context needed<br>• Advanced patterns<br>• Complex integrations | • Senior developers (5+ years)<br>• Expert in domain<br>• Handles edge cases well |
| **Expert** | • Very high complexity<br>• Architectural decisions<br>• System-wide impact<br>• Novel solutions | • Architects, tech leads<br>• Deep RWS knowledge<br>• Strategic thinking |

**Examples:**
```yaml
tags:
  complexity: [beginner]  # Simple CRUD generation
  
tags:
  complexity: [intermediate]  # Standard refactoring
  
tags:
  complexity: [advanced]  # Complex migration
  
tags:
  complexity: [expert]  # Architectural redesign
```

---

### 6. AI Agent Persona Tags

Specifies which AI agent persona is best suited for this prompt.

**Valid Values:**
- `code-generator` - Creates new code from specifications
- `refactoring-agent` - Modernizes legacy code
- `test-generator` - Creates test suites
- `security-reviewer` - Identifies security issues
- `performance-optimizer` - Improves performance
- `documentation-writer` - Creates documentation
- `debugging-assistant` - Helps identify bugs
- `architect-advisor` - Provides architectural guidance
- `general-purpose` - No specific persona required

**Usage:**
- **Required**: Recommended (helps with agent selection)
- **Multiple**: Allowed (if multiple personas can use prompt)

**Examples:**
```yaml
tags:
  ai-agent-persona: [refactoring-agent]  # Specific to refactoring
  
tags:
  ai-agent-persona: [code-generator, test-generator]  # Generate code and tests
  
tags:
  ai-agent-persona: [general-purpose]  # Any agent can use
```

---

## Complete Tag Example

```yaml
---
title: Refactor Payment Service to Microservice Architecture
description: Modernizes monolithic payment processing into microservices with retry logic and audit logging
version: 1.0.0
author: Gen-e2 Lead Engineer
created: 2026-01-02
tags:
  role: [developer, architect]
  task-type: [refactoring, architecture-review]
  module: [cashiering, security]
  compliance: [casino-control-act, audit-logging, financial-reporting]
  complexity: [advanced]
  ai-agent-persona: [refactoring-agent]
---
```

---

## Tagging Best Practices

### DO:
✅ Include all relevant tags  
✅ Use only predefined values  
✅ Be specific with compliance tags  
✅ Match complexity to actual difficulty  
✅ Add multiple modules if cross-cutting  
✅ Review tags during peer review  

### DON'T:
❌ Create custom tag values  
❌ Over-tag with irrelevant categories  
❌ Leave required tags empty  
❌ Use inconsistent casing  
❌ Skip compliance tags when applicable  
❌ Misrepresent complexity level  

---

## Tag Validation

The validation script (`validate-prompts.sh`) checks:

1. **YAML Format**: Valid YAML frontmatter
2. **Required Categories**: role, task-type, module, complexity present
3. **Valid Values**: All tags match predefined values
4. **Consistency**: Tags align with file path and name
5. **Compliance**: Compliance tags used when needed

**Example Validation Errors:**
```
❌ ERROR: Invalid role tag 'dev' (must be 'developer')
❌ ERROR: Missing required tag 'complexity'
❌ ERROR: Invalid complexity value 'medium' (use 'intermediate')
✅ SUCCESS: All tags valid
```

---

## Searching by Tags

### Using the CLI Tool

```bash
# By role
rws-prompt search --role developer

# By task type
rws-prompt search --task-type refactoring

# By module
rws-prompt search --module cashiering

# By compliance
rws-prompt search --compliance casino-control-act

# By complexity
rws-prompt search --complexity intermediate

# Combined filters
rws-prompt search --role developer --task refactoring --module cashiering --complexity advanced
```

### Using Git Grep

```bash
# Find all prompts with specific tag
grep -r "role: \[developer\]" prompts/

# Find compliance-related prompts
grep -r "compliance:" prompts/ | grep -v "compliance: \[\]"

# Find advanced prompts
grep -r "complexity: \[advanced\]" prompts/
```

---

## Tag Evolution

### Adding New Tags

To propose a new tag value:

1. **Create RFC**: Document the need in Azure DevOps
2. **Team Discussion**: Present in weekly tactical review
3. **Approval**: Get sign-off from Tech Lead
4. **Update Schema**: Add to this guide
5. **Update Validation**: Modify validation script
6. **Migrate Existing**: Update affected prompts

### Deprecating Tags

To deprecate a tag value:

1. **Create Migration Plan**: Document replacement strategy
2. **Team Notification**: Announce in monthly strategic review
3. **Deprecation Period**: Mark as deprecated (3 months)
4. **Migration**: Update all prompts using deprecated tag
5. **Removal**: Remove from schema after migration

---

## Tag Usage Statistics

Track tag usage to understand library composition:

```bash
# Count prompts by role
grep -rh "role:" prompts/ | sort | uniq -c

# Count by complexity
grep -rh "complexity:" prompts/ | sort | uniq -c

# Count by compliance requirement
grep -rh "compliance:" prompts/ | grep -v "\[\]" | sort | uniq -c
```

---

## Tools and Automation

### VS Code Snippet for Tags

```json
{
  "Prompt Tags": {
    "prefix": "prompt-tags",
    "body": [
      "---",
      "title: ${1:Prompt Title}",
      "description: ${2:Brief description}",
      "version: 1.0.0",
      "author: ${3:Your Name}",
      "created: ${CURRENT_YEAR}-${CURRENT_MONTH}-${CURRENT_DATE}",
      "tags:",
      "  role: [${4|developer,architect,tester,security-specialist|}]",
      "  task-type: [${5|code-generation,refactoring,testing,debugging|}]",
      "  module: [${6|cashiering,gaming-ops,membership,reporting,security,shared|}]",
      "  compliance: [${7|casino-control-act,pii-protection,audit-logging|}]",
      "  complexity: [${8|beginner,intermediate,advanced,expert|}]",
      "  ai-agent-persona: [${9|refactoring-agent,code-generator,test-generator|}]",
      "---",
      "$0"
    ],
    "description": "Insert prompt tags frontmatter"
  }
}
```

### Python Tag Extractor

```python
import yaml
import glob

def extract_tags(prompt_file):
    with open(prompt_file, 'r') as f:
        content = f.read()
        if content.startswith('---'):
            end = content.find('---', 3)
            frontmatter = yaml.safe_load(content[3:end])
            return frontmatter.get('tags', {})
    return {}

# Get all tags from all prompts
for prompt in glob.glob('prompts/**/*.prompt.md', recursive=True):
    tags = extract_tags(prompt)
    print(f"{prompt}: {tags}")
```

---

## Questions?

- **Schema Issues**: Contact Gen-e2 Lead Engineer
- **Compliance Tags**: Consult Security Specialist
- **Tag Disputes**: Raise in weekly tactical review

---

**Remember**: Good tagging = Better discoverability = Higher productivity!
