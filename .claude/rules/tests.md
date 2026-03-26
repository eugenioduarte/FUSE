---
paths:
  - "**/__tests__/**/*.ts"
  - "**/__tests__/**/*.tsx"
  - "**/*.test.ts"
  - "**/*.test.tsx"
---

# Test Rules

- Global coverage baseline is `>= 80%`
- Hooks and services target `>= 90%`
- Unit tests must not call real APIs
- Mocks must be local, explicit, and isolated
- Each test should verify behaviour, not internal implementation details
