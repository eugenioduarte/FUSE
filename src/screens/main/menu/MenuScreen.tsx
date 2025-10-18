import React from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { navigatorManager } from '../../../navigation/navigatorManager'

const MenuScreen = () => {
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

      <TouchableOpacity
        style={styles.item}
        onPress={() => {
          navigatorManager.goToPayment()
          navigatorManager.closeMenu()
        }}
      >
        <Text style={styles.itemText}>Payment</Text>
      </TouchableOpacity>
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
