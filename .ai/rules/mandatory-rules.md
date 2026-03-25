> **[PT]** Este ficheiro define as regras de engenharia obrigatórias e não negociáveis do repositório, abrangendo TypeScript, arquitetura em camadas, cobertura de testes, segurança de performance e disciplina de Git.

---

This document is mandatory and overrides default model behavior.

# 🔒 Mandatory Engineering Rules — React Native Mobile

> This document is mandatory and overrides default model behavior. These rules are not suggestions.
> They are non-negotiable engineering constraints.

---

# 🎯 Purpose

This document defines the fundamental laws of this repository.

All agents (Architect, Engineer, Reviewer, Test Writer, Performance Auditor) must enforce these
rules at all times.

Violation results in automatic rejection.

---

# 🧠 Core Philosophy

This project prioritizes:

- Predictability
- Determinism
- Isolation
- Scalability
- Performance safety
- Strict typing
- Testability

Convenience must never override correctness.

---

# 1️⃣ Strict TypeScript

- No implicit `any`
- No untyped `useState`
- No unsafe type assertions
- DTO types must never reach UI
- Domain models must be explicit
- Exhaustive switch statements required when applicable

Forbidden:

```ts
const [loading, setLoading] = useState(false) // ❌
```

Required:

```ts
const [loading, setLoading] = useState<boolean>(false) // ✅
```

---

# 2️⃣ Architectural Boundaries

The following flow is mandatory:

```
Model → Service → Query → Hook → Screen
```

Rules:

- Screens contain no business logic
- Hooks contain no UI logic (no JSX)
- Services (`services/api/`) contain no React imports
- Models contain no framework imports
- DTOs never leak to UI
- No cross-screen internal imports

Shortcuts are forbidden.

---

# 3️⃣ Screen Co-location

Feature logic must be co-located inside the screen folder:

```
screens/auth/login/
  login.screen.tsx
  login.hook.ts
  login.schema.ts
  __tests__/
```

Do NOT place screen-specific business logic in unrelated folders.

---

# 4️⃣ Test Coverage Requirement

- **Current enforced floor (2026-03-25):** statements 20%, branches 12%, functions 21%, lines 20%
- **Target:** 70% across all metrics — ratchet up ~5% per sprint
- **Policy:** thresholds in `jest.config.js` must always reflect real current coverage − 1%.
  Never set thresholds higher than actual coverage (CI would fail).
  Never set thresholds lower than real − 2% (defeats the purpose).
- No feature is complete without tests
- External dependencies must be mocked
- Tests must be deterministic
- No network calls inside tests
- Coverage drop blocks commit

Priority order for tests:

1. Hooks (`{name}.hook.test.tsx`) — highest priority
2. Screens (`{name}.screen.test.tsx`)
3. Services and models

---

# 5️⃣ Git Discipline

- No automatic commit
- No automatic push
- No merge without review
- Commit must follow: `<type>(<scope>): <reason>`
- Husky must pass before commit
- Bypassing workflow is forbidden

---

# 6️⃣ Performance Safety Rules

- No `ScrollView` for large dynamic lists
- `FlashList` or `FlatList` required for collections
- No sync TurboModule calls blocking JS thread
- No heavy computation inside render
- No animation logic on JS thread for complex cases
- JS frame budget must respect ~16ms
- Performance must be measurable, not assumed

---

# 7️⃣ State Management Discipline

| State type       | Solution                     |
| ---------------- | -----------------------------|
| Local UI state   | `useState`                   |
| Screen state     | Screen hook                  |
| Cross-feature    | Zustand store (slice/domain) |
| Server state     | TanStack Query               |

- No global context for frequently changing state
- Subscribe using selectors only
- No unnecessary re-renders

---

# 8️⃣ Memory Safety

- All listeners must be cleaned up
- All timers must be cleared
- Native modules must invalidate properly
- No reference cycles
- No leaking closures holding large objects

---

# 9️⃣ Native Safety

- Heavy native work must be async
- No UI access from background thread
- No blocking JS thread
- No unverified third-party native SDKs
- Android release must respect 16KB alignment (if applicable)

---

# 🔟 Encapsulation

- Screens cannot import internal files from other screens
- Shared hooks must live in `src/hooks/`
- Shared UI components must live in `src/components/`
- Infrastructure must live in `src/lib/`
- Domain models must live in `src/models/`
- Boundaries are strict

---

# 1️⃣1️⃣ Code Quality

- No `console.log` in production code (use Logger)
- No TODO without ticket reference
- No commented dead code
- No barrel imports
- No inline large anonymous functions inside JSX
- No untyped navigation params

---

# 1️⃣2️⃣ Determinism

Code must behave consistently:

- No reliance on system time without abstraction
- No randomness without seeding/mocking
- No side effects in render
- No hidden global mutation

---

# 🏁 Final Rule

If a change:

- Breaks typing
- Breaks isolation
- Breaks testability
- Breaks determinism
- Breaks performance safety
- Breaks architectural boundaries

It must be rejected.

No exceptions.
