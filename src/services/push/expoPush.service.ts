import Constants from 'expo-constants'
// @ts-ignore - types are provided by expo-notifications at runtime
import * as Notifications from 'expo-notifications'
import {
  collection,
  doc,
  getDocs,
  getFirestore,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore'
import { Platform } from 'react-native'
import { getFirebaseApp } from '../firebase/firebaseInit'

function db() {
  return getFirestore(getFirebaseApp())
}

export async function registerForPushNotificationsAsync(uid: string) {
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync()
    let finalStatus = existingStatus
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync()
      finalStatus = status
    }
    if (finalStatus !== 'granted') {
      return null
    }

    const projectId =
      (Constants?.expoConfig as any)?.extra?.eas?.projectId ||
      (Constants as any)?.easConfig?.projectId ||
      (Constants?.expoConfig as any)?.projectId

    const tokenResponse = await Notifications.getExpoPushTokenAsync(
      projectId ? { projectId } : (undefined as any),
    )
    const token = tokenResponse?.data
    if (!token) return null

    // Save/refresh token in Firestore
    const tokenDoc = doc(db(), 'users', uid, 'expoPushTokens', token)
    await setDoc(
      tokenDoc,
      {
        token,
        platform: Platform.OS,
        updatedAt: serverTimestamp(),
      } as any,
      { merge: true },
    )
    return token
  } catch {
    return null
  }
}

export async function sendPushToUser(
  toUid: string,
  payload: { title: string; body: string; data?: Record<string, any> },
) {
  try {
    const snap = await getDocs(
      collection(db(), 'users', toUid, 'expoPushTokens'),
    )
    const tokens = snap.docs
      .map((d) => (d.data() as any)?.token)
      .filter(Boolean)
    if (!tokens.length) return

    const messages = tokens.map((to) => ({
      to,
      sound: 'default',
      title: payload.title,
      body: payload.body,
      data: payload.data || {},
    }))

    await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(messages),
    })
  } catch {}
}
