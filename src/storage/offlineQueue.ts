import { getDb } from '../lib/db/db'
import { offlineQueueDao } from '../lib/db/dao/offline-queue.dao'

export type QueueItem = {
  id: string
  url: string
  method: 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  body?: any
  headers?: Record<string, string>
  createdAt: number
  tries: number
}

export const offlineQueue = {
  async enqueue(item: Omit<QueueItem, 'id' | 'createdAt' | 'tries'>) {
    const db = await getDb()
    return offlineQueueDao.enqueue(db, item)
  },

  async peekAll(): Promise<QueueItem[]> {
    const db = await getDb()
    return offlineQueueDao.peekAll(db)
  },

  async remove(id: string) {
    const db = await getDb()
    return offlineQueueDao.remove(db, id)
  },

  async bumpTries(id: string) {
    const db = await getDb()
    return offlineQueueDao.bumpTries(db, id)
  },
}
