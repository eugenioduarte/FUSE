import React from 'react'
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import {
  decideNotification,
  markNotificationRead,
} from '../../../../services/firebase/notifications.service'
import { useAuthStore } from '../../../../store/useAuthStore'
import { useOverlay } from '../../../../store/useOverlay'

const NotificationOverlay: React.FC = () => {
  const { notificationOverlay, setNotificationOverlay } = useOverlay()
  const visible = !!notificationOverlay
  const payload = notificationOverlay
  const uid = useAuthStore((s) => s.user?.id || '')

  const onClose = () => {
    try {
      if (payload?.onClose) payload.onClose()
      else if (uid && payload?.id)
        markNotificationRead(uid, payload.id).catch(() => {})
    } finally {
      setNotificationOverlay(null)
    }
  }

  const onAccept = () => {
    try {
      if (payload?.onAccept) payload.onAccept()
      else if (uid && payload?.id)
        decideNotification(uid, payload.id, 'accepted').catch(() => {})
    } finally {
      setNotificationOverlay(null)
    }
  }

  const onDeny = () => {
    try {
      if (payload?.onDeny) payload.onDeny()
      else if (uid && payload?.id)
        decideNotification(uid, payload.id, 'denied').catch(() => {})
    } finally {
      setNotificationOverlay(null)
    }
  }

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      statusBarTranslucent
    >
      <View style={styles.backdrop}>
        <View style={styles.card}>
          {!!payload?.title && (
            <Text style={styles.title}>{payload.title}</Text>
          )}
          {!!payload?.body && (
            <Text style={styles.message}>{payload.body}</Text>
          )}

          <View style={styles.row}>
            {payload?.requireDecision ? (
              <>
                <TouchableOpacity
                  style={[styles.btn, styles.btnSecondary]}
                  onPress={onDeny}
                >
                  <Text style={[styles.btnText, styles.btnTextSecondary]}>
                    {payload?.denyLabel || 'Negar'}
                  </Text>
                </TouchableOpacity>
                <View style={{ width: 8 }} />
                <TouchableOpacity
                  style={[styles.btn, styles.btnPrimary]}
                  onPress={onAccept}
                >
                  <Text style={styles.btnText}>
                    {payload?.acceptLabel || 'Aceitar'}
                  </Text>
                </TouchableOpacity>
              </>
            ) : (
              <TouchableOpacity
                style={[styles.btn, styles.btnPrimary]}
                onPress={onClose}
              >
                <Text style={styles.btnText}>Fechar</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </Modal>
  )
}

export default NotificationOverlay

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
  row: { flexDirection: 'row', justifyContent: 'flex-end' },
  btn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  btnPrimary: { backgroundColor: '#3b82f6' },
  btnSecondary: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#52525b',
  },
  btnText: { color: 'white', fontWeight: '700' },
  btnTextSecondary: { color: '#e5e7eb' },
})
