import { Button, Text } from '@/components'
import { useTheme } from '@/hooks/use-theme'
import { t } from '@/locales/translation'
import {
  decideNotification,
  markNotificationRead,
} from '@/services/firebase/notifications.service'
import { useAuthStore } from '@/store/auth.store'
import { useOverlay } from '@/store/overlay.store'
import { useThemeStore } from '@/store/theme.store'
import { ThemeType } from '@/types/theme.type'
import { Ionicons } from '@expo/vector-icons'
import React from 'react'
import { Modal, StyleSheet, TouchableOpacity, View } from 'react-native'

const NotificationOverlay: React.FC = () => {
  const theme = useTheme()
  const color = useThemeStore((s) => s.colorLevelUp.background_color)
  const styles = createStyles(theme, color)

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
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={26} color={theme.colors.textPrimary} />
          </TouchableOpacity>
          {!!payload?.title && <Text variant="xLarge">{payload.title}</Text>}
          {!!payload?.body && (
            <Text variant="large" style={styles.message}>
              {payload.body}
            </Text>
          )}

          <View style={styles.row}>
            {payload?.requireDecision ? (
              <>
                <Button
                  title={payload?.denyLabel || t('notification.deny')}
                  onPress={onDeny}
                />
                <Button
                  title={payload?.acceptLabel || t('notification.accept')}
                  onPress={onAccept}
                />
              </>
            ) : (
              <></>
            )}
          </View>
        </View>
      </View>
    </Modal>
  )
}

export default NotificationOverlay

const createStyles = (theme: ThemeType, color?: string) =>
  StyleSheet.create({
    backdrop: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.6)',
      alignItems: 'center',
      justifyContent: 'center',
      padding: theme.spacings.large,
    },
    card: {
      width: '100%',
      backgroundColor: color,
      borderRadius: theme.border.radius12,
      padding: theme.spacings.medium,
    },
    message: {
      marginBottom: theme.spacings.medium,
      marginTop: theme.spacings.small,
    },
    row: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      gap: theme.spacings.xMedium,
    },
    closeButton: { alignSelf: 'flex-end' },
  })
