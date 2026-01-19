---
title: Security Architecture Review
description: Perform a comprehensive security architecture review for authentication, authorization, data protection, and compliance requirements
version: 1.0.0
author: Prompt Manager MCP
created: 2026-01-18
tags:
  role: [architect, security-specialist]
  task-type: [architecture-review]
  module: [security]
  compliance: [casino-control-act, pii-protection, audit-logging, security-baseline]
  complexity: [expert]
  ai-agent-persona: [security-reviewer]
---

# Security Architecture Review

You are tasked with performing a comprehensive security architecture review for a casino management system's authentication and authorization module.

## Review Scope

The security module handles:
- User authentication (employees and system accounts)
- Multi-factor authentication (MFA)
- Role-based access control (RBAC)
- Permission management
- Session management
- Audit logging

## Current Architecture

```
┌─────────────┐      ┌──────────────┐      ┌─────────────┐
│   Client    │─────▶│  API Gateway │─────▶│   Auth      │
│             │      │              │      │   Service   │
└─────────────┘      └──────────────┘      └─────────────┘
                            │                      │
                            ▼                      ▼
                     ┌──────────────┐      ┌─────────────┐
                     │   Session    │      │   User      │
                     │   Store      │      │   Database  │
                     └──────────────┘      └─────────────┘
```

## Review Areas

### 1. Authentication Mechanisms
- Evaluate password policies and storage
- Review MFA implementation
- Assess token generation and validation
- Check session management practices
- Verify logout and session timeout logic

### 2. Authorization Model
- Review RBAC implementation
- Check permission granularity
- Assess privilege escalation risks
- Verify least privilege principle
- Review default permissions

### 3. Data Protection
- Evaluate encryption at rest and in transit
- Review sensitive data handling
- Check PII protection measures
- Assess key management practices
- Verify secure communication channels

### 4. Audit and Compliance
- Review audit logging completeness
- Check log retention policies
- Assess compliance with regulations (PCI-DSS, GDPR)
- Verify audit trail integrity
- Review log access controls

### 5. Security Controls
- Evaluate input validation
- Check for common vulnerabilities (OWASP Top 10)
- Review rate limiting and DoS protection
- Assess error handling (no information leakage)
- Check security headers and CORS policies

## Review Questions

For each area, address:
1. What are the current security measures?
2. What are the potential vulnerabilities?
3. What is the risk assessment (likelihood × impact)?
4. What are the recommended improvements?
5. What is the implementation priority?

## Deliverables

Provide:
1. **Executive Summary**: High-level findings and risk assessment
2. **Detailed Findings**: Specific vulnerabilities with evidence
3. **Risk Matrix**: Categorized by severity and likelihood
4. **Recommendations**: Prioritized list of improvements
5. **Implementation Roadmap**: Timeline for addressing issues
6. **Compliance Checklist**: Mapping to regulatory requirements

## Output Format

```markdown
## Finding #1: [Title]

**Severity**: Critical | High | Medium | Low
**Category**: Authentication | Authorization | Data Protection | etc.

**Current Implementation**:
[Description of current approach]

**Vulnerability**:
[Description of the security issue]

**Risk Assessment**:
- Likelihood: High | Medium | Low
- Impact: High | Medium | Low
- Overall Risk: Critical | High | Medium | Low

**Proof of Concept**:
[Example or scenario demonstrating the issue]

**Recommendation**:
[Specific steps to address the vulnerability]

**Implementation Effort**: High | Medium | Low
**Priority**: P0 (Immediate) | P1 (High) | P2 (Medium) | P3 (Low)
```

## Success Criteria

- All critical security areas reviewed
- Vulnerabilities identified with clear evidence
- Risk assessment is realistic and data-driven
- Recommendations are specific and actionable
- Compliance requirements addressed
- Executive summary suitable for stakeholders
