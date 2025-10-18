import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { asyncStorage } from '../storage/asyncStorage'

type User = {
  id: string
  name: string
} | null

type AuthState = {
  user: User
  rehydrated: boolean
  login: (user: NonNullable<User>) => void
  logout: () => void
  markRehydrated: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      rehydrated: false,
      login: (user) => set({ user }),
      logout: () => set({ user: null }),
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
