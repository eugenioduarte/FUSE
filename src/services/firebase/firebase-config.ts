import Constants from 'expo-constants'

const extras: any = (Constants?.expoConfig as any)?.extra?.firebase || {}

export const firebaseConfig = {
  apiKey: extras.FIREBASE_API_KEY || process.env.FIREBASE_API_KEY || '',
  authDomain:
    extras.FIREBASE_AUTH_DOMAIN || process.env.FIREBASE_AUTH_DOMAIN || '',
  projectId:
    extras.FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID || '',
  storageBucket:
    extras.FIREBASE_STORAGE_BUCKET || process.env.FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId:
    extras.FIREBASE_MESSAGING_SENDER_ID ||
    process.env.FIREBASE_MESSAGING_SENDER_ID ||
    '',
  appId: extras.FIREBASE_APP_ID || process.env.FIREBASE_APP_ID || '',
  measurementId:
    extras.FIREBASE_MEASUREMENT_ID || process.env.FIREBASE_MEASUREMENT_ID || '',
}
