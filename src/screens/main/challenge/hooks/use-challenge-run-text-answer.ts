import useTrackTopicSession from '@/hooks/use-track-topic-session'
import { navigatorManager } from '@/navigation/navigatorManager'
import {
  TEXT_EVALUATION_PROMPT,
  TEXT_EXERCISES_SYSTEM,
  buildTextExercisesPrompt,
} from '@/services/prompts'
import { callAI, toJSONSafe } from '@/services/ai/ai.service'
import { challengesRepository } from '@/services/repositories/challenges.repository'
import { summariesRepository } from '@/services/repositories/summaries.repository'
import { useAuthStore } from '@/store/useAuthStore'
import { useOverlay } from '@/store/useOverlay'
import { Challenge } from '@/types/domain'
import React from 'react'

// Types
export type TAExercise = { question: string; correctAnswer: string }
export type TAEvaluation = { score: number; feedback?: string }
export type TAAttemptItem = TAExercise & {
  userAnswer: string
  score: number
  feedback?: string
}
export type TAAttempt = {
  at: number
  score: number // final 0-10
  total: number // 10
  exercises: TAAttemptItem[]
}

const PER_EXERCISE_SECONDS = 120
const TOTAL_EXERCISES = 5

export default function useChallengeRunTextAnswer(challengeId: string) {
  const { setLoadingOverlay, setErrorOverlay } = useOverlay()
  const meId = useAuthStore((s) => s.user?.id)

  const [challenge, setChallenge] = React.useState<Challenge | null>(null)
  const [topicId, setTopicId] = React.useState<string | null>(null)
  const [exercises, setExercises] = React.useState<TAExercise[]>([])
  const [step, setStep] = React.useState(0)
  const [timer, setTimer] = React.useState<number | null>(PER_EXERCISE_SECONDS)
  const [answer, setAnswer] = React.useState('')
  const [evaluated, setEvaluated] = React.useState<null | {
    score: number
    feedback?: string
  }>(null)
  const [attemptItems, setAttemptItems] = React.useState<TAAttemptItem[]>([])
  const [loading, setLoading] = React.useState(true)
  // finished navigation is handled by navigating to ChallengeFinishedScoreScreen
  const [totalExercises, setTotalExercises] =
    React.useState<number>(TOTAL_EXERCISES)

  const canSubmit = answer.trim().length >= 30 && evaluated == null

  React.useEffect(() => {
    let active = true
    ;(async () => {
      try {
        setLoadingOverlay(true, 'ChallengeRunTextAnswerScreen')
        const all = await challengesRepository.list()
        const ch = all.find((c) => c.id === challengeId) || null
        if (!active) return
        if (!ch) throw new Error('Challenge not found')
        setChallenge(ch)

        const summary = await summariesRepository.getById(ch.summaryId)
        if (!active) return
        if (!summary) throw new Error('Summary not found')

        if (active) setTopicId(summary.topicId)

        // read totals and per-exercise seconds from challenge payload
        const tExercisesRaw = Number(
          ch.payload?.totalExercises ?? TOTAL_EXERCISES,
        )
        const tExercises =
          Number.isFinite(tExercisesRaw) && tExercisesRaw > 0
            ? tExercisesRaw
            : TOTAL_EXERCISES
        setTotalExercises(tExercises)
        const perSecRaw = Number(
          ch.payload?.perExerciseSeconds ?? PER_EXERCISE_SECONDS,
        )
        setTimer(perSecRaw > 0 ? perSecRaw : null)

        // Use pre-generated exercises if available (stored at challenge creation time)
        const preGenExercises: TAExercise[] | undefined =
          Array.isArray(ch.payload?.exercises) && ch.payload.exercises.length > 0
            ? (ch.payload.exercises as TAExercise[])
            : undefined

        const setQ = preGenExercises ?? await generateOpenQuestionSet(summary.content, tExercises)
        if (!active) return
        setExercises(setQ)
        setLoading(false)
      } catch (e) {
        console.error(e)
        setErrorOverlay(true, 'Não foi possível iniciar Resposta em Texto.')
        setLoading(false)
      } finally {
        setLoadingOverlay(false)
      }
    })()
    return () => {
      active = false
    }
  }, [challengeId, setLoadingOverlay, setErrorOverlay])

  // Track session
  useTrackTopicSession(topicId, 'challenge', challengeId)

  // Timer per exercise
  React.useEffect(() => {
    if (loading) return
    if (timer == null) return
    if (timer <= 0) return
    const id = setTimeout(() => setTimer((t) => (t === null ? t : t - 1)), 1000)
    return () => clearTimeout(id)
  }, [timer, loading])

  // On timeout, autograde with 0 if not evaluated
  React.useEffect(() => {
    if (loading) return
    if (timer == null) return
    if (timer <= 0 && evaluated == null) {
      const current = exercises[step]
      if (!current) return
      const item: TAAttemptItem = {
        question: current.question,
        correctAnswer: current.correctAnswer,
        userAnswer: answer.trim(),
        score: 0,
        feedback: 'Tempo esgotado.',
      }
      setAttemptItems((prev) => [...prev, item])
      setEvaluated({ score: 0, feedback: 'Tempo esgotado.' })
    }
  }, [timer, evaluated, loading, answer, exercises, step])

  const doSubmit = async () => {
    if (!challenge || !exercises[step] || !canSubmit) return
    try {
      setLoadingOverlay(true, 'ChallengeRunTextAnswerScreen')
      const ex = exercises[step]
      const evalRes = await evaluateOpenAnswer(ex, answer)
      const item: TAAttemptItem = {
        ...ex,
        userAnswer: answer.trim(),
        score: evalRes.score,
        feedback: evalRes.feedback,
      }
      setAttemptItems((prev) => [...prev, item])
      setEvaluated({ score: evalRes.score, feedback: evalRes.feedback })
    } catch (e) {
      console.error(e)
      setErrorOverlay(true, 'Falha ao avaliar a resposta.')
    } finally {
      setLoadingOverlay(false)
    }
  }

  const onContinue = async () => {
    if (!challenge || evaluated == null) return
    const next = step + 1
    if (next < totalExercises) {
      setStep(next)
      setAnswer('')
      setEvaluated(null)
      // reset timer according to challenge payload or global default
      const per = Number(
        challenge?.payload?.perExerciseSeconds ?? PER_EXERCISE_SECONDS,
      )
      setTimer(per > 0 ? per : null)
      return
    }
    // finish
    const sum = attemptItems.reduce((acc, it) => acc + it.score, 0)
    const avg = attemptItems.length ? sum / attemptItems.length : 0
    const final = Math.round(avg * 10) / 10 // 1 decimal between 0 and 10
    const now = Date.now()
    const attempt: TAAttempt & { userId?: string } = {
      at: now,
      score: final,
      total: 10,
      userId: meId || undefined,
      exercises: attemptItems,
    }
    const updated: Challenge = {
      ...challenge,
      updatedAt: now,
      payload: {
        ...challenge.payload,
        attempts: [...(challenge.payload?.attempts ?? []), attempt],
        lastAttempt: { score: final, total: 10, at: now },
      },
    }
    await challengesRepository.upsert(updated, '/sync/challenge', {
      summaryId: challenge.summaryId,
    })
    setChallenge(updated)
    // navigate to finished screen with score
    navigatorManager.goToChallengeFinishedScore({ score: final, total: 10, summaryId: challenge.summaryId })
    try {
      setLoadingOverlay(true, 'Sincronizando…')
      const { immediateCollaborativeFlush } = await import(
        '@/services/firebase/immediateFlush'
      )
      await immediateCollaborativeFlush(1500)
    } catch {
    } finally {
      setLoadingOverlay(false)
    }
  }

  const forceFinish = async () => {
    if (!challenge) return
    try {
      setLoadingOverlay(true, 'ChallengeRunTextAnswerScreen')
      const items = [...attemptItems]
      if (evaluated) {
        // nothing
      } else {
        const cur = exercises[step]
        if (cur) {
          items.push({
            ...cur,
            userAnswer: answer.trim(),
            score: 0,
            feedback: 'Abandonado.',
          })
        }
      }
      for (let i = items.length; i < totalExercises; i++) {
        const ex = exercises[i]
        items.push({
          question: ex?.question || '—',
          correctAnswer: ex?.correctAnswer || '',
          userAnswer: '',
          score: 0,
        })
      }
      const sum = items.reduce((acc, it) => acc + it.score, 0)
      const avg = items.length ? sum / items.length : 0
      const final = Math.round(avg * 10) / 10
      const now = Date.now()
      const attempt: TAAttempt & { userId?: string } = {
        at: now,
        score: final,
        total: 10,
        userId: meId || undefined,
        exercises: items,
      }
      const updated: Challenge = {
        ...challenge,
        updatedAt: now,
        payload: {
          ...challenge.payload,
          attempts: [...(challenge.payload?.attempts ?? []), attempt],
          lastAttempt: { score: final, total: 10, at: now },
        },
      }
      await challengesRepository.upsert(updated, '/sync/challenge', {
        summaryId: challenge.summaryId,
      })
      setChallenge(updated)
      // navigate to finished screen with score
      navigatorManager.goToChallengeFinishedScore({ score: final, total: 10, summaryId: challenge.summaryId })
      try {
        setLoadingOverlay(true, 'Sincronizando…')
        const { immediateCollaborativeFlush } = await import(
          '@/services/firebase/immediateFlush'
        )
        await immediateCollaborativeFlush(1500)
      } catch {}
    } catch (e) {
      console.error(e)
    } finally {
      setLoadingOverlay(false)
    }
  }

  const lastAttempt = (challenge?.payload?.attempts || []).at(-1)

  return {
    challenge,
    topicId,
    exercises,
    step,
    setStep,
    timer,
    answer,
    setAnswer,
    evaluated,
    attemptItems,
    loading,
    canSubmit,
    totalExercises,
    lastAttempt,
    doSubmit,
    onContinue,
    forceFinish,
  }
}

