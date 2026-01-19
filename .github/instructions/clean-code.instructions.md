---
applyTo: "**/*.{ts,js,tsx,jsx,py,java,cs,go,rs,php,rb}"
---
# Clean Code Guidelines for AI Agents

## Overview
These instructions define the coding standards and practices that must be followed when generating or modifying code. The goal is to produce code that is readable, maintainable, and robust. As an AI agent, you must prioritize clarity and intent in your generated code.

## Core Principles

### 1. Meaningful Names
- **Variables**: Use intention-revealing names. Avoid single letters (except for loop counters like `i`, `j` in short loops).
  - *Bad*: `const d = 10; // days`
  - *Good*: `const daysSinceCreation = 10;`
- **Functions**: Names should be verbs or verb phrases. They should describe exactly what the function does.
  - *Bad*: `process()`
  - *Good*: `processUserRegistration()`
- **Classes**: Names should be nouns or noun phrases. Avoid generic names like `Manager` or `Processor` unless strictly necessary and well-defined.
- **Booleans**: Prefix with `is`, `has`, `can`, or `should`.
  - *Bad*: `open`
  - *Good*: `isOpen`

### 2. Functions
- **Small**: Functions should be small and do one thing. If a function does multiple things, extract them into sub-functions.
- **Single Level of Abstraction**: Statements within a function should be at the same level of abstraction.
- **Arguments**: Minimize the number of arguments. Ideally 0-2. If more are needed, use an object/struct/interface.
- **Side Effects**: Avoid side effects. A function should not change the state of the system unexpectedly. If it must, the name should reflect it.

### 3. Comments
- **Self-Documenting Code**: Prefer expressive code over comments. Refactor complex logic into named functions instead of explaining it with comments.
- **Explain "Why", not "What"**: Comments should explain the intent, business logic, or "why" a specific decision was made, not the syntax.
- **Avoid Redundant Comments**: Do not repeat what the code says.
- **TODOs**: If you leave a TODO, include a brief explanation of what is missing.

### 4. Control Structures
- **Avoid Deep Nesting**: Use guard clauses (early returns) to reduce nesting levels.
  - *Bad*:
    ```typescript
    if (user) {
      if (user.isActive) {
        // logic
      }
    }
    ```
  - *Good*:
    ```typescript
    if (!user || !user.isActive) return;
    // logic
    ```
- **Positive Conditionals**: Prefer positive conditionals over negative ones for readability.

### 5. Error Handling
- **Exceptions**: Use exceptions rather than return codes for errors.
- **Context**: Provide context in error messages.
- **Clean Up**: Ensure resources are cleaned up in `finally` blocks or using language-specific features (e.g., `using`, `defer`).
- **Don't Swallow Errors**: Never catch an error and do nothing (empty catch block). Log it or rethrow it.

### 6. DRY (Don't Repeat Yourself)
- Extract duplicated logic into shared functions or classes.
- Avoid copy-pasting code blocks.

### 7. SOLID Principles (Object-Oriented Design)
- **SRP (Single Responsibility Principle)**: A class or module should have one, and only one, reason to change.
- **OCP (Open/Closed Principle)**: Entities should be open for extension, but closed for modification.
- **LSP (Liskov Substitution Principle)**: Subtypes must be substitutable for their base types.
- **ISP (Interface Segregation Principle)**: Many client-specific interfaces are better than one general-purpose interface.
- **DIP (Dependency Inversion Principle)**: Depend on abstractions, not on concretions.

## Examples

### Naming
```typescript
// Bad
function getThem(theList: any[]) {
  const list1 = [];
  for (const x of theList) {
    if (x[0] === 4) list1.push(x);
  }
  return list1;
}

// Good
function getFlaggedCells(gameBoard: Cell[]) {
  const flaggedCells: Cell[] = [];
  for (const cell of gameBoard) {
    if (cell.isFlagged()) flaggedCells.push(cell);
  }
  return flaggedCells;
}
```

### Function Arguments
```typescript
// Bad
function createMenu(title: string, body: string, buttonText: string, cancellable: boolean) { ... }

// Good
interface MenuConfig {
  title: string;
  body: string;
  buttonText: string;
  cancellable: boolean;
}

function createMenu(config: MenuConfig) { ... }
```

### Conditionals (Guard Clauses)
```typescript
// Bad
function processPayment(payment: Payment) {
  if (payment.isValid) {
    if (payment.amount > 0) {
      saveToDatabase(payment);
      sendReceipt(payment);
    } else {
      throw new Error("Invalid amount");
    }
  } else {
    throw new Error("Invalid payment");
  }
}

// Good
function processPayment(payment: Payment) {
  if (!payment.isValid) {
    throw new Error("Invalid payment");
  }
  if (payment.amount <= 0) {
    throw new Error("Invalid amount");
  }

  saveToDatabase(payment);
  sendReceipt(payment);
}
```
