---
paths:
  - "**/*.hook.ts"
  - "**/*.hook.tsx"
---

# Hook Rules

- Hook names start with `use`
- Hooks expose intent-centric state and handlers
- Side effects must be explicit and localized
- Return stable shapes that are easy for screens to consume
- Do not leak DTOs or transport concerns through hook APIs
