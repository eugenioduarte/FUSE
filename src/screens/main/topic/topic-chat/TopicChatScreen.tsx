import { RouteProp, useRoute } from '@react-navigation/native'
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
import { useAuthStore } from '../../../../store/useAuthStore'
import {
  listenTopicChat,
  sendTopicChatMessage,
  TopicChatMessage,
} from '../../../../services/firebase/chat.service'

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

  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<ChatMessage[]>([])

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
    return (
      <AnimatedView
        entering={FadeIn.duration(150)}
        exiting={FadeOut.duration(120)}
        style={{
          paddingVertical: 6,
          paddingHorizontal: 12,
          alignItems: isMine ? 'flex-end' : 'flex-start',
        }}
      >
        <View
          style={{
            maxWidth: '85%',
            backgroundColor: isMine ? '#3b82f6' : '#1f2937',
            borderRadius: 14,
            paddingHorizontal: 12,
            paddingVertical: 8,
          }}
        >
          <Text style={{ color: 'white' }}>{item.text}</Text>
          <Text
            style={{
              color: 'rgba(255,255,255,0.6)',
              fontSize: 10,
              marginTop: 4,
            }}
          >
            {new Date(item.createdAt).toLocaleTimeString()}
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
