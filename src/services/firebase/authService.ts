import {
  createUserWithEmailAndPassword,
  EmailAuthProvider,
  getAuth,
  onAuthStateChanged,
  reauthenticateWithCredential,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  updateEmail,
  updatePassword,
  updateProfile,
} from 'firebase/auth'
// Note: For React Native persistence, we'll require RN-specific exports at runtime
import { useAuthStore } from '../../store/useAuthStore'
import { generateAvatarUrl, parseAvatarUrl } from '../profile/avatar.service'
import { getFirebaseApp } from './firebaseInit'
import { getUserAvatarMeta, upsertUserProfile } from './userProfile.service'

let authInstance: ReturnType<typeof getAuth> | undefined
let authReadyPromise: Promise<void> | null = null

export function getFirebaseAuth(): ReturnType<typeof getAuth> {
  if (authInstance) return authInstance

  const app = getFirebaseApp()
  // In React Native, we must explicitly initialize Auth with AsyncStorage persistence
  // to ensure sessions persist across app reloads. Fallback to getAuth if already initialized.
  try {
    const { initializeAuth } = require('firebase/auth')
    const { getReactNativePersistence } = require('firebase/auth')
    const AsyncStorage =
      require('@react-native-async-storage/async-storage').default
    authInstance = initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage),
    })
  } catch {
    // If Auth was already initialized for this app, get the existing instance
    authInstance = getAuth(app)
  }
  return authInstance as ReturnType<typeof getAuth>
}

export function waitForAuthReady() {
  if (authReadyPromise) return authReadyPromise

  const auth = getFirebaseAuth()
  const { login, logout } = useAuthStore.getState()

  authReadyPromise = new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        login(mapFirebaseUser(user))
        // Hydrate avatar metadata from Firestore
        hydrateUserAvatarMeta(user).catch(() => {})
        // Ensure Firestore profile exists with basic fields
        upsertUserProfile({
          name: user.displayName ?? user.email,
          email: user.email,
        }).catch(() => {})
      } else {
        logout()
      }
      unsubscribe()
      resolve()
    })
  })

  return authReadyPromise
}

export function initFirebaseAuthListener() {
  const auth = getFirebaseAuth()
  const { login, logout } = useAuthStore.getState()

  onAuthStateChanged(auth, (user) => {
    if (user) {
      login(mapFirebaseUser(user))
      hydrateUserAvatarMeta(user).catch(() => {})
      upsertUserProfile({
        name: user.displayName ?? user.email,
        email: user.email,
      }).catch(() => {})
    } else {
      logout()
    }
  })
}

export async function firebaseLogin(email: string, password: string) {
  const res = await signInWithEmailAndPassword(
    getFirebaseAuth(),
    email,
    password,
  )
  const user = res.user

  const { login } = useAuthStore.getState()
  login(mapFirebaseUser(user))

  return res
}

export async function firebaseLogout() {
  const { logout } = useAuthStore.getState()
  logout()
  return signOut(getFirebaseAuth())
}

export async function firebaseRegister(email: string, password: string) {
  return createUserWithEmailAndPassword(getFirebaseAuth(), email, password)
}

export async function firebaseSendPasswordReset(email: string) {
  return sendPasswordResetEmail(getFirebaseAuth(), email)
}

// Helpers and profile update flows

export function getCurrentUser() {
  return getFirebaseAuth().currentUser
}

function mapFirebaseUser(user: import('firebase/auth').User) {
  return {
    id: user.uid,
    name: user.displayName ?? user.email ?? 'User',
    email: user.email ?? null,
    avatarUrl: user.photoURL ?? null,
  }
}

export async function updateDisplayName(displayName: string) {
  const user = getCurrentUser()
  if (!user) throw new Error('Not authenticated')
  await updateProfile(user, { displayName })
  useAuthStore.getState().updateUser({ name: displayName })
  upsertUserProfile({ name: displayName }).catch(() => {})
}

export async function updateAvatarUrl(avatarUrl: string) {
  const user = getCurrentUser()
  if (!user) throw new Error('Not authenticated')
  await updateProfile(user, { photoURL: avatarUrl })
  useAuthStore.getState().updateUser({ avatarUrl })
}

async function reauth(currentPassword: string) {
  const user = getCurrentUser()
  if (!user?.email) throw new Error('Not authenticated')
  const credential = EmailAuthProvider.credential(user.email, currentPassword)
  await reauthenticateWithCredential(user, credential)
  return user
}

export async function changeEmail(currentPassword: string, newEmail: string) {
  const user = await reauth(currentPassword)
  await updateEmail(user, newEmail)
  await sendEmailVerification(user)
  useAuthStore.getState().updateUser({ email: newEmail })
  upsertUserProfile({ email: newEmail }).catch(() => {})
}

export async function changePassword(
  currentPassword: string,
  newPassword: string,
) {
  const user = await reauth(currentPassword)
  await updatePassword(user, newPassword)
}

async function hydrateUserAvatarMeta(user: import('firebase/auth').User) {
  try {
    const meta = await getUserAvatarMeta(user.uid)
    if (!meta) return
    const { avatarStyle, avatarSeed } = meta
    if (!avatarStyle || !avatarSeed) return
    const store = useAuthStore.getState()
    store.updateUser({ avatarStyle, avatarSeed })
    const currentPhoto = user.photoURL || null
    const isDice = currentPhoto ? parseAvatarUrl(currentPhoto) : null
    const desiredUrl = generateAvatarUrl(avatarStyle as any, avatarSeed as any)
    // If no photoURL or it was a dicebear with different params, update local store
    if (!currentPhoto || (isDice && currentPhoto !== desiredUrl)) {
      // Only update local store; avoid forcing remote profile change unexpectedly
      store.updateUser({ avatarUrl: desiredUrl })
    }
  } catch {
    // swallow
  }
}
