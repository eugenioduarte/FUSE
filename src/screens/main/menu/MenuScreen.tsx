import { Text } from '@/components'
import { useTheme } from '@/hooks/useTheme'
import { t } from '@/locales/translation'
import { useAuthStore } from '@/store'
import { ColorLevels, useThemeStore } from '@/store/useThemeStore'
import { ThemeType } from '@/types/theme.type'
import React from 'react'
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native'
import { navigatorManager } from '../../../navigation/navigatorManager'
import { isDevUser } from '../../../services/firebase/dev.service'

const MenuScreen = () => {
  const theme = useTheme()
  const colors = useThemeStore((s) => s.colorLevelUp)
  const styles = createStyles(theme, colors)
  const userId = useAuthStore((s) => s.user?.id)
  const logout = useAuthStore((s) => s.logout)
  const [isDev, setIsDev] = React.useState(false)

  React.useEffect(() => {
    let mounted = true
    const run = async () => {
      if (!userId) {
        if (mounted) setIsDev(false)
        return
      }
      const ok = await isDevUser(userId)
      if (mounted) setIsDev(ok)
    }
    run()
    return () => {
      mounted = false
    }
  }, [userId])

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View>
        <TouchableOpacity
          style={styles.item}
          onPress={() => {
            navigatorManager.goToProfile()
            navigatorManager.closeMenu()
          }}
        >
          <Text variant="xLarge" style={styles.itemText}>
            {t('menu.profile')}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.item}
          onPress={() => {
            navigatorManager.goToConnections()
            navigatorManager.closeMenu()
          }}
        >
          <Text variant="xLarge" style={styles.itemText}>
            {t('menu.connections')}
          </Text>
        </TouchableOpacity>

        {isDev ? (
          <TouchableOpacity
            style={styles.item}
            onPress={() => {
              navigatorManager.goToComponents()
              navigatorManager.closeMenu()
            }}
          >
            <Text variant="xLarge" style={styles.itemText}>
              {t('menu.components')}
            </Text>
          </TouchableOpacity>
        ) : null}
      </View>
      <TouchableOpacity
        style={styles.item}
        onPress={() => {
          logout()
          navigatorManager.goToLoginScreen()
        }}
      >
        <Text variant="xLarge" style={styles.itemText}>
          {t('menu.logout')}
        </Text>
      </TouchableOpacity>
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
      backgroundColor: colors.level_five,
      paddingTop: '10%',
      paddingBottom: '10%',
    },
    item: {
      paddingVertical: 14,
      alignItems: 'center',
    },
    itemText: {
      color: colors.level_one,
    },
  })
