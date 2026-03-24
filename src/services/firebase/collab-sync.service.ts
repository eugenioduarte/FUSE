import {
  collection,
  getFirestore,
  onSnapshot,
  query,
  where,
} from 'firebase/firestore'
import { useAuthStore } from '../../store/auth.store'
import { Challenge, Summary, Topic } from '../../types/domain'
import { getFirebaseApp } from './firebase-init'

// Lazily loaded to avoid circular deps
async function upsertTopic(t: Topic) {
  const { topicsRepository } = await import('../repositories/topics.repository')
  await topicsRepository.upsert(t, '/sync/topic', { fromSync: true })
}

async function deleteTopic(id: string) {
  const { topicsRepository } = await import('../repositories/topics.repository')
  await topicsRepository.deleteById(id, { syncUrl: '/sync/topic' })
}

function mapTopicDoc(d: any): Topic {
  const data = d.data() as any
  return {
    id: d.id,
    title: data.title || 'Tópico',
    description: data.description,
    backgroundColor: data.backgroundColor,
    createdBy: data.createdBy,
    members: data.members,
    createdAt:
      typeof data.createdAt === 'number'
        ? data.createdAt
        : (data.createdAt?.toMillis?.() ?? Date.now()),
    updatedAt:
      typeof data.updatedAt === 'number'
        ? data.updatedAt
        : (data.updatedAt?.toMillis?.() ?? Date.now()),
  }
}

function mapSummaryDoc(d: any): Summary {
  const data = d.data() as any
  return {
    id: d.id,
    topicId: data.topicId,
    authorId: data.authorId,
    title: data.title,
    content: data.content,
    generatedBy: data.generatedBy || 'user',
    keywords: data.keywords,
    backgroundColor: data.backgroundColor,
    parentSummaryId: data.parentSummaryId,
    expandableTerms: data.expandableTerms,
    recommendations: data.recommendations,
    createdAt:
      typeof data.createdAt === 'number'
        ? data.createdAt
        : (data.createdAt?.toMillis?.() ?? Date.now()),
    updatedAt:
      typeof data.updatedAt === 'number'
        ? data.updatedAt
        : (data.updatedAt?.toMillis?.() ?? Date.now()),
  }
}

function mapChallengeDoc(d: any): Challenge {
  const data = d.data() as any
  return {
    id: d.id,
    type: data.type,
    title: data.title,
    summaryId: data.summaryId,
    authorId: data.authorId,
    payload: data.payload,
    createdAt:
      typeof data.createdAt === 'number'
        ? data.createdAt
        : (data.createdAt?.toMillis?.() ?? Date.now()),
    updatedAt:
      typeof data.updatedAt === 'number'
        ? data.updatedAt
        : (data.updatedAt?.toMillis?.() ?? Date.now()),
  }
}

export type UnsubscribeGroup = () => void

/**
 * Starts real-time listeners for collaborative data the user should see.
 * - Topics I created
 * - Topics where I am a member
 * When topics update background color, summaries are auto-updated via repository upsert.
 */
export function startCollabSyncForUser(userId: string): UnsubscribeGroup {
  const db = getFirestore(getFirebaseApp())
  const unsubs: (() => void)[] = []
  const perTopicUnsubs = new Map<string, () => void>()

  async function attachTopicChildrenListeners(topicId: string) {
    // Avoid duplicate
    if (perTopicUnsubs.has(topicId)) return

    const subFns: (() => void)[] = []
    // Summaries for this topic
    const qSum = query(
      collection(db, 'summaries'),
      where('topicId', '==', topicId),
    )
    const unsubSums = onSnapshot(qSum, async (snap) => {
      const { summariesRepository } =
        await import('../repositories/summaries.repository')
      for (const ch of snap.docChanges()) {
        const id = ch.doc.id
        if (ch.type === 'removed') {
          await summariesRepository.deleteById(id)
        } else {
          const s = mapSummaryDoc(ch.doc)
          await summariesRepository.upsert(s, '/sync/summary', {
            fromSync: true,
          })
        }
      }
    })
    subFns.push(unsubSums)

    // Challenges for this topic (we write topicId on Firestore docs)
    const qCh = query(
      collection(db, 'challenges'),
      where('topicId', '==', topicId),
    )
    const unsubCh = onSnapshot(qCh, async (snap) => {
      const { challengesRepository } =
        await import('../repositories/challenges.repository')
      for (const ch of snap.docChanges()) {
        const id = ch.doc.id
        if (ch.type === 'removed') {
          await challengesRepository.deleteById(id)
        } else {
          const c = mapChallengeDoc(ch.doc)
          await challengesRepository.upsert(c, '/sync/challenge', {
            summaryId: c.summaryId,
            fromSync: true,
          })
        }
      }
    })
    subFns.push(unsubCh)

    perTopicUnsubs.set(topicId, () => {
      for (const u of subFns) {
        try {
          u()
        } catch {}
      }
      perTopicUnsubs.delete(topicId)
    })
  }

  function detachTopicChildrenListeners(topicId: string) {
    const fn = perTopicUnsubs.get(topicId)
    if (fn) {
      try {
        fn()
      } catch {}
    }
  }

  // Topics created by me
  const qMine = query(
    collection(db, 'topics'),
    where('createdBy', '==', userId),
  )
  const unsubMine = onSnapshot(qMine, (snap) => {
    for (const ch of snap.docChanges()) {
      const id = ch.doc.id
      if (ch.type === 'removed') {
        deleteTopic(id)
        detachTopicChildrenListeners(id)
      } else {
        const t = mapTopicDoc(ch.doc)
        upsertTopic(t)
        attachTopicChildrenListeners(id)
      }
    }
  })
  unsubs.push(unsubMine)

  // Topics where I am a member
  const qMember = query(
    collection(db, 'topics'),
    where('members', 'array-contains', userId),
  )
  const unsubMember = onSnapshot(qMember, (snap) => {
    for (const ch of snap.docChanges()) {
      const id = ch.doc.id
      if (ch.type === 'removed') {
        deleteTopic(id)
        detachTopicChildrenListeners(id)
      } else {
        const t = mapTopicDoc(ch.doc)
        upsertTopic(t)
        attachTopicChildrenListeners(id)
      }
    }
  })
  unsubs.push(unsubMember)

  // Return group unsubscriber
  return () => {
    for (const u of unsubs) {
      try {
        u()
      } catch {}
    }
    // Detach all per-topic listeners
    for (const u of Array.from(perTopicUnsubs.values())) {
      try {
        u()
      } catch {}
    }
  }
}

/** One-off sync to ensure cache is fresh on app open or resume */
export async function triggerInitialCollaborativeSync() {
  const me = useAuthStore.getState().user
  if (!me?.id) return
  const { syncUserTopicsMembership } = await import('./invites.service')
  await syncUserTopicsMembership()
  // Summaries and challenges will be hydrated by the listeners above once topics are in local cache
}
