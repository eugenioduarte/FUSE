import { getDb } from '../../lib/db/db'
import { calendarDao } from '../../lib/db/dao/calendar.dao'
import { offlineQueue } from '../../storage/offlineQueue'
import { CalendarEvent } from '../../types/domain'

export const calendarRepository = {
  async list(): Promise<CalendarEvent[]> {
    const db = await getDb()
    return calendarDao.getAll(db)
  },

  async upsert(event: CalendarEvent, syncUrl: string) {
    const db = await getDb()
    await calendarDao.upsert(db, event)
    await offlineQueue.enqueue({ url: syncUrl, method: 'PUT', body: event })
  },
}
