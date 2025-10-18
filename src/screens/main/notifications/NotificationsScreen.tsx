import React from 'react'
import {
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'

interface NotificationItem {
  id: string
  title: string
  body: string
  read?: boolean
}

const sampleData: NotificationItem[] = [
  { id: '1', title: 'Welcome', body: 'Thanks for joining!', read: false },
  {
    id: '2',
    title: 'Calendar',
    body: 'Your event starts in 1 hour',
    read: true,
  },
]

const Separator = () => <View style={{ height: 12 }} />

const NotificationsScreen: React.FC = () => {
  const renderItem = ({ item }: { item: NotificationItem }) => (
    <TouchableOpacity style={[styles.card, item.read && styles.cardRead]}>
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.body}>{item.body}</Text>
    </TouchableOpacity>
  )

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={sampleData}
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
})
