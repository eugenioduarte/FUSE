import { border, Colors, spacings, typography } from '../constants/theme'

export function useTheme() {
  const colorScheme = 'light'

  return {
    colors: Colors[colorScheme],
    spacings,
    typography,
    border,
  }
}
