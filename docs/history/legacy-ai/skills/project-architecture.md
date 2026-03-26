---
name: project-architecture
version: 1.0.0
author: Eugénio Silva
created: 2026-03-01
updated: 2026-03-23
---

> **[PT]** Define o modelo arquitetural em camadas do projeto, descrevendo como as camadas interagem e quais são as suas responsabilidades.

---

This document is mandatory and overrides default model behavior.

# 🏗 Project Architecture — React Native Mobile

> This document defines the architectural model of this application. It describes how layers
> interact and how the system is structured. It is mandatory for all agents and contributors.

---

# 🎯 Purpose

This architecture exists to ensure:

- Scalability
- Testability
- Isolation
- Performance safety
- Long-term maintainability
- Predictable evolution

We do not structure code randomly. We structure it intentionally.

---

# 🧠 Architectural Model

The application follows a layered architecture with domain-organized screens.

Core flow:

```
Model → Service → Query → Store/Hook → Screen
```

Each layer has a strict responsibility.

Shortcuts are forbidden.

---

# 🧱 Layer Responsibilities

---

## 📦 1️⃣ Models (Domain Layer)

Location: `src/models/<domain>/`

Purpose:

- Represent business domain
- Pure TypeScript types
- No React imports
- No framework dependencies

Examples:

```
models/
  user/user.model.ts
  charging/store.model.ts
  customer/customer-stats.model.ts
  terms/terms.model.ts
```

Rules:

- DTO must never be used as domain model
- Model must represent business truth
- No side effects

---

## 🔌 2️⃣ Services — API Layer (Data Access)

Location: `src/services/api/<domain>/`

Purpose:

- Communicate with backend
- Transform DTO → Model
- Normalize API errors
- Handle HTTP concerns

Structure:

```
services/api/auth/
  auth.ts          # pure async functions (loginWithPKCE, refreshToken)
  auth.types.ts    # DTO/response types — never leak to UI
  pkce.ts          # specific implementation
  index.ts         # re-exports
```

Rules:

- No React imports
- No UI logic
- No state management
- Pure async functions only

Service does NOT know about hooks or screens.

---

## 🔄 3️⃣ Query Layer (Async State Orchestration)

Location: `src/services/query/<domain>/`

Purpose:

- Handle caching (TanStack Query)
- Manage loading/error states
- Connect services to hooks
- Define mutations and queries

Naming:

- `use{Action}Mutation.ts` for write operations
- `use{Resource}Query.ts` for read operations

Examples:

```
services/query/auth/
  useLoginWithPkceMutation.ts
  useRefreshTokenMutation.ts
  index.ts
```

Rules:

- No UI logic
- No direct rendering logic
- Must return structured async state

---

## 🏪 4️⃣ Store (Cross-Feature State)

Location: `src/store/`

Purpose:

- Manage state that persists across screens or is shared between multiple screens
- Provide fine-grained selectors to minimize re-renders

Structure:

```
store/
  auth.store.ts      # user session, hasShownOnboarding, rehydrated hydration flag
  overlay.store.ts   # UI overlays (error, loading, success, notifications, etc.)
  theme.store.ts     # theme color state
```

Each `{name}.store.ts` file contains the Zustand `create()` call, state, actions, and named hooks — all in one file.

Rules:

- Subscribe using named hooks only (no `useStore((s) => s)` in screens)
- One store file per concern
- Persist only what needs to survive app restarts (`partialize` to exclude ephemeral fields)
- `rehydrated` flag must NOT be persisted — it is set by `onRehydrateStorage` on every launch

---

## 🪝 5️⃣ Hooks (Screen Controller Layer)

Location: `src/screens/<domain>/<screen>/`

Naming: `use{ScreenName}Screen` (e.g., `useLoginScreen`)

Purpose:

- Encapsulate business logic for a screen
- Orchestrate query mutations + store state
- Prepare data for UI
- Control screen-level behavior

Example:

```ts
// login.hook.ts
export function useLoginScreen() {
  const [email, setEmail] = useState<string>('')
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const pkceLoginMutation = useLoginWithPkceMutation()
  const setCredentials = useSetCredentials()

  const handleLogin = useCallback(async () => { ... }, [...])

  return { email, setEmail, isSubmitting, handleLogin, isEmailValid }
}

export default useLoginScreen
```

