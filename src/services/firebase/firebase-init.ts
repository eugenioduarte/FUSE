import { FirebaseApp, getApps, initializeApp } from 'firebase/app'
import { firebaseConfig } from './firebase-config'

let _app: FirebaseApp

export function getFirebaseApp(): FirebaseApp {
  if (!_app) {
    const apps = getApps()
    _app = apps.length ? apps[0] : initializeApp(firebaseConfig)
  }
  return _app
}
