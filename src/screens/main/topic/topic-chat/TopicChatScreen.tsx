import { Text, TextInput } from '@/components'
import { useTheme } from '@/hooks/useTheme'
import { t } from '@/locales/translation'
import { RootStackParamList } from '@/navigation/navigatorManager'
import { getFirebaseAuth } from '@/services/firebase/authService'
import {
  listenTopicChat,
  sendTopicChatMessage,
  TopicChatMessage,
} from '@/services/firebase/chat.service'
import { getFirebaseApp } from '@/services/firebase/firebaseInit'
import { useAuthStore } from '@/store/useAuthStore'
import { useThemeStore } from '@/store/useThemeStore'
import { ThemeType } from '@/types/theme.type'
import { Ionicons } from '@expo/vector-icons'
import { RouteProp, useRoute } from '@react-navigation/native'
import { doc, getDoc, getFirestore } from 'firebase/firestore'
import React, { useEffect, useRef, useState } from 'react'
import {
  FlatList,
  KeyboardAvoidingView,
  ListRenderItem,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native'
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated'

// Simple local message shape for mock/chat simulation
type ChatMessage = TopicChatMessage

const AnimatedView = Animated.View
const DEBUG_CHAT = false

const TopicChatScreen: React.FC = () => {
  const theme = useTheme()
  const color = useThemeStore((s) => s.colorLevelUp.background_color)
  const styles = createStyles(theme, color)

  const route = useRoute<RouteProp<RootStackParamList, 'TopicChatScreen'>>()
  const { topicId } = route.params

  const storeUid = useAuthStore((s) => s.user?.id || '')
  const myName = useAuthStore((s) => s.user?.name || t('topicChat.you'))
  const authUid = getFirebaseAuth().currentUser?.uid || ''
  const myUid = storeUid || authUid || ''

  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [nameByUid, setNameByUid] = useState<Record<string, string>>({})

  useEffect(() => {
    if (!myUid) return
    setNameByUid((prev) => ({ ...prev, [myUid]: myName }))
  }, [myUid, myName])

  const listRef = useRef<FlatList<ChatMessage>>(null)

  useEffect(() => {
    requestAnimationFrame(() => {
      try {
        listRef.current?.scrollToEnd({ animated: true })
      } catch {}
    })
  }, [messages.length])

  useEffect(() => {
    const unsub = listenTopicChat(topicId, (msgs) => setMessages(msgs))
    return () => {
      try {
        unsub()
      } catch {}
    }
  }, [topicId])

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
      console.error('Failed to send message', e)
    }
  }

  const renderItem: ListRenderItem<ChatMessage> = ({ item }) => {
    if (__DEV__ && DEBUG_CHAT) {
      console.log('Rendering message', item)
      console.log('Rendering message', myUid)
    }
    const isMine = item.authorId === myUid
    if (__DEV__ && DEBUG_CHAT) {
      try {
        console.log('[chat] render item', {
          id: item.id,
          authorId: item.authorId,
          myUid,
          isMine,
        })
      } catch {}
    }
    const senderName = nameByUid[item.authorId] || item.authorId
    const bubbleStyle = [
      styles.bubbleBase,
      isMine ? styles.bubbleMine : styles.bubbleOther,
    ]

    return (
      <AnimatedView
        entering={FadeIn.duration(150)}
        exiting={FadeOut.duration(120)}
        style={styles.messageContainer}
      >
        {!isMine && (
          <Text variant="small" style={styles.senderName} numberOfLines={1}>
            {senderName}
          </Text>
        )}

        <View style={bubbleStyle}>
          <Text variant="medium" style={styles.bubbleText}>
            {item.text}
          </Text>
          <Text
            variant="medium"
            style={[
              styles.timestamp,
              isMine ? styles.timestampRight : styles.timestampLeft,
            ]}
          >
            {(item.createdAt
              ? typeof (item as any).createdAt?.toDate === 'function'
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
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 76 : 0}
      enabled
    >
      <View style={styles.contentWrapper}>
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          onContentSizeChange={() =>
            listRef.current?.scrollToEnd({ animated: true })
          }
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          ListFooterComponent={<View style={styles.footerSpacer} />}
        />
      </View>
      <View style={styles.inputRow}>
        <View style={styles.inputWrapper}>
          <TextInput
            placeholder={t('topicChat.placeholder')}
            placeholderTextColor={theme.colors.backgroundTertiary}
            value={input}
            onChangeText={setInput}
            multiline
            scrollEnabled
            style={styles.textInput}
          />
        </View>

        <TouchableOpacity onPress={onSend} style={styles.sendButton}>
          <Ionicons
            name="send-sharp"
            size={26}
            color={theme.colors.textPrimary}
          />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  )
}

export default TopicChatScreen

const createStyles = (theme: ThemeType, color?: string) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: color,
      paddingTop: 0,
    },
    contentWrapper: { flex: 1 },

    listContent: { padding: 16, paddingBottom: 220 },
    footerSpacer: { height: 12 },
    inputRow: { flexDirection: 'row', padding: 16, alignItems: 'flex-start' },
    inputWrapper: { flex: 1, marginRight: 8 },
    textInput: {
      height: 50,
      paddingVertical: 10,
      color: theme.colors.backgroundTertiary,
      backgroundColor: theme.colors.black,
      borderColor: theme.colors.black,
      borderWidth: 1,
      borderRadius: 10,
      paddingHorizontal: 12,
    },
    sendButton: {
      width: 50,
      height: 50,
      borderRadius: 25,
      alignItems: 'center',
      justifyContent: 'center',
    },
    messageContainer: {
      width: '100%',
      paddingVertical: 6,
      paddingHorizontal: 12,
      alignItems: 'stretch',
    },
    senderName: {
      marginBottom: 4,
      marginLeft: 6,
      alignSelf: 'flex-start',
    },
    bubbleBase: {
      maxWidth: '85%',
      borderRadius: 14,
      paddingHorizontal: 12,
      paddingVertical: 8,
    },
    bubbleMine: {
      backgroundColor: '#3b82f6',
      borderTopLeftRadius: 14,
      borderTopRightRadius: 4,
      alignSelf: 'flex-end',
      marginLeft: 48,
      marginRight: 0,
    },
    bubbleOther: {
      backgroundColor: '#1f2937',
      borderTopLeftRadius: 4,
      borderTopRightRadius: 14,
      alignSelf: 'flex-start',
      marginLeft: 0,
      marginRight: 48,
    },
    timestampRight: { textAlign: 'right' },
    timestampLeft: { textAlign: 'left' },
    bubbleText: { color: theme.colors.backgroundTertiary },
    timestamp: {
      width: '100%',
      color: theme.colors.backgroundTertiary,
      fontSize: 10,
      marginTop: 4,
    },
  })
