import { t } from '@/locales/translation'
import { RootStackParamList } from '@/navigation/navigator-manager'
import { getFirebaseAuth } from '@/services/firebase/auth.service'
import {
  listenTopicChat,
  sendTopicChatMessage,
  TopicChatMessage,
} from '@/services/firebase/chat.service'
import { getFirebaseApp } from '@/services/firebase/firebase-init'
import { useAuthStore } from '@/store/auth.store'
import { RouteProp, useRoute } from '@react-navigation/native'
import { doc, getDoc, getFirestore } from 'firebase/firestore'
import { useEffect, useRef, useState } from 'react'
import { FlatList } from 'react-native'

type ChatMessage = TopicChatMessage

export type UseTopicChatReturn = {
  topicId: string
  messages: ChatMessage[]
  input: string
  setInput: (value: string) => void
  onSend: () => Promise<void>
  listRef: React.RefObject<FlatList<ChatMessage> | null>
  myUid: string
  nameByUid: Record<string, string>
}

export function useTopicChat(): UseTopicChatReturn {
  const route = useRoute<RouteProp<RootStackParamList, 'TopicChatScreen'>>()
  const { topicId } = route.params

  const storeUid = useAuthStore((s) => s.user?.id || '')
  const myName = useAuthStore((s) => s.user?.name || t('topicChat.you'))
  const authUid = getFirebaseAuth().currentUser?.uid || ''
  const myUid = storeUid || authUid || ''

  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [nameByUid, setNameByUid] = useState<Record<string, string>>({})

  const listRef = useRef<FlatList<ChatMessage>>(null)

  useEffect(() => {
    if (!myUid) return
    setNameByUid((prev) => ({ ...prev, [myUid]: myName }))
  }, [myUid, myName])

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

  return {
    topicId,
    messages,
    input,
    setInput,
    onSend,
    listRef,
    myUid,
    nameByUid,
  }
}
