---
paths:
  - "src/**/*.ts"
  - "src/**/*.tsx"
---

# Performance and Safety Rules

## Performance

- Never use `ScrollView` for large dynamic lists — use `FlashList` or `FlatList`
- No heavy computation inside render functions
- No animation logic on the JS thread for complex cases
- Respect the 16ms JS frame budget — measure before optimizing

## State Management

| State type | Solution |
| --- | --- |
| Local UI state | `useState` |
| Screen business state | Screen hook |
| Cross-feature state | Zustand store (flat `{name}.store.ts`) |
| Server state | TanStack Query |

- No global context for frequently changing state
- Subscribe to Zustand stores using selectors only
- No unnecessary re-renders from unscoped subscriptions

## Memory Safety

- All event listeners must be cleaned up on unmount
- All timers must be cleared on unmount
- Native modules must invalidate properly
- No reference cycles or leaking closures holding large objects

## Native Safety

- Heavy native work must be async
- No UI access from background threads
- No blocking the JS thread from native calls
- No unverified third-party native SDKs

## Code Quality

- No `console.log` in production code — use Logger with `{Category}.{Subcategory}` tags
- No TODO comments without a ticket reference
- No commented-out dead code
- No barrel imports
- No untyped navigation params

## Determinism

- No reliance on system time without an abstraction layer
- No randomness without seeding or mocking in tests
- No side effects in render functions
- No hidden global mutations
