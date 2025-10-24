import { RouteProp, useRoute } from '@react-navigation/native'
import { doc, getDoc, getFirestore } from 'firebase/firestore'
import React, { useEffect, useRef, useState } from 'react'
import {
  FlatList,
  KeyboardAvoidingView,
  ListRenderItem,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated'
import { RootStackParamList } from '../../../../navigation/navigatorManager'
import {
  listenTopicChat,
  sendTopicChatMessage,
  TopicChatMessage,
} from '../../../../services/firebase/chat.service'
import { getFirebaseApp } from '../../../../services/firebase/firebaseInit'
import { useAuthStore } from '../../../../store/useAuthStore'

// Simple local message shape for mock/chat simulation
type ChatMessage = TopicChatMessage

const AnimatedView = Animated.View

const TopicChatScreen: React.FC = () => {
  const route = useRoute<RouteProp<RootStackParamList, 'TopicChatScreen'>>()
  const { topicId } = route.params
  // When real chat is wired, we'll subscribe using topicId
  useEffect(() => {
    // placeholder side-effect referencing topicId
  }, [topicId])
  const myUid = useAuthStore((s) => s.user?.id || 'me')
  const myName = useAuthStore((s) => s.user?.name || 'Você')

  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [nameByUid, setNameByUid] = useState<Record<string, string>>({
    [myUid]: myName,
  })

  const listRef = useRef<FlatList<ChatMessage>>(null)

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    requestAnimationFrame(() => {
      try {
        listRef.current?.scrollToEnd({ animated: true })
      } catch {}
    })
  }, [messages.length])

  // Subscribe to Firestore chat in real-time
  useEffect(() => {
    const unsub = listenTopicChat(topicId, (msgs) => setMessages(msgs))
    return () => {
      try {
        unsub()
      } catch {}
    }
  }, [topicId])

  // Resolve display names for other participants (from users/{uid})
  useEffect(() => {
    const others = messages
      .map((m) => m.authorId)
      .filter((uid) => uid && uid !== myUid)
    const unique = Array.from(new Set(others))
    const missing = unique.filter((uid) => !(uid in nameByUid))
    if (missing.length === 0) return
    const loadNames = async () => {
      const db = getFirestore(getFirebaseApp())
      const updates: Record<string, string> = {}
      for (const uid of missing) {
        try {
          const snap = await getDoc(doc(db, 'users', uid))
          if (snap.exists()) {
            const data: any = snap.data()
            updates[uid] = data?.name || data?.email || uid
          } else {
            updates[uid] = uid
          }
        } catch {
          updates[uid] = uid
        }
      }
      setNameByUid((prev) => ({ ...prev, ...updates }))
    }
    loadNames()
  }, [messages, myUid, nameByUid])

  const onSend = async () => {
    const text = input.trim()
    if (!text) return
    try {
      await sendTopicChatMessage(topicId, text)
      setInput('')
    } catch (e) {
      // Optional: surface a toast later
      console.error('Failed to send message', e)
    }
  }

  const renderItem: ListRenderItem<ChatMessage> = ({ item }) => {
    const isMine = item.authorId === myUid
    const senderName = nameByUid[item.authorId] || item.authorId
    return (
      <AnimatedView
        entering={FadeIn.duration(150)}
        exiting={FadeOut.duration(120)}
        style={{
          width: '100%',
          paddingVertical: 6,
          paddingHorizontal: 12,
          alignItems: isMine ? 'flex-end' : 'flex-start',
        }}
      >
        {isMine ? null : (
          <Text
            style={{
              color: 'rgba(255,255,255,0.8)',
              fontSize: 11,
              marginBottom: 4,
              marginLeft: 6,
            }}
            numberOfLines={1}
          >
            {senderName}
          </Text>
        )}
        <View
          style={{
            maxWidth: '85%',
            backgroundColor: isMine ? '#3b82f6' : '#1f2937',
            borderRadius: 14,
            paddingHorizontal: 12,
            paddingVertical: 8,
            borderTopLeftRadius: isMine ? 14 : 4,
            borderTopRightRadius: isMine ? 4 : 14,
            alignSelf: isMine ? 'flex-end' : 'flex-start',
            marginLeft: isMine ? 48 : 0,
            marginRight: isMine ? 0 : 48,
          }}
        >
          <Text style={{ color: 'white' }}>{item.text}</Text>
          <Text
            style={{
              width: '100%',
              color: 'rgba(255,255,255,0.6)',
              fontSize: 10,
              marginTop: 4,
              textAlign: isMine ? 'right' : 'left',
            }}
          >
            {(item.createdAt
              ? // Firestore Timestamp or number/date string handling
                typeof (item as any).createdAt?.toDate === 'function'
                ? (item as any).createdAt.toDate()
                : new Date(item.createdAt as any)
              : new Date()
            ).toLocaleTimeString()}
          </Text>
        </View>
      </AnimatedView>
    )
  }

  const keyExtractor = (m: ChatMessage) => m.id

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: '#0b0b0c' }}
      behavior={Platform.select({ ios: 'padding', android: undefined })}
      keyboardVerticalOffset={
        Platform.select({ ios: 76, android: 0 }) as number
      }
    >
      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        onContentSizeChange={() =>
          listRef.current?.scrollToEnd({ animated: true })
        }
      />

      {/* Input docked at bottom */}
      <View
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          padding: 12,
          backgroundColor: '#0b0b0c',
          borderTopWidth: 1,
          borderTopColor: '#1f2937',
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <TextInput
            placeholder="Escreva uma mensagem"
            placeholderTextColor="#9ca3af"
            value={input}
            onChangeText={setInput}
            multiline
            style={{
              flex: 1,
              minHeight: 40,
              maxHeight: 120,
              color: 'white',
              backgroundColor: '#111214',
              borderColor: '#27272a',
              borderWidth: 1,
              borderRadius: 10,
              paddingHorizontal: 12,
              paddingVertical: 8,
              marginBottom: 50,
            }}
          />
          <TouchableOpacity
            onPress={onSend}
            style={{
              backgroundColor: '#2563eb',
              paddingHorizontal: 14,
              paddingVertical: 10,
              borderRadius: 10,
              opacity: input.trim() ? 1 : 0.5,
            }}
            disabled={!input.trim()}
          >
            <Text style={{ color: 'white', fontWeight: '700' }}>Enviar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  )
}

export default TopicChatScreen
