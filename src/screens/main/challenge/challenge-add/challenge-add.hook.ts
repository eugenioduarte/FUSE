import { generateMatrixQA } from '@/hooks/use-challenge-matrix/use-challenge-matrix'
import { navigatorManager } from '@/navigation/navigatorManager'
import { buildHangmanPrompt, buildQuizPrompt } from '@/services/prompts'
import { challengesRepository } from '@/services/repositories/challenges.repository'
import { summariesRepository } from '@/services/repositories/summaries.repository'
import { topicsRepository } from '@/services/repositories/topics.repository'
import { useOverlay } from '@/store/overlay.store'
import { Challenge } from '@/types/domain'
import { useEffect, useState } from 'react'
import { generateHangmanRounds } from '../challenge-run-hangman/challenge-run-hangman.hook'
import { generateQuiz } from '../challenge-run-quiz/challenge-run-quiz.hook'
import {
  generateOpenQuestionSet,
  TAExercise,
} from '../challenge-run-text-answer/challenge-run-text-answer.hook'

type UseChallengeAddReturn = {
  topicColor: string | undefined
  avgScores: Record<string, number>
  totals: Record<string, number>
  handleStartQuiz: () => Promise<void>
  handleStartHangman: () => Promise<void>
  handleStartMatrix: () => Promise<void>
  handleStartText: () => Promise<void>
}

export default function useChallengeAdd(
  summaryId?: string,
): UseChallengeAddReturn {
  const { setLoadingOverlay, setErrorOverlay } = useOverlay()
  const [topicColor, setTopicColor] = useState<string | undefined>()
  const [avgScores, setAvgScores] = useState<Record<string, number>>({})
  const [totals, setTotals] = useState<Record<string, number>>({})

  // 🔹 Load topic color for UI accent
  useEffect(() => {
    let active = true
    ;(async () => {
      try {
        if (!summaryId) return
        const summary = await summariesRepository.getById(summaryId)
        if (!active || !summary) return
        const topic = await topicsRepository.getById(summary.topicId)
        if (active) setTopicColor(topic?.backgroundColor || undefined)
      } catch (e) {
        console.warn('useChallengeAdd: failed to load topic color', e)
      }
    })()
    return () => {
      active = false
    }
  }, [summaryId])

  // 🔹 Compute average scores and totals per challenge type
  useEffect(() => {
    let active = true
    ;(async () => {
      try {
        const all = await challengesRepository.list()
        const filtered = summaryId
          ? all.filter((c) => c.summaryId === summaryId)
          : all
        const { averages, totalsCounter } = computeScoreStats(filtered)
        if (!active) return
        setAvgScores(averages)
        setTotals(totalsCounter)
      } catch (e) {
        console.warn('useChallengeAdd: failed to compute avg scores', e)
      }
    })()
    return () => {
      active = false
    }
  }, [summaryId])

  // 🔹 Common helper: persist challenge + navigate
  const saveAndNavigate = async (
    challenge: Challenge,
    navigate: (id: string) => void,
  ) => {
    await challengesRepository.upsert(challenge, '/sync/challenge', {
      summaryId,
    })
    navigate(challenge.id)
  }

  // 🔹 Quiz — generate questions via AI at creation time
  const handleStartQuiz = async () => {
    if (!summaryId) {
      setErrorOverlay(true, 'Open challenge creation from a Summary first.')
      return
    }
    try {
      setLoadingOverlay(true, 'Gerando Quiz…')
      const summary = await summariesRepository.getById(summaryId)
      if (!summary) throw new Error('Summary not found')

      const totalQuestions = Math.floor(Math.random() * (10 - 5 + 1)) + 5
      const prompt = buildQuizPrompt(summary.content, totalQuestions)
      const quiz = await generateQuiz(prompt)

      const now = Date.now()
      const challenge: Challenge = {
        id: `${now}`,
        type: 'quiz',
        title: 'Quiz',
        summaryId,
        payload: {
          totalQuestions: quiz.questions.length,
          questions: quiz.questions,
        },
        createdAt: now,
        updatedAt: now,
      }
      await saveAndNavigate(challenge, (id) =>
        navigatorManager.goToChallengeRunQuiz({ challengeId: id }),
      )
    } catch (e) {
      console.error(e)
      setErrorOverlay(
        true,
        'Could not create Quiz challenge. Please try again.',
      )
    } finally {
      setLoadingOverlay(false)
    }
  }

  // 🔹 Hangman — generate rounds via AI at creation time
  const handleStartHangman = async () => {
    if (!summaryId) {
      setErrorOverlay(true, 'Open challenge creation from a Summary first.')
      return
    }
    try {
      setLoadingOverlay(true, 'Gerando Hangman…')
      const summary = await summariesRepository.getById(summaryId)
      if (!summary) throw new Error('Summary not found')

      const totalRounds = Math.floor(Math.random() * (5 - 2 + 1)) + 2
      const maxErrorsPerRound = 3
      const rounds = await generateHangmanRounds(
        buildHangmanPrompt(summary.content, totalRounds),
      )

      const now = Date.now()
      const challenge: Challenge = {
        id: `${now}`,
        type: 'hangman',
        title: 'Hangman',
        summaryId,
        payload: { totalRounds: rounds.length, maxErrorsPerRound, rounds },
        createdAt: now,
        updatedAt: now,
      }
      await saveAndNavigate(challenge, (id) =>
        navigatorManager.goToChallengeRunHangman({ challengeId: id }),
      )
    } catch (e) {
      console.error(e)
      setErrorOverlay(
        true,
        'Could not create Hangman challenge. Please try again.',
      )
    } finally {
      setLoadingOverlay(false)
    }
  }

  // 🔹 Matrix — generate question + words via AI at creation time
  const handleStartMatrix = async () => {
    if (!summaryId) {
      setErrorOverlay(true, 'Open challenge creation from a Summary first.')
      return
    }
    try {
      setLoadingOverlay(true, 'Gerando Matrix…')
      const summary = await summariesRepository.getById(summaryId)
      if (!summary) throw new Error('Summary not found')

      const qa = await generateMatrixQA(summary.content)

      const now = Date.now()
      const challenge: Challenge = {
        id: `${now}`,
        type: 'matrix',
        title: 'Matrix',
        summaryId,
        payload: {
          totalWords: qa.words.length,
          durationSec: 60,
          question: qa.question,
          words: qa.words,
        },
        createdAt: now,
        updatedAt: now,
      }
      await saveAndNavigate(challenge, (id) =>
        navigatorManager.goToChallengeRunMatrix({ challengeId: id }),
      )
    } catch (e) {
      console.error(e)
      setErrorOverlay(
        true,
        'Could not create Matrix challenge. Please try again.',
      )
    } finally {
      setLoadingOverlay(false)
    }
  }

  // 🔹 Text Answer — generate exercises via AI at creation time
  const handleStartText = async () => {
    if (!summaryId) {
      setErrorOverlay(true, 'Open challenge creation from a Summary first.')
      return
    }
    try {
      setLoadingOverlay(true, 'Gerando exercícios…')
      const summary = await summariesRepository.getById(summaryId)
      if (!summary) throw new Error('Summary not found')

      const totalExercises = 5
      const exercises: TAExercise[] = await generateOpenQuestionSet(
        summary.content,
        totalExercises,
      )

      const now = Date.now()
      const challenge: Challenge = {
        id: `${now}`,
        type: 'text',
        title: 'Text Answer',
        summaryId,
        payload: {
          totalExercises: exercises.length,
          perExerciseSeconds: 120,
          exercises,
        },
        createdAt: now,
        updatedAt: now,
      }
      await saveAndNavigate(challenge, (id) =>
        navigatorManager.goToChallengeRunTextAnswer({ challengeId: id }),
      )
    } catch (e) {
      console.error(e)
      setErrorOverlay(
        true,
        'Could not create Text challenge. Please try again.',
      )
    } finally {
      setLoadingOverlay(false)
    }
  }

  return {
    topicColor,
    avgScores,
    totals,
    handleStartQuiz,
    handleStartHangman,
    handleStartMatrix,
    handleStartText,
  }
}

