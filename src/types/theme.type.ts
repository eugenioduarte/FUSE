import { border, Colors, spacings, typography } from '../constants/theme'

export type Theme = {
  colors: typeof Colors.light
  spacings: typeof spacings
  border: typeof border
  typography: typeof typography
}
