import { PathIcon } from '@/assets/icons'
import React from 'react'
import { Text, TouchableOpacity, View } from 'react-native'
import { navigatorManager } from '../../navigation/navigatorManager'
import { useOverlay } from '../../store/useOverlay'

const HeaderDashboard = () => {
  const setFastWayOverlay = useOverlay((s) => s.setFastWayOverlay)
  const handleMenuPress = () => {
    navigatorManager.openMenu()
  }

  const handleNotificationsPress = () => {
    navigatorManager.goToNotifications()
  }

  const handleCalendarPress = () => {
    navigatorManager.goToCalendar()
  }

  const handleFastWayPress = () => {
    setFastWayOverlay(true)
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
        <TouchableOpacity onPress={handleFastWayPress}>
          <Text style={{ color: 'white', fontWeight: 'bold' }}>fastWay</Text>
        </TouchableOpacity>
        <View
          style={{
            backgroundColor: 'red',
            width: 30,
            height: 30,
            borderRadius: 15,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <PathIcon />
        </View>
      </View>
    </View>
  )
}

export default HeaderDashboard
