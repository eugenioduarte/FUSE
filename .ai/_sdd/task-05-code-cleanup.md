> **[PT]** Plano de auditoria e limpeza do código — remoção de dependências não utilizadas, dead code, padrões inconsistentes e configurações redundantes.

---

# SDD — Task #5: Code Cleanup and Refactoring

**Status:** Planned
**Priority:** Medium
**Agent:** `code-reviewer` (audit) + `react-native-engineer` (fixes) + `coupling-analyzer` (metrics)

---

## 🎯 Goal

Comprehensive codebase audit to remove dead code, unused dependencies, redundant configs, and inconsistent patterns. Improve maintainability without changing any behavior.

---

## 📦 Scope

- `package.json` — unused npm dependencies
- `src/` — dead code, unused exports, inconsistent patterns
- Root config files — redundant or conflicting configurations
- `src/store/` — unused Zustand slices or selectors
- `src/services/` — deprecated or unused API functions

---

## 🏗 Architecture Decisions

- **No behavior changes** — cleanup only, zero functional impact
- **One PR per domain** — don't bundle everything into one massive PR
- Run `coupling-analyzer` before and after to verify improvement
- All changes must pass TypeScript strict check + ESLint + tests

---

## 📋 Implementation Plan

### Step 1 — Unused Dependencies Audit
```bash
npx depcheck
```
- List all unused packages
- Cross-reference with actual imports
- Remove confirmed unused packages

### Step 2 — Dead Code Detection
```bash
# Find unused exports
npx ts-prune

# Find unreferenced files
npx unimported
```
- Review each flagged item
- Remove confirmed dead code

### Step 3 — Zustand Store Audit
- Review each slice in `src/store/`
- Identify selectors with zero consumers
- Remove unused slices/actions

### Step 4 — Service Layer Audit
- Review `src/services/` for deprecated functions
- Check if all exported functions are actually called
- Remove confirmed dead service functions

### Step 5 — Pattern Consistency
Enforce across the codebase:
- All hooks use `use-` prefix (already enforced by naming rule)
- All screen files use `.screen.tsx` suffix where the pattern is adopted
- No `console.log` in production code
- No commented-out code blocks

```bash
grep -rn "console\.log" src/ --include="*.ts" --include="*.tsx"
```

### Step 6 — Config Cleanup
- Review `babel.config.js`, `metro.config.js`, `tsconfig.json` for redundant entries
- Check `.eslintrc` for rules already covered by TypeScript strict mode

### Step 7 — Coupling Analysis (Before/After)
```bash
.ai/scripts/analyze-coupling.sh
```
- Run before cleanup → record baseline metrics
- Run after cleanup → verify Fan-Out and Fan-In improved

### Step 8 — Validate
```bash
npx tsc --noEmit       # TypeScript check
npx eslint src/        # Lint check
npx jest               # Tests
```
All must pass with zero errors.

---

## ✅ Definition of Done

- [ ] `depcheck` shows zero unused dependencies
- [ ] `ts-prune` shows zero unused exports (or all flagged ones are intentional public API)
- [ ] Zero `console.log` in production code
- [ ] Zero commented-out code blocks
- [ ] All TypeScript, ESLint, and test checks pass
- [ ] Coupling metrics equal or better than baseline
- [ ] `code-reviewer` validation passed
