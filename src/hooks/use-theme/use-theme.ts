import { border, Colors, spacings, typography } from '../constants/theme'
import { ThemeType } from '../types/theme.type'

export function useTheme(): ThemeType {
  const colorScheme = 'light'

  return {
    colors: Colors[colorScheme],
    spacings,
    typography,
    border,
  }
}
