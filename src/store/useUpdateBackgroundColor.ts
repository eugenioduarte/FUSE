import { useTheme } from '@/hooks/useTheme'
import { useThemeStore } from '@/store/useThemeStore'
import { useEffect } from 'react'

/**
 * Hook que atualiza a cor de fundo do nível (colorLevelUp) na theme store.
 * Se for passada uma cor, usa-a; caso contrário usa a cor padrão do tema.
 *
 * @param color cor de background a ser aplicada (ex: '#FF0000')
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
