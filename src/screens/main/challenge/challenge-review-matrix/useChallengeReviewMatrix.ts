import { challengesRepository } from '@/services/repositories/challenges.repository'
import { Challenge } from '@/types/domain'
import { useEffect, useMemo, useState } from 'react'

type MatrixAttempt = {
  at: number
  score: number
  total: number
  question: string
  words: string[]
  found: string[]
  grid: string[][]
  placements: { word: string; cells: { r: number; c: number }[] }[]
}

/**
 * useChallengeReviewMatrix
 *
 * Loads a challenge by id and extracts the last Matrix attempt along with
 * a memoized set of found cells for quick lookup by the UI.
 */
export default function useChallengeReviewMatrix(challengeId: string) {
  const [challenge, setChallenge] = useState<Challenge | null>(null)
  const [topicId, setTopicId] = useState<string | null>(null)
  const [attempt, setAttempt] = useState<MatrixAttempt | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    ;(async () => {
      try {
        const all = await challengesRepository.list()
        if (!active) return
        const ch = all.find((c) => c.id === challengeId) || null
        if (!ch) throw new Error('Challenge não encontrado')
        setChallenge(ch)
        const attempts: MatrixAttempt[] = ch.payload?.attempts || []
        const last = attempts.at(-1) || null
        setAttempt(last)
        try {
          const { summariesRepository } = await import(
            '../../../../services/repositories/summaries.repository'
          )
          const summary = await summariesRepository.getById(ch.summaryId)
          if (summary) setTopicId(summary.topicId)
        } catch {}
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    })()
    return () => {
      active = false
    }
  }, [challengeId])

  const foundCells = useMemo(() => {
    const set = new Set<string>()
    if (!attempt) return set
    for (const pl of attempt.placements) {
      if (!attempt.found.includes(pl.word)) continue
      for (const cell of pl.cells) set.add(`${cell.r},${cell.c}`)
    }
    return set
  }, [attempt])

  const dateStr = useMemo(() => {
    if (!attempt) return ''
    const d = new Date(attempt.at)
    const pad = (n: number) => String(n).padStart(2, '0')
    return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`
  }, [attempt])

  return {
    challenge,
    topicId,
    attempt,
    loading,
    foundCells,
    dateStr,
  }
}
