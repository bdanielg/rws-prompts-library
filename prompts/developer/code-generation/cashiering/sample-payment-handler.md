---
title: Payment Transaction Handler
description: Implement a robust payment transaction handler for casino cashiering with validation, audit logging, and compliance requirements
version: 1.0.0
author: Prompt Manager MCP
created: 2026-01-18
tags:
  role: [developer]
  task-type: [code-generation]
  module: [cashiering]
  compliance: [casino-control-act, audit-logging, financial-reporting]
  complexity: [advanced]
  ai-agent-persona: [code-generator]
---

# Payment Transaction Handler

You are tasked with implementing a robust payment transaction handler for a casino management system's cashiering module.

## Context

The cashiering system handles various types of financial transactions including:
- Cash deposits and withdrawals
- Credit/debit card payments
- Electronic fund transfers
- Voucher redemptions
- Promotional credits

## Requirements

1. **Transaction Processing**
   - Implement atomic transaction handling to ensure data integrity
   - Support multiple payment methods
   - Handle concurrent transaction requests
   - Implement proper error handling and rollback mechanisms

2. **Security**
   - All transactions must be logged with audit trails
   - Implement encryption for sensitive payment data
   - Follow PCI-DSS compliance requirements
   - Validate all input data to prevent injection attacks

3. **Validation**
   - Verify sufficient balance before processing withdrawals
   - Validate payment method details
   - Check transaction limits and daily caps
   - Implement fraud detection checks

4. **Data Model**
   ```typescript
   interface Transaction {
     id: string;
     customerId: string;
     type: 'deposit' | 'withdrawal' | 'transfer';
     amount: number;
     currency: string;
     paymentMethod: PaymentMethod;
     status: 'pending' | 'completed' | 'failed' | 'cancelled';
     timestamp: Date;
     metadata: Record<string, any>;
   }
   ```

5. **Error Handling**
   - Insufficient funds
   - Invalid payment method
   - Network timeouts
   - System errors
   - Duplicate transactions

## Technical Constraints

- Use TypeScript for type safety
- Implement proper async/await patterns
- Follow SOLID principles
- Include comprehensive error handling
- Add logging at critical points
- Write unit tests for all transaction types

## Output Format

Provide:
1. Complete implementation of the transaction handler
2. Error handling logic
3. Validation functions
4. Unit tests covering all scenarios
5. Comments explaining key decisions

## Success Criteria

- All transaction types process correctly
- Error handling covers all edge cases
- Code follows best practices and is maintainable
- Security requirements are met
- Comprehensive test coverage (>80%)
