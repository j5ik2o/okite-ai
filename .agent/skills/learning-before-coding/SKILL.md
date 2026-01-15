---
name: learning-before-coding
description: Enforce learning from existing implementations before writing new code. Use this skill when implementing new features, adding new classes/functions, or modifying existing code. Prevents AI from writing "textbook" code that ignores project conventions. Triggers on: new feature implementation, adding components, refactoring, code generation requests.
---

# Learning Before Coding

Analyze existing implementations before writing any new code. The existing codebase IS the documentation of project conventions.

## Core Principle

**Never write code without first understanding how similar code is written in this project.**

AI tends to write "textbook correct" code that follows general best practices but ignores project-specific patterns. This skill prevents that by enforcing a mandatory analysis phase.

## Mandatory Pre-Implementation Workflow

### Step 1: Identify Similar Code

Before implementing anything, find existing code that is:
- **Same layer**: If adding a repository, find other repositories
- **Same type**: If adding a service, find other services
- **Same domain**: If working in auth, find other auth code
- **Same pattern**: If adding an API endpoint, find other endpoints

Search strategies:
```
# Find similar classes/modules
Glob: **/*Repository*.{ts,py,go,rs}
Glob: **/*Service*.{ts,py,go,rs}
Glob: **/*Controller*.{ts,py,go,rs}

# Find similar patterns
Grep: "class.*Repository"
Grep: "interface.*Service"
```

### Step 2: Extract Project Patterns

Analyze 2-3 similar implementations and document. For comprehensive checklists by code type, see [pattern-checklist.md](references/pattern-checklist.md).

| Aspect | What to Look For |
|--------|------------------|
| **Structure** | Interface + Class? Class only? Functional? |
| **Naming** | Prefix/suffix conventions, casing style |
| **Dependencies** | How are dependencies injected? Constructor? |
| **Error handling** | Exceptions? Result types? Error codes? |
| **Validation** | Where and how is input validated? |
| **Testing** | Test file location, naming, patterns |
| **Comments** | Docstrings? JSDoc? None? |
| **Imports** | Absolute? Relative? Barrel files? |

### Step 3: Document Findings Before Coding

Create a mental checklist:
```
Project Pattern Analysis:
- [ ] Structure: [e.g., "Direct class, no interface"]
- [ ] Naming: [e.g., "PascalCase, *Repository suffix"]
- [ ] DI pattern: [e.g., "Constructor injection"]
- [ ] Error handling: [e.g., "Custom exceptions"]
- [ ] Test pattern: [e.g., "*.test.ts colocated"]
```

### Step 4: Implement Following Patterns

Only after completing Steps 1-3, write code that:
- Matches the identified structure exactly
- Uses the same naming conventions
- Follows the same error handling approach
- Places files in the same locations

## Anti-Patterns to Avoid

| Don't Do This | Do This Instead |
|---------------|-----------------|
| Add interface when project uses direct classes | Match existing pattern (class only) |
| Use dependency injection framework when project uses manual DI | Use manual constructor injection |
| Add comprehensive error handling when project uses simple throws | Match existing error style |
| Create `src/repositories/` when project uses `src/infrastructure/` | Use existing directory structure |
| Add JSDoc when project has no comments | Follow existing documentation style |

## Quick Reference Checklist

Before writing ANY new code:

1. **Find**: Locate 2-3 similar existing implementations
2. **Read**: Study their structure, patterns, conventions
3. **Extract**: Document the project-specific patterns
4. **Match**: Ensure new code follows identified patterns exactly
5. **Verify**: Compare new code against existing examples

## Examples

### Bad: Writing Without Analysis

```
User: "Add a UserRepository"
AI: *Immediately writes*
interface IUserRepository { ... }
class UserRepository implements IUserRepository { ... }
```

### Good: Analyze First

```
User: "Add a UserRepository"
AI: *First searches*
Glob: **/*Repository*.ts

AI: *Reads existing repositories*
Found: ProductRepository.ts, OrderRepository.ts
Pattern: Direct class export, no interface, constructor DI

AI: *Then implements matching pattern*
class UserRepository {
  constructor(private db: Database) {}
  ...
}
```

## Integration with Development Workflow

This skill should be activated:
- At the START of any implementation task
- BEFORE writing any new class, function, or module
- When refactoring existing code
- When adding tests for new functionality

The analysis phase typically takes 2-5 minutes but saves hours of refactoring.
