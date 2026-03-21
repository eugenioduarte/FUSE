> **[PT]** Plano de migração do sistema de estilos atual para Tailwind CSS via Uniwind, mantendo a aparência visual idêntica em todos os componentes e ecrãs.

---

# SDD — Task #2: Tailwind CSS Migration (Uniwind)

**Status:** Planned
**Priority:** Medium
**Agent:** `react-native-engineer` + `frontend-architect` (initial setup)

---

## 🎯 Goal

Replace all `StyleSheet.create({})` and inline styles with Tailwind utility classes via [Uniwind](https://uniwind.dev/). All screens and components must maintain pixel-perfect visual parity with the current design.

---

## 📦 Scope

### Files Affected
- `package.json` — add `nativewind` or `uniwind` dependency
- `babel.config.js` / `metro.config.js` — add Tailwind transform
- `tailwind.config.js` — new file, configure design tokens
- `src/constants/theme.ts` — map existing tokens to Tailwind config
- All `*.tsx` files in `src/screens/` and `src/components/`

### Files to Reference
- `src/constants/theme.ts` — existing color tokens, typography, spacings
- `.ai/skills/ux-ui-standards.md` — design system constraints

---

## 🏗 Architecture Decisions

- Use **Nativewind v4** (Tailwind for React Native) — verify Expo compatibility first
- Design token mapping: Tailwind `extend` config maps to existing `Colors`, `typography`, `spacings` from `theme.ts`
- Migration strategy: **screen by screen** — never migrate all at once
- Keep `StyleSheet.create` for complex animations and dynamic styles that can't be expressed in Tailwind
- No visual regression allowed — take before/after screenshots per screen

---

## 📋 Implementation Plan

### Step 1 — Setup & Configuration
```bash
npx expo install nativewind tailwindcss
```
- Create `tailwind.config.js` extending existing design tokens from `src/constants/theme.ts`
- Update `babel.config.js` to add `nativewind/babel`
- Update `metro.config.js` for CSS support

### Step 2 — Token Mapping
In `tailwind.config.js`:
```js
theme: {
  extend: {
    colors: { ...importedFromTheme },
    spacing: { ...importedFromTheme },
    fontFamily: { ...importedFromTheme },
  }
}
```

### Step 3 — Migrate Components (Bottom-Up)
Order: atoms → molecules → screens
1. `src/components/buttons/` — buttons first (simple, isolated)
2. `src/components/containers/`
3. `src/components/headers/`
4. `src/screens/auth/`
5. `src/screens/main/`

Per file:
- Replace `StyleSheet.create({})` with `className` props
- Remove `style={{}}` inline props
- Verify visual output on simulator

### Step 4 — Remove StyleSheet Imports
After each file is migrated, remove unused `StyleSheet` imports.

### Step 5 — Validate Design System
```bash
# Search for any remaining hardcoded hex/rgb values
grep -rn --include="*.tsx" "#[0-9A-Fa-f]\{3,6\}" src/
grep -rn --include="*.tsx" "rgb(" src/
```
All must be zero.

### Step 6 — Test Visual Parity
- Run on iOS simulator — compare screenshots per screen
- Run on Android emulator — verify consistency
- Test dark/light theme switching

---

## ✅ Definition of Done

- [ ] `nativewind` configured and working in Expo
- [ ] All `StyleSheet.create` replaced with Tailwind classes (except animation edge cases)
- [ ] Zero hardcoded color hex values in components
- [ ] All screens visually identical to pre-migration
- [ ] Tested on iOS and Android
- [ ] `code-reviewer` validation passed
