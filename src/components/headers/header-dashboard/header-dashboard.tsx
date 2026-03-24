import { PathIcon, Settings } from '@/assets/icons'
import { useTheme } from '@/hooks/use-theme'
import { navigatorManager } from '@/navigation/navigator-manager'
import { useOverlay } from '@/store/overlay.store'
import { useThemeStore } from '@/store/theme.store'
import { ThemeType } from '@/types/theme.type'
import React, { useEffect } from 'react'
import { Image, StyleSheet, TouchableOpacity, View } from 'react-native'

const HeaderDashboard = () => {
  const theme = useTheme()
  const styles = createStyles(theme)

  const setFastWayOverlay = useOverlay((s) => s.setFastWayOverlay)
  const setBackgroundColor = useThemeStore((state) => state.setBackgroundColor)
  const color = useThemeStore((s) => s.colorLevelUp.background_color)

  useEffect(() => {
    setBackgroundColor(color)
  }, [color, setBackgroundColor])

  const handleMenuPress = () => {
    navigatorManager.toggleMenu()
  }

  const handleFastWayPress = () => {
    setFastWayOverlay(true)
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={handleMenuPress} style={styles.touchable}>
        <Settings />
      </TouchableOpacity>

      <Image
        source={require('../../../assets/images/logo.png')}
        style={styles.image}
      />
      <TouchableOpacity onPress={handleFastWayPress} style={styles.touchable}>
        <PathIcon />
      </TouchableOpacity>
    </View>
  )
}

export default HeaderDashboard

const createStyles = (theme: ThemeType) =>
  StyleSheet.create({
    container: {
      flex: 1,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    touchable: {
      backgroundColor: theme.colors.backgroundSecondary,
      width: 35,
      height: 35,
      borderRadius: 99,
      justifyContent: 'center',
      alignItems: 'center',
      padding: theme.spacings.xSmall,
      borderWidth: theme.border.size,
      borderColor: theme.colors.borderColor,
    },
    image: { width: 80, height: 80 },
  })
