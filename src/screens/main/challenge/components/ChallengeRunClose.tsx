import { useOverlay } from '@/store/useOverlay'
import { useThemeStore } from '@/store/useThemeStore'
import { Ionicons } from '@expo/vector-icons'
import React from 'react'
import { SafeAreaView, StyleSheet, TouchableOpacity, View } from 'react-native'

type Props = {
  onConfirm: () => Promise<void>
  title?: string
  body?: string
}

const ChallengeRunClose: React.FC<Props> = ({ onConfirm, title, body }) => {
  const setNotification = useOverlay((s) => s.setNotificationOverlay)
  // hide global header while a challenge is running; restore on unmount
  React.useEffect(() => {
    try {
      const prev = useThemeStore.getState().headerConfig
      // store on the element for restore
      ;(ChallengeRunClose as any)._prevHeader = prev
      useThemeStore.setState({
        headerConfig: { title: prev.title, type: prev.type, visible: false },
      })
    } catch {}
    return () => {
      try {
        const prev = (ChallengeRunClose as any)._prevHeader
        if (prev) useThemeStore.setState({ headerConfig: prev })
      } catch {}
    }
  }, [])

  const ask = () => {
    setNotification({
      id: `force-finish-${Date.now()}`,
      title: title || 'Terminar exercício?',
      body:
        body ||
        'Deseja realmente sair? As respostas não finalizadas serão consideradas erradas.',
      requireDecision: true,
      acceptLabel: 'Sair',
      denyLabel: 'Continuar',
      onAccept: () => {
        // call provided callback
        void (async () => {
          try {
            setNotification(null)
            await onConfirm()
          } catch {}
        })()
      },
      onDeny: () => setNotification(null),
      onClose: () => setNotification(null),
    })
  }

  return (
    <SafeAreaView pointerEvents="box-none" style={styles.container}>
      <View style={styles.inner}>
        <TouchableOpacity onPress={ask} style={styles.btn}>
          <Ionicons name="close" size={26} color="white" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

export default ChallengeRunClose

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    zIndex: 1000,
  },
  inner: {
    padding: 12,
    alignItems: 'flex-end',
  },
  btn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
})
