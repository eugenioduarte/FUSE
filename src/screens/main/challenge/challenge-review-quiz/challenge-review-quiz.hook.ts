import { challengesRepository } from '@/services/repositories/challenges.repository'
import { summariesRepository } from '@/services/repositories/summaries.repository'
import { useOverlay } from '@/store/overlay.store'
import { Challenge } from '@/types/domain'
import { useEffect, useState } from 'react'

export type AIQuizQuestion = {
  question: string
  options: { text: string; correct: boolean; explanation: string }[]
}

export type AttemptQuestion = AIQuizQuestion & { choice: number | null }

export type Attempt = {
  at: number
  score: number
  total: number
  questions: AttemptQuestion[]
}

const useChallengeReviewQuiz = (challengeId: string | null) => {
  const [challenge, setChallenge] = useState<Challenge | null>(null)
  const [topicId, setTopicId] = useState<string | null>(null)
  const [attempt, setAttempt] = useState<Attempt | null>(null)
  const { setLoadingOverlay } = useOverlay.getState()
  const [explainIdxByQ, setExplainIdxByQ] = useState<
    Record<number, number | null>
  >({})

  useEffect(() => {
    let active = true
    if (!challengeId) {
      setLoadingOverlay(true, 'ChallengeReviewQuizScreen')
      return
    }

    ;(async () => {
      try {
        setLoadingOverlay(true, 'ChallengeReviewQuizScreen')
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
        if (last) {
          const init: Record<number, number | null> = {}
          for (let i = 0; i < last.questions.length; i++) init[i] = null
          setExplainIdxByQ(init)
        }
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

  const handleOptionPress = (questionIndex: number, optionIndex: number) => {
    setExplainIdxByQ((prev) => ({ ...prev, [questionIndex]: optionIndex }))
  }

  return {
    challenge,
    topicId,
    attempt,
    explainIdxByQ,
    handleOptionPress,
  }
}

export default useChallengeReviewQuiz
