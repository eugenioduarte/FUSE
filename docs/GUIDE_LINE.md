# 📘 Project – Official Guideline

This document defines **all mandatory rules** that must always be followed by the entire team in every commit, PR, component and architectural decision.

---

# ✅ 1. Commits

- **Always in English.**
- **Maximum of 100 characters.**
- Must follow Husky rules.
- Recommended format:
  - `feat: add user authentication flow`
  - `fix: correct validation error on form submit`
  - `refactor: extract hook for data fetching`
  - `test: add unit tests for Button component`
  - `docs: update API documentation`

---

# ✅ 2. Styles (CSS)

All styling must follow the pattern:

```ts
const createStyles = (theme: Theme, color?: string) =>
  StyleSheet.create({
    // ...styles
  })
```

**Style Rules:**

- ❌ Inline styles are forbidden.
- ❌ Creating `StyleSheet.create` outside of `createStyles` is forbidden.
- ❌ Hard-coded colors (e.g., `'#fff'`) are forbidden.
- ✔ Colors must come from the theme.
- ✔ Typography must come from the theme.
- ✔ Spacing must come from the theme.

---

# ✅ 3. Text Strings

- **No free text can exist inside the code.**
- All text must be stored inside `pt.json` (or equivalent i18n files).
- Instead of literal text, always reference translation keys:

```tsx
<Text>{t('home.welcomeMessage')}</Text>
```

---

# 🚫 4. `any` is Forbidden

- Never use `any`.
- If needed, create:
  - Explicit types
  - Interfaces
  - DTOs
  - Utility types

- If something is unknown, use `unknown` and validate.

---

# ♻ 5. Clean Code – General Rules

These rules must be followed **strictly**.

## Variables

- Names must be **clear**, **descriptive**, and **in English**.
- ❌ Abbreviations are forbidden (except universal ones like `id`, `url`).

## React Components

- A component must have **one single purpose**.
- ❌ Must not exceed **200 lines** (refactor if needed).
- Avoid more than **3 levels of nesting**.
- Extract reusable pieces whenever possible.

## Functions

- Must be **small**, descriptive, and do only one thing.
- The name must be a **verb**.

## Hooks

- Shared logic must be extracted into hooks.
- Hooks must start with `use`.
- Avoid huge hooks (max 200 lines).

## Import Order

1. React
2. External libraries
3. Hooks
4. Local components
5. Utils
6. Styles
7. Types

---

# 🧪 6. Tests

- Every component must have tests.
- Tests must live next to the component.
- Avoid unnecessary manual mocks.
- Always use **React Testing Library**.

---

# 📁 7. Folder Structure

Recommended structure:

```
app/
  components/
  screens/
  hooks/
  services/
  store/
  navigation/
  theme/
  i18n/
  utils/
```

---

# 🔒 8. Typing

- Everything must be typed.
- Required props must be explicitly annotated.
- Never export meaningless generic types.

---

# 🧹 9. SOLID

The project must strictly follow the SOLID principles:

- **S** – Single Responsibility
- **O** – Open/Closed
- **L** – Liskov Substitution
- **I** – Interface Segregation
- **D** – Dependency Inversion

---

# 📝 10. Code Standards

- Inline functions are forbidden.
- Loading states must not be aggregated.
- Avoid comments (except `TODO:`).
- Code must be self-explanatory.

---

# 🚀 11. Performance

- Avoid unnecessary re-renders.
- Use `useMemo`, `useCallback`, `React.memo` when appropriate.
- Avoid heavy calculations inside JSX.

---

# 🔐 12. Security

- Never log sensitive data.
- Always validate input (Zod recommended).

---

# 📦 13. DTOs & API Communication

- All fetch responses must have DTOs.
- Validate external data before using it.
- Never trust external sources.

---

# 🧭 14. Navigation

- Routes must be centralized.
- Navigation parameters must be typed.

---

# ⭐ 15. PR Quality

A Pull Request can only be approved if:

- It follows all the rules above.
- It has a clear and descriptive explanation.
- At least one reviewer has approved.
- There is no console.log.
- Everything is fully typed.
- All tests are passing.

---

# 🧩 16. UI vs Logic Separation

- Components must contain **UI only**.
- All logic must be extracted into custom hooks.
- Hooks handle data, validation, async calls, derived state, and business rules.

---

# 📌 17. Golden Rule

> **Any PR that does not follow these rules will be automatically rejected.**

---

If you want, I can also generate a version for README, onboarding, or a printable cheat sheet.
