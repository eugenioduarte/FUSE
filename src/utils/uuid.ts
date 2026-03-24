import uuid from 'expo-modules-core/src/uuid'

/**
 * Generates a UUID v4 string.
 * Uses Expo's native implementation which is safe in Hermes (React Native)
 * — `globalThis.crypto` is NOT available in Hermes and will throw.
 */
export function randomUUID(): string {
  return uuid.v4()
}
