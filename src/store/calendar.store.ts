import AsyncStorage from '@react-native-async-storage/async-storage'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { CalendarCommitment } from '../types/calendar.type'

interface CalendarState {
  events: CalendarCommitment[]
  // Selected date for UI screens
  selectedDate: string | null
  setSelectedDate: (date: string) => void
  // Legacy/dashboard API
  seedIfEmpty: () => Promise<void>
  getEventsForDate: (date: string) => CalendarCommitment[]
  addOrUpdate: (e: CalendarCommitment) => void
  // CalendarScreen helpers
  addAppointment: (
    a: Omit<
      Pick<
        CalendarCommitment,
        'date' | 'title' | 'description' | 'topicId' | 'summaryId'
      > & { time?: string },
      'id'
    >,
  ) => void
  editAppointment: (id: string, updates: Partial<CalendarCommitment>) => void
  removeAppointment: (id: string) => void
}

export const useCalendarStore = create<CalendarState>()(
  persist(
    (set, get) => ({
      events: [],
      selectedDate: null,
      setSelectedDate: (date) => set({ selectedDate: date }),
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
        // no-op: calendar events come from Firebase real-time sync
      },
      addAppointment: (a) =>
        set((s) => {
          const now = Date.now()
          const newEvent: CalendarCommitment = {
            id: `${now}`,
            topicId: a.topicId,
            summaryId: a.summaryId,
            title: a.title,
            description: a.description,
            location: undefined,
            date: a.date,
            time: a.time || '00:00',
            createdAt: now,
            updatedAt: now,
          }
          return { events: [newEvent, ...s.events] }
        }),
      editAppointment: (id, updates) =>
        set((s) => ({
          events: s.events.map((ev) =>
            ev.id === id ? { ...ev, ...updates, updatedAt: Date.now() } : ev,
          ),
        })),
      removeAppointment: (id) =>
        set((s) => ({ events: s.events.filter((ev) => ev.id !== id) })),
    }),
    {
      name: 'calendar-store',
      storage: createJSONStorage(() => AsyncStorage),
      version: 1,
    },
  ),
)
