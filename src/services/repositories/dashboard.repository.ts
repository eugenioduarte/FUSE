import { localCache } from '../../storage/localCache'
import { TopicCardModel } from '../../types/dashboard.type'

const CACHE_KEY = 'dashboard:topic-cards'

export const dashboardRepository = {
  async listTopicCards(): Promise<TopicCardModel[]> {
    const cached = await localCache.get<TopicCardModel[]>(CACHE_KEY)
    return cached?.data ?? []
  },

  async seedTopicCardsIfEmpty() {
    // no-op: dashboard cards are derived from real data (Firebase / AI)
  },
}
