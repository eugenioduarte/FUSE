import useTrackTopicSession from '@/hooks/useTrackTopicSession'
import { challengesRepository } from '@/services/repositories/challenges.repository'
import { summariesRepository } from '@/services/repositories/summaries.repository'
import { useOverlay } from '@/store/useOverlay'
import { Challenge } from '@/types/domain'
import { useEffect, useState } from 'react'

export default function useChallengeReviewTextAnswer(challengeId: string) {
  const { setErrorOverlay, setLoadingOverlay } = useOverlay.getState()
  const [challenge, setChallenge] = useState<Challenge | null>(null)
  const [topicId, setTopicId] = useState<string | null>(null)

  const [timeLimitSeconds, setTimeLimitSeconds] = useState<number>(60)

  useEffect(() => {
    let active = true
    if (!challengeId) {
      setLoadingOverlay(true, 'ChallengeReviewTextAnswerScreen')
      return
    }

    ;(async () => {
      try {
        setLoadingOverlay(true, 'ChallengeReviewTextAnswerScreen')
        const all = await challengesRepository.list()
        if (!active) return
        const ch = all.find((c) => c.id === challengeId) || null
        if (!ch) throw new Error('Challenge not found')
        setChallenge(ch)
        try {
          const summary = await summariesRepository.getById(ch.summaryId)
          if (summary) setTopicId(summary.topicId)
        } catch {}
      } catch (e) {
        console.error(e)
        setErrorOverlay(true, 'Não foi possível carregar o review.')
      } finally {
        setLoadingOverlay(false)
      }
    })()
    return () => {
      active = false
    }
  }, [challengeId, setErrorOverlay, setLoadingOverlay])

  useTrackTopicSession(topicId, 'challenge', challenge?.id)

  const lastAttempt = (challenge?.payload?.attempts || []).at(-1)
  const exercises = lastAttempt?.exercises || []

  return {
    challenge,
    exercises,
    lastAttempt,
    timeLimitSeconds,
    setTimeLimitSeconds,
  }
}
