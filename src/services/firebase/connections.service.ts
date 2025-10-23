import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore'
import { ConnectionRequest, RequestStatus } from '../../types/domain'
import { generateAvatarUrl } from '../profile/avatar.service'
import { getCurrentUser } from './authService'
import { getFirebaseApp } from './firebaseInit'

function db() {
  return getFirestore(getFirebaseApp())
}

export type PublicUser = {
  uid: string
  name: string | null
  email: string | null
  avatarUrl: string | null
}

function participantsKey(a: string, b: string) {
  return [a, b].sort((x, y) => x.localeCompare(y)).join('_')
}

export async function getUserProfile(uid: string): Promise<PublicUser | null> {
  const ref = doc(db(), 'users', uid)
  const snap = await getDoc(ref)
  if (!snap.exists()) return null
  const data = snap.data() as any
  const name = data.name ?? data.email ?? null
  const email = data.email ?? null
  const avatarStyle = data.avatarStyle || null
  const avatarSeed = data.avatarSeed || null
  const avatarUrl =
    avatarStyle && avatarSeed
      ? generateAvatarUrl(avatarStyle, avatarSeed)
      : null
  return { uid, name, email, avatarUrl }
}

export async function findUserByEmailFull(
  email: string,
): Promise<PublicUser | null> {
  const q = query(
    collection(db(), 'users'),
    where('email', '==', email.trim().toLowerCase()),
  )
  const snap = await getDocs(q)
  if (snap.empty) return null
  const uid = snap.docs[0].id
  return getUserProfile(uid)
}

export async function getConnectionRequestBetween(
  a: string,
  b: string,
): Promise<ConnectionRequest | null> {
  const key = participantsKey(a, b)
  const q = query(
    collection(db(), 'connectionRequests'),
    where('participantsKey', '==', key),
  )
  const snap = await getDocs(q)
  if (snap.empty) return null
  const d = snap.docs[0]
  const x = d.data() as any
  return {
    id: d.id,
    fromUser: x.fromUser,
    toUser: x.toUser,
    participantsKey: x.participantsKey,
    status: x.status,
    createdAt: x.createdAt?.toMillis?.() ?? Date.now(),
    updatedAt: x.updatedAt?.toMillis?.() ?? Date.now(),
  }
}

export async function sendConnectionRequest(toUid: string) {
  const me = getCurrentUser()
  if (!me) throw new Error('Not authenticated')
  if (me.uid === toUid)
    throw new Error('Não pode enviar pedido para si próprio')

  // Check existing
  const existing = await getConnectionRequestBetween(me.uid, toUid)
  if (existing && existing.status === 'pending') return existing

  const ref = collection(db(), 'connectionRequests')
  const res = await addDoc(ref, {
    fromUser: me.uid,
    toUser: toUid,
    participantsKey: participantsKey(me.uid, toUid),
    status: 'pending' as RequestStatus,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })

  // Create a notification for the recipient
  await addDoc(collection(db(), 'notifications'), {
    type: 'connection',
    toUser: toUid,
    fromUser: me.uid,
    requestId: res.id,
    status: 'pending',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })

  return res.id
}

export function listenConnectionRequest(
  keyA: string,
  keyB: string,
  cb: (req: ConnectionRequest | null) => void,
) {
  const key = participantsKey(keyA, keyB)
  const q = query(
    collection(db(), 'connectionRequests'),
    where('participantsKey', '==', key),
  )
  return onSnapshot(q, (snap) => {
    if (snap.empty) {
      cb(null)
      return
    }
    const d = snap.docs[0]
    const x = d.data() as any
    cb({
      id: d.id,
      fromUser: x.fromUser,
      toUser: x.toUser,
      participantsKey: x.participantsKey,
      status: x.status,
      createdAt: x.createdAt?.toMillis?.() ?? Date.now(),
      updatedAt: x.updatedAt?.toMillis?.() ?? Date.now(),
    })
  })
}

export async function respondToConnectionRequest(
  requestId: string,
  decision: Exclude<RequestStatus, 'pending'>,
) {
  const me = getCurrentUser()
  if (!me) throw new Error('Not authenticated')
  const reqRef = doc(db(), 'connectionRequests', requestId)
  const reqSnap = await getDoc(reqRef)
  if (!reqSnap.exists()) throw new Error('Pedido não encontrado')
  const req = reqSnap.data() as any
  // Only recipient can respond
  if (req.toUser !== me.uid)
    throw new Error('Sem permissão para responder a este pedido')

  await updateDoc(reqRef, { status: decision, updatedAt: serverTimestamp() })

  // Update related notification (not strictly required here)
  // naive: there's no requestId index; we assume a single notification was created with the id
  // For simplicity we won't back-link; consumers can look up by participantsKey if needed.

  if (decision === 'accepted') {
    await addMutualConnection(req.fromUser, req.toUser)
  }
}

export async function addMutualConnection(a: string, b: string) {
  const since = serverTimestamp()
  const usersCol = collection(db(), 'users')
  const aConnRef = doc(usersCol, a, 'connections', b)
  const bConnRef = doc(usersCol, b, 'connections', a)
  await Promise.all([
    setDoc(aConnRef, { since, status: 'accepted' }, { merge: true }),
    setDoc(bConnRef, { since, status: 'accepted' }, { merge: true }),
  ])
}

export async function isAlreadyConnected(
  a: string,
  b: string,
): Promise<boolean> {
  const connRef = doc(db(), 'users', a, 'connections', b)
  const snap = await getDoc(connRef)
  return snap.exists()
}

export function listenPendingConnectionRequests(
  uid: string,
  cb: (list: ConnectionRequest[]) => void,
) {
  const qy = query(
    collection(db(), 'connectionRequests'),
    where('toUser', '==', uid),
    where('status', '==', 'pending'),
  )
  return onSnapshot(qy, (snap) => {
    const list: ConnectionRequest[] = snap.docs.map((d) => {
      const x = d.data() as any
      return {
        id: d.id,
        fromUser: x.fromUser,
        toUser: x.toUser,
        participantsKey: x.participantsKey,
        status: x.status,
        createdAt: x.createdAt?.toMillis?.() ?? Date.now(),
        updatedAt: x.updatedAt?.toMillis?.() ?? Date.now(),
      }
    })
    cb(list)
  })
}
