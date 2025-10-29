import { Text } from '@/components'
import { useTheme } from '@/hooks/useTheme'
import { useAuthStore } from '@/store'
import { ThemeType } from '@/types/theme.type'
import React from 'react'
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native'
import { navigatorManager } from '../../../navigation/navigatorManager'
import { isDevUser } from '../../../services/firebase/dev.service'

const MenuScreen = () => {
  const theme = useTheme()
  const styles = createStyles(theme)
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
            Profile
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
            Connections
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
              Components
            </Text>
          </TouchableOpacity>
        ) : null}

        <TouchableOpacity
          style={styles.item}
          onPress={() => {
            navigatorManager.goToPayment()
            navigatorManager.closeMenu()
          }}
        >
          <Text variant="xLarge" style={styles.itemText}>
            Payment
          </Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity
        style={styles.item}
        onPress={() => {
          logout()
          navigatorManager.goToLoginScreen()
        }}
      >
        <Text variant="xLarge" style={styles.itemText}>
          Logout
        </Text>
      </TouchableOpacity>
    </ScrollView>
  )
}

export default MenuScreen

const createStyles = (theme: ThemeType) =>
  StyleSheet.create({
    container: {
      flexGrow: 1,
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: theme.colors.accentRed,
      paddingTop: '10%',
      paddingBottom: '10%',
    },
    title: {
      color: theme.colors.white,
      fontSize: 22,
      fontWeight: '700',
      marginBottom: 24,
    },
    item: {
      paddingVertical: 14,
      alignItems: 'center',
    },
    itemText: {
      color: theme.colors.white,
    },
  })
