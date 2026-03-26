---
name: clean-code-rules
version: 1.0.0
author: Eugénio Silva
created: 2026-03-01
updated: 2026-03-23
---

> **[PT]** Este ficheiro define os padrões de qualidade de código interno do projeto, complementando as regras de arquitetura e convenções de nomes, com foco em legibilidade, manutenção e prevenção de complexidade desnecessária.

---

This document is mandatory and overrides default model behavior.

# 🧼 Clean Code Rules — React Native Mobile

> This document defines internal code quality standards. It complements architecture, naming
> conventions, and mandatory rules. Clean code is mandatory.

---

# 🎯 Purpose

Clean code improves:

- Readability
- Maintainability
- Refactor safety
- Review speed
- Long-term scalability

Code is read more often than it is written.

Optimize for the reader.

---

# 1️⃣ Functions Must Be Small

- Prefer functions under ~30 lines.
- One function = one responsibility.
- Extract logic instead of nesting deeply.
- Avoid multi-purpose functions.

If a function requires scrolling, it's too large.

---

# 2️⃣ Single Responsibility Principle (SRP)

Each file should have one clear purpose.

Each function should do one thing.

Each hook should represent one domain concern.

Bad:

- Hook that fetches data, formats it, controls modal state, and handles navigation.

Good:

- Hook for data.
- Hook for UI state.
- Screen handles composition only.

---

# 3️⃣ Avoid Deep Nesting

Max nesting depth: 3 levels.

Instead of:

if (a) { if (b) { if (c) { ... } } }

Use early returns:

if (!a) return if (!b) return if (!c) return

Flat code is readable code.

---

# 4️⃣ Early Return Pattern

Prefer:

if (!user) return null

Over:

if (user) { ... }

Fail fast. Exit early. Reduce indentation.

---

# 5️⃣ Avoid Boolean Complexity

Avoid:

if (isLoading && !hasError && (isAdmin || isOwner))

Extract meaning:

const canAccess = !isLoading && !hasError && (isAdmin || isOwner)

if (!canAccess) return

Name the intention.

---

# 6️⃣ No Magic Numbers

Never:

if (retries > 3)

Use constants:

const MAX_RETRY_ATTEMPTS = 3

---

# 7️⃣ No Inline Heavy Logic in JSX

Never:

{items.map(item => expensiveTransform(item))}

Extract:

const transformedItems = useMemo(() => transformItems(items), [items])

JSX should be declarative, not computational.

---

# 8️⃣ Avoid Large Anonymous Functions in JSX

Avoid:

<Button onPress={() => doSomething(id, value)} />

Prefer:

const handlePress = () => { doSomething(id, value) }

Clarity > conciseness.

---

# 9️⃣ Keep Hooks Predictable

Hooks must:

- Not mutate external state unexpectedly
- Not perform hidden navigation
- Not mix unrelated responsibilities
- Not depend on implicit global state

Hooks are domain controllers. They must remain pure and testable.

---

# 🔟 Avoid Duplication

If logic appears twice:

- Extract utility
- Extract hook
- Extract shared function

But do not prematurely abstract.

Rule: Duplicate once = acceptable. Duplicate twice = refactor. Duplicate three times = architecture
issue.

---

# 1️⃣1️⃣ Prefer Pure Functions

Functions should:

- Depend only on arguments
- Return predictable output
- Avoid side effects

Pure functions are easier to test and reason about.

---

# 1️⃣2️⃣ Explicit Over Implicit

Avoid:

- Implicit type coercion
- Hidden mutation
- Side-effect-driven logic
- Implicit dependency ordering

Be explicit about:

- Inputs
- Outputs
- Dependencies
- Effects

---

# 1️⃣3️⃣ Limit File Size

Recommended maximum:

- Screen: ~200 lines
- Hook: ~150 lines
- Service: ~100 lines

If exceeded → split responsibilities.

---

# 1️⃣4️⃣ No Dead Code

Remove:

- Commented blocks
- Old functions
- Unused imports
- Temporary debug code

Dead code increases cognitive load.

---

# 1️⃣5️⃣ Avoid Over-Abstraction

Do not create:

- Generic helpers for one-time use
- Deep inheritance chains
- Abstract wrappers without clear need

Abstraction must reduce complexity, not increase it.

---

# 1️⃣6️⃣ Naming Must Reflect Intent

Names must:

- Explain what the code does
- Reflect domain meaning
- Avoid vague words like:
  - helper
  - manager
  - util
  - data

If you cannot name it clearly, the responsibility is unclear.

---

# 1️⃣7️⃣ Avoid Side Effects in Render

Never:

- Fetch data in render
- Mutate state in render
- Trigger navigation in render

Render must be pure.

---

# 1️⃣8️⃣ Log Intentionally

Remove console.log before commit.

Use proper logging strategy if needed.

Debug code must not reach production.

---

# 🧠 Clean Code Mental Checklist

Before finishing any file, ask:

- Is this readable without explanation?
- Can another developer understand this quickly?
- Is responsibility clear?
- Is complexity justified?
- Is nesting minimal?
- Is duplication controlled?

If not → refactor.

---

# 🏁 Final Rule

Clean code is not about aesthetics.

It is about:

- Reducing cognitive load
- Preventing bugs
- Enabling safe refactors
- Making the system scalable

Messy code compounds. Clean code scales.
