import React from 'react'
import { Text, TouchableOpacity, View } from 'react-native'

const HeaderDashboard = () => {
  const handleMenuPress = () => {
    // Lógica para abrir o menu lateral
  }

  const handleNotificationsPress = () => {
    // Lógica para abrir as notificações
  }

  const handleCalendarPress = () => {
    // Lógica para abrir o calendário
  }

  return (
    <View
      style={{
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}
    >
      <TouchableOpacity onPress={handleMenuPress}>
        <Text style={{ color: 'white', fontWeight: 'bold' }}>Menu</Text>
      </TouchableOpacity>
      <View style={{ flexDirection: 'row', gap: 20 }}>
        <TouchableOpacity onPress={handleCalendarPress}>
          <Text style={{ color: 'white', fontWeight: 'bold' }}>Calendar</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleNotificationsPress}>
          <Text style={{ color: 'white', fontWeight: 'bold' }}>
            Notifications
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

export default HeaderDashboard
