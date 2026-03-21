This document is mandatory and overrides default model behavior.

# 🏷 Naming Conventions — React Native Mobile

> This document is mandatory and overrides default model behavior. Consistency is not optional.

---

# 🎯 Purpose

This document defines naming standards across the entire codebase.

Naming must reflect:

- Domain clarity
- Architectural boundaries
- Predictability
- Scalability

Inconsistent naming is considered technical debt.

---

# 🧱 General Rules

- Use English for all identifiers.
- Prefer clarity over brevity.
- Avoid abbreviations unless universally known (e.g., ID, URL).
- Names must reflect domain meaning, not UI representation.
- Avoid generic names like `data`, `item`, `value`, `handler`.

---

# 📁 File Naming

All files must use:

- **kebab-case** for folders
- **kebab-case** for file names

Examples:

```
login.screen.tsx
login.hook.ts
login.schema.ts
user.model.ts
use-color-scheme.ts
```

Never use camelCase or PascalCase for file names.

---

# 🧩 Components

## Component Naming

- Use **PascalCase** for the exported component name
- File name: kebab-case (applies to screen-specific sub-components)
- Top-level reusable components in `src/components/` use PascalCase folder + PascalCase file

Example:

```tsx
// src/components/buttons/Button.tsx
export default function Button() {}

// screens/auth/login/components/header.tsx
export function Header() {}
```

Avoid:

- Prefix duplication (no `LoginHeader` inside the login feature)

---

# 🪝 Hooks

## Rules

- Must start with `use`
- Must reflect domain intent
- Screen-level hooks must follow `use{ScreenName}Screen` pattern
- Never suffix with "Hook"

Correct:

```
useLoginScreen          ← screen business logic hook
useUserLocation         ← shared infrastructure hook
useColorScheme          ← shared utility hook
```

Incorrect:

```
useLoginHook
loginHook
useLogin (ambiguous — prefer useLoginScreen)
```

---

# 🧠 State Variables

## Boolean Variables

Must use semantic prefixes:

```
is    → isSubmitting, isLoading, isEmailValid
has   → hasError
should → shouldRetry
can   → canProceed
```

Never:

```
loading
errorState
```

## Handlers

Must start with `handle`.

Examples:

```
handleSubmit
handleLogin
handleRetry
```

## Props Callbacks

Must start with `on`.

Examples:

```
onPress
onSubmit
onRetry
```

---

# 📦 Models

Models represent domain entities.

File naming:

```
user.model.ts
store.model.ts
customer-stats.model.ts
```

Rules:

- Use PascalCase for type name
- Do NOT prefix with `I`
- Do NOT suffix with `Interface`
- One model per file (or closely related models grouped together)

Correct:

```ts
export type User = {
  id: string
  name: string
}
```

Incorrect:

```ts
export interface IUser {}
```

---

# 🔄 DTOs (API Contracts)

DTOs must end with:

```
Dto
```

Examples:

```
AuthLoginResponseDto
UserProfileDto
```

Never expose DTO types to the UI layer. Transform at service boundary.

---

# 🏪 Store

Each store is a single file containing state, actions, and hooks:

| File              | Responsibility                                  |
| ----------------- | ----------------------------------------------- |
| `{name}.store.ts` | Zustand `create()` + state + actions + hooks    |

Examples:

```
auth.store.ts
overlay.store.ts
theme.store.ts
```

## Hook naming in store:

```ts
// State access hooks — exported from the store file
useUser()
useIsAuthenticated()
useIsRehydrated()
useHasShownOnboarding()

// Action hooks — grouped into a single actions hook
useAuthActions()        // returns { login, logout, updateUser, setHasShownOnboarding }
useThemeActions()       // returns { setBackgroundColor, setLevelTenColor }
```

No separate `.hooks.ts`, `.selectors.ts`, or `index.ts` files. Everything lives in `{name}.store.ts`.

---

# 🔌 Services

## API Layer (`services/api/`)

Functions use verb-driven naming:

```ts
loginWithPKCE(email: string): Promise<AuthModel>
refreshToken(token: string): Promise<AuthModel>
fetchCustomerStats(): Promise<CustomerStats>
```

Avoid generic class containers like `UserService`. Prefer pure functions grouped by domain file.

## Type files in API layer:

```
auth.types.ts        → AuthLoginResponse, PkceLoginVariables
customer.types.ts    → CustomerStatsResponse
```

---

# 📊 Query Layer (`services/query/`)

Query hooks must describe the action:

```
useLoginWithPkceMutation.ts     → useLoginWithPkceMutation()
useRefreshTokenMutation.ts      → useRefreshTokenMutation()
useCustomerStatsQuery.ts        → useCustomerStatsQuery()
```

Suffix pattern:

- `use{Action}Mutation` — for mutations (POST, PUT, DELETE)
- `use{Resource}Query` — for queries (GET)

Avoid generic names like `useData`, `useFetch`.

---

# 🧪 Tests

Test files must end with:

```
.test.tsx   (for React components/hooks)
.test.ts    (for plain logic)
```

Examples:

```
login.hook.test.tsx
login.screen.test.tsx
```

Do not use `.spec.ts`.

Test files must live in `__tests__/` next to the tested file.

---

# 🧾 Constants

Constants must use:

```
SCREAMING_SNAKE_CASE
```

Examples:

```
MAX_RETRY_ATTEMPTS
DEFAULT_PAGE_SIZE
CREDENTIALS_STORAGE_KEY
```

---

# 🎨 Enums

Use PascalCase for enum name.
Use string values that describe the step/state:

```ts
export enum AuthSteps {
  SIGN_IN = 'sign-in',
  SIGN_UP = 'sign-up',
  EMAIL_VERIFICATION = 'email-verification',
}
```

For simple string unions, prefer union types over enums:

```ts
export type MapPinStatus = 'available' | 'busy' | 'offline' | 'group'
```

---

# 🧠 Navigation

The project uses **expo-router** (file-based routing).

- Route params are typed via `useLocalSearchParams<{ id: string }>()`
- Navigation actions are centralized in `lib/navigation/navigation-manager.ts`

```ts
const { goToTerms, goToCharging } = useNavigationManager()
```

Never call `router.push` directly inside screens or hooks without going through `navigation-manager`.

---

# 🪵 Logger

Logger tags must be descriptive and follow `{Category}.{Subcategory}`:

```ts
new Logger('Store.UserDomain')
new Logger('Api.Auth')
new Logger('Query.Auth.useLoginWithEmailMutation')
new Logger('Screen.Login')
```

---

# 🧩 Feature Folder Naming

Folders must:

- Be kebab-case
- Represent a domain concept
- Avoid generic names like `common`, `utils`, `temp`

Correct:

```
charging-start/
fast-plug/
auth/login/
```

---

# 🔒 Prohibited Naming Patterns

- Prefixing interfaces with `I`
- Suffixing hooks with `Hook`
- Generic names like `utils2`, `helper`, `manager` (without domain context)
- Abbreviations that hide meaning
- Deep nested names like `login-form-input-field-container.tsx`

---

# 📈 Scalability Rule

Names must scale.

Before naming something, ask:

- Will this still make sense in 2 years?
- Is it domain-driven?
- Is it explicit?
- Is it unique within context?

If not, rename.

---

# 🏁 Final Rule

If a name:

- Hides intent
- Breaks consistency
- Violates domain clarity
- Creates ambiguity
- Conflicts with architectural boundaries

It must be renamed before merge.