// ─── helpers ─────────────────────────────────────────────────────────────────

type Acc = { scoreSum: number; totalSum: number; count: number }

function collectAttempts(challenge: Challenge): any[] {
  const attempts: any[] = []
  if (Array.isArray(challenge.payload?.attempts))
    attempts.push(...challenge.payload.attempts)
  if (challenge.payload?.lastAttempt)
    attempts.push(challenge.payload.lastAttempt)
  return attempts
}

function accumulateAttempt(
  acc: Acc,
  score: number,
  total: number,
  type: string,
): Acc {
  if (!Number.isFinite(total) || total === 0) {
    return {
      ...acc,
      scoreSum: acc.scoreSum + score,
      totalSum: acc.totalSum + (type === 'text' ? 10 : 1),
      count: acc.count + 1,
    }
  }
  return {
    ...acc,
    scoreSum: acc.scoreSum + score,
    totalSum: acc.totalSum + total,
    count: acc.count + 1,
  }
}

function computeScoreStats(challenges: Challenge[]) {
  const accs: Record<string, Acc> = {}
  const totalsCounter: Record<string, number> = {}

  for (const c of challenges) {
    const { type } = c
    const attempts = collectAttempts(c)

    totalsCounter[type] = (totalsCounter[type] || 0) + attempts.length
    if (c.payload?.lastAttempt && !attempts.length) {
      totalsCounter[type] = Math.max(totalsCounter[type], 1)
    }

    let acc: Acc = accs[type] ?? { scoreSum: 0, totalSum: 0, count: 0 }
    for (const a of attempts) {
      const sc = Number(a?.score)
      if (!Number.isFinite(sc)) continue
      acc = accumulateAttempt(acc, sc, Number(a?.total), type)
    }
    accs[type] = acc
  }

  const averages: Record<string, number> = {}
  for (const [k, a] of Object.entries(accs)) {
    if (a.count > 0 && a.totalSum > 0) {
      averages[k] = Math.round((a.scoreSum / a.totalSum) * 100)
    }
  }

  return { averages, totalsCounter }
}
