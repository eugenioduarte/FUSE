> **[PT]** Snapshot da estrutura de pastas e ficheiros do projeto gerado para referência do router LLM e carregamento de contexto pelos agentes.

---

# Project Structure Snapshot

> Generated: 2026-03-20 Purpose: LLM router reference — complete structural overview of the Mobile
> app for agent context loading.

---

## Stack

| Layer          | Technology                          |
| -------------- | ----------------------------------- |
| Framework      | React Native + Expo (SDK 55)        |
| Routing        | Expo Router (file-based)            |
| Language       | TypeScript (strict mode)            |
| State (client) | Zustand                             |
| State (server) | TanStack Query v5                   |
| Styling        | Tailwind via Uniwind adapter        |
| Testing        | Jest + React Native Testing Library |
| Package manager | pnpm |

---

## Entry Points

| File                           | Role                              |
| ------------------------------ | --------------------------------- |
| `app/_layout.tsx`              | Root layout — wraps all providers |
| `app/index.tsx`                | Root redirect — hydration-aware routing |
| `app/(auth)/_layout.tsx`       | Auth + onboarding flow group      |
| `app/(main)/_layout.tsx`       | Main tab navigation group         |
| `app/(stack)/_layout.tsx`      | Native stack navigation group     |
| `app/(no-header)/_layout.tsx`  | Screens without header            |
| `app.json`                     | Expo app configuration            |

---

## Architecture Layers

Strict top-down dependency. No layer may import from a layer above it.

```
Screen          src/screens/{domain}/{name}/{name}.screen.tsx
  ↓ uses
Hook            src/screens/{domain}/{name}/{name}.hook.ts
  ↓ uses
Query / Store   src/services/query/{domain}.ts
                src/store/
  ↓ uses
Service         src/services/api/{domain}.ts
  ↓ uses
Model           src/models/{domain}.ts
```

---

## Directory Map

```
/                                   Project root
├── .ai/                            AI engineering rules & agents
│   ├── system.md                   Master context loader
│   ├── agents/                     Agent role definitions (6 agents)
│   ├── rules/                      Mandatory project rules (5 files)
│   ├── skills/                     Implementation patterns (7 files)
│   ├── templates/                  Scaffold templates (3 files)
│   ├── _sdd/                       Software Design Documents
│   └── docs/                       Project documentation (this file)
├── app/                            Expo Router — file-based routes
│   ├── _layout.tsx                 ROOT ENTRY
│   ├── index.tsx               ROOT REDIRECT (hydration-aware)
│   ├── (auth)/                 Auth + onboarding screens
│   ├── (main)/
│   ├── (stack)/
│   └── (no-header)/
├── src/
│   ├── components/                 Shared UI components (PascalCase files)
│   ├── constants/                  App-wide constants
│   ├── hooks/                      Shared custom hooks (use{Action}.ts)
│   ├── i18n/
│   │   └── translations/
│   │       ├── en.json             TRANSLATION SOURCE OF TRUTH
│   │       └── pt.json             TRANSLATION SOURCE OF TRUTH
│   ├── lib/
│   │   └── navigation/
│   │       └── navigation-manager.ts   NAVIGATION ENTRY
│   ├── models/                     Domain types — no framework imports
│   ├── providers/                  React context providers
│   ├── screens/                    Feature screens (co-located: screen + hook + styles + tests)
│   ├── services/
│   │   ├── api/                    HTTP services — DTO → Model mapping
│   │   └── query/                  TanStack Query hooks
│   ├── store/
│   │   ├── auth.store.ts           Auth session + onboarding flag + rehydration hook
│   │   ├── overlay.store.ts        UI overlay state (error, loading, success, etc.)
│   │   └── theme.store.ts          Theme color state
│   ├── styles/
│   │   └── theme.css               DESIGN TOKENS — single source for all colors
│   ├── types/
│   └── utils/
├── assets/                         Static assets (icons, images, fonts)
├── app.json                        Expo config + plugins
├── babel.config.js
├── metro.config.js
├── package.json
└── tsconfig.json
```

---

## Agent Files Index

### Agents (`/agents/`)

| File                              | Role                                        |
| --------------------------------- | ------------------------------------------- |
| `system.md`                       | Master context — loaded by all agents       |
| `agents/react-native-engineer.md` | Implementation — builds features end-to-end |
| `agents/code-reviewer.md`         | Review — enforces all rules on diffs        |
| `agents/performance-auditor.md`   | Audit — rendering and bundle performance    |
| `agents/test-writer.md`           | Tests — unit + integration, 80% minimum     |
| `agents/test-write-e2e.md`        | E2E — full user-flow device tests           |
| `agents/frontend-architect.md`    | Architecture — structural decisions         |

