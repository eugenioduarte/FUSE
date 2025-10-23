import {
  addDoc,
  arrayUnion,
  collection,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  onSnapshot,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore'
import { useAuthStore } from '../../store/useAuthStore'
import { NotificationInvite, Topic } from '../../types/domain'
import { getCurrentUser } from './authService'
import { getFirebaseApp } from './firebaseInit'

function db() {
  return getFirestore(getFirebaseApp())
}

export async function findUserByEmail(email: string): Promise<string | null> {
  const q = query(
    collection(db(), 'users'),
    where('email', '==', email.trim().toLowerCase()),
  )
  const snap = await getDocs(q)
  if (snap.empty) return null
  const uid = snap.docs[0].id
  return uid
}

export async function sendTopicInvite(toEmail: string, topicId: string) {
  const from = getCurrentUser()
  if (!from) throw new Error('Not authenticated')
  const toUid = await findUserByEmail(toEmail)
  if (!toUid) throw new Error('Utilizador não encontrado')

  const ref = collection(db(), 'notifications')
  await addDoc(ref, {
    type: 'invite',
    toUser: toUid,
    fromUser: from.uid,
    topicId,
    status: 'pending',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
}

export function listenPendingInvites(
  uid: string,
  cb: (invites: NotificationInvite[]) => void,
) {
  const q = query(
    collection(db(), 'notifications'),
    where('toUser', '==', uid),
    where('status', '==', 'pending'),
    where('type', '==', 'invite'),
  )
  return onSnapshot(q, (snap) => {
    const list: NotificationInvite[] = snap.docs.map((d) => {
      const data = d.data() as any
      return {
        id: d.id,
        type: data.type,
        toUser: data.toUser,
        fromUser: data.fromUser,
        topicId: data.topicId,
        status: data.status,
        createdAt: (data.createdAt?.toMillis?.() ?? Date.now()) as number,
        updatedAt: (data.updatedAt?.toMillis?.() ?? Date.now()) as number,
      }
    })
    cb(list)
  })
}

export async function acceptInvite(inviteId: string) {
  const me = getCurrentUser()
  if (!me) throw new Error('Not authenticated')
  const notifRef = doc(db(), 'notifications', inviteId)
  const notifDoc = await getDoc(notifRef)
  const data = notifDoc.data() as any
  const topicId = data?.topicId as string
  if (topicId) {
    const topicRef = doc(db(), 'topics', topicId)
    // Append to members array safely
    await updateDoc(topicRef, {
      members: arrayUnion(me.uid),
      updatedAt: serverTimestamp(),
    })
  }
  await updateDoc(notifRef, {
    status: 'accepted',
    updatedAt: serverTimestamp(),
  })
  // Optionally refresh local membership cache
  try {
    const { syncUserTopicsMembership } = await import('./invites.service')
    await syncUserTopicsMembership()
  } catch {}
}

export async function declineInvite(inviteId: string) {
  const notifRef = doc(db(), 'notifications', inviteId)
  await updateDoc(notifRef, {
    status: 'declined',
    updatedAt: serverTimestamp(),
  })
}

export async function syncUserTopicsMembership() {
  const me = useAuthStore.getState().user
  if (!me?.id) return
  // Fetch topics where members contains me.id and upsert locally if known shape
  const q = query(
    collection(db(), 'topics'),
    where('members', 'array-contains', me.id),
  )
  const snap = await getDocs(q)
  for (const d of snap.docs) {
    const t = d.data() as any
    const topic: Topic = {
      id: d.id,
      title: t.title || 'Tópico',
      description: t.description,
      backgroundColor: t.backgroundColor,
      createdBy: t.createdBy,
      members: t.members,
      createdAt: t.createdAt?.toMillis?.() ?? Date.now(),
      updatedAt: t.updatedAt?.toMillis?.() ?? Date.now(),
    }
    // Lazy import to avoid circular deps
    const { topicsRepository } = await import(
      '../repositories/topics.repository'
    )
    await topicsRepository.upsert(topic, '/sync/topic')
  }
}
