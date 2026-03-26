> **[PT]** Este ficheiro define os princípios de engenharia do repositório, explicando o "porquê" por trás das decisões arquiteturais, práticas de código e cultura de desenvolvimento da equipa.

---

# 🧠 Engineering Principles — React Native Mobile

> This document defines the engineering philosophy of this repository. It explains _why_ we build
> software the way we do.

These principles guide architectural decisions, code reviews, and long-term evolution of the system.

They are not optional.

---

# 🎯 Purpose

Rules define _what_ must be done. Principles define _why_ we do it.

When rules conflict, evolve, or require interpretation, these principles guide the decision.

---

# 1️⃣ Clarity Over Cleverness

Code must be explicit.

We prefer:

- Readable over concise
- Predictable over smart
- Clear naming over abstraction tricks
- Explicit types over inference magic

If code requires explanation, it is too clever.

---

# 2️⃣ Architecture Before Speed

Short-term speed must never compromise long-term scalability.

We do not:

- Put logic in screens for convenience
- Skip layers to save time
- Ignore structure for quick delivery

Correct architecture reduces future complexity.

---

# 3️⃣ Determinism Over Convenience

The system must behave predictably.

We avoid:

- Hidden global mutations
- Side effects in render
- Uncontrolled implicit behavior
- Unmockable dependencies

Code should produce the same result under the same inputs.

Always.

---

# 4️⃣ Isolation By Default

Everything should be isolated:

- Features from other features
- UI from business logic
- Services from UI
- Domain from framework
- External dependencies from core logic

Isolation enables:

- Testability
- Refactoring
- Scalability
- Stability

Coupling is a cost. Minimize it.

---

# 5️⃣ Type Safety Is a Contract

TypeScript is not decoration.

Types are:

- Documentation
- Contract
- Protection
- Architecture boundary

If something requires `any`, architecture must be reconsidered.

---

# 6️⃣ Testability Is Non-Negotiable

Code that cannot be tested is incomplete.

We value:

- Isolated hooks
- Mockable services
- Deterministic behavior
- High coverage on logic layers

Testing is not for coverage metrics. Testing is for confidence.

---

# 7️⃣ Performance Is a Feature

Performance is not a late optimization.

We design with:

- JS thread awareness
- Native thread awareness
- 16ms frame budget
- Proper list virtualization
- Measured rendering behavior

We measure before optimizing. We optimize with evidence.

---

# 8️⃣ Boundaries Protect Scalability

Feature boundaries are sacred.

Cross-feature coupling creates invisible technical debt.

We protect:

- Domain separation
- Encapsulation
- Folder structure discipline
- Naming consistency

Boundaries allow the system to grow safely.

---

# 9️⃣ Simplicity Scales

Complex solutions are last resort.

We prefer:

- Small functions
- Pure functions
- Flat structures
- Explicit flow

If a solution increases cognitive load, it must provide measurable value.

---

# 🔟 Discipline At The Git Boundary

Quality is enforced at commit time.

Nothing enters the repository without:

- Structure
- Tests
- Review
- Passing checks
- Explicit confirmation

Process discipline protects code integrity.

---

# 1️⃣1️⃣ Measure Before Optimize

Never optimize blindly.

We:

1. Identify the bottleneck
2. Measure it
3. Apply targeted fix
4. Re-measure

Optimization without measurement is guesswork.

---

# 1️⃣2️⃣ Long-Term Thinking

We write code for:

- The next developer
- The next refactor
- The next scale phase
- The next year

If a decision creates hidden complexity, it is rejected.

---

# 🏁 Final Principle

We build software that is:

- Predictable
- Scalable
- Measurable
- Isolated
- Typed
- Testable
- Maintainable

If a change violates these qualities, it must be reconsidered.

Engineering is discipline, not improvisation.
