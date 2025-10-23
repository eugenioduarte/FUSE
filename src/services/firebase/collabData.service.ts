import {
  deleteDoc,
  doc,
  getFirestore,
  serverTimestamp,
  setDoc,
  writeBatch,
} from 'firebase/firestore'
import { useAuthStore } from '../../store/useAuthStore'
import { Challenge, Summary, Topic } from '../../types/domain'
import { getFirebaseApp } from './firebaseInit'

function db() {
  return getFirestore(getFirebaseApp())
}

// Helpers to coerce timestamps
function toFsDoc<T extends { createdAt: number; updatedAt: number }>(data: T) {
  // Store timestamps as server timestamps to normalize across devices
  return {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  } as any
}

export async function upsertGroupTopic(topic: Topic) {
  const ref = doc(db(), 'topics', topic.id)
  const payload = toFsDoc<Topic>({
    ...topic,
    // Ensure required metadata
    createdBy: topic.createdBy || useAuthStore.getState().user?.id || undefined,
    members:
      topic.members || [useAuthStore.getState().user?.id!].filter(Boolean),
  })
  await setDoc(ref, payload, { merge: true })
}

export async function upsertGroupSummary(summary: Summary) {
  const ref = doc(db(), 'summaries', summary.id)
  const payload = toFsDoc<Summary>({
    ...summary,
    authorId: summary.authorId || useAuthStore.getState().user?.id || undefined,
  })
  await setDoc(ref, payload, { merge: true })
}

export async function upsertGroupChallenge(
  challenge: Challenge,
  opts?: { topicId?: string },
) {
  const ref = doc(db(), 'challenges', challenge.id)
  const payload = toFsDoc<Challenge & { topicId?: string }>({
    ...challenge,
    authorId:
      challenge.authorId || useAuthStore.getState().user?.id || undefined,
    // Include topicId to make listeners simpler (not part of Challenge type locally)
    ...(opts?.topicId ? { topicId: opts.topicId } : {}),
  } as any)
  await setDoc(ref, payload, { merge: true })
}

export async function deleteGroupTopic(topicId: string) {
  await deleteDoc(doc(db(), 'topics', topicId))
}

export async function deleteGroupSummary(summaryId: string) {
  await deleteDoc(doc(db(), 'summaries', summaryId))
}

export async function deleteGroupChallenge(challengeId: string) {
  await deleteDoc(doc(db(), 'challenges', challengeId))
}

/** Promote an existing local topic (and its content) to a shared group in Firestore */
export async function promoteTopicToGroup(topicId: string) {
  const me = useAuthStore.getState().user
  if (!me?.id) throw new Error('Not authenticated')
  // Lazy-load repositories to avoid circular deps
  const { topicsRepository } = await import('../repositories/topics.repository')
  const { summariesRepository } = await import(
    '../repositories/summaries.repository'
  )
  const { challengesRepository } = await import(
    '../repositories/challenges.repository'
  )

  const topic = await topicsRepository.getById(topicId)
  if (!topic) throw new Error('Topic not found')

  const batch = writeBatch(db())
  // Topic doc
  const topicDoc = doc(db(), 'topics', topic.id)
  batch.set(
    topicDoc,
    {
      ...topic,
      createdBy: me.id,
      members: [me.id],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    } as any,
    { merge: true },
  )

  // Summaries under this topic
  const summaries = await summariesRepository.list(topicId)
  for (const s of summaries) {
    const sumRef = doc(db(), 'summaries', s.id)
    batch.set(
      sumRef,
      {
        ...s,
        authorId: s.authorId || me.id,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      } as any,
      { merge: true },
    )
  }

  // Challenges for each summary - we need their minimal lists
  const allChallenges = await challengesRepository.list()
  for (const ch of allChallenges) {
    // Keep only challenges related to this topic
    const sum = summaries.find((s) => s.id === ch.summaryId)
    if (!sum) continue
    const chRef = doc(db(), 'challenges', ch.id)
    batch.set(
      chRef,
      {
        ...ch,
        authorId: ch.authorId || me.id,
        topicId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      } as any,
      { merge: true },
    )
  }

  await batch.commit()

  // Update local topic to reflect group membership
  const next: Topic = {
    ...topic,
    createdBy: me.id,
    members: [me.id],
    updatedAt: Date.now(),
  }
  await topicsRepository.upsert(next, '/sync/topic')
}

/** Convenience: promote topic (if needed) and send an invite to a friend email */
export async function promoteAndInvite(toEmail: string, topicId: string) {
  // Promote first to ensure topic exists on Firestore
  await promoteTopicToGroup(topicId)
  const { sendTopicInvite } = await import('./invites.service')
  await sendTopicInvite(toEmail, topicId)
}
