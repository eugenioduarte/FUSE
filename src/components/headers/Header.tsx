import { Ionicons } from '@expo/vector-icons'
import React from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { navigationRef } from '../../navigation/navigationRef'
import { useThemeStore } from '../../store/useThemeStore'
import HeaderDashboard from './HeaderDashboard'

// 🔸 Header genérico (com botão de voltar e título)
const DefaultHeader = ({ title }: { title: string }) => {
  const canGoBack = navigationRef.isReady() && navigationRef.canGoBack()

  return (
    <>
      {canGoBack ? (
        <TouchableOpacity
          onPress={() => navigationRef.goBack()}
          style={styles.iconWrapper}
        >
          <Ionicons name="chevron-back" size={24} color="white" />
        </TouchableOpacity>
      ) : (
        <View style={styles.iconPlaceholder} />
      )}

      <Text numberOfLines={1} style={styles.title}>
        {title}
      </Text>

      <View style={styles.iconPlaceholder} />
    </>
  )
}

export const Header: React.FC = () => {
  const { headerConfig } = useThemeStore()
  const { title, visible, type } = headerConfig

  if (!visible) return null

  const renderHeader = () => {
    switch (type) {
      case 'DashboardScreen':
        return <HeaderDashboard />
      default:
        return <DefaultHeader title={title} />
    }
  }

  return <View style={styles.container}>{renderHeader()}</View>
}

const styles = StyleSheet.create({
  container: {
    height: 100,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#eee',
    backgroundColor: 'black',
  },
  iconWrapper: { width: 40, alignItems: 'flex-start' },
  iconPlaceholder: { width: 40 },
  title: {
    flex: 1,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  dashboardHeaderContainer: {
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'black',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#eee',
  },
  dashboardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: 'white',
  },
})
