import { localCache } from '../../storage/localCache'
import { offlineQueue } from '../../storage/offlineQueue'
import { Challenge } from '../../types/domain'

const CACHE_KEY = 'challenges:list'

export const challengesRepository = {
  async list(): Promise<Challenge[]> {
    const cached = await localCache.get<Challenge[]>(CACHE_KEY)
    return cached?.data ?? []
  },

  async upsert(challenge: Challenge, syncUrl: string) {
    const current = (await localCache.get<Challenge[]>(CACHE_KEY))?.data ?? []
    const idx = current.findIndex((c) => c.id === challenge.id)
    if (idx >= 0) current[idx] = challenge
    else current.unshift(challenge)
    await localCache.set(CACHE_KEY, current, challenge.updatedAt)

    await offlineQueue.enqueue({ url: syncUrl, method: 'PUT', body: challenge })
  },
}
