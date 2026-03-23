---
name: react-native-best-practices
version: 1.0.0
author: Eugénio Silva
created: 2026-03-01
updated: 2026-03-23
---

> **[PT]** Este ficheiro define as boas práticas técnicas específicas para React Native, cobrindo o modelo de threads, virtualização de listas, gestão de memória, performance e considerações da Nova Arquitetura.

---

This document is mandatory and overrides default model behavior.

# 📱 React Native Best Practices — Mobile

> This document defines technical best practices specific to React Native. It complements
> architecture and clean code rules. These practices prevent performance, memory, and scalability
> issues.

---

# 🎯 Purpose

React Native is not just React.

It has:

- A JS thread
- A UI thread
- A native bridge (or JSI/Fabric)
- Frame budget constraints
- Mobile memory limits

These best practices exist to respect that environment.

---

# 1️⃣ Understand the Thread Model

React Native runs on:

- JS Thread (business logic, React rendering)
- UI Thread (layout, gestures, animations)
- Native Modules (background execution)

Rules:

- Never block JS thread.
- Never perform heavy computation inside render.
- Avoid synchronous native calls.
- Heavy native work must be async.

JS frame budget ≈ 16ms (60 FPS).

If you exceed it, UI stutters.

---

# 2️⃣ Virtualize Lists Always

Never render dynamic lists with ScrollView.

Use:

- FlashList (preferred for large datasets)
- FlatList (standard)

Rules:

- Always provide `keyExtractor`
- Use `estimatedItemSize` (FlashList)
- Memoize `renderItem`
- Avoid inline arrow functions inside renderItem

Lists are the #1 source of performance issues.

---

# 3️⃣ Avoid Unnecessary Re-renders

Use:

- Stable references
- Memoization only when needed
- Selectors for store subscriptions
- Isolated state

Do NOT:

- Wrap everything in useMemo blindly
- Use global context for frequently changing state
- Pass large objects as props unnecessarily

Measure before optimizing.

---

# 4️⃣ Keep Render Pure

Render must:

- Not fetch data
- Not mutate state
- Not trigger navigation
- Not perform heavy transformations

Prepare data in hook. Render must be declarative.

---

# 5️⃣ Prefer Uncontrolled Inputs for High-Frequency Typing

Controlled inputs may cause lag on legacy architecture.

Prefer:

- `defaultValue`
- Debounced updates
- Deferred rendering (useDeferredValue)

Input responsiveness has priority.

---

# 6️⃣ Use Reanimated for Complex Animations

For gestures and heavy animations:

- Use Reanimated (UI thread execution)
- Avoid JS-driven animation loops
- Avoid expensive layout recalculation per frame

Animations must not block JS thread.

---

# 7️⃣ Avoid Deep Component Trees

Deep trees increase:

- Render cost
- Layout calculation
- Debug difficulty

Extract components logically. Avoid wrapper-only View chains.

---

# 8️⃣ Memory Safety

Always:

- Cleanup listeners in useEffect
- Clear timers
- Cancel async operations when unmounted
- Avoid retaining large closures

Memory leaks degrade performance over time.

Mobile devices have limited RAM.

---

# 9️⃣ Navigation Best Practices

- Keep navigation logic minimal in screen
- Avoid passing large objects through params
- Pass IDs instead of full objects
- Type navigation params strictly
- Avoid deep nested navigators without need

Navigation state impacts performance.

---

# 🔟 Avoid Heavy Work in useEffect

useEffect must not:

- Perform heavy sync calculations
- Chain multiple large async calls without control
- Trigger cascading state updates

Split responsibilities. Keep effects focused.

---

# 1️⃣1️⃣ Optimize Startup Time

Avoid:

- Heavy synchronous initialization
- Large static imports
- Blocking logic before first screen

Defer non-critical initialization.

Measure Time To Interactive (TTI) in release mode.

---

# 1️⃣2️⃣ Prefer Native SDKs Over JS Polyfills

If performance-sensitive:

- Prefer native crypto over crypto-js
- Prefer native stack navigation
- Avoid heavy JS polyfills when native alternative exists

JS is slower than native for CPU-bound work.

---

# 1️⃣3️⃣ Respect the New Architecture

If using:

- Fabric
- TurboModules
- React Compiler

Ensure:

- No sync blocking calls
- No reliance on legacy behavior
- Proper invalidation of native resources

Architecture must align with runtime capabilities.

---

# 1️⃣4️⃣ Bundle Size Awareness

Large bundle impacts:

- Startup time
- Memory
- OTA updates

Avoid:

- Unused libraries
- Large utility packages for small usage
- Duplicate dependencies

---

# 1️⃣5️⃣ Avoid Overusing Global State

Global state should not:

- Store ephemeral UI state
- Replace local state
- Manage transient UI flags

Local state is cheaper and safer.

---

# 1️⃣6️⃣ Measure Performance Before Refactoring

When performance is questioned:

1. Measure FPS
2. Profile React re-renders
3. Identify bottleneck
4. Apply targeted fix
5. Re-measure

Optimization without measurement is guessing.

---

# 🧠 React Native Mental Model

Always think:

- Is this running on JS thread?
- Could this block rendering?
- Is this safe under 16ms?
- Is this list virtualized?
- Is this causing unnecessary re-renders?
- Is this safe under low-memory conditions?

Mobile constraints are real.

---

# 🏁 Final Rule

React Native performance issues are architectural, not cosmetic.

Design for:

- Frame safety
- Memory safety
- Isolation
- Measurability

If unsure, default to the simpler and safer approach.
