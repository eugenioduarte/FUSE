import { summariesDao } from '../../lib/db/dao/summaries.dao'
import { getDb } from '../../lib/db/db'
import { offlineQueue } from '../../storage/offlineQueue'
import { ExpandableTerm, Summary } from '../../types/domain'
import { aiService } from '../ai/ai.service'
import { challengesRepository } from './challenges.repository'
import { topicsRepository } from './topics.repository'

export const summariesRepository = {
  async listAll(): Promise<Summary[]> {
    const db = await getDb()
    return summariesDao.getAll(db)
  },

  async list(topicId: string): Promise<Summary[]> {
    const db = await getDb()
    return summariesDao.getByTopicId(db, topicId)
  },

  async getById(id: string): Promise<Summary | null> {
    const db = await getDb()
    return summariesDao.getById(db, id)
  },

  async upsert(
    summary: Summary,
    syncUrl: string,
    opts?: { fromSync?: boolean },
  ) {
    const db = await getDb()
    await summariesDao.upsert(db, summary)

    if (!opts?.fromSync) {
      await offlineQueue.enqueue({ url: syncUrl, method: 'PUT', body: summary })
    }

    // No immediate Firestore mirror; collaborative mirror will be flushed on Dashboard focus.
  },

  async createWithAI(
    topicId: string,
    prompt: string,
    opts?: { idFactory?: () => string; syncUrl?: string },
  ) {
    const now = Date.now()
    const id = opts?.idFactory ? opts.idFactory() : `${now}`
    const gen = await aiService.generateKnowledgeSummary(prompt)
    const topic = await topicsRepository.getById(topicId)
    const summary: Summary = {
      id,
      topicId,
      title: gen.title,
      content: gen.content,
      keywords: gen.keywords,
      expandableTerms: gen.expandableTerms as ExpandableTerm[] | undefined,
      recommendations: gen.recommendations,
      generatedBy: 'ai',
      backgroundColor: topic?.backgroundColor || undefined,
      createdAt: now,
      updatedAt: now,
    }
    await this.upsert(summary, opts?.syncUrl || '/sync/summary')
    try {
      const { processOfflineQueue } = await import('../sync/sync.service')
      await processOfflineQueue()
    } catch {}
    try {
      const { flushLocalCollaborativeChanges } =
        await import('../firebase/collab-flush.service')
      await flushLocalCollaborativeChanges()
    } catch {}
    return summary
  },

  async createExpandableFromTerm(
    parent: Summary,
    term: string,
    opts?: { idFactory?: () => string; syncUrl?: string },
  ) {
    const now = Date.now()
    const id = opts?.idFactory ? opts.idFactory() : `${now}`
    const gen = await aiService.generateKnowledgeSummary(term)
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
      backgroundColor: parent.backgroundColor || undefined,
      createdAt: now,
      updatedAt: now,
    }
    await this.upsert(summary, opts?.syncUrl || '/sync/summary')
    try {
      const { processOfflineQueue } = await import('../sync/sync.service')
      await processOfflineQueue()
    } catch {}
    try {
      const { flushLocalCollaborativeChanges } =
        await import('../firebase/collab-flush.service')
      await flushLocalCollaborativeChanges()
    } catch {}
    return summary
  },

  async listChildren(parentSummaryId: string): Promise<Summary[]> {
    const db = await getDb()
    return summariesDao.getChildren(db, parentSummaryId)
  },

  async deleteById(
    id: string,
    opts?: { syncUrl?: string; alsoClearWhiteboard?: boolean },
  ) {
    const db = await getDb()
    const target = await summariesDao.getById(db, id)
    if (!target) return

    // Recursively delete children first
    const children = await summariesDao.getChildren(db, id)
    for (const child of children) {
      await this.deleteById(child.id, opts)
    }

    await challengesRepository.deleteBySummaryId(id)
    await summariesDao.deleteById(db, id)

    await offlineQueue.enqueue({
      url: opts?.syncUrl || '/sync/summary',
      method: 'DELETE',
      body: { id },
    })

    try {
      const { deleteGroupSummary } =
        await import('../firebase/collab-data.service')
      await deleteGroupSummary(id)
    } catch {}
  },

  async deleteByTopicId(topicId: string, opts?: { syncUrl?: string }) {
    const list = await this.list(topicId)
    for (const s of list) {
      await this.deleteById(s.id, opts)
    }
  },

  async setBackgroundColorByTopic(
    topicId: string,
    color?: string,
    opts?: { syncUrl?: string; fromSync?: boolean },
  ) {
    const db = await getDb()
    const list = await summariesDao.getByTopicId(db, topicId)
    if (!list.length) return

    const updatedAt = Date.now()
    for (const s of list) {
      const updated: Summary = {
        ...s,
        backgroundColor: color || undefined,
        updatedAt,
      }
      await summariesDao.upsert(db, updated)

      if (!opts?.fromSync) {
        await offlineQueue.enqueue({
          url: opts?.syncUrl || '/sync/summary',
          method: 'PUT',
          body: updated,
        })
      }
    }
  },
}
