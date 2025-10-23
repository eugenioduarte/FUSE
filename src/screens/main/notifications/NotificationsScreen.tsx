import React, { useEffect, useState } from 'react'
import {
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import {
  acceptInvite,
  declineInvite,
  listenPendingInvites,
} from '../../../services/firebase/invites.service'
import { useAuthStore } from '../../../store/useAuthStore'
import { NotificationInvite } from '../../../types/domain'

type InviteVM = { id: string; fromUser: string; topicId: string }

const Separator = () => <View style={{ height: 12 }} />

const NotificationsScreen: React.FC = () => {
  const uid = useAuthStore((s) => s.user?.id)
  const [invites, setInvites] = useState<InviteVM[]>([])

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
    return () => unsub()
  }, [uid])

  const renderItem = ({ item }: { item: InviteVM }) => (
    <View style={styles.card}>
      <Text style={styles.title}>Convite para tópico</Text>
      <Text style={styles.body}>De: {item.fromUser}</Text>
      <Text style={styles.body}>Tópico: {item.topicId}</Text>
      <View style={{ flexDirection: 'row', gap: 12, marginTop: 8 }}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => acceptInvite(item.id)}
        >
          <Text style={styles.buttonText}>Aceitar</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.secondary]}
          onPress={() => declineInvite(item.id)}
        >
          <Text style={styles.buttonText}>Recusar</Text>
        </TouchableOpacity>
      </View>
    </View>
  )

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={invites}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 16 }}
        ItemSeparatorComponent={Separator}
      />
    </SafeAreaView>
  )
}

export default NotificationsScreen

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
