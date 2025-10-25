import { useAuthStore } from '@/src/store'
import React from 'react'
import { Button, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { navigatorManager } from '../../../navigation/navigatorManager'
import { isDevUser } from '../../../services/firebase/dev.service'

const MenuScreen = () => {
  const { user, logout } = useAuthStore((s) => ({
    user: s.user,
    logout: s.logout,
  }))
  const [isDev, setIsDev] = React.useState(false)

  React.useEffect(() => {
    let mounted = true
    const run = async () => {
      if (!user?.id) return setIsDev(false)
      const ok = await isDevUser(user.id)
      if (mounted) setIsDev(ok)
    }
    run()
    return () => {
      mounted = false
    }
  }, [user?.id])
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Menu</Text>

      <TouchableOpacity
        style={styles.item}
        onPress={() => {
          navigatorManager.goToProfile()
          navigatorManager.closeMenu()
        }}
      >
        <Text style={styles.itemText}>Profile</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.item}
        onPress={() => {
          navigatorManager.goToConnections()
          navigatorManager.closeMenu()
        }}
      >
        <Text style={styles.itemText}>Connections</Text>
      </TouchableOpacity>

      {isDev ? (
        <TouchableOpacity
          style={styles.item}
          onPress={() => {
            navigatorManager.goToComponents()
            navigatorManager.closeMenu()
          }}
        >
          <Text style={styles.itemText}>Components</Text>
        </TouchableOpacity>
      ) : null}

      <TouchableOpacity
        style={styles.item}
        onPress={() => {
          navigatorManager.goToPayment()
          navigatorManager.closeMenu()
        }}
      >
        <Text style={styles.itemText}>Payment</Text>
      </TouchableOpacity>
      <Button
        title="Logout"
        onPress={() => {
          logout()
          navigatorManager.goToLoginScreen()
        }}
      />
    </View>
  )
}

export default MenuScreen

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111',
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  title: {
    color: 'white',
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 24,
  },
  item: {
    paddingVertical: 14,
  },
  itemText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
})
