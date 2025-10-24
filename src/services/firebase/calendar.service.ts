import {
  addDoc,
  arrayRemove,
  arrayUnion,
  collection,
  deleteDoc,
  doc,
  getFirestore,
  onSnapshot,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore'
import type { CalendarCommitment } from '../../types/calendar.type'
import { getFirebaseApp } from './firebaseInit'

export type NewSharedEvent = {
  title: string
  description?: string
  date: string // YYYY-MM-DD
  time?: string // HH:mm
  topicId?: string
  summaryId?: string
}

export type CalendarChange = {
  type: 'added' | 'modified' | 'removed'
  event: CalendarCommitment
}

function db() {
  return getFirestore(getFirebaseApp())
}

function mapEventDoc(d: any): CalendarCommitment {
  const data: any = d.data() || {}
  return {
    id: d.id,
    ownerUid: data.ownerUid,
    participants: Array.isArray(data.participants) ? data.participants : [],
    accepted: Array.isArray(data.accepted) ? data.accepted : [],
    title: data.title || 'Compromisso',
    description: data.description,
    topicId: data.topicId,
    summaryId: data.summaryId,
    date: data.date,
    time: data.time || '00:00',
    createdAt:
      typeof data.createdAt === 'number'
        ? data.createdAt
        : (data.createdAt?.toMillis?.() ?? Date.now()),
    updatedAt:
      typeof data.updatedAt === 'number'
        ? data.updatedAt
        : (data.updatedAt?.toMillis?.() ?? Date.now()),
  }
}

export async function createSharedEvent(
  ownerUid: string,
  payload: NewSharedEvent,
  participants: string[],
): Promise<string> {
  const base: any = {
    ownerUid,
    title: payload.title,
    description: payload.description || '',
    date: payload.date,
    time: payload.time || '00:00',
    participants: Array.isArray(participants) ? participants : [],
    accepted: [],
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  }
  if (payload.topicId !== undefined) base.topicId = payload.topicId
  if (payload.summaryId !== undefined) base.summaryId = payload.summaryId

  const ref = await addDoc(collection(db(), 'calendarEvents'), base)
  return ref.id
}

export function listenCalendarForUser(
  uid: string,
  onChange: (change: CalendarChange) => void,
) {
  const database = db()
  // Maintain membership sets to avoid false removals when docs move between queries
  const ownSet = new Set<string>()
  const accSet = new Set<string>()
  const partSet = new Set<string>()

  const handleRemoved = (id: string) => {
    // Only remove if it's not present in any set
    if (!ownSet.has(id) && !accSet.has(id) && !partSet.has(id)) {
      // We need a minimal event shape for removal; reuse last-known fields if needed
      onChange({ type: 'removed', event: { id } as any })
    }
  }

  const handleSnapshot = (
    which: 'own' | 'acc' | 'part',
    snap: import('firebase/firestore').QuerySnapshot,
  ) => {
    for (const ch of snap.docChanges()) {
      const id = ch.doc.id
      if (ch.type === 'removed') {
        if (which === 'own') ownSet.delete(id)
        else if (which === 'acc') accSet.delete(id)
        else partSet.delete(id)
        handleRemoved(id)
      } else {
        const ev = mapEventDoc(ch.doc)
        // Track membership
        if (which === 'own') ownSet.add(id)
        else if (which === 'acc') accSet.add(id)
        else partSet.add(id)
        onChange({ type: ch.type, event: ev })
      }
    }
  }

  const qOwn = query(
    collection(database, 'calendarEvents'),
    where('ownerUid', '==', uid),
  )
  const unsubOwn = onSnapshot(qOwn, (snap) => handleSnapshot('own', snap))

  const qAcc = query(
    collection(database, 'calendarEvents'),
    where('accepted', 'array-contains', uid),
  )
  const unsubAcc = onSnapshot(qAcc, (snap) => handleSnapshot('acc', snap))

  // Include pending invitations (participants) so invited users see as "pendente"
  const qPart = query(
    collection(database, 'calendarEvents'),
    where('participants', 'array-contains', uid),
  )
  const unsubPart = onSnapshot(qPart, (snap) => handleSnapshot('part', snap))

  return () => {
    try {
      unsubOwn()
    } catch {}
    try {
      unsubAcc()
    } catch {}
    try {
      unsubPart()
    } catch {}
  }
}

export async function acceptCalendarEvent(eventId: string, uid: string) {
  await updateDoc(doc(db(), 'calendarEvents', eventId), {
    accepted: arrayUnion(uid),
    updatedAt: serverTimestamp(),
  } as any)
}

/**
 * Leave a shared event: removes the user from participants and accepted arrays.
 * After this, the event will stop appearing for this user via realtime listeners.
 */
export async function leaveCalendarEvent(eventId: string, uid: string) {
  await updateDoc(doc(db(), 'calendarEvents', eventId), {
    participants: arrayRemove(uid),
    accepted: arrayRemove(uid),
    updatedAt: serverTimestamp(),
  } as any)
}

/**
 * Delete an event owned by the current user. Use only if the user is the owner.
 * Security rules should enforce ownership on delete. Caller must ensure ownership.
 */
export async function deleteOwnedCalendarEvent(eventId: string) {
  await deleteDoc(doc(db(), 'calendarEvents', eventId))
}
