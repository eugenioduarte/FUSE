> **[PT]** Este ficheiro define a estrutura de pastas obrigatória do projeto React Native, incluindo o padrão de co-localização de ecrãs, a organização das camadas de serviços, store e modelos, e as regras de encapsulamento entre features.

---

This document is mandatory and overrides default model behavior.

# 📁 Folder Structure Rule — React Native Mobile

## 🎯 Purpose

This document defines the official folder structure for this React Native (Expo) application.

All screens MUST follow the screen-level pattern defined here.

This rule is mandatory and overrides personal preferences.

---

# 🧱 Core Architecture Principle

The project follows:

- Domain-organized screens with co-located logic
- Layer-based shared infrastructure (services, store, models)
- High cohesion within each screen folder
- Low coupling between screens
- Clear separation between reusable and feature-specific code

---

# 📦 Root Structure

```
src/
├── components/       # Reusable UI components (buttons, inputs, typography, etc.)
├── constants/        # App-wide constants
├── hooks/            # Shared hooks (theme, location, logger, etc.)
├── i18n/             # Internationalization (i18next)
├── lib/              # Infrastructure (firebase, rest, storage, tanstack, validation)
├── models/           # Domain models (pure TypeScript, no framework imports)
├── providers/        # React context providers (SystemProvider, SessionManager, etc.)
├── screens/          # Feature screens organized by domain
├── services/         # API functions and React Query hooks
├── store/            # Zustand state (domains, flows, slices)
├── styles/           # theme.css (color tokens)
├── tools/            # Dev tools
├── types/            # Global TypeScript definitions
└── utils/            # Utility functions
```

---

# 🧩 Screen Structure (Mandatory Pattern)

Each screen lives under `src/screens/<domain>/<screen-name>/` and must follow:

```
screens/
  auth/
    login/
      login.screen.tsx          # Presentation layer (JSX only, no business logic)
      login.hook.ts             # Business logic hook
      login.schema.ts           # Zod validation schema (if the screen has form/input)
      login.types.ts            # Local types (optional)
      login.constants.ts        # Local constants (optional)
      components/               # Screen-specific sub-components
        header.tsx
        form-field.tsx
      __tests__/
        login.hook.test.tsx
        login.screen.test.tsx
```

---

# 🧠 Naming Rules

## Screen Folder

- Must use `kebab-case`
- Must represent the domain concept

Examples:

```
login/
register/
charging-start/
fast-plug/
```

---

## Core Files (Mandatory Naming)

| File                       | Responsibility             |
| -------------------------- | -------------------------- |
| `{name}.screen.tsx`        | Presentation layer only    |
| `{name}.hook.ts`           | Business logic             |
| `{name}.schema.ts`         | Zod validation schema      |
| `{name}.types.ts`          | Local types (optional)     |
| `{name}.constants.ts`      | Local constants (optional) |

Do not rename these patterns.

---

## Components Folder

```
components/
  header.tsx
  form.tsx
  list-item.tsx
```

Rules:

- No prefix repetition (do NOT use `login-header.tsx` inside `login/`)
- Components must be screen-specific
- Reusable components must go to `src/components/`

---

# 📦 Services Layer

```
services/
  api/                        # HTTP functions — no React imports
    auth/
      auth.ts                 # API functions (loginWithPKCE, etc.)
      auth.types.ts           # DTO types (never leak to UI)
      index.ts                # Re-exports
    charging/
    customer/
    ...
  query/                      # React Query hooks
    auth/
      useLoginWithPkceMutation.ts
      useRefreshTokenMutation.ts
      index.ts
    charging/
    customer/
    ...
```

---

# 🏪 Store Layer

```
store/
  auth.store.ts      # Auth state: user, hasShownOnboarding, rehydrated + hooks
  overlay.store.ts   # UI overlay state + hooks
  theme.store.ts     # Theme/color state + hooks
```

Each store file contains state, actions, and hooks together:

| Convention              | Responsibility                    |
| ----------------------- | --------------------------------- |
| `{name}.store.ts`       | Zustand store with state, actions and exported hooks |

Store file exports:
- The `use{Name}Store` store
- Named hooks: `use{Thing}`, `use{Name}Actions`

---

# 📦 Models Layer

```
models/
  charging/
    store.model.ts
  customer/
    customer-stats.model.ts
  user/
    user.model.ts
  terms/
    terms.model.ts
```

- Pure TypeScript types
- No React or framework imports
- Represent business domain, not API responses

---

# 🔒 Encapsulation Rule

Screens must not import internal files from other screens.

Allowed:

```ts
import { useAuthActions } from '@/store/auth.store'
import { useLoginWithPkceMutation } from '@/services/query'
```

Forbidden:

```ts
import { internalHelper } from '@/screens/auth/register/register.hook'
```

Screen boundaries are strict.

---

# 🧪 Testing Structure

Each screen must include tests co-located in `__tests__/`:

```
__tests__/
  {name}.hook.test.tsx      # Hook tests (highest priority)
  {name}.screen.test.tsx    # Screen render tests
```

Tests must live close to the screen. No centralized test folders.

---

# 📈 Scalability Rule

As the project grows, screens may be grouped deeper by domain:

```
screens/
  auth/
    login/
    register/
  charging/
    charging-start/
    charging-detail/
  map/
```

Each leaf screen still must respect the mandatory pattern.

---

# 🧭 Definition of Compliance

A screen is compliant when:

- Folder structure matches exactly the defined pattern
- No business logic inside `.screen.tsx`
- No cross-screen internal imports
- Tests are co-located in `__tests__/`
- Schema is co-located (when the screen has inputs)
- Hook follows `use{ScreenName}Screen` naming

Violation of this rule triggers code review rejection.
