import { SQLiteDatabase } from 'expo-sqlite'
import { CalendarEvent } from '@/types/domain'

type CalendarRow = {
  id: string
  title: string
  date: string
  notes: string | null
  created_at: number
  updated_at: number
}

function rowToEvent(row: CalendarRow): CalendarEvent {
  return {
    id: row.id,
    title: row.title,
    date: row.date,
    notes: row.notes ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export const calendarDao = {
  async getAll(db: SQLiteDatabase): Promise<CalendarEvent[]> {
    const rows = await db.getAllAsync<CalendarRow>(
      `SELECT * FROM calendar_events ORDER BY date ASC`,
    )
    return rows.map(rowToEvent)
  },

  async upsert(db: SQLiteDatabase, event: CalendarEvent): Promise<void> {
    await db.runAsync(
      `INSERT INTO calendar_events (id, title, date, notes, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET
         title = excluded.title,
         date = excluded.date,
         notes = excluded.notes,
         updated_at = excluded.updated_at`,
      [
        event.id,
        event.title,
        event.date,
        event.notes ?? null,
        event.createdAt,
        event.updatedAt,
      ],
    )
  },

  async deleteById(db: SQLiteDatabase, id: string): Promise<void> {
    await db.runAsync(`DELETE FROM calendar_events WHERE id = ?`, [id])
  },
}
