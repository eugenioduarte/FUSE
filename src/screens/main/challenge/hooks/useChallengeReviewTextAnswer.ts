import useTrackTopicSession from '@/hooks/useTrackTopicSession'
import { challengesRepository } from '@/services/repositories/challenges.repository'
import { summariesRepository } from '@/services/repositories/summaries.repository'
import { useOverlay } from '@/store/useOverlay'
import { Challenge } from '@/types/domain'
import { useEffect, useState } from 'react'

export default function useChallengeReviewTextAnswer(challengeId: string) {
  const { setErrorOverlay } = useOverlay()
  const [challenge, setChallenge] = useState<Challenge | null>(null)
  const [topicId, setTopicId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const [timeLimitSeconds, setTimeLimitSeconds] = useState<number>(60)

  useEffect(() => {
    let active = true
    ;(async () => {
      try {
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
        if (active) setLoading(false)
      }
    })()
    return () => {
      active = false
    }
  }, [challengeId, setErrorOverlay])

  useTrackTopicSession(topicId, 'challenge', challenge?.id)

  const lastAttempt = (challenge?.payload?.attempts || []).at(-1)
  const exercises = lastAttempt?.exercises || []

  return {
    challenge,
    loading,
    exercises,
    lastAttempt,
    timeLimitSeconds,
    setTimeLimitSeconds,
  }
}
