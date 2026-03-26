---
name: engineering-principles
description: Core engineering philosophy for this repository — the "why" behind architectural decisions, code standards, and design trade-offs.
allowed-tools: Read, Grep, Glob
---

# Engineering Principles

Use this skill when making architectural decisions, reviewing design trade-offs, or interpreting rules that appear to conflict. These principles explain the reasoning behind the rules — not additional rules themselves.

---

## 1. Clarity Over Cleverness

Code must be explicit. Prefer readable over concise, predictable over smart, clear naming over abstraction tricks. If code requires explanation to understand, it is too clever.

## 2. Architecture Before Speed

Short-term speed must never compromise long-term scalability. Screens do not own logic. Layers are not skipped to save time. Correct architecture reduces future complexity — it does not add it.

## 3. Determinism Over Convenience

The system must behave predictably under the same inputs. Avoid hidden global mutations, side effects in render, and uncontrolled implicit behavior. Unmockable dependencies are an architecture failure.

## 4. Isolation By Default

Features, UI, services, domain, and external dependencies must be isolated from each other. Coupling is a cost — minimize it. Isolation enables testability, refactoring, and stability.

## 5. Type Safety Is a Contract

TypeScript is not decoration. Types are documentation, contract, protection, and architecture boundary. If something requires `any`, reconsider the architecture — not the type.

## 6. Testability Is Non-Negotiable

Code that cannot be tested is incomplete. Hooks must be isolatable. Services must be mockable. High coverage on logic layers is a confidence mechanism, not a vanity metric.

## 7. Performance Is a Feature

Performance is not a late optimization. Design with JS/native thread awareness and 16ms frame budget in mind. Measure before optimizing. Optimize with evidence, not assumption.

## 8. Boundaries Protect Scalability

Feature boundaries are sacred. Cross-feature coupling creates invisible technical debt. Encapsulation, naming consistency, and folder discipline allow the system to grow safely.

## 9. Simplicity Scales

Complex solutions are a last resort. Prefer small pure functions, flat structures, and explicit flow. If a solution increases cognitive load, it must provide measurable value to justify that cost.

## 10. Discipline At The Git Boundary

Quality is enforced at commit time. Nothing enters the repository without structure, tests, review, and passing checks. Process discipline protects code integrity.

## 11. Measure Before Optimize

Never optimize blindly. Identify the bottleneck, measure it, apply a targeted fix, re-measure. Optimization without measurement is guesswork with extra steps.

## 12. Long-Term Thinking

Write code for the next developer, the next refactor, the next scale phase. If a decision creates hidden complexity for future maintainers, it must be reconsidered before merging.
