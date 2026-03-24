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
import { useAuthStore } from '../../store/auth.store'
import { generateAvatarUrl, parseAvatarUrl } from '../profile/avatar.service'
import { getFirebaseApp } from './firebaseInit'
import { getUserAvatarMeta, upsertUserProfile } from './userProfile.service'

let authInstance: ReturnType<typeof getAuth> | undefined
let authReadyPromise: Promise<void> | null = null

export function getFirebaseAuth(): ReturnType<typeof getAuth> {
  if (authInstance) return authInstance

  const app = getFirebaseApp()
  // In React Native, we initialize Auth with expo-secure-store for encrypted persistence
  // (MASVS-STORAGE-1: tokens stored in encrypted storage, not plaintext AsyncStorage).
  // expo-secure-store uses iOS Keychain and Android Keystore under the hood.
  try {
    const { initializeAuth, getReactNativePersistence } = require('firebase/auth')
    const SecureStore = require('expo-secure-store')
    // expo-secure-store only allows [A-Za-z0-9._-] in keys.
    // Firebase uses colons in its keys (e.g. 'firebase:authUser:apiKey:appId'),
    // so we sanitize before every call to avoid silent failures.
    const sanitizeKey = (key: string) => key.replace(/[^A-Za-z0-9._-]/g, '_')
    // expo-secure-store has a 2048 byte limit per entry. Firebase auth tokens can
    // exceed this, so we chunk large values across multiple keys.
    const CHUNK_SIZE = 1800
    const secureStoreAdapter = {
      getItem: async (key: string) => {
        const k = sanitizeKey(key)
        const countStr = await SecureStore.getItemAsync(`${k}__chunks`)
        if (countStr) {
          const count = parseInt(countStr, 10)
          const parts = await Promise.all(
            Array.from({ length: count }, (_, i) =>
              SecureStore.getItemAsync(`${k}__chunk_${i}`),
            ),
          )
          if (parts.some((p) => p === null)) return null
          return parts.join('')
        }
        return SecureStore.getItemAsync(k)
      },
      setItem: async (key: string, value: string) => {
        const k = sanitizeKey(key)
        if (value.length <= CHUNK_SIZE) {
          // Clean up any leftover chunks from a previous large value
          const oldCount = await SecureStore.getItemAsync(`${k}__chunks`)
          if (oldCount) {
            const n = parseInt(oldCount, 10)
            await Promise.all([
              SecureStore.deleteItemAsync(`${k}__chunks`),
              ...Array.from({ length: n }, (_, i) =>
                SecureStore.deleteItemAsync(`${k}__chunk_${i}`),
              ),
            ])
          }
          return SecureStore.setItemAsync(k, value)
        }
        // Split into fixed-size chunks
        const chunks: string[] = []
        for (let i = 0; i < value.length; i += CHUNK_SIZE) {
          chunks.push(value.slice(i, i + CHUNK_SIZE))
        }
        await SecureStore.deleteItemAsync(k).catch(() => undefined)
        await Promise.all([
          SecureStore.setItemAsync(`${k}__chunks`, String(chunks.length)),
          ...chunks.map((chunk, i) =>
            SecureStore.setItemAsync(`${k}__chunk_${i}`, chunk),
          ),
        ])
      },
      removeItem: async (key: string) => {
        const k = sanitizeKey(key)
        const countStr = await SecureStore.getItemAsync(`${k}__chunks`)
        if (countStr) {
          const n = parseInt(countStr, 10)
          await Promise.all([
            SecureStore.deleteItemAsync(`${k}__chunks`),
            ...Array.from({ length: n }, (_, i) =>
              SecureStore.deleteItemAsync(`${k}__chunk_${i}`),
            ),
          ])
        }
        return SecureStore.deleteItemAsync(k)
      },
    }
    authInstance = initializeAuth(app, {
      persistence: getReactNativePersistence(secureStoreAdapter),
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
