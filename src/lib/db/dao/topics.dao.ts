import { SQLiteDatabase } from 'expo-sqlite'
import { Topic } from '@/types/domain'

type TopicRow = {
  id: string
  title: string
  description: string | null
  backgroundColor: string | null
  createdBy: string | null
  members_json: string | null
  created_at: number
  updated_at: number
}

function rowToTopic(row: TopicRow): Topic {
  return {
    id: row.id,
    title: row.title,
    description: row.description ?? undefined,
    backgroundColor: row.backgroundColor ?? undefined,
    createdBy: row.createdBy ?? undefined,
    members: row.members_json ? JSON.parse(row.members_json) : undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export const topicsDao = {
  async getAll(db: SQLiteDatabase): Promise<Topic[]> {
    const rows = await db.getAllAsync<TopicRow>(
      `SELECT * FROM topics ORDER BY updated_at DESC`,
    )
    return rows.map(rowToTopic)
  },

  async getById(db: SQLiteDatabase, id: string): Promise<Topic | null> {
    const row = await db.getFirstAsync<TopicRow>(
      `SELECT * FROM topics WHERE id = ?`,
      [id],
    )
    return row ? rowToTopic(row) : null
  },

  async upsert(db: SQLiteDatabase, topic: Topic): Promise<void> {
    await db.runAsync(
      `INSERT INTO topics
         (id, title, description, backgroundColor, createdBy, members_json,
          created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET
         title = excluded.title,
         description = excluded.description,
         backgroundColor = excluded.backgroundColor,
         createdBy = excluded.createdBy,
         members_json = excluded.members_json,
         updated_at = excluded.updated_at`,
      [
        topic.id,
        topic.title,
        topic.description ?? null,
        topic.backgroundColor ?? null,
        topic.createdBy ?? null,
        topic.members ? JSON.stringify(topic.members) : null,
        topic.createdAt,
        topic.updatedAt,
      ],
    )
  },

  async deleteById(db: SQLiteDatabase, id: string): Promise<void> {
    await db.runAsync(`DELETE FROM topics WHERE id = ?`, [id])
  },

  async count(db: SQLiteDatabase): Promise<number> {
    const row = await db.getFirstAsync<{ cnt: number }>(
      `SELECT COUNT(*) as cnt FROM topics`,
    )
    return row?.cnt ?? 0
  },
}
