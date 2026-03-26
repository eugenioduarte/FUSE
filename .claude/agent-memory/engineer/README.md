Stores implementation patterns, preferred code paths, and recurring delivery constraints.

---

## Loading Overlay — Centralized in GlobalLoadingObserver

**Rule:** Never call `overlayActions.open('loading')` or `overlayActions.close()` directly in hooks or screens to control loading state for API calls.

**Why:** `GlobalLoadingObserver` (`src/providers/GlobalLoadingObserver.tsx`) uses `useIsFetching()` and `useIsMutating()` from React Query to globally observe all API calls and manage the loading overlay automatically. Manual calls create inconsistencies and duplication.

**Applies to:** All hooks in `src/services/query/`, all screen hooks. The only accepted exception is opening an overlay of a different type than `'loading'` (e.g. `'chargerNotFound'`, `'chargingComplete'`).

---

## Store — Flat `.store.ts` Files (No Slices/Domains/Flows)

**Rule:** The store uses flat `{name}.store.ts` files — no separation into `slices/`, `domains/`, `flows/`. Each file contains the Zustand `create()` + state + actions + exported hooks.

**Why:** Architectural decision made on 2026-03-20 to simplify the model. Separating into three files (`.slice.ts`, `.hooks.ts`, `.selectors.ts`) was over-engineering for the current project size.

**Applies to:** Any new store. Existing files: `auth.store.ts`, `overlay.store.ts`, `theme.store.ts`.

Correct pattern:

```ts
export const useAuthStore = create<AuthState>()(persist(...))
export const useUser = () => useAuthStore((s) => s.user)
export const useAuthActions = () => useAuthStore((s) => ({ login: s.login, logout: s.logout }))
```

---

## Navigation — `useEffect` + `router.replace()` (Not `<Redirect>`)

**Rule:** For conditional navigation based on hydration (e.g. `app/index.tsx`), use `router.replace()` inside a `useEffect`, never `<Redirect>`.

**Why:** `<Redirect>` causes a white screen in Expo Router when rendered during the initial mount before navigation is ready. `useEffect` ensures the router is initialized.

**Applies to:** `app/index.tsx` and any root route that needs to redirect based on store state.

Correct pattern:

```tsx
export default function Index() {
  const router = useRouter()
  const rehydrated = useAuthStore((s) => s.rehydrated)
  useEffect(() => {
    if (!rehydrated) return
    router.replace('/(auth)/onboarding')
  }, [rehydrated])
  return null
}
```

---

## Hydration — `rehydrated` Must NOT Be Persisted

**Rule:** The `rehydrated` field in the auth store must NOT be included in Zustand persistence. Use `partialize` to exclude it. It is set to `true` by `onRehydrateStorage` on each launch.

**Why:** If `rehydrated` is persisted, it may be loaded as `false` before the `onRehydrateStorage` callback fires, creating a race condition that results in a permanent white screen.

**Applies to:** `src/store/auth.store.ts` and any future store with a hydration flag.

---

## Dependencies — Never Use `latest` for Critical Packages

**Rule:** Never set `"firebase"`, `"react"`, `"react-native"`, `"expo"`, or any package with a history of breaking changes to `"latest"` in `package.json`. Always pin to an explicit version range (e.g. `"^12.11.0"`).

**Why:** `yarn install` on a new machine or CI can silently install a different major version. Discovered on 2026-03-25 when Firebase was `"latest"` (resolved 12.11.0) — fixed to `"^12.11.0"`.

**Applies to:** All new dependencies added to `package.json`. When in doubt, use `yarn info <pkg> version` to get the latest stable version and pin it explicitly.
