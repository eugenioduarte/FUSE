import AsyncStorage from '@react-native-async-storage/async-storage'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { calendarMock } from '../mock/calendar.mock'
import { CalendarCommitment } from '../types/calendar.type'

interface CalendarState {
  events: CalendarCommitment[]
  seedIfEmpty: () => Promise<void>
  getEventsForDate: (date: string) => CalendarCommitment[]
  addOrUpdate: (e: CalendarCommitment) => void
}

export const useCalendarStore = create<CalendarState>()(
  persist(
    (set, get) => ({
      events: [],
      addOrUpdate: (e) =>
        set((s) => {
          const idx = s.events.findIndex((x) => x.id === e.id)
          if (idx >= 0) {
            const next = [...s.events]
            next[idx] = e
            return { events: next }
          }
          return { events: [e, ...s.events] }
        }),
      getEventsForDate: (date) => get().events.filter((e) => e.date === date),
      seedIfEmpty: async () => {
        const hasData = get().events.length > 0
        if (hasData) return
        set({ events: calendarMock })
      },
    }),
    {
      name: 'calendar-store',
      storage: createJSONStorage(() => AsyncStorage),
      version: 1,
    },
  ),
)
