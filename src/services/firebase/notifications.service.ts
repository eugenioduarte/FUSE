import {
  addDoc,
  collection,
  doc,
  getFirestore,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore'
import { sendPushToUser } from '../push/expo-push.service'
import { getFirebaseApp } from './firebase-init'

function pruneUndefined<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') return obj
  if (Array.isArray(obj))
    return obj.map((v) => (v === undefined ? null : pruneUndefined(v))) as any
  const out: Record<string, any> = {}
  for (const [k, v] of Object.entries(obj as any)) {
    if (v === undefined) continue
    out[k] = pruneUndefined(v as any)
  }
  return out as any
}

export type AppNotification = {
  id: string
  title?: string
  body?: string
  requireDecision?: boolean
  acceptLabel?: string
  denyLabel?: string
  status?: 'pending' | 'accepted' | 'denied' | 'read'
  createdAt?: number
  type?: string
  // Optional payload for certain types (e.g., calendar_invite)
  event?: {
    eventId?: string
    title: string
    description?: string
    date: string
    time?: string
    topicId?: string
    summaryId?: string
    invitedBy?: string
  }
}

function db() {
  return getFirestore(getFirebaseApp())
}

export function listenUserNotifications(
  uid: string,
  onData: (list: AppNotification[]) => void,
) {
  const q = query(
    collection(db(), 'users', uid, 'notifications'),
    orderBy('createdAt', 'desc'),
  )
  return onSnapshot(q, (snap) => {
    const res: AppNotification[] = snap.docs.map((d) => {
      const data: any = d.data() || {}
      return {
        id: d.id,
        title: data.title,
        body: data.body,
        requireDecision: !!data.requireDecision,
        acceptLabel: data.acceptLabel,
        denyLabel: data.denyLabel,
        status: data.status || 'pending',
        createdAt:
          typeof data.createdAt === 'number'
            ? data.createdAt
            : (data.createdAt?.toMillis?.() ?? Date.now()),
        type: data.type,
        event: data.event,
      }
    })
    onData(res)
  })
}

/**
 * Back-compat: also listen to top-level notifications addressed to this user.
 */
export function listenUserNotificationsTopLevel(
  uid: string,
  onData: (list: AppNotification[]) => void,
) {
  const qy = query(
    collection(db(), 'notifications'),
    where('toUser', '==', uid),
    where('status', '==', 'pending'),
  )
  return onSnapshot(qy, (snap) => {
    const res: AppNotification[] = snap.docs.map((d) => {
      const data: any = d.data() || {}
      return {
        id: d.id,
        title: data.title,
        body: data.body,
        requireDecision: data.requireDecision ?? true,
        acceptLabel: data.acceptLabel,
        denyLabel: data.denyLabel,
        status: data.status || 'pending',
        createdAt:
          typeof data.createdAt === 'number'
            ? data.createdAt
            : (data.createdAt?.toMillis?.() ?? Date.now()),
        type: data.type,
        event: data.event,
      }
    })
    onData(res)
  })
}

export async function markNotificationRead(uid: string, id: string) {
  await updateDoc(doc(db(), 'users', uid, 'notifications', id), {
    status: 'read',
    readAt: serverTimestamp(),
  } as any)
}

export async function decideNotification(
  uid: string,
  id: string,
  decision: 'accepted' | 'denied',
) {
  await updateDoc(doc(db(), 'users', uid, 'notifications', id), {
    status: decision,
    decisionAt: serverTimestamp(),
  } as any)
}

/**
 * Back-compat: Decide a top-level notification (stored in the root 'notifications' collection).
 */
export async function decideNotificationTopLevel(
  id: string,
  decision: 'accepted' | 'denied',
) {
  await updateDoc(doc(db(), 'notifications', id), {
    status: decision,
    decisionAt: serverTimestamp(),
  } as any)
}

export type NewAppNotificationInput = {
  title?: string
  body?: string
  requireDecision?: boolean
  acceptLabel?: string
  denyLabel?: string
}

/**
 * Create a new notification for the given user.
 * Handy for local testing or server-side triggers.
 */
export async function pushUserNotification(
  uid: string,
  data: NewAppNotificationInput,
) {
  const payload = {
    title: data.title || '',
    body: data.body || '',
    requireDecision: !!data.requireDecision,
    acceptLabel: data.acceptLabel,
    denyLabel: data.denyLabel,
    status: 'pending' as const,
    createdAt: serverTimestamp(),
  }
  await addDoc(collection(db(), 'users', uid, 'notifications'), payload as any)
}

export async function pushCalendarInvite(
  toEmail: string,
  event: {
    title: string
    description?: string
    date: string
    time?: string
    topicId?: string
    summaryId?: string
    invitedBy?: string
  },
) {
  // Resolve user uid by email using existing helper
  const { findUserByEmail } = await import('./invites.service')
  const uid = await findUserByEmail(toEmail)
  if (!uid) throw new Error('Utilizador não encontrado')
  const body = `${event.title} em ${event.date}${event.time ? ' às ' + event.time : ''}`
  await addDoc(collection(db(), 'users', uid, 'notifications'), {
    title: 'Convite de Calendário',
    body,
    requireDecision: true,
    acceptLabel: 'Aceitar',
    denyLabel: 'Recusar',
    status: 'pending',
    createdAt: serverTimestamp(),
    type: 'calendar_invite',
    event: pruneUndefined(event),
  } as any)
}

export async function pushCalendarInviteToUid(
  toUid: string,
  event: {
    eventId?: string
    title: string
    description?: string
    date: string
    time?: string
    topicId?: string
    summaryId?: string
    invitedBy?: string
  },
) {
  const body = `${event.title} em ${event.date}${event.time ? ' às ' + event.time : ''}`
  await addDoc(collection(db(), 'users', toUid, 'notifications'), {
    title: 'Convite de Calendário',
    body,
    requireDecision: true,
    acceptLabel: 'Aceitar',
    denyLabel: 'Recusar',
    status: 'pending',
    createdAt: serverTimestamp(),
    type: 'calendar_invite',
    event: pruneUndefined(event),
  } as any)
  // Fire-and-forget push notification if the user has Expo tokens
  try {
    await sendPushToUser(toUid, {
      title: 'Convite de Calendário',
      body,
      data: { type: 'calendar_invite', event: pruneUndefined(event) },
    })
  } catch {}
}
