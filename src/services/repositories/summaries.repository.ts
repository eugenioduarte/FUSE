import { localCache } from '../../storage/localCache'
import { offlineQueue } from '../../storage/offlineQueue'
import { Summary } from '../../types/domain'

const listKey = (topicId: string) => `summaries:list:${topicId}`

export const summariesRepository = {
  async list(topicId: string): Promise<Summary[]> {
    const cached = await localCache.get<Summary[]>(listKey(topicId))
    return cached?.data ?? []
  },

  async upsert(summary: Summary, syncUrl: string) {
    const key = listKey(summary.topicId)
    const current = (await localCache.get<Summary[]>(key))?.data ?? []
    const idx = current.findIndex((s) => s.id === summary.id)
    if (idx >= 0) current[idx] = summary
    else current.unshift(summary)
    await localCache.set(key, current, summary.updatedAt)

    await offlineQueue.enqueue({ url: syncUrl, method: 'PUT', body: summary })
  },
}
