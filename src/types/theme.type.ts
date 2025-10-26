import { border, Colors, spacings, typography } from '../constants/theme'

export type ThemeType = {
  colors: typeof Colors.light
  spacings: typeof spacings
  border: typeof border
  typography: typeof typography
}
