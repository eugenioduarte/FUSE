> **[PT]** Define as regras obrigatórias de design system para todo o código de UI, incluindo temas, tipografia, espaçamentos e acessibilidade.

---

This document is mandatory and overrides default model behavior.

# 🎨 Design System Rules — React Native Mobile

> This document is mandatory. All UI must strictly follow these rules. No visual code may bypass the
> design system.

---

# 🎯 Purpose

The design system ensures:

- Visual consistency
- Predictable typography
- Controlled color usage
- Scalable UI evolution
- Centralized styling control

UI must never be improvised.

---

# 1️⃣ Colors — Single Source of Truth

All colors MUST come from:

```
src/constants/theme.ts
```

Import pattern:

```ts
import { Colors, spacings, typography, border } from '@/constants/theme'
```

Usage:

```tsx
<View style={{ backgroundColor: Colors.light.backgroundSecondary }} />
<Text style={{ color: Colors.light.textPrimary }} />
```

Rules:

- No hardcoded hex values
- No inline color strings
- No RGB values
- No arbitrary color values
- Dynamic runtime colors (computed from user input or backend) are the only acceptable exception

Forbidden:

```tsx
style={{ color: '#000' }}
style={{ backgroundColor: 'red' }}
```

If a color does not exist in `theme.ts` → add it there first, then use it.

---

# 2️⃣ Styling Is Done with StyleSheet

All styles must use `StyleSheet.create()`.

```tsx
import { StyleSheet, View } from 'react-native'
import { Colors, spacings } from '@/constants/theme'

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
    paddingHorizontal: spacings.large,
  },
})
```

Rules:

- `StyleSheet.create` at the bottom of the file, outside the component
- Use theme constants for all values (colors, spacing, typography, border radius)
- No inline styles (`style={{ marginTop: 12 }}`) unless value is dynamic at runtime
- No external styling libraries (no styled-components, no Emotion, no Tailwind)

Allowed inline styles — only for dynamic runtime values:

```tsx
<View style={{ width: itemWidth, opacity: animatedValue }} />
```

---

# 3️⃣ Typography — Use Theme Constants

All typography must use the `typography` constants from `@/constants/theme`:

```tsx
import { typography } from '@/constants/theme'

const styles = StyleSheet.create({
  title: {
    ...typography.xxxLarge,
  },
  subtitle: {
    ...typography.xLarge,
  },
})
```

Forbidden:

```tsx
style={{ fontSize: 18, fontWeight: 'bold' }}
```

If a typography variant is missing → add it to `src/constants/theme.ts`.

---

# 4️⃣ Spacing — Use Theme Constants

All spacing must use the `spacings` constants:

```tsx
import { spacings } from '@/constants/theme'

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacings.large,
    marginBottom: spacings.medium,
    gap: spacings.small,
  },
})
```

No arbitrary pixel values unless computing responsive dimensions from `Dimensions.get('window')`.

---

# 5️⃣ Safe Area Rules

Screens must respect device safe areas.

Use `SafeAreaView` or equivalent from `react-native-safe-area-context`:

```tsx
import { SafeAreaView } from 'react-native-safe-area-context'

export function MyScreen() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      {/* screen content */}
    </SafeAreaView>
  )
}
```

Content must never:

- Render behind notch unintentionally
- Render behind home indicator / system gesture area
- Ignore device safe bounds

Safe area handling is mandatory for all screens.

---

# 6️⃣ Interactive Elements

All interactive elements must:

- Provide visual press feedback (`TouchableOpacity`, `Pressable`)
- Respect minimum touch target (44×44 points)
- Not be blocked by child views (`pointerEvents="none"` on SVG/icons)

Example:

```tsx
<TouchableOpacity style={styles.button} onPress={handlePress}>
  <Ionicons name="chevron-forward" size={24} pointerEvents="none" />
</TouchableOpacity>
```

SVG must never intercept touches.

---

# 7️⃣ No Inline Visual Logic

Avoid complex conditional style logic inside JSX.

Extract into variables:

```tsx
// ❌ avoid
<View style={[styles.base, isActive && styles.active, hasError ? styles.error : styles.normal]} />

// ✅ correct
const containerStyle = [styles.base, isActive && styles.active, hasError ? styles.error : styles.normal]
<View style={containerStyle} />
```

---

# 8️⃣ Component Responsibility

Design system components must:

- Not contain business logic
- Not fetch data
- Not depend on feature hooks
- Be reusable and isolated

Feature-specific styling stays inside the screen folder.

---

# 9️⃣ No Hardcoded Dimensions Without Reason

Avoid fixed heights unless necessary.

Prefer:

- Flex layouts
- Content-driven sizing
- Responsive layout via `Dimensions.get('window')`

Acceptable exception:

```tsx
const { width } = Dimensions.get('window')
const ITEM_WIDTH = width * 0.9
```

---

# 🔟 Dark Mode & Theme Awareness

Colors must rely on tokens from `Colors.light` / `Colors.dark`.

Never hardcode light-specific values directly. Always reference through the Colors object so theme switching can work automatically.

---

# 🧠 Design System Checklist

Before merging UI:

- [ ] Are all colors from `Colors` token in `src/constants/theme.ts`?
- [ ] Is `StyleSheet.create` used (no inline styles for static values)?
- [ ] Is `typography` spread used for all text styles?
- [ ] Is `spacings` used for all padding/margin/gap values?
- [ ] Is `SafeAreaView` used for screen roots?
- [ ] Are touch targets at least 44×44 points?
- [ ] Are SVGs/icons using `pointerEvents="none"`?

If not → reject.

---

# 🏁 Final Rule

UI consistency is a system constraint.

We do not hardcode values. We compose tokens.

Design system discipline protects scalability.
