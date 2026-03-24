import { create } from 'zustand'

interface NetworkState {
  online: boolean
  setOnline: (online: boolean) => void
}

// Placeholder store for connectivity. Later, integrate react-native-netinfo to update this automatically.
export const useNetworkStore = create<NetworkState>((set) => ({
  online: true,
  setOnline: (online) => set({ online }),
}))
