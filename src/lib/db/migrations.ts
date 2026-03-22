import AsyncStorage from '@react-native-async-storage/async-storage'
import { SQLiteDatabase } from 'expo-sqlite'

const MIGRATIONS: Array<(db: SQLiteDatabase) => Promise<void>> = [
  migration_v1_create_schema,
]

export async function runMigrations(db: SQLiteDatabase): Promise<void> {
  await db.execAsync(
    `CREATE TABLE IF NOT EXISTS schema_version (version INTEGER PRIMARY KEY)`,
  )

  const row = await db.getFirstAsync<{ version: number }>(
    `SELECT version FROM schema_version LIMIT 1`,
  )
  const currentVersion = row?.version ?? 0

  for (let i = currentVersion; i < MIGRATIONS.length; i++) {
    await MIGRATIONS[i](db)
    if (i === 0) {
      await db.runAsync(`INSERT INTO schema_version (version) VALUES (?)`, [
        i + 1,
      ])
    } else {
      await db.runAsync(`UPDATE schema_version SET version = ?`, [i + 1])
    }
  }
}

// ─── Migration v1 ────────────────────────────────────────────────────────────

async function migration_v1_create_schema(db: SQLiteDatabase): Promise<void> {
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS topics (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      backgroundColor TEXT,
      createdBy TEXT,
      members_json TEXT,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS summaries (
      id TEXT PRIMARY KEY,
      topicId TEXT NOT NULL,
      authorId TEXT,
      title TEXT,
      content TEXT NOT NULL,
      generatedBy TEXT NOT NULL DEFAULT 'user',
      keywords_json TEXT,
      backgroundColor TEXT,
      parentSummaryId TEXT,
      expandable_terms_json TEXT,
      recommendations_json TEXT,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_summaries_topicId ON summaries(topicId);

    CREATE TABLE IF NOT EXISTS challenges (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL,
      title TEXT NOT NULL,
      summaryId TEXT NOT NULL,
      authorId TEXT,
      payload_json TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_challenges_summaryId ON challenges(summaryId);

    CREATE TABLE IF NOT EXISTS calendar_events (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      date TEXT NOT NULL,
      notes TEXT,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS offline_queue (
      id TEXT PRIMARY KEY,
      url TEXT NOT NULL,
      method TEXT NOT NULL,
      body_json TEXT,
      headers_json TEXT,
      created_at INTEGER NOT NULL,
      tries INTEGER NOT NULL DEFAULT 0
    );
  `)

  // One-time data migration: copy existing AsyncStorage data into SQLite
  await migrateFromAsyncStorage(db)
}

async function migrateFromAsyncStorage(db: SQLiteDatabase): Promise<void> {
  try {
    await migrateTopics(db)
    await migrateSummaries(db)
    await migrateChallenges(db)
    await migrateCalendar(db)
    await migrateOfflineQueue(db)

    // Remove AsyncStorage cache keys so the app reads only from SQLite
    await AsyncStorage.multiRemove([
      'cache:topics:list',
      'cache:summaries:list',
      'offline:queue',
    ])
    // Summaries per-topic keys are not removed here (unknown at migration time);
    // they become stale naturally as the app no longer writes to them.
  } catch (e) {
    console.warn('SQLite migration from AsyncStorage failed (non-fatal):', e)
  }
}

async function migrateTopics(db: SQLiteDatabase): Promise<void> {
  const raw = await AsyncStorage.getItem('cache:topics:list')
  if (!raw) return
  const parsed = JSON.parse(raw)
  const topics: any[] = parsed?.data ?? []
  for (const t of topics) {
    await db.runAsync(
      `INSERT OR IGNORE INTO topics
         (id, title, description, backgroundColor, createdBy, members_json,
          created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        t.id,
        t.title,
        t.description ?? null,
        t.backgroundColor ?? null,
        t.createdBy ?? null,
        t.members ? JSON.stringify(t.members) : null,
        t.createdAt ?? Date.now(),
        t.updatedAt ?? Date.now(),
      ],
    )
  }
}

async function migrateSummaries(db: SQLiteDatabase): Promise<void> {
  const raw = await AsyncStorage.getItem('cache:summaries:list')
  if (!raw) return
  const parsed = JSON.parse(raw)
  const summaries: any[] = parsed?.data ?? []
  for (const s of summaries) {
    await db.runAsync(
      `INSERT OR IGNORE INTO summaries
         (id, topicId, authorId, title, content, generatedBy, keywords_json,
          backgroundColor, parentSummaryId, expandable_terms_json,
          recommendations_json, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        s.id,
        s.topicId,
        s.authorId ?? null,
        s.title ?? null,
        s.content,
        s.generatedBy ?? 'user',
        s.keywords ? JSON.stringify(s.keywords) : null,
        s.backgroundColor ?? null,
        s.parentSummaryId ?? null,
        s.expandableTerms ? JSON.stringify(s.expandableTerms) : null,
        s.recommendations ? JSON.stringify(s.recommendations) : null,
        s.createdAt ?? Date.now(),
        s.updatedAt ?? Date.now(),
      ],
    )
  }
}

async function migrateChallenges(db: SQLiteDatabase): Promise<void> {
  const raw = await AsyncStorage.getItem('cache:challenges:list')
  if (!raw) return
  const parsed = JSON.parse(raw)
  const challenges: any[] = parsed?.data ?? []
  for (const c of challenges) {
    await db.runAsync(
      `INSERT OR IGNORE INTO challenges
         (id, type, title, summaryId, authorId, payload_json, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        c.id,
        c.type,
        c.title,
        c.summaryId,
        c.authorId ?? null,
        JSON.stringify(c.payload ?? {}),
        c.createdAt ?? Date.now(),
        c.updatedAt ?? Date.now(),
      ],
    )
  }
}

async function migrateCalendar(db: SQLiteDatabase): Promise<void> {
  const raw = await AsyncStorage.getItem('cache:calendar:list')
  if (!raw) return
  const parsed = JSON.parse(raw)
  const events: any[] = parsed?.data ?? []
  for (const e of events) {
    await db.runAsync(
      `INSERT OR IGNORE INTO calendar_events
         (id, title, date, notes, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        e.id,
        e.title,
        e.date,
        e.notes ?? null,
        e.createdAt ?? Date.now(),
        e.updatedAt ?? Date.now(),
      ],
    )
  }
}

async function migrateOfflineQueue(db: SQLiteDatabase): Promise<void> {
  const raw = await AsyncStorage.getItem('offline:queue')
  if (!raw) return
  const items: any[] = JSON.parse(raw) ?? []
  for (const item of items) {
    await db.runAsync(
      `INSERT OR IGNORE INTO offline_queue
         (id, url, method, body_json, headers_json, created_at, tries)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        item.id,
        item.url,
        item.method,
        item.body ? JSON.stringify(item.body) : null,
        item.headers ? JSON.stringify(item.headers) : null,
        item.createdAt ?? Date.now(),
        item.tries ?? 0,
      ],
    )
  }
}
