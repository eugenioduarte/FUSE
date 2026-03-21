# Project Structure

A quick tour of the codebase layout.

```
app.config.js / app.json / babel.config.js / eas.json / metro.config.js
src/
  components/
  constants/
  hooks/
  locales/
  navigation/
  screens/
  services/
    ai/
    firebase/
    repositories/
  storage/
  store/
  types/
  utils/
```

## Highlights

- `src/services/repositories/*` — Repository layer wrapping local cache and offline queue, exposing convenient CRUD methods for Topics, Summaries, and Challenges. Includes `fromSync` options to avoid echo writes.
- `src/storage/localCache.ts` — Local key-value store with timestamps.
- `src/storage/offlineQueue.ts` — Append-only queue of REST-like operations (PUT/DELETE) to be processed later.
- `src/services/firebase/collabSync.service.ts` — Firestore listeners (topics I own + topics where I am a member). Writes into repositories with `fromSync: true`.
- `src/services/firebase/collabFlush.service.ts` — Mirrors local queued changes to Firestore only on explicit triggers (e.g., Dashboard focus, finishing a challenge). Includes de-duplication via last mirrored `updatedAt`.
- `src/services/firebase/immediateFlush.ts` — Small helper to run a capped-time flush so the UI never hangs.
- `src/screens/main/challenge/*` — Challenge flows (run, review, list, add). After finishing, they upsert attempts and trigger an immediate flush.
- `src/screens/main/dashboard/DashboardScreen.tsx` — Orchestrates processing the offline queue and a collaborative flush on focus.
- `src/store/*` — Zustand stores for auth, overlay, theme, etc.
- `src/navigation/*` — Navigator setup and route helpers.

See also: [[Sync and Collaboration]].
