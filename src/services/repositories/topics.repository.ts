import { topicsMock } from '../../mock/topics.mock'
import { localCache } from '../../storage/localCache'
import { offlineQueue } from '../../storage/offlineQueue'
import { Topic } from '../../types/domain'
import { summariesRepository } from './summaries.repository'

const CACHE_KEY = 'topics:list'

export const topicsRepository = {
  async list(): Promise<Topic[]> {
    const cached = await localCache.get<Topic[]>(CACHE_KEY)
    return cached?.data ?? []
  },
  async seedIfEmpty() {
    const cached = await localCache.get<Topic[]>(CACHE_KEY)
    const has = (cached?.data?.length ?? 0) > 0
    if (has) return
    // Map dashboard TopicCardModel mocks into Topic entities
    const mapped: Topic[] = topicsMock.map((m) => ({
      id: m.id,
      title: m.topicName,
      description: undefined,
      createdAt: Date.parse(m.createdAt) || Date.now(),
      updatedAt: Date.now(),
    }))
    await localCache.set(CACHE_KEY, mapped, Date.now())
  },
  async getById(id: string): Promise<Topic | null> {
    const cached = await localCache.get<Topic[]>(CACHE_KEY)
    const list = cached?.data ?? []
    return list.find((t) => t.id === id) ?? null
  },

  async upsert(topic: Topic, syncUrl: string) {
    // Update local cache first
    const current = (await localCache.get<Topic[]>(CACHE_KEY))?.data ?? []
    const idx = current.findIndex((t) => t.id === topic.id)

    const prev = idx >= 0 ? current[idx] : undefined
    const backgroundChanged = prev?.backgroundColor !== topic.backgroundColor

    if (idx >= 0) current[idx] = topic
    else current.unshift(topic)
    await localCache.set(CACHE_KEY, current, topic.updatedAt)

    // Queue mutation for server
    await offlineQueue.enqueue({ url: syncUrl, method: 'PUT', body: topic })

    // If color changed, propagate to summaries for this topic
    if (backgroundChanged) {
      await summariesRepository.setBackgroundColorByTopic(
        topic.id,
        topic.backgroundColor,
      )
    }
  },

  async deleteById(id: string, opts?: { syncUrl?: string }) {
    // Cascade delete summaries (and their challenges)
    await summariesRepository.deleteByTopicId(id)

    // Update topics cache
    const current = (await localCache.get<Topic[]>(CACHE_KEY))?.data ?? []
    const next = current.filter((t) => t.id !== id)
    await localCache.set(CACHE_KEY, next)

    // Enqueue delete for server
    await offlineQueue.enqueue({
      url: opts?.syncUrl || '/sync/topic',
      method: 'DELETE',
      body: { id },
    })
  },
}
