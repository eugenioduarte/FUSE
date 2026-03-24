import { create } from 'zustand'

export type SyncStatus = 'idle' | 'syncing' | 'error' | 'offline'

type SyncStatusStore = {
  status: SyncStatus
  setSyncing: () => void
  setIdle: () => void
  setError: () => void
  setOffline: () => void
}

export const useSyncStatusStore = create<SyncStatusStore>((set) => ({
  status: 'idle',
  setSyncing: () => set({ status: 'syncing' }),
  setIdle: () => set({ status: 'idle' }),
  setError: () => set({ status: 'error' }),
  setOffline: () => set({ status: 'offline' }),
}))
