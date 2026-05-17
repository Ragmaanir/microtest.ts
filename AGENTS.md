# Agent Instructions

## Project Purpose
- Simple testing library

## Project Setup (Must Follow)
- TypeScript only
- ESM only
- pnpm

## Importing (Must Follow)
- use relative imports with `.js` extension, e.g. `import "../table_def.js"`.

## Build / Verification (Must Follow)
- When changing code, run `pnpm build`.
- Do not modify `/dist` by hand; it must be generated via `pnpm build`.
- When changing behavior, run relevant tests.
- Prefer minimal, focused changes. Do not refactor unrelated code.

## Design Guidelines
- Prefer small, dependency-free implementations.
- Do not add heavy dependencies when the functionality belongs in the project itself.
- Keep APIs simple and strongly typed.

## TypeScript Style Rules
- Prefer `"` over `'`
- Avoid semicolons except where required
- Method names use underscore_case (e.g. `some_other_method`, not `someOtherMethod`)
- Types and classes use standard naming convention (CamelCase).
- Avoid `any` unless unavoidable
- Avoid explicit casting if avoidable

## Tests
- Do not add tests unless explicitly instructed.
- If instructed to add tests:
  - use microtest.ts itself to implement tests and follow the template below.
  - By default, if not given instructions about which specific tests to write, ONLY write tests for the happy-path, for complicated logic that is error-prone and for code paths that are executed frequently.


### Template

When writing tests, write them in this style:

```typescript
import { assert, test } from "./test"
import { Thing } from "../src/thing"

test("Thing#method_to_test", () => {
  const t = new Thing()
  
  assert.equal(t.method_to_test(1), "1")
  assert.equal(t.method_to_test(null), "null")
})

test.run()
```

Key points:

- DO NOT follow the testing pattern of one-test-one-assertion.
- DO use multiple assertions in one test when possible.
- DO NOT write failure-messages for the assertions.
- Test names should start with `Class#method` or `Class.static_method` and optionally follow with a very short description of what scenario it is testing. Eg. `Router#find_route returns null when route does not exist`
