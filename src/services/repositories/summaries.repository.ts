import { localCache } from '../../storage/localCache'
import { offlineQueue } from '../../storage/offlineQueue'
import { ExpandableTerm, Summary } from '../../types/domain'
import { aiService } from '../ai/ai.service'
import { challengesRepository } from './challenges.repository'

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
    // Prefer enriched knowledge summary
    const gen = await aiService.generateKnowledgeSummary(prompt)
    const summary: Summary = {
      id,
      topicId,
      title: gen.title,
      content: gen.content,
      keywords: gen.keywords,
      expandableTerms: gen.expandableTerms as ExpandableTerm[] | undefined,
      recommendations: gen.recommendations,
      generatedBy: 'ai',
      createdAt: now,
      updatedAt: now,
    }
    await this.upsert(summary, opts?.syncUrl || '/sync/summary')
    return summary
  },

  async createExpandableFromTerm(
    parent: Summary,
    term: string,
    opts?: { idFactory?: () => string; syncUrl?: string },
  ) {
    const prompt = term
    const now = Date.now()
    const id = opts?.idFactory ? opts.idFactory() : `${now}`
    const gen = await aiService.generateKnowledgeSummary(prompt)
    const summary: Summary = {
      id,
      topicId: parent.topicId,
      title: gen.title || term,
      content: gen.content,
      keywords: gen.keywords,
      expandableTerms: gen.expandableTerms as ExpandableTerm[] | undefined,
      recommendations: gen.recommendations,
      parentSummaryId: parent.id,
      generatedBy: 'ai',
      createdAt: now,
      updatedAt: now,
    }
    await this.upsert(summary, opts?.syncUrl || '/sync/summary')
    return summary
  },

  async listChildren(parentSummaryId: string): Promise<Summary[]> {
    const all = await this.listAll()
    return all.filter((s) => s.parentSummaryId === parentSummaryId)
  },

  async deleteById(
    id: string,
    opts?: { syncUrl?: string; alsoClearWhiteboard?: boolean },
  ) {
    const all = await this.listAll()
    const target = all.find((s) => s.id === id)
    if (!target) return

    // Recursively delete children first
    const children = all.filter((s) => s.parentSummaryId === id)
    for (const child of children) {
      await this.deleteById(child.id, opts)
    }

    // Delete related challenges
    await challengesRepository.deleteBySummaryId(id)

    // Update topic-specific cache
    const key = listKey(target.topicId)
    const curTopicList = (await localCache.get<Summary[]>(key))?.data ?? []
    const nextTopicList = curTopicList.filter((s) => s.id !== id)
    await localCache.set(key, nextTopicList)

    // Update global list
    const curAll = (await localCache.get<Summary[]>(LIST_ALL_KEY))?.data ?? []
    const nextAll = curAll.filter((s) => s.id !== id)
    await localCache.set(LIST_ALL_KEY, nextAll)

    // Enqueue delete for server sync
    await offlineQueue.enqueue({
      url: opts?.syncUrl || '/sync/summary',
      method: 'DELETE',
      body: { id },
    })
  },

  async deleteByTopicId(topicId: string, opts?: { syncUrl?: string }) {
    const list = await this.list(topicId)
    for (const s of list) {
      await this.deleteById(s.id, opts)
    }
    // Clear the topic cache key
    await localCache.remove(listKey(topicId))
  },
}