Rules:

- No JSX
- No UI component logic
- Must be testable in isolation (all external deps mockable)
- Returns a plain object consumed by the screen

Hooks represent screen intelligence.

---

## 🖥 6️⃣ Screens (Presentation Layer)

Location: `src/screens/<domain>/<screen>/`

Naming: `{name}.screen.tsx`

Purpose:

- Render UI
- Consume the screen hook
- Map state to components
- Trigger user actions

Example:

```tsx
// login.screen.tsx
export default function LoginScreen() {
  const { email, setEmail, isSubmitting, handleLogin, isEmailValid } =
    useLoginScreen()

  return (
    <WrapperSafeArea>
      <TextInput value={email} onChangeText={setEmail} />
      <Button onPress={handleLogin} disabled={!isEmailValid(email)} />
    </WrapperSafeArea>
  )
}
```

Rules:

- No business logic
- No API calls
- No data transformation logic
- No heavy computation
- Purely declarative

Screens are dumb. Hooks are smart.

---

# 🧩 Screen-Based Structure

Screens are organized by domain group:

```
src/screens/
  auth/
    login/
      login.screen.tsx
      login.hook.ts
      login.schema.ts
      __tests__/
    register/
  charging/
    charging-start/
    charging-detail/
  map/
  profile/
```

Screens must not depend on internal files from other screens.

Shared logic must move to:

- `src/hooks/` (shared hooks)
- `src/components/` (reusable UI)
- `src/services/` (API/query)
- `src/store/` (cross-screen state)
- `src/models/` (domain types)
- `src/lib/` (infrastructure)

---

# 🧠 Data Flow

```
User Action
  ↓
Screen (JSX, no logic)
  ↓
Hook (orchestrates)
  ↓
Query (TanStack) or Store (Zustand)
  ↓
Service (HTTP, pure async)
  ↓
API
  ↓
Service transforms DTO → Model
  ↓
Query updates cache / Store updates state
  ↓
Hook updates derived state
  ↓
Screen re-renders
```

One direction. No circular dependency.

---

# 🏪 State Architecture

| State type     | Solution                               |
| -------------- | -------------------------------------- |
| Local UI state | `useState` inside hook                 |
| Screen state   | Screen hook                            |
| Cross-screen   | Zustand store (`src/store/*.store.ts`) |
| Server state   | TanStack Query (services/query layer)  |

Global context must not manage high-frequency state.

---

# ⚡ Performance Awareness

Architecture must consider:

- JS thread budget (16ms frame)
- Native thread separation
- Virtualized lists (FlashList/FlatList)
- Memoization strategy (`useCallback`, `useMemo`)
- Re-render isolation (fine-grained selectors)

Architecture must not introduce:

- Large context cascades
- Heavy sync native calls
- Deep prop drilling

---

# 🧪 Testability Model

Each layer must be independently testable:

- Models → pure type validation
- Services → mocked HTTP client
- Query → mocked service
- Hook → mocked query + mocked store
- Screen → mocked hook

If a layer cannot be tested independently, architecture is broken.

---

# 🔒 Encapsulation Rules

- Screens cannot import internal files from other screens.
- Services cannot import UI.
- Models cannot import framework.
- Query cannot import screen.
- No circular dependencies allowed.

Boundaries are strict.

---

# 📈 Scalability Strategy

As the project grows:

- Screens may be grouped deeper by domain.
- Services may be split by domain.
- Models remain centralized.
- Shared logic extracted when reused across ≥ 2 screens.

We optimize for growth, not for small size.

---

# 🧠 Architectural Decision Rule

Before implementing anything, ask:

- Which layer does this belong to?
- Is this domain logic or UI logic?
- Does this introduce coupling?
- Is this testable?
- Does this respect the flow?

If unclear → consult Frontend Architect agent.

---

# 🏁 Final Principle

Architecture is not accidental.

It is a constraint system that:

- Protects scalability
- Enables performance
- Guarantees testability
- Reduces technical debt

Breaking architecture for convenience is forbidden.
