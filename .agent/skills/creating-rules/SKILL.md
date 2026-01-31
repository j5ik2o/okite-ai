---
name: creating-rules
description: Creates Claude Code rules (.claude/rules/*.md) with YAML frontmatter and path-specific scoping. Use when creating project rules, coding standards, or conditional guidelines for specific file types.
---

# Creating Claude Code Rules

Create modular, focused rules for `.claude/rules/` directory.

## Quick Start

**First, ask the user**:
- Rule scope: global (all files) or path-specific (certain file types)?
- Location: `.claude/rules/` (project) or `~/.claude/rules/` (personal)?

Then create a `.md` file:

```markdown
---
paths: src/**/*.ts
---

# TypeScript Guidelines

- Use strict mode
- Prefer interfaces over type aliases for object shapes
- Use explicit return types for exported functions
```

## Rule File Structure

### Global Rules (No Frontmatter)

Apply to all files:

```markdown
# Code Style

- Use 2-space indentation
- Prefer const over let
- No unused variables
```

### Path-Specific Rules (With Frontmatter)

Apply only when Claude works with matching files:

```markdown
---
paths: src/api/**/*.ts
---

# API Development Rules

- All endpoints must include input validation
- Use standard error response format
- Include OpenAPI documentation comments
```

## YAML Frontmatter

### `paths` Field

Single pattern:
```yaml
paths: src/**/*.ts
```

Multiple patterns with brace expansion:
```yaml
paths: src/**/*.{ts,tsx}
```

Comma-separated patterns:
```yaml
paths: {src,lib}/**/*.ts, tests/**/*.test.ts
```

### Glob Patterns Reference

| Pattern | Matches |
|---------|---------|
| `**/*.ts` | All TypeScript files anywhere |
| `src/**/*` | All files under `src/` |
| `*.md` | Markdown files in project root only |
| `src/components/*.tsx` | React components in specific directory |
| `**/*.{ts,tsx}` | TypeScript and TSX files |
| `{src,lib}/**/*.ts` | TypeScript in `src/` or `lib/` |

## Directory Organization

### Basic Structure

```
.claude/rules/
├── code-style.md      # General coding standards
├── testing.md         # Testing conventions
└── security.md        # Security requirements
```

### With Subdirectories

```
.claude/rules/
├── frontend/
│   ├── react.md
│   └── styles.md
├── backend/
│   ├── api.md
│   └── database.md
└── general.md
```

All `.md` files are discovered recursively.

### Symlinks for Shared Rules

```bash
# Symlink shared rules directory
ln -s ~/shared-claude-rules .claude/rules/shared

# Symlink individual files
ln -s ~/company-standards/security.md .claude/rules/security.md
```

## Best Practices

### DO

**Keep rules focused** (one topic per file):
```markdown
# ✓ Good - testing.md
# Testing Conventions

- Use vitest for unit tests
- Place tests in __tests__ directory
- Name test files: *.test.ts
```

**Use descriptive filenames**:
- `api-validation.md` not `rules1.md`
- `react-components.md` not `frontend.md`

**Be specific**:
```markdown
# ✓ Good
- Use 2-space indentation
- Prefer `interface` over `type` for objects

# ✗ Bad
- Format code properly
- Use good naming
```

**Use path scoping appropriately**:
```yaml
# ✓ Good - applies to specific files
paths: src/api/**/*.ts

# ✗ Bad - too broad for API-specific rules
# (no paths = applies to everything)
```

### DON'T

**Don't create catch-all files**:
```markdown
# ✗ Bad - rules.md containing everything
# All Rules
## Coding
## Testing
## Deployment
## Security
```

**Don't duplicate CLAUDE.md content**:
- CLAUDE.md: Project overview, common commands, architecture
- Rules: Specific guidelines for code/files

**Don't use time-sensitive info**:
```markdown
# ✗ Bad
- As of January 2025, use React 19 features
```

## Common Rule Categories

For detailed examples, see [examples.md](references/examples.md).

### Code Style

```markdown
# Code Style

- Use ESLint/Prettier configuration
- No console.log in production code
- Prefer named exports
- Use absolute imports with @/ prefix
```

### Testing

```markdown
---
paths: **/*.test.{ts,tsx}
---

# Testing Standards

- Arrange-Act-Assert pattern
- Mock external dependencies
- Test edge cases explicitly
- Aim for 80%+ coverage on new code
```

### API Development

```markdown
---
paths: src/api/**/*.ts
---

# API Guidelines

- Validate all inputs with zod
- Return consistent error format: { error: string, code: string }
- Log all 5xx errors
- Include request ID in responses
```

### Security

```markdown
# Security Requirements

- Never log sensitive data (passwords, tokens, PII)
- Sanitize user inputs before database queries
- Use parameterized queries only
- Validate file uploads: type, size, content
```

### React/Frontend

```markdown
---
paths: src/components/**/*.tsx
---

# React Component Guidelines

- Prefer functional components with hooks
- Extract complex logic to custom hooks
- Use React.memo for expensive renders
- Props interface named: ComponentNameProps
```

## Rules vs CLAUDE.md

**CLAUDE.md**: High-level project info, build commands, architecture patterns

**Rules (`.claude/rules/*.md`)**: Specific coding guidelines, often conditional on file types

Use rules when:
- Guidelines apply to specific file types or paths
- Content is focused on single topic (testing, security, etc.)
- Team wants modular, organized guidelines

Use CLAUDE.md when:
- General project information applies to all files
- Build/test/lint commands needed frequently
- Architectural overview needed

## Checklist

Before creating a rule:
- [ ] Identified clear, focused topic
- [ ] Chose appropriate scope (global or path-specific)
- [ ] Used descriptive filename
- [ ] Kept content specific and actionable
- [ ] Avoided duplicating CLAUDE.md content
- [ ] Tested glob patterns if using path scoping
