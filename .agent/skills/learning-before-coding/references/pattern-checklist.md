# Pattern Checklist by Code Type

Detailed checklists for analyzing existing patterns before implementing new code.

## Classes and Modules

### Structural Patterns
- [ ] Interface/Protocol defined separately?
- [ ] Abstract base class used?
- [ ] Direct concrete class only?
- [ ] Mixin/Trait composition?
- [ ] Functional module pattern?

### Naming Conventions
- [ ] Class name prefix (e.g., `Base*`, `Abstract*`)
- [ ] Class name suffix (e.g., `*Service`, `*Repository`, `*Handler`)
- [ ] File name matches class name?
- [ ] File name casing (PascalCase, snake_case, kebab-case)
- [ ] Method naming (camelCase, snake_case)
- [ ] Private member prefix (`_`, `#`, none)

### Dependency Injection
- [ ] Constructor injection
- [ ] Property injection
- [ ] Method injection
- [ ] DI container/framework used
- [ ] Manual wiring
- [ ] Factory pattern

## Functions

### Function Patterns
- [ ] Pure functions preferred?
- [ ] Async/await or callbacks?
- [ ] Promise chains?
- [ ] Error return values vs exceptions?
- [ ] Guard clauses style?

### Parameter Patterns
- [ ] Options object for multiple params?
- [ ] Destructuring in signature?
- [ ] Default values approach
- [ ] Required vs optional order

## Error Handling

### Exception Patterns
- [ ] Custom exception classes?
- [ ] Single base exception?
- [ ] Exception hierarchy depth
- [ ] Exception naming (`*Error`, `*Exception`)

### Result/Either Patterns
- [ ] Result type used?
- [ ] Optional/Maybe for nullable?
- [ ] Error codes vs error objects?
- [ ] Error message format

### Recovery Patterns
- [ ] Retry logic location
- [ ] Fallback strategies
- [ ] Logging approach

## Testing

### Test Organization
- [ ] Colocated (`*.test.ts` next to source)
- [ ] Separate directory (`__tests__/`, `tests/`)
- [ ] Mirror structure?

### Test Naming
- [ ] `test_*` prefix
- [ ] `*_test` suffix
- [ ] `*.spec.*` naming
- [ ] Describe/it style

### Test Patterns
- [ ] AAA (Arrange-Act-Assert)?
- [ ] Given-When-Then?
- [ ] Test fixtures approach
- [ ] Mock/stub conventions
- [ ] Factory functions for test data

## API/Endpoints

### Route Patterns
- [ ] RESTful conventions?
- [ ] Route file organization
- [ ] Controller/Handler structure
- [ ] Middleware usage

### Request/Response
- [ ] DTO classes?
- [ ] Validation layer location
- [ ] Response envelope format
- [ ] Error response structure

## Configuration

### Config Patterns
- [ ] Environment variables
- [ ] Config files (YAML, JSON, TOML)
- [ ] Config class/object structure
- [ ] Secrets handling

## Documentation

### Comment Patterns
- [ ] JSDoc/docstring style
- [ ] Inline comments frequency
- [ ] TODO format
- [ ] License headers

### Type Documentation
- [ ] Type annotations everywhere?
- [ ] Strategic annotation only?
- [ ] Return type always specified?

## File Organization

### Directory Structure
- [ ] Feature-based (by domain)
- [ ] Layer-based (controllers/, services/, repos/)
- [ ] Hybrid approach

### Module Exports
- [ ] Barrel files (index.ts)?
- [ ] Named exports only?
- [ ] Default exports?
- [ ] Re-exports pattern

## Language-Specific

### TypeScript
- [ ] Strict mode?
- [ ] Type vs Interface preference
- [ ] Enum vs const object
- [ ] any usage tolerance

### Python
- [ ] Type hints everywhere?
- [ ] dataclass vs regular class
- [ ] __all__ exports
- [ ] relative vs absolute imports

### Go
- [ ] Interface in consumer package?
- [ ] Pointer vs value receivers
- [ ] Error wrapping style
- [ ] Package naming

### Rust
- [ ] Result<T, E> patterns
- [ ] Error type design
- [ ] Module organization
- [ ] Trait definitions location
