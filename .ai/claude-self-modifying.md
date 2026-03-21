> **[PT]** Registo vivo de padrões aprendidos, correções e decisões arquiteturais confirmadas em sessões anteriores — deve ser lido antes de qualquer implementação.

---

# 🧠 Claude Self-Modifying Learning Log

> This file is a living record of learned patterns, corrections, and architectural decisions
> confirmed in previous sessions. **It must be read before any implementation.**
>
> Format of each entry:
> - **Rule** — what to do / not do
> - **Why** — context or incident that generated the rule
> - **Applies to** — where this rule has effect

---

## 🔄 Loading Overlay — Centralized in GlobalLoadingObserver

**Rule:** Never call `overlayActions.open('loading')` or `overlayActions.close()` directly
in hooks or screens to control the loading state of API calls.

**Why:** The `GlobalLoadingObserver` (`src/providers/GlobalLoadingObserver.tsx`) was created, which
uses `useIsFetching()` and `useIsMutating()` from React Query to globally observe all API calls
and manage the loading overlay in a centralized and automatic way. Manual calls create
inconsistencies and duplication.

**Applies to:** All hooks in `src/services/query/`, all screen hooks, all components. The only
accepted exception is when opening an overlay of a **different** type than `'loading'`
(e.g. `'chargerNotFound'`, `'chargingComplete'`).

---

## 🚫 Git — No Co-Author in Commits

**Rule:** Never include a `Co-Authored-By:` line in commits.

**Why:** Company policy. Commits must only carry the user's name.

**Applies to:** All commits in this repository.

---

## 🏗 Architecture — Model → Service → Query → Hook → Screen

**Rule:** Strictly respect the responsibility chain. No shortcuts between layers.

**Why:** Defined in `system.md` and confirmed across multiple sessions. Breaking the chain creates
coupling and makes testing harder.

**Applies to:** Any new feature or refactor.

---

## 🏪 Store — Flat `.store.ts` Files (No Slices/Domains/Flows)

**Rule:** The store uses flat `{name}.store.ts` files — no separation into `slices/`, `domains/`,
`flows/`. Each file contains the Zustand `create()` + state + actions + exported hooks.

**Why:** Architectural decision made on 2026-03-20 to simplify the model. Separating into
three files (`.slice.ts`, `.hooks.ts`, `.selectors.ts`) was over-engineering for the current
project size.

**Applies to:** Any new store. Existing files: `auth.store.ts`, `overlay.store.ts`,
`theme.store.ts`.

Correct pattern:

```ts
export const useAuthStore = create<AuthState>()(persist(...))
export const useUser = () => useAuthStore((s) => s.user)
export const useAuthActions = () => useAuthStore((s) => ({ login: s.login, logout: s.logout }))
```

---

## 🧭 Navigation — `useEffect` + `router.replace()` (Not `<Redirect>`)

**Rule:** For conditional navigation based on hydration (e.g. `app/index.tsx`), use
`router.replace()` inside a `useEffect`, never `<Redirect>`.

**Why:** `<Redirect>` causes a white screen in Expo Router when rendered during the initial mount
before navigation is ready. `useEffect` ensures the router is initialized.

**Applies to:** `app/index.tsx` and any root route that needs to redirect based on store state.

Correct pattern:

```tsx
export default function Index() {
  const router = useRouter()
  const rehydrated = useAuthStore((s) => s.rehydrated)
  // ...
  useEffect(() => {
    if (!rehydrated) return
    router.replace('/(auth)/onboarding')
  }, [rehydrated])
  return null
}
```

---

## 🔁 Hydration — `rehydrated` Must NOT Be Persisted

**Rule:** The `rehydrated` field in the auth store must NOT be included in Zustand persistence.
Use `partialize` to exclude it. It is set to `true` by `onRehydrateStorage` on each launch.

**Why:** If `rehydrated` is persisted, it may be loaded as `false` before the `onRehydrateStorage`
callback fires, creating a race condition that results in a permanent white screen.

**Applies to:** `src/store/auth.store.ts` and any future store with a hydration flag.

---

## 📝 How to Update This File

Whenever:
- The user corrects something that was done incorrectly
- A relevant architectural decision is made
- A recurring error pattern is identified
- A new project convention is established

→ Add a new entry to this file using the format above.
