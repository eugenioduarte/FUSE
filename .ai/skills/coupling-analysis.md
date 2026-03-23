---
name: coupling-analysis
version: 1.0.0
author: Eugénio Silva
created: 2026-03-01
updated: 2026-03-23
---

> **[PT]** Skill para analisar e melhorar o acoplamento de código com base nos princípios de Balanced Coupling adaptados para React Native.

---

# 🔗 Coupling Analysis Skill

> This skill provides deep analysis of code coupling and suggests improvements based on "Your Code as a Crime Scene" and coupling analysis principles, specifically adapted for React Native architecture.

---

## 🎯 Purpose

Analyze coupling in the codebase to:

- Identify tightly coupled modules that increase change cost
- Detect hidden dependencies and temporal coupling
- Suggest refactoring strategies to balance coupling
- Improve modularity and testability
- Reduce change fragility

**Key Principle:** Not all coupling is bad. The goal is **balanced coupling** — high cohesion within modules, low coupling between unrelated modules, and intentional coupling where dependencies are explicit and justified.

---

## 📚 Coupling Types in React Native

### 1. **Structural Coupling**

Direct dependencies between modules.

```typescript
// ❌ Bad: Screen directly depends on API
import { fetchUserAPI } from '@/services/api/user'

export function UserScreen() {
  const data = fetchUserAPI() // Tight coupling
}

// ✅ Good: Screen depends on abstraction (hook)
import { useUser } from '@/hooks/useUser'

export function UserScreen() {
  const { data } = useUser() // Loose coupling via hook
}
```

**Analysis:**

- Count import statements per file
- Map dependency graph
- Identify circular dependencies
- Flag directly imported services in screens

---

### 2. **Temporal Coupling**

Hidden dependencies in execution order.

```typescript
// ❌ Bad: Order matters, but not explicit
function MyComponent() {
  const [user, setUser] = useState()
  const [posts, setPosts] = useState()

  // Must call fetchUser before fetchPosts (temporal coupling)
  fetchUser().then((u) => setUser(u))
  fetchPosts(user.id).then((p) => setPosts(p)) // Breaks if user not loaded
}

// ✅ Good: Make dependency explicit
function MyComponent() {
  const { user } = useUser()
  const { posts } = usePosts(user?.id) // Explicit dependency
}
```

**Analysis:**

- Identify useEffects with multiple dependencies
- Flag sequential async calls without dependency tracking
- Suggest query hooks to manage temporal relationships

---

### 3. **Data Coupling**

Sharing data structures between unrelated modules.

```typescript
// ❌ Bad: DTO leaking into UI
type UserDTO = { user_name: string; created_at: string }

function UserProfile({ user }: { user: UserDTO }) {
  return <Text>{user.user_name}</Text> // UI couples to API shape
}

// ✅ Good: Transform at boundary
type User = { name: string; createdAt: Date }

function UserProfile({ user }: { user: User }) {
  return <Text>{user.name}</Text> // UI couples to domain model
}
```

**Analysis:**

- Flag DTOs used outside service layer
- Detect snake_case in React components (API leakage)
- Suggest model transformations at boundaries

---

### 4. **Platform Coupling**

Direct dependency on React Native internals.

```typescript
// ❌ Bad: Platform details in business logic
import { Platform } from 'react-native'

function calculatePrice(base: number) {
  if (Platform.OS === 'ios') {
    return base * 1.3 // iOS tax
  }
  return base
}

// ✅ Good: Extract platform concerns
const TAX_RATE = Platform.select({ ios: 1.3, android: 1.0 })

function calculatePrice(base: number) {
  return base * TAX_RATE // Pure business logic
}
```

**Analysis:**

- Flag Platform checks in business logic
- Suggest extracting platform constants
- Move platform coupling to UI layer only

---

### 5. **Global State Coupling**

Shared mutable state creating hidden dependencies.

```typescript
// ❌ Bad: Multiple screens mutate same store
import { useAuthStore } from '@/store/useAuthStore'

function ScreenA() {
  const setUser = useAuthStore((s) => s.setUser)
  setUser(newUser) // Mutates global state
}

function ScreenB() {
  const user = useAuthStore((s) => s.user) // Implicitly coupled to ScreenA
}

// ✅ Good: Explicit actions with clear ownership
function ScreenA() {
  const login = useLogin() // Explicit mutation
  login(credentials)
}

function ScreenB() {
  const { user } = useAuth() // Read-only access
}
```

