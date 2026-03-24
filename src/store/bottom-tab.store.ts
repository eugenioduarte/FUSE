// src/store/bottom-tab.store.ts
import { create } from 'zustand'

type TabType = 'dashboard' | 'topics' | 'calendar'

interface BottomTabState {
  activeTab: TabType
  setActiveTab: (tab: TabType) => void
}

export const useBottomTabStore = create<BottomTabState>((set) => ({
  activeTab: 'dashboard',
  setActiveTab: (tab) => set({ activeTab: tab }),
}))
