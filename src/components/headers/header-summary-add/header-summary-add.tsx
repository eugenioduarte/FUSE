import { ChevronIcon, PathIcon } from '@/assets/icons'
import { Text } from '@/components'
import { useTheme } from '@/hooks/use-theme'
import { navigatorManager } from '@/navigation/navigatorManager'
import { useOverlay } from '@/store/useOverlay'
import { useThemeStore } from '@/store/useThemeStore'
import { ThemeType } from '@/types/theme.type'
import React, { useEffect } from 'react'
import { StyleSheet, View } from 'react-native'
import IconButton from '../../buttons/icon-button/IconButton'

const HeaderSummaryAdd = () => {
  const theme = useTheme()
  const styles = createStyles(theme)

  const setFastWayOverlay = useOverlay((s) => s.setFastWayOverlay)
  const setBackgroundColor = useThemeStore((state) => state.setBackgroundColor)
  const color = useThemeStore((s) => s.colorLevelUp.background_color)

  useEffect(() => {
    setBackgroundColor(color)
  }, [color, setBackgroundColor])

  const handleMenuPress = () => {
    navigatorManager.goBack()
  }

  const handleFastWayPress = () => {
    setFastWayOverlay(true)
  }

  return (
    <View style={styles.container}>
      <IconButton
        icon={
          <View style={styles.chevronIcon}>
            <ChevronIcon />
          </View>
        }
        onPress={handleMenuPress}
      />
      <Text variant="xxLarge">Create new Summary</Text>
      <IconButton icon={<PathIcon />} onPress={handleFastWayPress} />
    </View>
  )
}

export default HeaderSummaryAdd

const createStyles = (theme: ThemeType) =>
  StyleSheet.create({
    container: {
      flex: 1,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    chevronIcon: {
      transform: [{ rotate: '180deg' }],
      marginRight: theme.spacings.xSmall,
    },
  })
