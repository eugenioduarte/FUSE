import {
  doc,
  getDoc,
  getFirestore,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore'
import { useAuthStore } from '../../store/auth.store'
import { getCurrentUser } from './authService'
import { getFirebaseApp } from './firebaseInit'

export async function setUserAvatarMeta(params: {
  avatarStyle: string
  avatarSeed: string
}) {
  const user = getCurrentUser()
  if (!user) throw new Error('Not authenticated')
  const db = getFirestore(getFirebaseApp())
  const ref = doc(db, 'users', user.uid)
  await setDoc(
    ref,
    {
      avatarStyle: params.avatarStyle,
      avatarSeed: params.avatarSeed,
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  )
  // reflect locally as well
  useAuthStore.getState().updateUser({
    avatarStyle: params.avatarStyle,
    avatarSeed: params.avatarSeed,
  })
}

export async function upsertUserProfile(fields: {
  name?: string | null
  email?: string | null
  avatarStyle?: string | null
  avatarSeed?: string | null
}) {
  const user = getCurrentUser()
  if (!user) throw new Error('Not authenticated')
  const db = getFirestore(getFirebaseApp())
  const ref = doc(db, 'users', user.uid)
  const payload: Record<string, any> = { updatedAt: serverTimestamp() }
  if ('name' in fields) payload.name = fields.name
  if ('email' in fields) payload.email = fields.email
  if ('avatarStyle' in fields) payload.avatarStyle = fields.avatarStyle
  if ('avatarSeed' in fields) payload.avatarSeed = fields.avatarSeed
  await setDoc(ref, payload, { merge: true })
  useAuthStore.getState().updateUser(fields)
}

export async function getUserAvatarMeta(uid: string): Promise<{
  avatarStyle?: string
  avatarSeed?: string
} | null> {
  const db = getFirestore(getFirebaseApp())
  const ref = doc(db, 'users', uid)
  const snap = await getDoc(ref)
  if (!snap.exists()) return null
  const data = snap.data() || {}
  const { avatarStyle, avatarSeed } = data as any
  return { avatarStyle, avatarSeed }
}
