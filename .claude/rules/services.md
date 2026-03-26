---
paths:
  - "src/services/**/*.ts"
  - "src/services/**/*.tsx"
---

# Service Rules

- Services own transport, DTO parsing, and response normalization
- Query orchestration belongs in the query layer, not inside services
- DTOs are API contracts, not UI contracts
- External payloads should be validated before crossing boundaries
- Keep service APIs deterministic and testable
