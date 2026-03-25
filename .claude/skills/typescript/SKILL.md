---
name: typescript
description: TypeScript patterns, type definitions, async conventions, and module structure. Use whenever writing, editing, or reviewing TypeScript code, defining types or interfaces, handling async logic, or structuring modules. Also trigger for strict mode errors, generics, or type inference questions.
---

# TypeScript Conventions

## Compiler Settings
- `"strict": true` — non-negotiable
- `noUncheckedIndexedAccess: true` — always guard array/object access
- `exactOptionalPropertyTypes: true`
- Target `ES2022` or later

## Type Definitions
- Prefer `interface` for object shapes; `type` for unions, intersections, and primitives
- Never use `any` — use `unknown` and narrow with type guards
- Avoid type assertions (`as X`) unless you control both sides
- Export types from a dedicated `types.ts` per module

## Async Patterns
- Always `async/await` — never raw `.then()` chains in application code
- Wrap external calls in try/catch; rethrow with context
- Use `Promise.all()` for independent parallel operations

## Error Handling
- API boundaries: return `{ error: string }` with the appropriate HTTP status
- Never swallow errors silently — always log at minimum

## Naming
- Files: `kebab-case.ts`
- Classes/Interfaces/Types: `PascalCase`
- Functions/variables: `camelCase`
- Constants: `SCREAMING_SNAKE_CASE`
- Booleans: prefix with `is`, `has`, `can`, `should`

## Imports
- Use path aliases (`@/lib/...`) — no deep relative paths
- Group: external → internal → types → relative
