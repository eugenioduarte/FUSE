import { SQLiteDatabase } from 'expo-sqlite'
import { ExpandableTerm, Summary } from '@/types/domain'

type SummaryRow = {
  id: string
  topicId: string
  authorId: string | null
  title: string | null
  content: string
  generatedBy: string
  keywords_json: string | null
  backgroundColor: string | null
  parentSummaryId: string | null
  expandable_terms_json: string | null
  recommendations_json: string | null
  created_at: number
  updated_at: number
}

function rowToSummary(row: SummaryRow): Summary {
  return {
    id: row.id,
    topicId: row.topicId,
    authorId: row.authorId ?? undefined,
    title: row.title ?? undefined,
    content: row.content,
    generatedBy: row.generatedBy as 'user' | 'ai',
    keywords: row.keywords_json ? JSON.parse(row.keywords_json) : undefined,
    backgroundColor: row.backgroundColor ?? undefined,
    parentSummaryId: row.parentSummaryId ?? undefined,
    expandableTerms: row.expandable_terms_json
      ? (JSON.parse(row.expandable_terms_json) as ExpandableTerm[])
      : undefined,
    recommendations: row.recommendations_json
      ? JSON.parse(row.recommendations_json)
      : undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export const summariesDao = {
  async getAll(db: SQLiteDatabase): Promise<Summary[]> {
    const rows = await db.getAllAsync<SummaryRow>(
      `SELECT * FROM summaries ORDER BY updated_at DESC`,
    )
    return rows.map(rowToSummary)
  },

  async getByTopicId(db: SQLiteDatabase, topicId: string): Promise<Summary[]> {
    const rows = await db.getAllAsync<SummaryRow>(
      `SELECT * FROM summaries WHERE topicId = ? ORDER BY updated_at DESC`,
      [topicId],
    )
    return rows.map(rowToSummary)
  },

  async getById(db: SQLiteDatabase, id: string): Promise<Summary | null> {
    const row = await db.getFirstAsync<SummaryRow>(
      `SELECT * FROM summaries WHERE id = ?`,
      [id],
    )
    return row ? rowToSummary(row) : null
  },

  async getChildren(
    db: SQLiteDatabase,
    parentSummaryId: string,
  ): Promise<Summary[]> {
    const rows = await db.getAllAsync<SummaryRow>(
      `SELECT * FROM summaries WHERE parentSummaryId = ? ORDER BY updated_at DESC`,
      [parentSummaryId],
    )
    return rows.map(rowToSummary)
  },

  async upsert(db: SQLiteDatabase, summary: Summary): Promise<void> {
    await db.runAsync(
      `INSERT INTO summaries
         (id, topicId, authorId, title, content, generatedBy, keywords_json,
          backgroundColor, parentSummaryId, expandable_terms_json,
          recommendations_json, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET
         topicId = excluded.topicId,
         authorId = excluded.authorId,
         title = excluded.title,
         content = excluded.content,
         generatedBy = excluded.generatedBy,
         keywords_json = excluded.keywords_json,
         backgroundColor = excluded.backgroundColor,
         parentSummaryId = excluded.parentSummaryId,
         expandable_terms_json = excluded.expandable_terms_json,
         recommendations_json = excluded.recommendations_json,
         updated_at = excluded.updated_at`,
      [
        summary.id,
        summary.topicId,
        summary.authorId ?? null,
        summary.title ?? null,
        summary.content,
        summary.generatedBy,
        summary.keywords ? JSON.stringify(summary.keywords) : null,
        summary.backgroundColor ?? null,
        summary.parentSummaryId ?? null,
        summary.expandableTerms ? JSON.stringify(summary.expandableTerms) : null,
        summary.recommendations ? JSON.stringify(summary.recommendations) : null,
        summary.createdAt,
        summary.updatedAt,
      ],
    )
  },

  async deleteById(db: SQLiteDatabase, id: string): Promise<void> {
    await db.runAsync(`DELETE FROM summaries WHERE id = ?`, [id])
  },

  async deleteByTopicId(db: SQLiteDatabase, topicId: string): Promise<void> {
    await db.runAsync(`DELETE FROM summaries WHERE topicId = ?`, [topicId])
  },

  async updateBackgroundColorByTopicId(
    db: SQLiteDatabase,
    topicId: string,
    color: string | undefined,
  ): Promise<void> {
    await db.runAsync(
      `UPDATE summaries SET backgroundColor = ? WHERE topicId = ?`,
      [color ?? null, topicId],
    )
  },
}
