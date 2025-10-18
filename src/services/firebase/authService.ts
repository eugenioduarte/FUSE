import {
  createUserWithEmailAndPassword,
  getAuth,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth'
import { useAuthStore } from '../../store/useAuthStore'
import { getFirebaseApp } from './firebaseInit'

let authInstance: ReturnType<typeof getAuth> | null = null
let authReadyPromise: Promise<void> | null = null

export function getFirebaseAuth() {
  if (authInstance) return authInstance

  const app = getFirebaseApp()
  authInstance = getAuth(app)
  return authInstance
}

export function waitForAuthReady() {
  if (authReadyPromise) return authReadyPromise

  const auth = getFirebaseAuth()
  const { login, logout } = useAuthStore.getState()

  authReadyPromise = new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        login({
          id: user.uid,
          name: user.email ?? 'Unknown',
        })
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
      login({
        id: user.uid,
        name: user.email ?? 'Unknown',
      })
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
  login({
    id: user.uid,
    name: user.email ?? 'Unknown',
  })

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
