import { challengesRepository } from '@/services/repositories/challenges.repository'
import { summariesRepository } from '@/services/repositories/summaries.repository'
import { useOverlay } from '@/store/overlay.store'
import { Challenge } from '@/types/domain'
import { useEffect, useState } from 'react'

type AttemptRound = {
  word: string
  success: boolean
  wrongs: number
  guesses: string[]
}

type Attempt = {
  at: number
  score: number
  total: number
  rounds: AttemptRound[]
}

const useChallengeReviewHangman = (challengeId: string | null) => {
  const [challenge, setChallenge] = useState<Challenge | null>(null)
  const [topicId, setTopicId] = useState<string | null>(null)
  const [attempt, setAttempt] = useState<Attempt | null>(null)
  const { setLoadingOverlay } = useOverlay.getState()

  useEffect(() => {
    let active = true
    if (!challengeId) {
      setLoadingOverlay(true, 'ChallengeReviewHangmanScreen')
      return
    }

    ;(async () => {
      try {
        setLoadingOverlay(true, 'ChallengeReviewHangmanScreen')
        const all = await challengesRepository.list()
        if (!active) return
        const ch = all.find((c) => c.id === challengeId) || null
        if (!ch) throw new Error('Challenge não encontrado')
        setChallenge(ch)
        const attempts: Attempt[] = ch.payload?.attempts || []
        const last = (attempts as Attempt[]).at(-1) || null
        setAttempt(last)
        try {
          const summary = await summariesRepository.getById(ch.summaryId)
          if (summary) setTopicId(summary.topicId)
        } catch {}
      } catch (e) {
        console.error(e)
      } finally {
        setLoadingOverlay(false)
      }
    })()

    return () => {
      active = false
    }
  }, [challengeId, setLoadingOverlay])

  return {
    challenge,
    topicId,
    attempt,
  }
}

export default useChallengeReviewHangman
