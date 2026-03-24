import { buildQuizPrompt, QUIZ_SYSTEM } from '@/services/prompts'
import { callAI, toJSONSafe } from '@/services/ai/ai.service'
import { challengesRepository } from '@/services/repositories/challenges.repository'
import { summariesRepository } from '@/services/repositories/summaries.repository'
import { topicsRepository } from '@/services/repositories/topics.repository'
import { startSession, stopSessionByKey } from '@/services/usage/usageTracker'
import { useAuthStore } from '@/store/auth.store'
import { useOverlay } from '@/store/overlay.store'
import { Challenge } from '@/types/domain'
import { useFocusEffect } from '@react-navigation/native'
import React from 'react'

// Types for AI quiz
export type AIQuizQuestion = {
  question: string
  options: { text: string; correct: boolean; explanation: string }[]
}

type AIQuizResponse = { questions: AIQuizQuestion[] }

type AttemptQuestion = AIQuizQuestion & { choice: number | null }
type Attempt = {
  at: number
  score: number
  total: number
  questions: AttemptQuestion[]
}

export const useChallengeRunQuiz = (challengeId: string) => {
  const { setLoadingOverlay, setErrorOverlay } = useOverlay()
  const meId = useAuthStore((s) => s.user?.id)

  const [challenge, setChallenge] = React.useState<Challenge | null>(null)
  const [questions, setQuestions] = React.useState<AIQuizQuestion[]>([])
  const [loading, setLoading] = React.useState(true)
  const [topicColor, setTopicColor] = React.useState<string | undefined>()
  const [step, setStep] = React.useState(0)
  const [finished, setFinished] = React.useState<null | {
    score: number
    total: number
  }>(null)

  // Attempt state
  const [firstChoiceByIndex, setFirstChoiceByIndex] = React.useState<
    Record<number, number | null>
  >({})
  const [currentChoice, setCurrentChoice] = React.useState<number | null>(null)

  React.useEffect(() => {
    let active = true
    ;(async () => {
      try {
        setLoadingOverlay(true, 'ChallengeRunQuizScreen')
        const all = await challengesRepository.list()
        const ch = all.find((c) => c.id === challengeId) || null
        if (!active) return
        if (!ch) throw new Error('Challenge not found')
        setChallenge(ch)

        const summary = await summariesRepository.getById(ch.summaryId)
        if (!active) return
        if (!summary) throw new Error('Summary not found for this challenge')
        try {
          const topic = await topicsRepository.getById(summary.topicId)
          if (active) setTopicColor(topic?.backgroundColor || undefined)
        } catch {}

        // Use pre-generated questions if available (stored at challenge creation time)
        const preGenQuestions: AIQuizQuestion[] | undefined =
          Array.isArray(ch.payload?.questions) && ch.payload.questions.length > 0
            ? (ch.payload.questions as AIQuizQuestion[])
            : undefined

        let quizQuestions: AIQuizQuestion[]
        if (preGenQuestions) {
          quizQuestions = preGenQuestions
        } else {
          const total = Number(
            ch.payload?.totalQuestions ||
              Math.floor(Math.random() * (10 - 5 + 1)) + 5,
          )
          const prompt = buildQuizPrompt(summary.content, total)
          const quiz = await generateQuiz(prompt)
          quizQuestions = quiz.questions
        }
        if (!active) return
        const shuffled = quizQuestions.map((q) => ({
          ...q,
          options: shuffleArray(q.options),
        }))
        setQuestions(shuffled)

        const init: Record<number, number | null> = {}
        for (let i = 0; i < quizQuestions.length; i++) init[i] = null
        setFirstChoiceByIndex(init)
        setCurrentChoice(null)
        setLoading(false)
      } catch (e) {
        console.error(e)
        setErrorOverlay(true, 'Falha ao preparar o quiz. Tente novamente.')
        setLoading(false)
      } finally {
        setLoadingOverlay(false)
      }
    })()
    return () => {
      active = false
    }
  }, [challengeId, setErrorOverlay, setLoadingOverlay])

  useFocusEffect(
    React.useCallback(() => {
      let sessionKey: string | null = null
      ;(async () => {
        try {
          if (!challenge) return
          const summary = await summariesRepository.getById(challenge.summaryId)
          if (!summary) return
          sessionKey = await startSession(
            summary.topicId,
            'challenge',
            challenge.id,
          )
        } catch {}
      })()
      return () => {
        if (sessionKey) stopSessionByKey(sessionKey)
      }
    }, [challenge]),
  )

  const isLast = step >= Math.max(0, questions.length - 1)

  // Consider the recorded first choice for the current step as the ground truth
  // for whether the user can continue. This prevents swapping the chosen option
  // by tapping other choices after the first selection.
  const canContinue = (firstChoiceByIndex[step] ?? null) !== null

  const onSelect = (optionIdx: number) => {
    // If the user already made a first choice for this step, ignore further clicks
    // so they cannot change the recorded answer by tapping other options.
    if ((firstChoiceByIndex[step] ?? null) !== null) return

    setCurrentChoice(optionIdx)
    setFirstChoiceByIndex((prev) => ({
      ...prev,
      [step]: prev[step] ?? optionIdx,
    }))
  }

  const onContinue = async () => {
    if (!canContinue || !challenge) return
    const nextStep = step + 1
    if (nextStep < questions.length) {
      setStep(nextStep)
      setCurrentChoice(null)
      return
    }
    const score = computeScore(questions, firstChoiceByIndex)
    const now = Date.now()
    const attempt: Attempt & { userId?: string } = {
      at: now,
      score,
      total: questions.length,
      userId: meId || undefined,
      questions: questions.map((q, i) => ({
        ...q,
        choice: firstChoiceByIndex[i] ?? null,
      })),
    }
    const updated: Challenge = {
      ...challenge,
      updatedAt: now,
      payload: {
        ...challenge.payload,
        attempts: [...(challenge.payload?.attempts ?? []), attempt],
        lastAttempt: { score, total: questions.length, at: now },
      },
    }
    try {
      await challengesRepository.upsert(updated, '/sync/challenge', {
        summaryId: challenge.summaryId,
      })
    } catch (e) {
      console.error(e)
    }
    setChallenge(updated)
    setFinished({ score, total: questions.length })
    // fire-and-forget — never block navigation
    import('@/services/firebase/immediateFlush')
      .then(({ immediateCollaborativeFlush }) => immediateCollaborativeFlush(1500))
      .catch(() => {})
  }

  const forceFinish = async () => {
    if (!challenge) return
    const score = computeScore(questions, firstChoiceByIndex)
    const now = Date.now()
    const attempt: Attempt & { userId?: string } = {
      at: now,
      score,
      total: questions.length,
      userId: meId || undefined,
      questions: questions.map((q, i) => ({
        ...q,
        choice: firstChoiceByIndex[i] ?? null,
      })),
    }
    const updated: Challenge = {
      ...challenge,
      updatedAt: now,
      payload: {
        ...challenge.payload,
        attempts: [...(challenge.payload?.attempts ?? []), attempt],
        lastAttempt: { score, total: questions.length, at: now },
      },
    }
    try {
      setLoadingOverlay(true, 'ChallengeRunQuizScreen')
      await challengesRepository.upsert(updated, '/sync/challenge', {
        summaryId: challenge.summaryId,
      })
    } catch (e) {
      console.error(e)
    } finally {
      setLoadingOverlay(false)
    }
    setChallenge(updated)
    setFinished({ score, total: questions.length })
    import('@/services/firebase/immediateFlush')
      .then(({ immediateCollaborativeFlush }) => immediateCollaborativeFlush(1500))
      .catch(() => {})
  }

  return {
    challenge,
    questions,
    loading,
    topicColor,
    step,
    setStep,
    finished,
    firstChoiceByIndex,
    currentChoice,
    isLast,
    canContinue,
    onSelect,
    onContinue,
    forceFinish,
  }
}

