import AsyncStorage from '@react-native-async-storage/async-storage'

// Persist key used by Zustand persist in useWhiteboardStore
const PERSIST_KEY = 'whiteboard-store'

export const whiteboardRepository = {
  // Clear both persisted and in-memory state if store is available
  async clearAll() {
    // Whiteboard feature removed. Clear persisted storage key only.
    try {
      await AsyncStorage.removeItem(PERSIST_KEY)
    } catch {}
  },
}
