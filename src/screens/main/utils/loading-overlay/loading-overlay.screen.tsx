import React from 'react'
import { ActivityIndicator, Modal, StyleSheet, Text, View } from 'react-native'
import { useOverlay } from '../../../../store/overlay.store'

const LoadingOverlay: React.FC = () => {
  const { loadingOverlay, loadingMessage } = useOverlay()
  return (
    <Modal
      visible={loadingOverlay}
      animationType="fade"
      transparent
      statusBarTranslucent
    >
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={styles.label}>{loadingMessage || 'Carregando…'}</Text>
        </View>
      </View>
    </Modal>
  )
}

export default LoadingOverlay

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    backgroundColor: '#1c1c1e',
    borderRadius: 12,
    paddingVertical: 24,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  label: { color: 'white', marginTop: 12, fontWeight: '600' },
})
