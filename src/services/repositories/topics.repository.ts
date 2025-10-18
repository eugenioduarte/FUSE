import { localCache } from '../../storage/localCache'
import { offlineQueue } from '../../storage/offlineQueue'
import { Topic } from '../../types/domain'

const CACHE_KEY = 'topics:list'

export const topicsRepository = {
  async list(): Promise<Topic[]> {
    const cached = await localCache.get<Topic[]>(CACHE_KEY)
    return cached?.data ?? []
  },

  async upsert(topic: Topic, syncUrl: string) {
    // Update local cache first
    const current = (await localCache.get<Topic[]>(CACHE_KEY))?.data ?? []
    const idx = current.findIndex((t) => t.id === topic.id)
    if (idx >= 0) current[idx] = topic
    else current.unshift(topic)
    await localCache.set(CACHE_KEY, current, topic.updatedAt)

    // Queue mutation for server
    await offlineQueue.enqueue({ url: syncUrl, method: 'PUT', body: topic })
  },
}
