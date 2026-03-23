---
name: api-integration-pattern
version: 1.0.0
author: Eugénio Silva
created: 2026-03-01
updated: 2026-03-23
---

> **[PT]** Este ficheiro define o padrão obrigatório de integração de APIs backend na aplicação, descrevendo o fluxo completo desde o modelo de domínio até ao ecrã, com exemplos de código e regras de cada camada.

---

This document is mandatory and overrides default model behavior.

# 🔌 API Integration Pattern — React Native Mobile

> This document defines the standard pattern for integrating backend APIs in this application.
> All new integrations must follow this pattern exactly.

---

# 🎯 Purpose

This pattern ensures:

- Clear separation between HTTP concerns and UI logic
- Type-safe API contracts
- Centralized error handling
- Testable service and query layers

---

# 🧱 Full Flow

```
Backend API
  ↓
services/api/<domain>/     (HTTP, DTO → Model transform)
  ↓
services/query/<domain>/   (TanStack Query mutation/query hook)
  ↓
screens/<domain>/<screen>/<screen>.hook.ts   (consumes query hook)
  ↓
screens/<domain>/<screen>/<screen>.screen.tsx  (consumes hook return)
```

---

# 1️⃣ Model Definition

Location: `src/models/<domain>/<entity>.model.ts`

Purpose: define the domain type — what the app cares about (not what the API returns).

```ts
// models/user/user.model.ts
export type User = {
  uid: string
  email: string
  displayName: string | null
  photoURL: string | null
}
```

Rules:

- Pure TypeScript types
- No React imports
- No framework dependencies
- No API-specific fields

---

# 2️⃣ API Service

Location: `src/services/api/<domain>/`

Files:

| File                | Responsibility                    |
| ------------------- | --------------------------------- |
| `{domain}.ts`       | Pure async functions (HTTP calls) |
| `{domain}.types.ts` | DTO types for request/response    |
| `index.ts`          | Re-exports as `{Domain}Api`       |

### DTO types (`auth.types.ts`):

```ts
// services/api/auth/auth.types.ts
export type AuthLoginResponseDto = {
  uid: string
  access_token: string
  refresh_token: string
}

export type PkceLoginVariablesDto = {
  email: string
  promptLogin: boolean
}
```

### Service functions (`auth.ts`):

```ts
// services/api/auth/auth.ts
import { httpClient } from '../httpClient'
import type { AuthLoginResponseDto, PkceLoginVariablesDto } from './auth.types'

export async function loginWithPKCE(
  variables: PkceLoginVariablesDto,
): Promise<AuthLoginResponseDto> {
  const response = await httpClient.post<AuthLoginResponseDto>(
    '/auth/pkce',
    variables,
  )
  return response.data
}
```

Rules:

- No React imports
- No hooks
- No state management
- Pure `async` functions only
- DTO types stay in this layer — never leak to UI

---

# 3️⃣ Query Layer (TanStack Query)

Location: `src/services/query/<domain>/`

Files:

| File                     | Naming pattern                     |
| ------------------------ | ---------------------------------- |
| `use{Action}Mutation.ts` | Write operations (POST/PUT/DELETE) |
| `use{Resource}Query.ts`  | Read operations (GET)              |
| `index.ts`               | Re-exports                         |

### Mutation hook:

```ts
// services/query/auth/useLoginWithPkceMutation.ts
import { useMutation } from '@tanstack/react-query'
import { loginWithPKCE } from '../../api/auth'
import type { PkceLoginVariablesDto } from '../../api/auth/auth.types'

export function useLoginWithPkceMutation() {
  return useMutation({
    mutationFn: (variables: PkceLoginVariablesDto) => loginWithPKCE(variables),
  })
}
```

### Query hook:

```ts
// services/query/customer/useCustomerStatsQuery.ts
import { useQuery } from '@tanstack/react-query'
import { fetchCustomerStats } from '../../api/customer'

export function useCustomerStatsQuery() {
  return useQuery({
    queryKey: ['customer', 'stats'],
    queryFn: fetchCustomerStats,
  })
}
```

Rules:

- No UI logic
- No JSX
- No direct store access
- Returns structured TanStack async state

---

# 4️⃣ Screen Hook Consumption

Location: `src/screens/<domain>/<screen>/<screen>.hook.ts`

The screen hook imports from the query layer and the store, never directly from the service.

```ts
// screens/auth/login/login.hook.ts
import { useLoginWithPkceMutation } from '@/src/services/query'
import { useSetCredentials } from '@/src/store/slices/credentials/credentials.hooks'
import { useNavigationManager } from '@/src/lib/navigation/navigation-manager'

export function useLoginScreen() {
  const pkceLoginMutation = useLoginWithPkceMutation()
  const setCredentials = useSetCredentials()
  const { goToTerms } = useNavigationManager()

  const handleLogin = useCallback(async () => {
    const resp = await pkceLoginMutation.mutateAsync({ email, promptLogin: true })
    await setCredentials(resp.uid, resp.access_token, rememberMe, resp.refresh_token)
    goToTerms()
  }, [...])

  return { handleLogin, ... }
}
```

---

# 5️⃣ Index Re-exports

Each query domain must expose a clean index:

```ts
// services/query/index.ts
export { useLoginWithPkceMutation } from './auth/useLoginWithPkceMutation'
export { useRefreshTokenMutation } from './auth/useRefreshTokenMutation'
export { useCustomerStatsQuery } from './customer/useCustomerStatsQuery'
```

Import in hooks via:

```ts
import { useLoginWithPkceMutation } from '@/src/services/query'
```

---

# 🧪 Testing

Each layer is tested independently:

| Layer   | How to test                                      |
| ------- | ------------------------------------------------ |
| Service | Mock `httpClient`, assert request and response   |
| Query   | Wrap in `QueryClientProvider`, mock service      |
| Hook    | Mock query hooks and store hooks via `jest.mock` |
| Screen  | Mock the screen hook entirely                    |

Example: mocking query hook in hook tests

```ts
jest.mock('@/src/services/query', () => ({
  useLoginWithPkceMutation: () => ({
    mutateAsync: jest.fn().mockResolvedValue({
      uid: 'uid',
      access_token: 'token',
      refresh_token: 'rft',
    }),
  }),
}))
```

---

# 🔒 Rules Summary

| Rule                                    | Enforced |
| --------------------------------------- | -------- |
| DTO types never reach UI layer          | ✅       |
| Service functions are pure async        | ✅       |
| Query hooks use TanStack (no raw fetch) | ✅       |
| Screen hook consumes query, not service | ✅       |
| Store mutations go through store hooks  | ✅       |
| No cross-layer direct imports           | ✅       |

---

# 🏁 Final Rule

Every API integration must go through:

```
Model → Service → Query → Hook → Screen
```

No shortcuts. No direct API calls in screens. No business logic in query hooks.
