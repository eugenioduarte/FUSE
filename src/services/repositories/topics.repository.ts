import { topicsMock } from '../../mock/topics.mock'
import { getDb } from '../../lib/db/db'
import { topicsDao } from '../../lib/db/dao/topics.dao'
import { offlineQueue } from '../../storage/offlineQueue'
import { Topic } from '../../types/domain'
import { summariesRepository } from './summaries.repository'

export const topicsRepository = {
  // Simple change listeners so UI can react to SQLite updates (e.g. after upsert)
  _listeners: new Set<() => void>(),
  onChange(fn: () => void) {
    this._listeners.add(fn)
    return () => this._listeners.delete(fn)
  },

  async list(): Promise<Topic[]> {
    const db = await getDb()
    return topicsDao.getAll(db)
  },

  async seedIfEmpty() {
    const db = await getDb()
    const count = await topicsDao.count(db)
    if (count > 0) return
    const mapped: Topic[] = topicsMock.map((m) => ({
      id: m.id,
      title: m.topicName,
      description: undefined,
      createdAt: Date.parse(m.createdAt) || Date.now(),
      updatedAt: Date.now(),
    }))
    for (const topic of mapped) {
      await topicsDao.upsert(db, topic)
    }
  },

  async getById(id: string): Promise<Topic | null> {
    const db = await getDb()
    return topicsDao.getById(db, id)
  },

  async upsert(topic: Topic, syncUrl: string, opts?: { fromSync?: boolean }) {
    const db = await getDb()
    const prev = await topicsDao.getById(db, topic.id)
    const backgroundChanged = prev?.backgroundColor !== topic.backgroundColor

    await topicsDao.upsert(db, topic)

    try {
      for (const l of this._listeners) {
        try {
          l()
        } catch {}
      }
    } catch {}

    if (!opts?.fromSync) {
      await offlineQueue.enqueue({ url: syncUrl, method: 'PUT', body: topic })
    }

    if (backgroundChanged) {
      await summariesRepository.setBackgroundColorByTopic(
        topic.id,
        topic.backgroundColor,
        { fromSync: opts?.fromSync },
      )
    }
  },

  async deleteById(id: string, opts?: { syncUrl?: string }) {
    await summariesRepository.deleteByTopicId(id)

    const db = await getDb()
    await topicsDao.deleteById(db, id)

    try {
      for (const l of this._listeners) {
        try {
          l()
        } catch {}
      }
    } catch {}

    await offlineQueue.enqueue({
      url: opts?.syncUrl || '/sync/topic',
      method: 'DELETE',
      body: { id },
    })

    try {
      const { deleteGroupTopic } = await import('../firebase/collabData.service')
      await deleteGroupTopic(id)
    } catch {}
  },
}