### Rules (`/rules/`)

| File                        | Scope                            |
| --------------------------- | -------------------------------- |
| `mandatory-rules.md`        | Non-negotiable constraints       |
| `naming-conventions.md`     | File, folder, variable naming    |
| `folder-structure.md`       | Co-location and directory layout |
| `git-workflow.md`           | Commit and branch conventions    |
| `engineering-principles.md` | Rationale behind all rules       |

### Skills (`/skills/`)

| File                             | Domain                               |
| -------------------------------- | ------------------------------------ |
| `project-architecture.md`        | Five-layer architecture              |
| `api-integration-pattern.md`     | DTO → Model → Service → Query chain  |
| `react-native-best-practices.md` | Mobile performance patterns          |
| `typescript-strict-rules.md`     | Type safety enforcement              |
| `translations.md`                | i18n key format and sync             |
| `clean-code-rules.md`            | Code quality standards               |
| `ux-ui-standards.md`             | Design system (Tailwind + theme.css) |
| `gitignore-rules.md`             | What must never be committed         |

### Templates (`/templates/`)

| File                  | Generates                     |
| --------------------- | ----------------------------- |
| `feature-template.md` | Full feature scaffold         |
| `screen-template.md`  | Screen + layout structure     |
| `hook-template.md`    | Screen-level hook + test stub |

### SDDs (`/_sdd/`)

| File                                 | Feature                           |
| ------------------------------------ | --------------------------------- |
| `charge-action/charge-screen.sdd.md` | Charging start screen (QR/Manual) |
| `login-terms/login-terms.sdd.md`     | Login terms acceptance            |
| `example/example.sdd.md`             | Reference SDD template            |
| `example/example.flow.md`            | Reference flow diagram            |

---

## State Management

**Zustand** — all persistent and cross-feature state.

Each store is a single file:

```
{name}.store.ts      Zustand create() + state + actions + named hooks (all in one file)
```

Current stores:

- `auth.store.ts` — user session, `hasShownOnboarding`, `rehydrated` (ephemeral, set by `onRehydrateStorage`)
- `overlay.store.ts` — UI overlay visibility (error, loading, success, notification, etc.)
- `theme.store.ts` — theme color preferences

Rules:

- `rehydrated` must **not** be persisted — use `partialize` to exclude it
- Navigation gating on hydration uses `useEffect` + `router.replace()`, never `<Redirect>` from index

**TanStack Query** — all server state (API responses).

---

## Navigation

- **Engine:** Expo Router (file-based)
- **Programmatic navigation:** Always via `src/lib/navigation/navigation-manager.ts` — never call `router.push` directly
- **Typed params:** `useLocalSearchParams<{ id: string }>()`
- **Route groups:** `(auth)` | `(main)` | `(stack)` | `(no-header)`

---

## Key Conventions

### Naming

- Files: `kebab-case`
- Components: `PascalCase.tsx`
- Screens: `{name}.screen.tsx`
- Screen hooks: `{name}.hook.ts`
- Shared hooks: `use{Action}.ts`
- Store: `{name}.store.ts`

### Translations

- Format: `domain.section.key` (snake_case, dot-separated)
- Always add key to **both** `en.json` and `pt.json`
- Access via `t('domain.section.key')` from `useTranslation()`

### API Integration (4-file chain)

1. `src/models/{domain}.ts` — domain type (no DTOs, no framework)
2. `src/services/api/{domain}.ts` — HTTP call + DTO → Model mapping
3. `src/services/query/{domain}.ts` — TanStack Query hook
4. `src/screens/.../...hook.ts` — consume query hook

### Testing

- Minimum global coverage: **80%**
- Hooks minimum: **90%**
- Coverage blocks commits (Husky)
- All external deps mocked (no real API, navigation, or storage in tests)

---

## Config Files

| File              | Purpose                       |
| ----------------- | ----------------------------- |
| `tsconfig.json`   | TypeScript strict config      |
| `babel.config.js` | Expo Babel transpilation      |
| `metro.config.js` | React Native Metro bundler    |
| `app.json`        | Expo app metadata and plugins |
| `package.json`    | App dependencies              |
