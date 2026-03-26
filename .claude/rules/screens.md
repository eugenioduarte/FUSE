---
paths:
  - "src/screens/**/*.ts"
  - "src/screens/**/*.tsx"
---

# Screen Rules

- Screens are presentation-first and must not own business logic
- Consume hooks as the orchestration boundary
- Keep feature files co-located with `components/` and `__tests__/`
- Use `StyleSheet.create` for static styles
- Do not import services directly into screen files
- Loading, error, and empty states are mandatory when relevant
