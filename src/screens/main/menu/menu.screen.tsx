import { Text } from '@/components'
import PressableScale from '@/components/containers/pressable-scale/pressable-scale'
import { useTheme } from '@/hooks/use-theme'
import { t } from '@/locales/translation'
import { navigatorManager } from '@/navigation/navigator-manager'
import { useAuthStore } from '@/store'
import { ColorLevels, useThemeStore } from '@/store/theme.store'
import { ThemeType } from '@/types/theme.type'
import React from 'react'
import { ScrollView, StyleSheet, View } from 'react-native'

const MenuScreen = () => {
  const theme = useTheme()
  const colors = useThemeStore((s) => s.colorLevelUp)
  const styles = createStyles(theme, colors)
  const logout = useAuthStore((s) => s.logout)

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View>
        <PressableScale
          style={styles.item}
          onPress={() => {
            navigatorManager.goToProfile()
            navigatorManager.closeMenu()
          }}
        >
          <Text variant="xLarge" style={styles.itemText}>
            {t('menu.profile')}
          </Text>
        </PressableScale>

        <PressableScale
          style={styles.item}
          onPress={() => {
            navigatorManager.goToConnections()
            navigatorManager.closeMenu()
          }}
        >
          <Text variant="xLarge" style={styles.itemText}>
            {t('menu.connections')}
          </Text>
        </PressableScale>
      </View>
      <PressableScale
        style={styles.item}
        onPress={() => {
          logout()
          navigatorManager.goToLoginScreen()
        }}
      >
        <Text variant="xLarge" style={styles.itemText}>
          {t('menu.logout')}
        </Text>
      </PressableScale>
    </ScrollView>
  )
}

export default MenuScreen

const createStyles = (theme: ThemeType, colors: ColorLevels) =>
  StyleSheet.create({
    container: {
      flexGrow: 1,
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: colors.background_color,
      paddingTop: '10%',
      paddingBottom: '10%',
    },
    item: {
      paddingVertical: theme.spacings.medium,
      alignItems: 'center',
    },
    itemText: {
      color: theme.colors.black,
    },
  })