**Analysis:**

- Map Zustand store usage across features
- Flag direct state mutations from multiple locations
- Suggest action-based APIs for state changes

---

## 🔍 Analysis Techniques

### 1. **Dependency Graph Analysis**

```typescript
// Generate dependency graph
interface DependencyNode {
  file: string
  imports: string[]
  importedBy: string[]
  depth: number // Distance from entry point
}

// Calculate metrics
function analyzeCoupling(graph: DependencyNode[]) {
  return {
    fanIn: countImportedBy(node), // How many depend on this
    fanOut: countImports(node), // How many this depends on
    instability: fanOut / (fanIn + fanOut), // 0 = stable, 1 = unstable
  }
}
```

**Red Flags:**

- `fanOut > 10` — Module depends on too many things
- `fanIn > 20` — Module is overused (potential god object)
- `instability > 0.8` && `fanIn > 5` — Unstable module with many dependents (fragile)

---

### 2. **Change Frequency Correlation**

```typescript
// Analyze git history
interface ChangePattern {
  file: string
  changes: number
  coChanges: Map<string, number> // Files changed together
}

// If FileA and FileB always change together → temporal coupling
function detectTemporalCoupling(history: ChangePattern[]) {
  return findCoChangingFiles(history, (threshold = 0.7))
}
```

**Red Flags:**

- Files in different features changing together > 70% of the time
- Screen+Service changing together (should be Screen→Hook→Service)

---

### 3. **Import Pattern Analysis**

```bash
# Find screens importing services directly
grep -r "from '@/services" src/screens/

# Find Utils imported in more than 10 places
grep -r "from '@/utils/specificUtil" src/ | wc -l
```

**Red Flags:**

- Screens importing from `/services` (should use hooks)
- Utility modules imported > 20 places (extract to separate package)
- Circular imports detected

---

## 🎨 Refactoring Strategies

### Strategy 1: **Introduce Abstraction Layer**

**When:** Module has high fanIn (over-used)

```typescript
// Before: Everyone imports DB directly
import { db } from '@/services/database'

// After: Introduce repository pattern
import { userRepository } from '@/services/repositories/userRepository'
```

---

### Strategy 2: **Extract Interface**

**When:** Two unrelated features depend on same concrete implementation

```typescript
// Before: Both features use AsyncStorage directly
import AsyncStorage from '@react-native-async-storage/async-storage'

// After: Extract storage interface
interface Storage {
  get(key: string): Promise<string | null>
  set(key: string, value: string): Promise<void>
}

const storage: Storage = createAsyncStorageAdapter()
```

---

### Strategy 3: **Dependency Inversion**

**When:** High-level module depends on low-level module

```typescript
// Before: Screen depends on Firebase
import { firebase } from '@/services/firebase'

function ProfileScreen() {
  const user = firebase.auth().currentUser // Tight coupling
}

// After: Screen depends on abstraction
import { useAuth } from '@/hooks/useAuth'

function ProfileScreen() {
  const { user } = useAuth() // Hook abstracts Firebase
}
```

---

### Strategy 4: **Event-Driven Decoupling**

**When:** Two features need to communicate but shouldn't know about each other

```typescript
// Before: Direct call creating coupling
import { refreshDashboard } from '@/screens/Dashboard'

function completeTask() {
  markComplete()
  refreshDashboard() // Tight coupling
}

// After: Event-based
import { emitEvent } from '@/events'

function completeTask() {
  markComplete()
  emitEvent('task:completed', { taskId }) // Loose coupling
}
```

---

### Strategy 5: **Feature Cohesion**

**When:** Scattered related code across the codebase

```typescript
// Before: User logic scattered
src/screens/UserProfile/
src/hooks/auth/
src/services/api/users.ts
src/utils/userHelpers.ts

// After: Cohesive feature folder
src/features/user/
  ├── screens/
  ├── hooks/
  ├── services/
  └── utils/
```

---

## 📊 Coupling Metrics

### Target Metrics for React Native

