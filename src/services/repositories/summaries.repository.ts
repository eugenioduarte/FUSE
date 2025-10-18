import { localCache } from '../../storage/localCache'
import { offlineQueue } from '../../storage/offlineQueue'
import { Summary } from '../../types/domain'
import { aiService } from '../ai/ai.service'

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

  async createWithAI(
    topicId: string,
    prompt: string,
    opts?: { idFactory?: () => string; syncUrl?: string },
  ) {
    const now = Date.now()
    const id = opts?.idFactory ? opts.idFactory() : `${now}`
    const gen = await aiService.generateSummary(prompt)
    const summary: Summary = {
      id,
      topicId,
      title: gen.title,
      content: gen.content,
      keywords: gen.keywords,
      generatedBy: 'ai',
      createdAt: now,
      updatedAt: now,
    }
    await this.upsert(summary, opts?.syncUrl || '/sync/summary')
    return summary
  },
}
