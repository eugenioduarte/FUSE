import { t } from '@/locales/translation'
import { sendTopicInviteToUid } from '@/services/firebase/invites.service'
import { useAuthStore } from '@/store/useAuthStore'
import { useOverlay } from '@/store/useOverlay'
import React from 'react'
import {
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'

const ShareOverlay: React.FC = () => {
  const { shareOverlay, setShareOverlay, setNotificationOverlay } = useOverlay()
  const visible = !!shareOverlay
  const payload = shareOverlay
  useAuthStore((s) => s.user?.id)

  const close = () => {
    try {
      payload?.onClose?.()
    } finally {
      setShareOverlay(null)
    }
  }

  const invite = async (uid: string) => {
    try {
      await sendTopicInviteToUid(uid, payload!.topicId)
      // show success notification
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
      // keep overlay open so user can invite others, but optionally close
    }
  }

  if (!payload) return null

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      statusBarTranslucent
    >
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <Text style={styles.title}>{t('topicDetails.share.heading')}</Text>

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
                    <Text style={styles.name}>
                      {item.name || item.email || item.uid}
                    </Text>
                    {item.email ? (
                      <Text style={styles.email}>{item.email}</Text>
                    ) : null}
                  </View>
                  <TouchableOpacity
                    style={styles.inviteBtn}
                    onPress={() => invite(item.uid)}
                  >
                    <Text style={styles.inviteText}>
                      {t('topicDetails.share.invite_button')}
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            />
          )}

          <View style={styles.footerRow}>
            <TouchableOpacity style={styles.closeBtn} onPress={close}>
              <Text style={styles.closeText}>{t('common.close')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  )
}

export default ShareOverlay

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    width: '100%',
    maxHeight: '80%',
    backgroundColor: '#1c1c1e',
    borderRadius: 12,
    padding: 16,
  },
  title: { color: 'white', fontSize: 18, fontWeight: '700', marginBottom: 8 },
  message: { color: '#ddd', marginBottom: 8 },
  list: { marginTop: 8, marginBottom: 8 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.04)',
  },
  info: { flex: 1, paddingRight: 12 },
  name: { color: 'white', fontWeight: '600' },
  email: { color: '#cbd5e1', fontSize: 12 },
  inviteBtn: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  inviteText: { color: 'white', fontWeight: '700' },
  footerRow: { marginTop: 12, alignItems: 'flex-end' },
  closeBtn: { paddingVertical: 8, paddingHorizontal: 12 },
  closeText: { color: '#e5e7eb' },
})
