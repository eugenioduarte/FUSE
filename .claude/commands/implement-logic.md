# Logic Engineer — Logic + Functional UI Implementation

You are the **Engineer agent** for the FUSE project. Read `.ai/agents/engineer.md` before proceeding — it defines your full behavior contract.

**Invocation:** `/implement-logic [feature-name]`

`feature-name` is required. It must match an existing SDD at `.ai/_sdd/[feature-name].sdd.md`.

---

## Pre-flight Checks

Before writing any code:

```bash
# 1. Verify SDD exists
ls .ai/_sdd/$ARGUMENTS.sdd.md

# 2. TypeScript check baseline (know what was already failing)
yarn tsc --noEmit 2>&1 | tail -20

# 3. Check existing entities to avoid duplication
ls src/models/
ls src/lib/db/dao/
ls src/services/repositories/
```

If SDD is missing → stop and report:
```
⛔ SDD not found: .ai/_sdd/$ARGUMENTS.sdd.md
Run /business-to-sdd $ARGUMENTS first.
```

---

## Read Before Implementing

1. `.ai/_sdd/$ARGUMENTS.sdd.md` — the full spec
2. `.ai/agents/engineer.md` — your behavior contract
3. `.ai/agents/architect.md` — architecture rules
4. `src/lib/db/migrations.ts` — current schema (to add your migration)
5. `src/navigation/Navigation.tsx` — to register your new screen
6. `src/services/repositories/` — existing repository patterns to follow
7. Any existing model that your feature extends or relates to

---

## Implementation Checklist

Work through each item in order. Mark each as done before moving to the next.

### 1. Domain Model
- File: `src/models/[entity].ts`
- TypeScript interface only
- No DTO fields (no snake_case API names)

### 2. DTO
- File: `src/services/api/[domain]/[entity].dto.ts`
- Matches exact API response shape
- Separate from domain model

### 3. SQLite Migration
- File: `src/lib/db/migrations.ts`
- Add new `case` in the migration runner for the new table(s)
- Columns from SDD Section 7 (Data Layer)

### 4. DAO
- File: `src/lib/db/dao/[entity].dao.ts`
- Methods: `getAll`, `getById`, `upsert`, `deleteById` (at minimum)
- Only `expo-sqlite` calls — no business logic

### 5. Repository
- File: `src/services/repositories/[entity].repository.ts`
- `list()` → reads SQLite, triggers background API sync
- `getById(id)` → reads SQLite
- `upsert(entity)` → writes SQLite + API
- `deleteById(id)` → deletes SQLite + API
- Emits `onChange` for hook subscriptions

### 6. API Service
- File: `src/services/api/[domain]/[entity].service.ts`
- HTTP calls only — no SQLite
- Maps DTO → Domain model
- Called by Repository only

### 7. Hook
- File: `src/screens/[feature]/[feature].hook.ts`
- Subscribes to Repository `onChange`
- Exposes: `{ data, loading, error, [actions] }`
- All business logic here

### 8. Functional Screen
- File: `src/screens/[feature]/[feature].screen.tsx`
- Only RN primitives: `View`, `Text`, `TextInput`, `TouchableOpacity`, `FlatList`, `ScrollView`, `ActivityIndicator`
- Zero business logic
- All interactive elements have `// TODO: ui-polish` comment
- Handles: loading, error, empty, data states

### 9. Navigation Registration
- Add screen to `src/navigation/Navigation.tsx`
- Add type to navigation type definitions if typed

### 10. Tests
- `src/screens/[feature]/__tests__/[feature].hook.test.ts`
- `src/lib/db/dao/__tests__/[entity].dao.test.ts` (if new DAO)

---

## Post-implementation Validation

```bash
# TypeScript must pass (no new errors beyond baseline)
yarn tsc --noEmit

# Lint must pass
yarn lint

# Tests must pass
yarn test --testPathPattern=[feature]
```

If any validation fails → fix before reporting done.

---

## Report

When complete, output:

```
✅ Logic implementation complete: [feature-name]

Files created:
- src/models/[entity].ts
- src/services/api/[domain]/[entity].dto.ts
- src/services/api/[domain]/[entity].service.ts
- src/lib/db/dao/[entity].dao.ts
- src/services/repositories/[entity].repository.ts
- src/screens/[feature]/[feature].hook.ts
- src/screens/[feature]/[feature].screen.tsx (functional, unstyled)
- src/screens/[feature]/__tests__/[feature].hook.test.ts

TypeScript: ✅ no new errors
Lint: ✅ passing
Tests: ✅ passing

Next step: /ui-polish [feature-name]
```

---

## Arguments

`$ARGUMENTS` — feature name (required). Must match SDD filename without extension.
