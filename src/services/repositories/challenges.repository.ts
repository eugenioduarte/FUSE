import { localCache } from '../../storage/localCache'
import { offlineQueue } from '../../storage/offlineQueue'
import { Challenge } from '../../types/domain'

const LIST_ALL_KEY = 'challenges:list'
const listKeyBySummary = (summaryId: string) => `challenges:list:${summaryId}`

export const challengesRepository = {
  async list(): Promise<Challenge[]> {
    const cached = await localCache.get<Challenge[]>(LIST_ALL_KEY)
    return cached?.data ?? []
  },

  async listBySummary(
    summaryId: string,
  ): Promise<{ id: string; title: string }[]> {
    const cached = await localCache.get<{ id: string; title: string }[]>(
      listKeyBySummary(summaryId),
    )
    return cached?.data ?? []
  },

  async upsert(
    challenge: Challenge,
    syncUrl: string,
    opts?: { summaryId?: string },
  ) {
    // Update global list
    const currentAll =
      (await localCache.get<Challenge[]>(LIST_ALL_KEY))?.data ?? []
    const idxAll = currentAll.findIndex((c) => c.id === challenge.id)
    if (idxAll >= 0) currentAll[idxAll] = challenge
    else currentAll.unshift(challenge)
    await localCache.set(LIST_ALL_KEY, currentAll, challenge.updatedAt)

    // Update per-summary list if provided
    if (opts?.summaryId) {
      const key = listKeyBySummary(opts.summaryId)
      const current =
        (await localCache.get<{ id: string; title: string }[]>(key))?.data ?? []
      const idx = current.findIndex((c) => c.id === challenge.id)
      const item = { id: challenge.id, title: challenge.title }
      if (idx >= 0) current[idx] = item
      else current.unshift(item)
      await localCache.set(key, current, challenge.updatedAt)
    }

    await offlineQueue.enqueue({ url: syncUrl, method: 'PUT', body: challenge })

    // Mirror to Firestore if parent topic is a group
    try {
      const { summariesRepository } = await import('./summaries.repository')
      const { topicsRepository } = await import('./topics.repository')
      const summary = await summariesRepository.getById(challenge.summaryId)
      const parent = summary
        ? await topicsRepository.getById(summary.topicId)
        : null
      if ((parent?.members && parent.members.length > 0) || parent?.createdBy) {
        const { upsertGroupChallenge } = await import(
          '../firebase/collabData.service'
        )
        await upsertGroupChallenge(challenge, { topicId: summary?.topicId })
      }
    } catch {}
  },

  async deleteById(
    id: string,
    opts?: { summaryId?: string; syncUrl?: string },
  ) {
    // Remove from global list
    const currentAll =
      (await localCache.get<Challenge[]>(LIST_ALL_KEY))?.data ?? []
    const nextAll = currentAll.filter((c) => c.id !== id)
    await localCache.set(LIST_ALL_KEY, nextAll)

    // Remove from per-summary list if provided
    if (opts?.summaryId) {
      const key = listKeyBySummary(opts.summaryId)
      const current =
        (await localCache.get<{ id: string; title: string }[]>(key))?.data ?? []
      const next = current.filter((c) => c.id !== id)
      await localCache.set(key, next)
    }

    await offlineQueue.enqueue({
      url: opts?.syncUrl || '/sync/challenge',
      method: 'DELETE',
      body: { id },
    })

    // Delete in Firestore as well
    try {
      const { deleteGroupChallenge } = await import(
        '../firebase/collabData.service'
      )
      await deleteGroupChallenge(id)
    } catch {}
  },

  async deleteBySummaryId(summaryId: string, opts?: { syncUrl?: string }) {
    // Remove mini list
    const key = listKeyBySummary(summaryId)
    const items = (await localCache.get<{ id: string; title: string }[]>(key))
      ?.data
    await localCache.remove(key)

    // Remove from global list
    const currentAll =
      (await localCache.get<Challenge[]>(LIST_ALL_KEY))?.data ?? []
    const toRemoveIds = new Set((items ?? []).map((i) => i.id))
    const nextAll = currentAll.filter(
      (c) => !(c.summaryId === summaryId || toRemoveIds.has(c.id)),
    )
    await localCache.set(LIST_ALL_KEY, nextAll)

    // Enqueue a single batch delete for server
    await offlineQueue.enqueue({
      url: opts?.syncUrl || '/sync/challenge',
      method: 'DELETE',
      body: { summaryId },
    })

    // Firestore deletions are handled in cascade by summariesRepository.deleteById
  },
}