// ---------- AI helpers ----------
export async function generateOpenQuestionSet(summary: string, total: number) {
  const content = await callAI(
    [
      { role: 'system', content: TEXT_EXERCISES_SYSTEM },
      { role: 'user', content: buildTextExercisesPrompt(summary, total) },
    ],
    0.4,
  )
  const json = toJSONSafe(content)
  const arr = Array.isArray(json?.exercises) ? json.exercises : []
  const parsed: TAExercise[] = arr
    .map((x: any) => ({
      question: String(x?.question || '').trim(),
      correctAnswer: String(x?.correctAnswer || '').trim(),
    }))
    .filter((x: TAExercise) => x.question && x.correctAnswer)
    .slice(0, total)
  if (parsed.length === 0) throw new Error('Text AI returned no valid exercises')
  return parsed
}

async function evaluateOpenAnswer(ex: TAExercise, userAnswer: string) {
  try {
    const content = await callAI(
      [
        { role: 'system', content: TEXT_EVALUATION_PROMPT },
        {
          role: 'user',
          content: [
            'Pergunta:',
            ex.question,
            'Resposta correta de referência:',
            ex.correctAnswer,
            'Resposta do aluno:',
            userAnswer,
            'Critérios: precisão, coerência, completude. Apenas JSON.',
          ].join('\n'),
        },
      ],
      0.2,
    )
    const json = toJSONSafe(content)
    const scoreNum = Math.max(0, Math.min(10, Number(json?.score ?? 0)))
    const feedback =
      typeof json?.feedback === 'string' ? json.feedback : undefined
    return { score: Math.round(scoreNum), feedback }
  } catch (e) {
    console.error(e)
    return { score: 0, feedback: 'Falha ao avaliar.' }
  }
}


