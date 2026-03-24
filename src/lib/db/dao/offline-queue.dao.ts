import { QueueItem } from '@/storage/offlineQueue'
import { randomUUID } from '@/utils/uuid'
import { SQLiteDatabase } from 'expo-sqlite'

type QueueRow = {
  id: string
  url: string
  method: string
  body_json: string | null
  headers_json: string | null
  created_at: number
  tries: number
}

function rowToItem(row: QueueRow): QueueItem {
  return {
    id: row.id,
    url: row.url,
    method: row.method as QueueItem['method'],
    body: row.body_json ? JSON.parse(row.body_json) : undefined,
    headers: row.headers_json ? JSON.parse(row.headers_json) : undefined,
    createdAt: row.created_at,
    tries: row.tries,
  }
}

export const offlineQueueDao = {
  async enqueue(
    db: SQLiteDatabase,
    item: Omit<QueueItem, 'id' | 'createdAt' | 'tries'>,
  ): Promise<QueueItem> {
    const id = `${Date.now()}-${randomUUID()}`
    const createdAt = Date.now()
    await db.runAsync(
      `INSERT INTO offline_queue
         (id, url, method, body_json, headers_json, created_at, tries)
       VALUES (?, ?, ?, ?, ?, ?, 0)`,
      [
        id,
        item.url,
        item.method,
        item.body ? JSON.stringify(item.body) : null,
        item.headers ? JSON.stringify(item.headers) : null,
        createdAt,
      ],
    )
    return { ...item, id, createdAt, tries: 0 }
  },

  async peekAll(db: SQLiteDatabase): Promise<QueueItem[]> {
    const rows = await db.getAllAsync<QueueRow>(
      `SELECT * FROM offline_queue ORDER BY created_at ASC`,
    )
    return rows.map(rowToItem)
  },

  async remove(db: SQLiteDatabase, id: string): Promise<void> {
    await db.runAsync(`DELETE FROM offline_queue WHERE id = ?`, [id])
  },

  async bumpTries(db: SQLiteDatabase, id: string): Promise<void> {
    await db.runAsync(`UPDATE offline_queue SET tries = tries + 1 WHERE id = ?`, [id])
  },
}