function computeScore(
  questions: AIQuizQuestion[],
  firstChoiceByIndex: Record<number, number | null>,
) {
  let score = 0
  for (let i = 0; i < questions.length; i++) {
    const first = firstChoiceByIndex[i]
    if (first == null) continue
    if (questions[i].options[first]?.correct) score += 1
  }
  return score
}

// Prompt builder moved to src/services/prompts

export async function generateQuiz(prompt: string): Promise<AIQuizResponse> {
  const content = await callAI(
    [
      { role: 'system', content: QUIZ_SYSTEM },
      { role: 'user', content: prompt },
    ],
    0.3,
  )
  const json = toJSONSafe(content)
  if (!json?.questions || !Array.isArray(json.questions))
    throw new Error('Quiz AI returned unexpected format')
  const questions: AIQuizQuestion[] = json.questions
    .slice(0, 50)
    .map((q: any) => ({
      question: String(q.question || ''),
      options: Array.isArray(q.options)
        ? q.options.slice(0, 5).map((o: any) => ({
            text: String(o.text || ''),
            correct: Boolean(o.correct),
            explanation: String(o.explanation || ''),
          }))
        : [],
    }))
    .filter((q: AIQuizQuestion) => q.question && q.options.length >= 4)
  if (questions.length === 0)
    throw new Error('Quiz AI returned no valid questions')
  return { questions }
}

function shuffleArray<T>(arr: T[]): T[] {
  const a = arr.slice()
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}


export default useChallengeRunQuiz
