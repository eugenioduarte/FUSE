import AsyncStorage from '@react-native-async-storage/async-storage'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { asyncStorage } from '../storage/asyncStorage'

export type User = {
  id: string
  name?: string | null
  email?: string | null
  avatarUrl?: string | null
  avatarStyle?: string | null
  avatarSeed?: string | null
} | null

type AuthState = {
  user: User
  rehydrated: boolean
  hasShownOnboarding: boolean
  setHasShownOnboarding: (v: boolean) => void
  login: (user: NonNullable<User>) => void
  logout: () => void
  updateUser: (patch: Partial<NonNullable<User>>) => void
  markRehydrated: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      rehydrated: false,
      hasShownOnboarding: false,
      login: (user) => set({ user }),
      logout: async () => {
        await AsyncStorage.clear()
        set({ user: null })
      },
      setHasShownOnboarding: (v: boolean) => set({ hasShownOnboarding: v }),
      updateUser: (patch) => {
        const current = get().user
        if (!current) return
        set({ user: { ...current, ...patch } })
      },
      markRehydrated: () => set({ rehydrated: true }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => asyncStorage),
      onRehydrateStorage: () => (state) => {
        state?.markRehydrated?.()
      },
    },
  ),
)
