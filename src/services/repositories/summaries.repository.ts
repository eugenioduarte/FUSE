import { localCache } from '../../storage/localCache'
import { offlineQueue } from '../../storage/offlineQueue'
import { Summary } from '../../types/domain'
import { aiService } from '../ai/ai.service'

const listKey = (topicId: string) => `summaries:list:${topicId}`
const LIST_ALL_KEY = 'summaries:list'

export const summariesRepository = {
  async listAll(): Promise<Summary[]> {
    const cached = await localCache.get<Summary[]>(LIST_ALL_KEY)
    return cached?.data ?? []
  },
  async list(topicId: string): Promise<Summary[]> {
    const cached = await localCache.get<Summary[]>(listKey(topicId))
    return cached?.data ?? []
  },

  async getById(id: string): Promise<Summary | null> {
    const all = await this.listAll()
    return all.find((s) => s.id === id) ?? null
  },

  async upsert(summary: Summary, syncUrl: string) {
    const key = listKey(summary.topicId)
    const current = (await localCache.get<Summary[]>(key))?.data ?? []
    const idx = current.findIndex((s) => s.id === summary.id)
    if (idx >= 0) current[idx] = summary
    else current.unshift(summary)
    await localCache.set(key, current, summary.updatedAt)

    // Maintain global list as well
    const all = (await localCache.get<Summary[]>(LIST_ALL_KEY))?.data ?? []
    const idxAll = all.findIndex((s) => s.id === summary.id)
    if (idxAll >= 0) all[idxAll] = summary
    else all.unshift(summary)
    await localCache.set(LIST_ALL_KEY, all, summary.updatedAt)

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