| Metric                                      | Target  | Warning        | Critical |
| ------------------------------------------- | ------- | -------------- | -------- |
| Fan-Out (dependencies per file)             | < 7     | 7-10           | > 10     |
| Fan-In (dependents per file)                | < 15    | 15-25          | > 25     |
| Instability (I = fanOut / (fanIn + fanOut)) | 0.3-0.7 | < 0.2 or > 0.8 | 0 or 1   |
| Cyclomatic Complexity                       | < 10    | 10-15          | > 15     |
| Co-change Frequency                         | < 50%   | 50-70%         | > 70%    |
| Import Depth                                | < 4     | 4-6            | > 6      |

---

## 🧪 Analysis Commands

```bash
# 1. Find highly coupled files (many imports)
grep -r "^import" src/ | cut -d: -f1 | sort | uniq -c | sort -nr | head -20

# 2. Find frequently changed together (git history)
git log --format='' --name-only --since='3 months ago' | \
  grep -v '^$' | sort | uniq -c | sort -nr

# 3. Detect circular dependencies
npx madge --circular --extensions ts,tsx src/

# 4. Visualize dependency graph
npx madge --image graph.png src/
```

---

## 🎯 Analysis Workflow

### Step 1: Measure Current State

```typescript
// Generate coupling report
{
  totalFiles: 450,
  avgFanOut: 6.2,
  avgFanIn: 8.5,
  circularDeps: 3,
  highCouplingFiles: [
    { file: 'utils/helpers.ts', fanIn: 45 },
    { file: 'screens/Dashboard.tsx', fanOut: 18 },
  ]
}
```

### Step 2: Identify Problem Areas

- Files with fanIn > 20 (overused)
- Files with fanOut > 10 (over-dependent)
- Circular dependencies
- Screen → Service direct coupling

### Step 3: Prioritize Refactoring

1. **Critical:** Circular dependencies (breaks build)
2. **High:** Screen → Service coupling (architecture violation)
3. **Medium:** High fanIn utils (create library)
4. **Low:** High fanOut (reduce dependencies incrementally)

### Step 4: Apply Strategy

- Use one of the 5 refactoring strategies
- Validate with tests
- Measure improvement

### Step 5: Prevent Regression

- Add architectural tests (no Screen imports Service)
- Git hooks to prevent circular deps
- Regular coupling analysis in CI

---

## 🚨 Anti-Patterns to Detect

### 1. **God Object**

```typescript
// utils/helpers.ts imported everywhere
fanIn > 30 && exports > 20
```

**Fix:** Split by domain

---

### 2. **Feature Envy**

```typescript
// Feature A constantly uses Feature B's internals
import { getPrivateState } from '@/features/B/internal'
```

**Fix:** Extract shared logic or add public API

---

### 3. **Shotgun Surgery**

```typescript
// Changing one feature requires changes in 5+ files
coChangeFrequency(['A', 'B', 'C', 'D', 'E']) > 0.8
```

**Fix:** Increase cohesion, move related code together

---

### 4. **Middle Man**

```typescript
// Hook just forwards to service
function useUser() {
  return userService.getUser() // Unnecessary indirection
}
```

**Fix:** Remove if no transformation/caching/logic

---

## ✅ Balanced Coupling Checklist

For each module, ensure:

- [ ] **Clear responsibility** — Single, well-defined purpose
- [ ] **Explicit dependencies** — No hidden coupling
- [ ] **Stable abstractions** — Depend on interfaces, not implementations
- [ ] **Low fan-out** — Depends on < 7 modules
- [ ] **Appropriate fan-in** — Used by appropriate number of consumers
- [ ] **No circular deps** — Clean dependency hierarchy
- [ ] **Feature cohesion** — Related code lives together
- [ ] **Layer separation** — Screens don't import Services

---

## 📚 References

- "Your Code as a Crime Scene" by Adam Tornhill
- "Structured Design" by Stevens, Myers, Constantine
- React Native architecture patterns
- Clean Architecture by Robert Martin

---

## 🎓 When to Use This Skill

Invoke coupling analysis when:

- Adding new features (prevent coupling increase)
- Refactoring existing code (reduce coupling)
- Code review (enforce coupling rules)
- Architecture review (validate layer separation)
- Performance issues (tight coupling often causes performance problems)
- Difficulty testing (tight coupling makes testing hard)

This skill should be used by:

- `coupling-analyzer` agent (primary)
- `code-reviewer` agent (validation)
- `frontend-architect` agent (architectural decisions)
