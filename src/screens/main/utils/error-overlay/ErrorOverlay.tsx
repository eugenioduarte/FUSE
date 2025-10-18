import React from 'react'
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { useOverlay } from '../../../../store/useOverlay'

const ErrorOverlay: React.FC = () => {
  const { errorOverlay, errorMessage, setErrorOverlay } = useOverlay()

  return (
    <Modal
      visible={errorOverlay}
      animationType="fade"
      transparent
      statusBarTranslucent
    >
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <Text style={styles.title}>Ocorreu um erro</Text>
          {!!errorMessage && <Text style={styles.message}>{errorMessage}</Text>}
          <TouchableOpacity
            style={styles.button}
            onPress={() => setErrorOverlay(false)}
          >
            <Text style={styles.buttonText}>Fechar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  )
}

export default ErrorOverlay

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    backgroundColor: '#1c1c1e',
    borderRadius: 12,
    padding: 20,
  },
  title: { color: 'white', fontSize: 18, fontWeight: '700', marginBottom: 8 },
  message: { color: '#ddd', marginBottom: 16 },
  button: {
    alignSelf: 'flex-end',
    backgroundColor: '#3b82f6',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  buttonText: { color: 'white', fontWeight: '700' },
})
