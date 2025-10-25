import { border, Colors, spacings, typography } from '../constants/theme'
import type { Theme } from '../types/theme.type'

export function useTheme(): Theme {
  const colorScheme = 'light'

  return {
    colors: Colors[colorScheme],
    spacings,
    typography,
    border,
  }
}
