import AsyncStorage from '@react-native-async-storage/async-storage'

// Persist key used by Zustand persist in useWhiteboardStore
const PERSIST_KEY = 'whiteboard-store'

export const whiteboardRepository = {
  // Clear both persisted and in-memory state if store is available
  async clearAll() {
    try {
      const mod = await import('../../store/useWhiteboardStore')
      // Clear runtime store
      mod.useWhiteboardStore.getState().clearAll()
    } catch {
      // ignore if store not available (e.g., web/SSR), we'll clear persisted anyway
    }
    try {
      await AsyncStorage.removeItem(PERSIST_KEY)
    } catch {}
  },
}
