import { SQLiteDatabase } from 'expo-sqlite'
import { Challenge } from '@/types/domain'

type ChallengeRow = {
  id: string
  type: string
  title: string
  summaryId: string
  authorId: string | null
  payload_json: string
  created_at: number
  updated_at: number
}

function rowToChallenge(row: ChallengeRow): Challenge {
  return {
    id: row.id,
    type: row.type as Challenge['type'],
    title: row.title,
    summaryId: row.summaryId,
    authorId: row.authorId ?? undefined,
    payload: JSON.parse(row.payload_json),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export const challengesDao = {
  async getAll(db: SQLiteDatabase): Promise<Challenge[]> {
    const rows = await db.getAllAsync<ChallengeRow>(
      `SELECT * FROM challenges ORDER BY updated_at DESC`,
    )
    return rows.map(rowToChallenge)
  },

  async getBySummaryId(
    db: SQLiteDatabase,
    summaryId: string,
  ): Promise<Challenge[]> {
    const rows = await db.getAllAsync<ChallengeRow>(
      `SELECT * FROM challenges WHERE summaryId = ? ORDER BY updated_at DESC`,
      [summaryId],
    )
    return rows.map(rowToChallenge)
  },

  async getById(db: SQLiteDatabase, id: string): Promise<Challenge | null> {
    const row = await db.getFirstAsync<ChallengeRow>(
      `SELECT * FROM challenges WHERE id = ?`,
      [id],
    )
    return row ? rowToChallenge(row) : null
  },

  async upsert(db: SQLiteDatabase, challenge: Challenge): Promise<void> {
    await db.runAsync(
      `INSERT INTO challenges
         (id, type, title, summaryId, authorId, payload_json,
          created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET
         type = excluded.type,
         title = excluded.title,
         summaryId = excluded.summaryId,
         authorId = excluded.authorId,
         payload_json = excluded.payload_json,
         updated_at = excluded.updated_at`,
      [
        challenge.id,
        challenge.type,
        challenge.title,
        challenge.summaryId,
        challenge.authorId ?? null,
        JSON.stringify(challenge.payload),
        challenge.createdAt,
        challenge.updatedAt,
      ],
    )
  },

  async deleteById(db: SQLiteDatabase, id: string): Promise<void> {
    await db.runAsync(`DELETE FROM challenges WHERE id = ?`, [id])
  },

  async deleteBySummaryId(
    db: SQLiteDatabase,
    summaryId: string,
  ): Promise<void> {
    await db.runAsync(`DELETE FROM challenges WHERE summaryId = ?`, [summaryId])
  },
}
