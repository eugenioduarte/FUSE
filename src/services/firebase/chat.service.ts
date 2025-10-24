import {
  addDoc,
  collection,
  getFirestore,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore'
import { useAuthStore } from '../../store/useAuthStore'
import { getFirebaseAuth } from './authService'
import { getFirebaseApp } from './firebaseInit'

export type TopicChatMessage = {
  id: string
  authorId: string
  text: string
  createdAt: number
}

function db() {
  return getFirestore(getFirebaseApp())
}
const DEBUG_CHAT = false

function mapChatDoc(d: any): TopicChatMessage {
  const data = d.data()
  const createdAt: number =
    typeof data.createdAt === 'number'
      ? data.createdAt
      : (data.createdAt?.toMillis?.() ?? Date.now())
  return {
    id: d.id,
    authorId: String(data.authorId || ''),
    text: String(data.text || ''),
    createdAt,
  }
}

export type Unsubscribe = () => void

/**
 * Listen to a topic chat in real-time. Emits sorted messages (oldest first).
 */
export function listenTopicChat(
  topicId: string,
  onMessages: (msgs: TopicChatMessage[]) => void,
): Unsubscribe {
  const q = query(
    collection(db(), 'topics', topicId, 'chat'),
    orderBy('createdAt', 'asc'),
  )
  return onSnapshot(q, (snap) => {
    const list: TopicChatMessage[] = snap.docs.map(mapChatDoc)
    onMessages(list)
  })
}

/**
 * Send a chat message to a topic. Requires authenticated user.
 */
export async function sendTopicChatMessage(topicId: string, text: string) {
  // Prefer the authenticated Firebase uid to avoid stale store issues
  const authUid = getFirebaseAuth().currentUser?.uid || null
  const storeUid = useAuthStore.getState().user?.id || null
  const uid = authUid || storeUid
  // Debug: trace which uid we are sending as
  if (__DEV__ && DEBUG_CHAT) {
    try {
      console.log('[chat] sendTopicChatMessage uid', { authUid, storeUid, uid })
    } catch {}
  }
  if (!uid) throw new Error('Not authenticated')
  const payload = {
    authorId: uid,
    text,
    createdAt: serverTimestamp() as unknown as Timestamp,
  }
  await addDoc(collection(db(), 'topics', topicId, 'chat'), payload as any)
}
