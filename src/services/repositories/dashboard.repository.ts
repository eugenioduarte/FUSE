import { topicsMock } from '../../mock/topics.mock'
import { localCache } from '../../storage/localCache'
import { TopicCardModel } from '../../types/dashboard.type'

const CACHE_KEY = 'dashboard:topic-cards'

export const dashboardRepository = {
  async listTopicCards(): Promise<TopicCardModel[]> {
    const cached = await localCache.get<TopicCardModel[]>(CACHE_KEY)
    return cached?.data ?? []
  },

  async seedTopicCardsIfEmpty() {
    const cached = await localCache.get<TopicCardModel[]>(CACHE_KEY)
    if (cached?.data && cached.data.length > 0) return

    await localCache.set(CACHE_KEY, topicsMock, Date.now())
  },
}
