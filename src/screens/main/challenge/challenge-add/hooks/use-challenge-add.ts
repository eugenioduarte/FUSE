import { navigatorManager } from '@/navigation/navigatorManager'
import { challengesRepository } from '@/services/repositories/challenges.repository'
import { summariesRepository } from '@/services/repositories/summaries.repository'
import { topicsRepository } from '@/services/repositories/topics.repository'
import { useOverlay } from '@/store/useOverlay'
import { Challenge } from '@/types/domain'
import { useEffect, useState } from 'react'

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

        type Acc = { scoreSum: number; totalSum: number; count: number }
        const accs: Record<string, Acc> = {}
        const totalsCounter: Record<string, number> = {}

        for (const c of filtered) {
          const type = c.type
          const acc = accs[type] ?? { scoreSum: 0, totalSum: 0, count: 0 }
          const attempts: any[] = []
          if (Array.isArray(c.payload?.attempts))
            attempts.push(...c.payload.attempts)
          if (c.payload?.lastAttempt) attempts.push(c.payload.lastAttempt)

          // count total attempts per type
          totalsCounter[type] = (totalsCounter[type] || 0) + attempts.length
          if (
            c.payload?.lastAttempt &&
            (!Array.isArray(c.payload?.attempts) || !c.payload.attempts.length)
          ) {
            totalsCounter[type] = Math.max(totalsCounter[type], 1)
          }

          for (const a of attempts) {
            const sc = Number(a?.score)
            const tot = Number(a?.total)
            if (!Number.isFinite(sc)) continue

            // fallback totals for incomplete data
            if (!Number.isFinite(tot) || tot === 0) {
              acc.scoreSum += sc
              acc.totalSum += type === 'text' ? 10 : 1
              acc.count += 1
              continue
            }

            acc.scoreSum += sc
            acc.totalSum += tot
            acc.count += 1
          }

          accs[type] = acc
        }

        const averages: Record<string, number> = {}
        for (const k of Object.keys(accs)) {
          const a = accs[k]
          if (a.count > 0 && a.totalSum > 0) {
            averages[k] = Math.round((a.scoreSum / a.totalSum) * 100)
          }
        }

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

  // 🔹 Common helper for navigation + challenge creation
  const createChallenge = async (
    type: Challenge['type'],
    payload: Record<string, any>,
    navigate: (id: string) => void,
  ) => {
    if (!summaryId) {
      setErrorOverlay(
        true,
        'Abra a criação de challenge a partir de um Summary.',
      )
      return
    }

    try {
      setLoadingOverlay(true, 'ChallengeAddScreen')
      const now = Date.now()
      const id = `${now}`

      const challenge: Challenge = {
        id,
        type,
        title: type.charAt(0).toUpperCase() + type.slice(1),
        summaryId,
        payload,
        createdAt: now,
        updatedAt: now,
      }

      await challengesRepository.upsert(challenge, '/sync/challenge', {
        summaryId,
      })
      navigate(id)
    } catch (e) {
      console.error(e)
      setErrorOverlay(
        true,
        `Não foi possível iniciar o ${type}. Tente novamente.`,
      )
    } finally {
      setLoadingOverlay(false)
    }
  }

  // 🔹 Specific handlers
  const handleStartQuiz = () =>
    createChallenge(
      'quiz',
      { totalQuestions: Math.floor(Math.random() * (10 - 5 + 1)) + 5 },
      (id) => navigatorManager.goToChallengeRunQuiz({ challengeId: id }),
    )

  const handleStartHangman = () =>
    createChallenge(
      'hangman',
      {
        totalRounds: Math.floor(Math.random() * (5 - 2 + 1)) + 2,
        maxErrorsPerRound: 3,
      },
      (id) => navigatorManager.goToChallengeRunHangman({ challengeId: id }),
    )

  const handleStartMatrix = () =>
    createChallenge('matrix', { totalWords: 5, durationSec: 60 }, (id) =>
      navigatorManager.goToChallengeRunMatrix({ challengeId: id }),
    )

  const handleStartText = () =>
    createChallenge(
      'text',
      { totalExercises: 5, perExerciseSeconds: 0 },
      (id) => navigatorManager.goToChallengeRunTextAnswer({ challengeId: id }),
    )

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
