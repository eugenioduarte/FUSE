import { doc, getDoc, getFirestore } from 'firebase/firestore'
import { getFirebaseApp } from './firebaseInit'

function db() {
  return getFirestore(getFirebaseApp())
}

/**
 * Returns true if the given uid exists in the users_dev collection.
 * Convention: document id equals the user's uid.
 */
export async function isDevUser(uid: string): Promise<boolean> {
  try {
    const snap = await getDoc(doc(db(), 'users_dev', uid))
    return snap.exists()
  } catch (err) {
    console.error('isDevUser failed', err)
    // On error, fail closed (no dev access)
    return false
  }
}
