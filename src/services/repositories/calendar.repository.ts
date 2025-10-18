import { localCache } from '../../storage/localCache'
import { offlineQueue } from '../../storage/offlineQueue'
import { CalendarEvent } from '../../types/domain'

const CACHE_KEY = 'calendar:list'

export const calendarRepository = {
  async list(): Promise<CalendarEvent[]> {
    const cached = await localCache.get<CalendarEvent[]>(CACHE_KEY)
    return cached?.data ?? []
  },

  async upsert(event: CalendarEvent, syncUrl: string) {
    const current =
      (await localCache.get<CalendarEvent[]>(CACHE_KEY))?.data ?? []
    const idx = current.findIndex((e) => e.id === event.id)
    if (idx >= 0) current[idx] = event
    else current.unshift(event)
    await localCache.set(CACHE_KEY, current, event.updatedAt)

    await offlineQueue.enqueue({ url: syncUrl, method: 'PUT', body: event })
  },
}
