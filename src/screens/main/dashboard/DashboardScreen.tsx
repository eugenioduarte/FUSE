import React from 'react'
import { Button, Text, View } from 'react-native'
import { navigatorManager } from '../../../navigation/navigatorManager'
import { useAuthStore } from '../../../store/useAuthStore'

export default function DashboardScreen() {
  const logout = useAuthStore((s) => s.logout)

  return (
    <View
      testID="dashboard-root"
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'blue',
      }}
    >
      <Text style={{ fontSize: 20, marginBottom: 12 }}>Dashboard</Text>
      <Button
        title="Go to Topic"
        onPress={() => {
          navigatorManager.goToTopic()
        }}
      />
      <View style={{ height: 12 }} />
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
