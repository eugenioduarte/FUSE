> **[PT]** Plano de implementação para internacionalização completa do app — extração de todas as strings hardcoded para os ficheiros de tradução PT/EN.

---

# SDD — Task #1: Internationalization

**Status:** Planned
**Priority:** High
**Agent:** `react-native-engineer`

---

## 🎯 Goal

Move every hardcoded string in `.tsx` and `.ts` files to the translation files (`src/locales/pt.json` and `src/locales/en.json`). All text displayed to the user must be rendered via the `t()` function from `i18next`.

---

## 📦 Scope

### Files Affected
- All `*.tsx` screen files under `src/screens/`
- All `*.tsx` component files under `src/components/`
- `src/locales/pt.json` — add all keys with Portuguese values
- `src/locales/en.json` — add all keys with English values

### Files to Reference
- `src/locales/pt.json` — current translation keys structure
- `src/locales/en.json` — current translation keys structure
- `src/hooks/` — check if a `use-translation` hook already exists

---

## 🏗 Architecture Decisions

- Use `i18next` + `react-i18next` (already configured)
- Translation key format: `<domain>.<screen>.<key>` — e.g., `auth.login.title`
- Never use raw strings in JSX — always `t('key')`
- Keep keys flat within each domain namespace
- Both PT and EN keys must be added simultaneously — no missing keys allowed

---

## 📋 Implementation Plan

### Step 1 — Audit hardcoded strings
```bash
# Find all JSX text that is not a translation call
grep -rn --include="*.tsx" '"[A-Z]' src/screens/ src/components/
grep -rn --include="*.tsx" "'[A-Z]" src/screens/ src/components/
```
Output: list of all files and lines with hardcoded strings.

### Step 2 — Define translation key taxonomy
Create a key map following the pattern:
```
auth.login.title
auth.login.subtitle
auth.register.title
...
main.dashboard.greeting
main.topic.empty_state
...
```

### Step 3 — Update `pt.json` and `en.json`
Add all keys to both files. PT values are the existing Portuguese strings. EN values are the English equivalents.

### Step 4 — Replace strings in components/screens
For each file identified in Step 1:
- Import `useTranslation` from `react-i18next`
- Replace hardcoded string with `t('key')`
- Example:
  ```tsx
  // Before
  <Text>Entrar</Text>
  // After
  const { t } = useTranslation()
  <Text>{t('auth.login.submit')}</Text>
  ```

### Step 5 — Validate coverage
```bash
# Check for any remaining raw uppercase strings in JSX
grep -rn --include="*.tsx" '>[A-Z][a-z]' src/screens/ src/components/ | grep -v "t('"
```

### Step 6 — Test
- Run app in PT locale — verify all strings display correctly
- Switch to EN locale — verify all strings display correctly
- No missing key warnings in console

---

## ✅ Definition of Done

- [ ] Zero hardcoded user-facing strings in `src/screens/` and `src/components/`
- [ ] All keys present in both `pt.json` and `en.json`
- [ ] No i18next "key not found" warnings at runtime
- [ ] App tested in both PT and EN locales
- [ ] PR reviewed by `code-reviewer` agent
