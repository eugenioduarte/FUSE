import { useTheme } from '@/hooks/use-theme'
import { useThemeStore } from '@/store/theme.store'
import { useEffect } from 'react'

/**
 * Hook that updates the level background color (colorLevelUp) in the theme store.
 * If a color is provided it is applied; otherwise the default secondary background
 * color from the active theme is used.
 *
 * @param color - optional override background color (e.g. '#FF0000')
 */
export function useUpdateBackgroundColor(color?: string) {
  const theme = useTheme()

  useEffect(() => {
    useThemeStore.setState({
      colorLevelUp: {
        background_color: color ?? theme.colors.backgroundSecondary,
      },
    })
  }, [color, theme.colors.backgroundSecondary])
}
