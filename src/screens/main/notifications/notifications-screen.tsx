import React, { useEffect, useState } from 'react'
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import {
  getUserProfile,
  listenPendingConnectionRequests,
  respondToConnectionRequest,
} from '../../../services/firebase/connections.service'
import {
  acceptInvite,
  declineInvite,
  listenPendingInvites,
} from '../../../services/firebase/invites.service'
import { t } from '@/locales/translation'
import { useAuthStore } from '../../../store/useAuthStore'
import { NotificationInvite } from '../../../types/domain'

type InviteVM = { id: string; fromUser: string; topicId: string }
type ConnVM = { id: string; fromUser: string; fromName?: string | null }

const Separator = () => <View style={{ height: 12 }} />

const NotificationsScreen: React.FC = () => {
  const uid = useAuthStore((s) => s.user?.id)
  const [invites, setInvites] = useState<InviteVM[]>([])
  const [connections, setConnections] = useState<ConnVM[]>([])

  useEffect(() => {
    if (!uid) return
    const unsub = listenPendingInvites(uid, (list: NotificationInvite[]) => {
      setInvites(
        list.map((n: NotificationInvite) => ({
          id: n.id,
          fromUser: n.fromUser,
          topicId: n.topicId,
        })),
      )
    })
    const unsubConn = listenPendingConnectionRequests(uid, async (list) => {
      const enriched: ConnVM[] = []
      for (const r of list) {
        const profile = await getUserProfile(r.fromUser)
        enriched.push({
          id: r.id,
          fromUser: r.fromUser,
          fromName: profile?.name,
        })
      }
      setConnections(enriched)
    })
    return () => {
      unsub()
      unsubConn()
    }
  }, [uid])

  const renderItem = ({ item }: { item: InviteVM }) => (
    <View style={styles.card}>
      <Text style={styles.title}>{t('notifications.invite_topic')}</Text>
      <Text style={styles.body}>{t('notifications.from')} {item.fromUser}</Text>
      <Text style={styles.body}>{t('notifications.topic_label')} {item.topicId}</Text>
      <View style={{ flexDirection: 'row', gap: 12, marginTop: 8 }}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => acceptInvite(item.id)}
        >
          <Text style={styles.buttonText}>{t('notifications.accept')}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.secondary]}
          onPress={() => declineInvite(item.id)}
        >
          <Text style={styles.buttonText}>{t('notifications.decline')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  )

  // Connection cards are rendered in a footer component below

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={invites}
        keyExtractor={(item) => `invite-${item.id}`}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 16 }}
        ItemSeparatorComponent={Separator}
        ListHeaderComponent={
          invites.length ? (
            <Text style={[styles.title, { marginBottom: 8 }]}>{t('notifications.invites_header')}</Text>
          ) : null
        }
        ListFooterComponent={<ConnectionsFooter connections={connections} />}
      />
    </SafeAreaView>
  )
}

export default NotificationsScreen

const ConnectionsFooter: React.FC<{ connections: ConnVM[] }> = ({
  connections,
}) => (
  <>
    <Separator />
    <FlatList
      data={connections}
      keyExtractor={(item) => `conn-${item.id}`}
      renderItem={({ item }) => <ConnectionCard item={item} />}
      ItemSeparatorComponent={Separator}
    />
  </>
)
const ConnectionCard: React.FC<{ item: ConnVM }> = ({ item }) => (
  <View style={styles.card}>
    <Text style={styles.title}>{t('notifications.connection_request')}</Text>
    <Text style={styles.body}>{t('notifications.from')} {item.fromName || item.fromUser}</Text>
    <View style={{ flexDirection: 'row', gap: 12, marginTop: 8 }}>
      <TouchableOpacity
        style={styles.button}
        onPress={() => respondToConnectionRequest(item.id, 'accepted')}
      >
        <Text style={styles.buttonText}>{t('notifications.accept')}</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.button, styles.secondary]}
        onPress={() => respondToConnectionRequest(item.id, 'declined')}
      >
        <Text style={styles.buttonText}>{t('notifications.decline')}</Text>
      </TouchableOpacity>
    </View>
  </View>
)

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'black' },
  card: {
    backgroundColor: '#1e1e1e',
    padding: 16,
    borderRadius: 10,
  },
  cardRead: { opacity: 0.6 },
  title: { color: 'white', fontSize: 16, fontWeight: '700', marginBottom: 6 },
  body: { color: '#ddd' },
  button: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  secondary: {
    backgroundColor: '#374151',
  },
  buttonText: { color: 'white', fontWeight: '700' },
})
