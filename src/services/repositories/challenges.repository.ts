import { getDb } from '../../lib/db/db'
import { challengesDao } from '../../lib/db/dao/challenges.dao'
import { offlineQueue } from '../../storage/offlineQueue'
import { Challenge } from '../../types/domain'

export const challengesRepository = {
  async list(): Promise<Challenge[]> {
    const db = await getDb()
    return challengesDao.getAll(db)
  },

  async listBySummary(summaryId: string): Promise<Challenge[]> {
    const db = await getDb()
    return challengesDao.getBySummaryId(db, summaryId)
  },

  async upsert(
    challenge: Challenge,
    syncUrl: string,
    opts?: { summaryId?: string; fromSync?: boolean },
  ) {
    const db = await getDb()
    await challengesDao.upsert(db, challenge)

    if (!opts?.fromSync) {
      await offlineQueue.enqueue({
        url: syncUrl,
        method: 'PUT',
        body: challenge,
      })
    }

    // Do NOT mirror to Firestore here. Collaborative mirror will be handled
    // centrally when Dashboard gains focus (flushLocalCollaborativeChanges).
  },

  async deleteById(
    id: string,
    opts?: { summaryId?: string; syncUrl?: string },
  ) {
    const db = await getDb()
    await challengesDao.deleteById(db, id)

    await offlineQueue.enqueue({
      url: opts?.syncUrl || '/sync/challenge',
      method: 'DELETE',
      body: { id },
    })

    try {
      const { deleteGroupChallenge } = await import(
        '../firebase/collabData.service'
      )
      await deleteGroupChallenge(id)
    } catch {}
  },

  async deleteBySummaryId(summaryId: string, opts?: { syncUrl?: string }) {
    const db = await getDb()
    await challengesDao.deleteBySummaryId(db, summaryId)

    await offlineQueue.enqueue({
      url: opts?.syncUrl || '/sync/challenge',
      method: 'DELETE',
      body: { summaryId },
    })

    // Firestore deletions are handled in cascade by summariesRepository.deleteById
  },
}
