# UI Designer — Design System Polish

You are the **UI Designer agent** for the FUSE project. Read `.ai/agents/ui-designer.md` before proceeding — it defines your full behavior contract.

**Invocation:** `/ui-polish [feature-name]`

`feature-name` is required. It must match an existing SDD and implemented screens.

---

## Pre-flight Checks

```bash
# 1. Verify SDD exists
ls .ai/_sdd/$ARGUMENTS.sdd.md

# 2. Verify screen exists (logic was implemented)
ls src/screens/$ARGUMENTS/$ARGUMENTS.screen.tsx

# 3. Count TODO: ui-polish markers to understand scope
grep -r "TODO: ui-polish" src/screens/$ARGUMENTS/ --include="*.tsx" -c
```

If screen is missing → stop and report:
```
⛔ Screen not found: src/screens/$ARGUMENTS/$ARGUMENTS.screen.tsx
Run /implement-logic $ARGUMENTS first.
```

---

## Read Before Polishing

1. `.ai/_sdd/$ARGUMENTS.sdd.md` — understand the feature intent
2. `.ai/agents/ui-designer.md` — your behavior contract and replacement map
3. `.ai/skills/ux-ui-standards.md` — design rules
4. `src/constants/theme.ts` — all available tokens
5. `src/components/index.ts` — available design system components
6. `src/screens/$ARGUMENTS/$ARGUMENTS.screen.tsx` — the screen to polish
7. Any sub-components in `src/screens/$ARGUMENTS/components/`
8. **3 existing polished screens** from the project (for visual reference):
   ```bash
   # Find recently modified screens as reference
   ls -lt src/screens/main/*/**.screen.tsx | head -6
   ```

---

## Polishing Checklist

Work through each item. Do NOT skip any.

### 1. Header
- Replace any raw `<View>` used as header with the correct Header component
- See replacement table in `.ai/agents/ui-designer.md`
- Import from `@/components`

### 2. Colors
- Replace all inline color values with theme tokens
- Remove all hex, RGB, and color name strings
- Add `const { theme } = useTheme()` if not present

### 3. Typography
- Replace all raw `<Text style={{ fontSize: X }}>` with theme typography
- Apply `typography.heading`, `typography.body`, `typography.caption`, etc.

### 4. Spacing
- Replace hardcoded `padding`, `margin`, `gap` values with `spacings.*` tokens
- `spacings.sm` = 8, `spacings.md` = 16, `spacings.lg` = 24, `spacings.xl` = 32

### 5. Interactive Elements
- Replace `<TouchableOpacity>` with project `Button` component where appropriate
- If custom button style needed, use `TouchableOpacity` + proper theme styles

### 6. Cards and Containers
- Replace plain `<View>` containers with themed containers (border, shadow, radius)
- Use `border.radius.*` constants

### 7. Loading State
- Replace `<ActivityIndicator>` with project loading component (if exists)
- Or style `ActivityIndicator` with theme color: `color={theme.textPrimary}`

### 8. Empty State
- If not implemented, add an empty state:
  ```tsx
  {data.length === 0 && (
    <View style={styles.emptyState}>
      <Text style={styles.emptyText}>No [entities] yet</Text>
    </View>
  )}
  ```
  Styled with theme typography and colors.

### 9. StyleSheet
- Move all inline style objects to `StyleSheet.create()` at bottom of file
- No inline objects for visual properties

### 10. Accessibility
- Every `TouchableOpacity` and `Button` must have `accessibilityLabel`
- Every `TextInput` must have `accessibilityLabel`
- Decorative icons must have `accessible={false}`

### 11. Remove TODO markers
- Remove all `// TODO: ui-polish` comments that have been addressed

---

## Post-Polish Validation

```bash
# TypeScript must pass
yarn tsc --noEmit

# Lint must pass
yarn lint

# Confirm no TODO markers remain
grep -r "TODO: ui-polish" src/screens/$ARGUMENTS/ --include="*.tsx"
# Expected: no output
```

---

## Report

When complete, output:

```
✅ UI polish complete: [feature-name]

Changes applied:
- Header: [HeaderComponent used]
- Colors: all tokens applied
- Typography: all theme values applied
- Spacing: all spacings.* used
- Interactive elements: [N] TouchableOpacity → Button
- Accessibility: labels added to [N] elements
- Empty state: [added / already present]

TypeScript: ✅ no new errors
Lint: ✅ passing
TODO markers remaining: 0

Stage complete. Feature ready for review.
```

---

## Arguments

`$ARGUMENTS` — feature name (required). Must match screen folder name.
