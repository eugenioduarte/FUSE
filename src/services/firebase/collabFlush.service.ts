import { localCache } from '../../storage/localCache'
import { offlineQueue } from '../../storage/offlineQueue'
import { Challenge, Summary, Topic } from '../../types/domain'
import { summariesRepository } from '../repositories/summaries.repository'
import { topicsRepository } from '../repositories/topics.repository'

type MirrorKind = 'topic' | 'summary' | 'challenge'

function mirrorKey(kind: MirrorKind, id: string) {
  return `collab:mirrored:${kind}:${id}:updatedAt`
}

async function getLastMirrored(kind: MirrorKind, id: string) {
  const key = mirrorKey(kind, id)
  const res = await localCache.get<number>(key)
  return res?.data ?? 0
}

async function setLastMirrored(
  kind: MirrorKind,
  id: string,
  updatedAt: number,
) {
  const key = mirrorKey(kind, id)
  await localCache.set(key, updatedAt, Date.now())
}

export async function flushLocalCollaborativeChanges() {
  // Look at enqueued REST sync items and mirror relevant ones to Firestore if changed
  const items = await offlineQueue.peekAll()

  for (const item of items) {
    try {
      if (item.method !== 'PUT') continue
      if (!item.url) continue

      if (item.url.includes('/sync/challenge')) {
        const challenge = item.body as Challenge
        if (!challenge?.id || !challenge?.summaryId) continue
        const last = await getLastMirrored('challenge', challenge.id)
        if ((challenge.updatedAt || 0) <= last) continue

        const summary = await summariesRepository.getById(challenge.summaryId)
        if (!summary) continue
        const parent = await topicsRepository.getById(summary.topicId)
        if (!parent) continue
        const isGroup = !!(
          parent.createdBy ||
          (parent.members && parent.members.length > 0)
        )
        if (!isGroup) continue
        const { upsertGroupChallenge } = await import('./collabData.service')
        await upsertGroupChallenge(challenge, { topicId: summary.topicId })
        await setLastMirrored('challenge', challenge.id, challenge.updatedAt)
      } else if (item.url.includes('/sync/summary')) {
        const summary = item.body as Summary
        if (!summary?.id || !summary?.topicId) continue
        const last = await getLastMirrored('summary', summary.id)
        if ((summary.updatedAt || 0) <= last) continue

        const parent = await topicsRepository.getById(summary.topicId)
        if (!parent) continue
        const isGroup = !!(
          parent.createdBy ||
          (parent.members && parent.members.length > 0)
        )
        if (!isGroup) continue
        const { upsertGroupSummary } = await import('./collabData.service')
        await upsertGroupSummary(summary)
        await setLastMirrored('summary', summary.id, summary.updatedAt)
      } else if (item.url.includes('/sync/topic')) {
        const topic = item.body as Topic
        if (!topic?.id) continue
        const last = await getLastMirrored('topic', topic.id)
        if ((topic.updatedAt || 0) <= last) continue

        const isGroup = !!(
          topic.createdBy ||
          (topic.members && topic.members.length > 0)
        )
        if (!isGroup) continue
        const { upsertGroupTopic } = await import('./collabData.service')
        await upsertGroupTopic(topic)
        await setLastMirrored('topic', topic.id, topic.updatedAt)
      }
    } catch (e) {
      // Ignore individual failures; they'll retry on next focus
      console.warn('collabFlush mirror failure', e)
    }
  }
}
