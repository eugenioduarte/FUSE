import { Text } from '@/components'
import { useTheme } from '@/hooks/use-theme'
import { t } from '@/locales/translation'
import { sendTopicInviteToUid } from '@/services/firebase/invites.service'
import { useAuthStore } from '@/store/useAuthStore'
import { useOverlay } from '@/store/useOverlay'
import { useThemeStore } from '@/store/useThemeStore'
import { ThemeType } from '@/types/theme.type'
import { AntDesign, Ionicons } from '@expo/vector-icons'
import React from 'react'
import {
  FlatList,
  Modal,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native'
import OverlayContainer from '../components/overlay-container'

const ShareOverlay: React.FC = () => {
  const theme = useTheme()
  const color = useThemeStore((s) => s.colorLevelUp.background_color)
  const styles = createStyles(theme, color)

  const { shareOverlay, setShareOverlay, setNotificationOverlay } = useOverlay()
  const visible = !!shareOverlay
  const payload = shareOverlay
  useAuthStore((s) => s.user?.id)
  const [invited, setInvited] = React.useState<string[]>([])
  const [loadingIds, setLoadingIds] = React.useState<string[]>([])

  const close = () => {
    try {
      payload?.onClose?.()
    } finally {
      setShareOverlay(null)
    }
  }

  const invite = async (uid: string) => {
    if (loadingIds.includes(uid)) return
    setLoadingIds((s) => [...s, uid])
    try {
      await sendTopicInviteToUid(uid, payload!.topicId)
      // mark as invited locally so the plus button disappears for this user
      setInvited((s) => [...s, uid])

      setNotificationOverlay({
        id: `invite-sent-${payload?.topicId}-${uid}`,
        title: t('topicDetails.share.invite_sent_title'),
        body: t('topicDetails.share.invite_sent_message'),
        requireDecision: false,
      })
    } catch (e) {
      console.error('invite error', e)
      setNotificationOverlay({
        id: `invite-error-${payload?.topicId}-${uid}`,
        title: t('common.error'),
        body: t('topicDetails.share.invite_error'),
        requireDecision: false,
      })
    } finally {
      setLoadingIds((s) => s.filter((i) => i !== uid))
    }
  }

  if (!payload) return <></>

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      statusBarTranslucent
    >
      <OverlayContainer>
        <View style={styles.card}>
          <View style={styles.headerRow}>
            <Text variant="xLarge">{t('topicDetails.share.heading')}</Text>

            <TouchableOpacity onPress={close}>
              <Ionicons
                name="close"
                size={26}
                color={theme.colors.textPrimary}
              />
            </TouchableOpacity>
          </View>

          {payload.connections.length === 0 ? (
            <Text style={styles.message}>
              {t('topicDetails.share.no_connections')}
            </Text>
          ) : (
            <FlatList
              data={payload.connections}
              keyExtractor={(i) => i.uid}
              style={styles.list}
              renderItem={({ item }) => (
                <View style={styles.row}>
                  <View style={styles.info}>
                    <Text variant="xLarge">
                      {item.name || item.email || item.uid}
                    </Text>
                    {item.email ? (
                      <Text variant="small">{item.email}</Text>
                    ) : null}
                  </View>

                  {!invited.includes(item.uid) ? (
                    <TouchableOpacity
                      onPress={() => invite(item.uid)}
                      disabled={loadingIds.includes(item.uid)}
                    >
                      <AntDesign
                        name="plus"
                        size={26}
                        color={theme.colors.textPrimary}
                      />
                    </TouchableOpacity>
                  ) : null}
                </View>
              )}
            />
          )}
        </View>
      </OverlayContainer>
    </Modal>
  )
}

export default ShareOverlay

const createStyles = (theme: ThemeType, color?: string) =>
  StyleSheet.create({
    card: {
      borderRadius: theme.border.radius12,
      padding: theme.spacings.medium,
      backgroundColor: color || theme.colors.backgroundSecondary,
    },
    message: { marginBottom: theme.spacings.small },
    list: {
      marginTop: theme.spacings.small,
      marginBottom: theme.spacings.small,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: theme.spacings.small,
    },
    info: { flex: 1, paddingRight: theme.spacings.medium },

    inviteBtn: {
      paddingHorizontal: 12,
      paddingVertical: theme.spacings.small,
      borderRadius: theme.spacings.small,
    },

    headerRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
  })
