import * as SQLite from 'expo-sqlite'
import { runMigrations } from './migrations'

// Promise-based singleton: set synchronously before any await so concurrent
// callers all await the same promise and migrations run exactly once.
let _dbPromise: Promise<SQLite.SQLiteDatabase> | null = null

export function getDb(): Promise<SQLite.SQLiteDatabase> {
  _dbPromise ??= (async () => {
    const db = await SQLite.openDatabaseAsync('fuse.db')
    await runMigrations(db)
    return db
  })()
  return _dbPromise
}
