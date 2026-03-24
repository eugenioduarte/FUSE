import React, { useEffect } from 'react'
import { Modal, StyleSheet, Text, View } from 'react-native'
import { useOverlay } from '../../../../store/overlay.store'

const SuccessOverlay: React.FC = () => {
  const { successOverlay, successMessage, setSuccessOverlay } = useOverlay()

  useEffect(() => {
    if (!successOverlay) return
    const t = setTimeout(() => setSuccessOverlay(false), 1500)
    return () => clearTimeout(t)
  }, [successOverlay, setSuccessOverlay])

  return (
    <Modal
      visible={successOverlay}
      animationType="fade"
      transparent
      statusBarTranslucent
    >
      <View style={styles.backdrop} pointerEvents="none">
        <View style={styles.toast}>
          <Text style={styles.title}>Sucesso</Text>
          {!!successMessage && (
            <Text style={styles.message}>{successMessage}</Text>
          )}
        </View>
      </View>
    </Modal>
  )
}

export default SuccessOverlay

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    backgroundColor: 'transparent',
    padding: 16,
  },
  toast: {
    width: '100%',
    backgroundColor: '#065f46', // emerald-800
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  title: { color: '#ecfdf5', fontWeight: '800', marginBottom: 2 },
  message: { color: '#d1fae5' },
})
