# Rule Examples

Practical examples for common rule scenarios.

## Language-Specific Rules

### TypeScript

```markdown
---
paths: **/*.{ts,tsx}
---

# TypeScript Guidelines

## Type Safety
- Enable strict mode in tsconfig.json
- Avoid `any` - use `unknown` when type is uncertain
- Prefer interfaces for object shapes, type for unions/intersections
- Use explicit return types for exported functions

## Patterns
- Use optional chaining `?.` and nullish coalescing `??`
- Prefer ES modules over require()
- Use const assertions for literal types: `as const`

## Generics
- Use generics for reusable components
- Name type parameters descriptively: `TItem`, `TResult`
```

### Python

```markdown
---
paths: **/*.py
---

# Python Guidelines

## Style
- Follow PEP 8
- Use type hints for function signatures
- Prefer f-strings over .format()

## Imports
- Group: stdlib, third-party, local
- Use absolute imports
- Avoid `from module import *`

## Error Handling
- Catch specific exceptions, not bare `except:`
- Use context managers for resources
```

### Bash

```markdown
---
paths: **/*.sh
---

# Bash Script Guidelines

## Header
- Always use `#!/usr/bin/env bash`
- Set `set -euo pipefail`

## Variables
- Quote all variables: `"${var}"`
- Use `readonly` for constants
- Use `local` in functions

## Error Handling
- Use `trap` for cleanup
- Check command existence with `command -v`
```

## Framework-Specific Rules

### React

```markdown
---
paths: src/components/**/*.tsx
---

# React Component Guidelines

## Structure
- One component per file
- Props interface: `ComponentNameProps`
- Export component as default

## Hooks
- Prefix custom hooks with `use`
- Extract complex logic to custom hooks
- Follow Rules of Hooks

## Performance
- Use `React.memo` for expensive renders
- Memoize callbacks with `useCallback`
- Memoize computed values with `useMemo`
```

### Next.js

```markdown
---
paths: {app,pages}/**/*.{ts,tsx}
---

# Next.js Guidelines

## App Router
- Use Server Components by default
- Add 'use client' only when needed
- Colocate loading.tsx and error.tsx

## Data Fetching
- Use fetch with caching options
- Prefer server-side data fetching
- Handle loading and error states

## Routing
- Use file-based routing conventions
- Keep route handlers in route.ts
```

### Express/API

```markdown
---
paths: src/api/**/*.ts
---

# API Development Rules

## Request Handling
- Validate all inputs with zod/joi
- Return consistent error format:
  ```json
  { "error": "message", "code": "ERROR_CODE" }
  ```

## Response
- Use proper HTTP status codes
- Include request ID in responses
- Set appropriate cache headers

## Security
- Sanitize inputs before queries
- Use parameterized SQL only
- Rate limit endpoints
```

## Domain-Specific Rules

### Testing

```markdown
---
paths: **/*.{test,spec}.{ts,tsx,js}
---

# Testing Standards

## Structure
- Use Arrange-Act-Assert pattern
- One assertion per test (when practical)
- Group related tests with describe

## Naming
- Describe behavior, not implementation
- Format: "should [expected behavior] when [condition]"

## Mocking
- Mock external dependencies
- Avoid mocking internal modules
- Reset mocks between tests
```

### Database

```markdown
---
paths: src/db/**/*.ts
---

# Database Guidelines

## Queries
- Use parameterized queries only
- Add indexes for frequent queries
- Use transactions for multi-step operations

## Migrations
- Name: `YYYYMMDD_HHMMSS_description.sql`
- Include both up and down migrations
- Test migrations on copy of production data

## Performance
- Use connection pooling
- Batch bulk operations
- Monitor slow queries
```

### Security

```markdown
# Security Requirements

## Sensitive Data
- Never log passwords, tokens, or PII
- Mask sensitive data in error messages
- Use secure environment variables

## Authentication
- Use secure session management
- Implement proper CSRF protection
- Hash passwords with bcrypt/argon2

## Input Validation
- Validate on both client and server
- Sanitize HTML content
- Limit file upload types and sizes
```

## Project Structure Rules

### Monorepo

```markdown
---
paths: packages/**/*
---

# Monorepo Guidelines

## Package Structure
- Each package has own package.json
- Shared dependencies at root
- Internal packages: `@repo/package-name`

## Dependencies
- Use workspace protocol: `workspace:*`
- Hoist common dependencies
- Keep package-specific deps local
```

### Microservices

```markdown
---
paths: services/**/*
---

# Microservice Guidelines

## Communication
- Use message queue for async operations
- Implement retry with exponential backoff
- Include correlation IDs

## Resilience
- Implement circuit breakers
- Handle partial failures gracefully
- Log all external calls
```

## Combining Multiple Scopes

### Frontend + Backend

```
.claude/rules/
├── frontend/
│   ├── react.md
│   ├── styling.md
│   └── testing.md
├── backend/
│   ├── api.md
│   ├── database.md
│   └── testing.md
└── shared/
    ├── security.md
    └── logging.md
```

### Shared Standards via Symlinks

```bash
# In each project
ln -s ~/company-rules/security.md .claude/rules/security.md
ln -s ~/company-rules/logging.md .claude/rules/logging.md
```
