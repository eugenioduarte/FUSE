> **[PT]** Plano de implementação de arquitetura offline-first usando SQLite como fonte única de verdade, com sincronização automática com a API em cada entrada de ecrã.

---

# SDD — Task #3: Offline-First Architecture with SQLite

**Status:** Done
**Priority:** High
**Agent:** `frontend-architect` (design) + `react-native-engineer` (implementation)

---

## 🎯 Goal

Make the app work fully offline. SQLite is the **single source of truth** — the app always reads from local DB. On screen entry, a background sync fetches from the API and updates SQLite. On network failure, the app continues with cached data.

---

## 📦 Scope

### New Files
- `src/lib/sqlite/` — SQLite setup, schema, migrations
- `src/lib/sqlite/schema.ts` — table definitions
- `src/lib/sqlite/migrations/` — versioned migration files
- `src/services/sync/` — sync layer (API → SQLite)
- `src/store/sync-status/` — Zustand slice for sync state UI

### Files Modified
- All service files in `src/services/` — add SQLite write after API fetch
- All hooks in `src/screens/*/hooks/` — read from SQLite instead of React Query cache
- `src/lib/` — add `expo-sqlite` setup

---

## 🏗 Architecture Decisions

```
Screen Entry
    ↓
Read from SQLite (instant, always available)
    ↓ (parallel)
Fetch from API → On success: write to SQLite → Trigger re-render
    ↓ (on error)
Show cached data + sync error indicator
```

- Use **`expo-sqlite`** (v2 with async API — compatible with Expo SDK 50+)
- Schema versioning via migration files — never alter schema directly
- React Query remains for server-state orchestration — SQLite is the persistence layer
- Mutations: write to SQLite optimistically, sync to API in background
- Conflict resolution: server wins (last-write-wins with server timestamp)

### Layer Boundaries (Strict)
```
Screen → Hook → Service → SQLite (read)
                       → API → SQLite (write on success)
```
No screen may directly access SQLite. All DB access goes through services.

---

## 📋 Implementation Plan

### Step 1 — Setup expo-sqlite
```bash
npx expo install expo-sqlite
```
- Create `src/lib/sqlite/database.ts` — singleton DB connection
- Create `src/lib/sqlite/schema.ts` — define all tables

### Step 2 — Define Schema
Tables matching existing domain models:
```sql
CREATE TABLE topics (id TEXT PRIMARY KEY, name TEXT, ...);
CREATE TABLE summaries (id TEXT PRIMARY KEY, topic_id TEXT, ...);
CREATE TABLE challenges (id TEXT PRIMARY KEY, ...);
CREATE TABLE calendar_events (id TEXT PRIMARY KEY, ...);
```

### Step 3 — Create Migration System
- `src/lib/sqlite/migrations/001_initial.ts`
- Migration runner in `src/lib/sqlite/migrate.ts`
- Run migrations on app startup before any DB access

### Step 4 — Create Sync Layer
For each domain (topics, summaries, challenges, calendar):
- `src/services/sync/sync-topics.ts`
  ```ts
  export async function syncTopics() {
    const data = await fetchTopicsFromAPI()
    await db.runAsync('INSERT OR REPLACE INTO topics ...')
  }
  ```

### Step 5 — Update Hooks
Replace direct React Query reads with SQLite reads + background sync:
```ts
// Before
const { data } = useQuery({ queryKey: ['topics'], queryFn: fetchTopics })

// After
const [topics, setTopics] = useState<Topic[]>([])
useEffect(() => {
  loadTopicsFromSQLite().then(setTopics)
  syncTopics().then(() => loadTopicsFromSQLite().then(setTopics))
}, [])
```

### Step 6 — Sync Status UI
- Add `SyncIndicator` component — shows last sync time and error state
- Zustand slice: `{ lastSync, isSyncing, syncError }`

### Step 7 — Handle Mutations
For create/update/delete operations:
1. Write to SQLite immediately (optimistic)
2. Send to API in background
3. On API failure: mark as pending, retry on next sync

### Step 8 — Test Offline Behavior
- Disable network on device/simulator
- Open app — verify data loads from SQLite
- Perform mutations — verify they queue correctly
- Re-enable network — verify sync completes

---

## ✅ Definition of Done

- [ ] App loads data with no network connection
- [ ] All API responses are persisted to SQLite
- [ ] Sync runs on every screen entry (background, non-blocking)
- [ ] Sync error shown to user when offline
- [ ] Mutations queue when offline and sync when back online
- [ ] Migration system tested with schema version bumps
- [ ] Tests cover sync layer and hook behavior
- [ ] `frontend-architect` approved the schema design
- [ ] `code-reviewer` validation passed
