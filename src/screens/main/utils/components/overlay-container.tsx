import { useTheme } from '@/hooks/use-theme'
import { useThemeStore } from '@/store/theme.store'
import React from 'react'
import { View } from 'react-native'

const OverlayContainer = ({ children }: { children: React.ReactNode }) => {
  const theme = useTheme()
  const color = useThemeStore((s) => s.colorLevelUp.background_color)

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: color,
        padding: theme.spacings.large,
        justifyContent: 'center',
      }}
    >
      {children}
    </View>
  )
}

export default OverlayContainer
