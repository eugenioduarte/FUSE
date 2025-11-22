import useTrackTopicSession from '@/hooks/useTrackTopicSession'
import {
  RootStackParamList,
  navigatorManager,
} from '@/navigation/navigatorManager'
import {
  TEXT_EVALUATION_PROMPT,
  TEXT_EXERCISES_SYSTEM,
  buildTextExercisesPrompt,
} from '@/services/prompts'
import { challengesRepository } from '@/services/repositories/challenges.repository'
import { summariesRepository } from '@/services/repositories/summaries.repository'
import { useAuthStore } from '@/store/useAuthStore'
import { useOverlay } from '@/store/useOverlay'
import { Challenge } from '@/types/domain'
import { RouteProp, useRoute } from '@react-navigation/native'
import React, { useEffect, useState } from 'react'
import {
  ActivityIndicator,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'
import ChallengeRunClose from './components/ChallengeRunClose'

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

const ChallengeRunTextAnswerScreen: React.FC = () => {
  const route =
    useRoute<RouteProp<RootStackParamList, 'ChallengeRunTextAnswerScreen'>>()
  const challengeId = route.params?.challengeId!
  const { setLoadingOverlay, setErrorOverlay } = useOverlay()

  const [challenge, setChallenge] = useState<Challenge | null>(null)
  const [topicId, setTopicId] = useState<string | null>(null)
  const [exercises, setExercises] = useState<TAExercise[]>([])
  const [step, setStep] = useState(0)
  const [timer, setTimer] = useState(PER_EXERCISE_SECONDS)
  const [answer, setAnswer] = useState('')
  const [evaluated, setEvaluated] = useState<null | {
    score: number
    feedback?: string
  }>(null)
  const [attemptItems, setAttemptItems] = useState<TAAttemptItem[]>([])
  const [loading, setLoading] = useState(true)
  const [finished, setFinished] = useState<null | { score: number }>(null)
  const meId = useAuthStore((s) => s.user?.id)

  const canSubmit = answer.trim().length >= 30 && evaluated == null
  // continue habilita apenas após avaliação

  // Load challenge + summary + generate questions
  useEffect(() => {
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

        const setQ = await generateOpenQuestionSet(
          summary.content,
          TOTAL_EXERCISES,
        )
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

  // Track session for this challenge run
  useTrackTopicSession(topicId, 'challenge', challengeId)

  // Timer per exercise
  useEffect(() => {
    if (loading || finished) return
    if (timer <= 0) return
    const id = setTimeout(() => setTimer((t) => t - 1), 1000)
    return () => clearTimeout(id)
  }, [timer, loading, finished])

  // On timeout, autograde with 0 if not evaluated
  useEffect(() => {
    if (loading || finished) return
    if (timer <= 0 && evaluated == null) {
      // Time's up: grade 0 and show correct answer
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
  }, [timer, evaluated, loading, finished, answer, exercises, step])

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
    if (next < TOTAL_EXERCISES) {
      setStep(next)
      setAnswer('')
      setEvaluated(null)
      setTimer(PER_EXERCISE_SECONDS)
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
    // Update UI immediately, then run a capped-time flush
    setChallenge(updated)
    setFinished({ score: final })
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
      // Build final attempt: include evaluated items, current (if evaluated) or mark as 0, and remaining as 0
      const items = [...attemptItems]
      // current step may have evaluation
      if (evaluated) {
        // already added to attemptItems when evaluated; nothing to do
      } else {
        // add current as zero
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
      // fill remaining with zeros
      for (let i = items.length; i < TOTAL_EXERCISES; i++) {
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
      setFinished({ score: final })
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

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#0b0b0c',
        }}
      >
        <ActivityIndicator />
      </View>
    )
  }

  if (!challenge || exercises.length === 0) {
    return (
      <View style={{ flex: 1, backgroundColor: '#0b0b0c', padding: 16 }}>
        <Text style={{ color: 'white' }}>Resposta em Texto indisponível.</Text>
      </View>
    )
  }

  const current = exercises[step]

  return (
    <View style={{ flex: 1, backgroundColor: '#0b0b0c' }}>
      <ChallengeRunClose onConfirm={forceFinish} />
      {/* Header */}
      <View
        style={{
          paddingHorizontal: 16,
          paddingTop: 16,
          paddingBottom: 8,
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Text style={{ color: 'white', fontSize: 18, fontWeight: '700' }}>
          {challenge.title || 'Resposta em Texto'}
        </Text>
        <Text style={{ color: '#e5e7eb' }}>{Math.max(0, timer)}s</Text>
      </View>

      {finished ? (
        <View style={{ flex: 1, padding: 16, justifyContent: 'center' }}>
          <Text
            style={{
              color: 'white',
              fontSize: 22,
              fontWeight: '800',
              textAlign: 'center',
              marginBottom: 12,
            }}
          >
            Resultado
          </Text>
          <Text style={{ color: '#e5e7eb', textAlign: 'center' }}>
            Pontuação final: {Number(finished.score).toFixed(1)}/10
          </Text>
          <View style={{ height: 16 }} />
          <TouchableOpacity
            onPress={() =>
              navigatorManager.goToChallengesList({
                summaryId: challenge.summaryId,
              })
            }
            style={{
              backgroundColor: '#10b981',
              borderRadius: 10,
              paddingVertical: 14,
              alignItems: 'center',
            }}
          >
            <Text style={{ color: 'white', fontWeight: '700' }}>
              Voltar para a lista
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={{ flex: 1, padding: 16 }}>
          <Text
            style={{ color: '#9ca3af', marginBottom: 6 }}
          >{`Exercício ${step + 1}/${TOTAL_EXERCISES}`}</Text>
          <Text style={{ color: 'white', fontWeight: '700', marginBottom: 10 }}>
            {current.question}
          </Text>

          <TextInput
            editable={evaluated == null}
            multiline
            textAlignVertical="top"
            placeholder="Escreva sua resposta..."
            placeholderTextColor="#6b7280"
            style={{
              backgroundColor: '#111214',
              borderColor: '#2B2C30',
              borderWidth: 1,
              borderRadius: 10,
              padding: 12,
              minHeight: 140,
              color: 'white',
            }}
            value={answer}
            onChangeText={setAnswer}
          />
          <Text style={{ color: '#9ca3af', marginTop: 6 }}>
            {answer.trim().length} / mínimo 30 caracteres
          </Text>

          {/* After evaluation show correct answer and feedback */}
          {evaluated && (
            <View
              style={{
                marginTop: 12,
                backgroundColor: '#0f172a',
                borderColor: '#1f2937',
                borderWidth: 1,
                borderRadius: 10,
                padding: 12,
              }}
            >
              <Text
                style={{ color: '#e5e7eb', fontWeight: '700', marginBottom: 6 }}
              >
                Resposta correta
              </Text>
              <Text style={{ color: 'white', marginBottom: 10 }}>
                {current.correctAnswer}
              </Text>
              <Text style={{ color: '#9ca3af' }}>
                Nota: {evaluated.score}/10
              </Text>
              {!!evaluated.feedback && (
                <Text style={{ color: '#9ca3af', marginTop: 6 }}>
                  {evaluated.feedback}
                </Text>
              )}
            </View>
          )}
        </View>
      )}

      {/* Footer */}
      {!finished && (
        <View style={{ padding: 16 }}>
          {evaluated ? (
            <TouchableOpacity
              onPress={onContinue}
              style={{
                backgroundColor: '#3b82f6',
                borderRadius: 10,
                paddingVertical: 14,
                alignItems: 'center',
              }}
            >
              <Text style={{ color: 'white', fontWeight: '700' }}>
                Continuar
              </Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              disabled={!canSubmit}
              onPress={doSubmit}
              style={{
                backgroundColor: canSubmit ? '#10b981' : '#1f2937',
                borderRadius: 10,
                paddingVertical: 14,
                alignItems: 'center',
              }}
            >
              <Text style={{ color: 'white', fontWeight: '700' }}>
                Enviar resposta
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  )
}

export default ChallengeRunTextAnswerScreen

// ---------- AI helpers ----------
async function generateOpenQuestionSet(
  summary: string,
  total: number,
): Promise<TAExercise[]> {
  try {
    const body = JSON.stringify({
      model: process.env.EXPO_PUBLIC_OPENAI_MODEL || 'gpt-4o-mini',
      messages: [
        { role: 'system', content: TEXT_EXERCISES_SYSTEM },
        { role: 'user', content: buildTextExercisesPrompt(summary, total) },
      ],
      temperature: 0.4,
    })
    const base =
      process.env.EXPO_PUBLIC_OPENAI_BASE_URL || 'https://api.openai.com/v1'
    const key = process.env.EXPO_PUBLIC_OPENAI_API_KEY
    if (!key) return mockOpenQuestions(total)
    const res = await fetch(`${base}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${key}`,
      },
      body,
    })
    if (!res.ok) return mockOpenQuestions(total)
    const data = await res.json()
    const content = data?.choices?.[0]?.message?.content?.trim?.() ?? ''
    const json = toJSONSafe(content)
    const arr = Array.isArray(json?.exercises) ? json.exercises : []
    const parsed: TAExercise[] = arr
      .map((x: any) => ({
        question: String(x?.question || '').trim(),
        correctAnswer: String(x?.correctAnswer || '').trim(),
      }))
      .filter((x: TAExercise) => x.question && x.correctAnswer)
      .slice(0, total)
    return parsed.length === total ? parsed : mockOpenQuestions(total)
  } catch (e) {
    console.error(e)
    return mockOpenQuestions(total)
  }
}

async function evaluateOpenAnswer(
  ex: TAExercise,
  userAnswer: string,
): Promise<TAEvaluation> {
  try {
    const body = JSON.stringify({
      model: process.env.EXPO_PUBLIC_OPENAI_MODEL || 'gpt-4o-mini',
      messages: [
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
      temperature: 0.2,
    })
    const base =
      process.env.EXPO_PUBLIC_OPENAI_BASE_URL || 'https://api.openai.com/v1'
    const key = process.env.EXPO_PUBLIC_OPENAI_API_KEY
    if (!key) return mockEvaluate(ex, userAnswer)
    const res = await fetch(`${base}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${key}`,
      },
      body,
    })
    if (!res.ok) return mockEvaluate(ex, userAnswer)
    const data = await res.json()
    const content = data?.choices?.[0]?.message?.content?.trim?.() ?? ''
    const json = toJSONSafe(content)
    const scoreNum = Math.max(0, Math.min(10, Number(json?.score ?? 0)))
    const feedback =
      typeof json?.feedback === 'string' ? json.feedback : undefined
    return { score: Math.round(scoreNum), feedback }
  } catch (e) {
    console.error(e)
    return mockEvaluate(ex, userAnswer)
  }
}

function toJSONSafe(text: string): any {
  try {
    const cleaned = text
      .replace(/^```(json)?/i, '')
      .replace(/```$/i, '')
      .trim()
    return JSON.parse(cleaned)
  } catch {
    return null
  }
}

function mockOpenQuestions(total: number): TAExercise[] {
  const base: TAExercise[] = [
    {
      question: 'Explique o objetivo principal do texto estudado.',
      correctAnswer:
        'O objetivo principal é apresentar e sintetizar os pontos-chave do tema.',
    },
    {
      question: 'Descreva dois conceitos fundamentais abordados.',
      correctAnswer:
        'Dois conceitos essenciais são a contextualização e os tópicos-chave.',
    },
    {
      question: 'Qual o impacto prático do conteúdo apresentado?',
      correctAnswer:
        'O impacto prático é orientar decisões e facilitar o entendimento aplicado.',
    },
    {
      question: 'Compare duas ideias principais e suas diferenças.',
      correctAnswer:
        'As ideias diferem em escopo e foco: uma é introdutória e a outra é aplicada.',
    },
    {
      question: 'Resuma a conclusão do material.',
      correctAnswer:
        'A conclusão reforça os aprendizados e sugere próximos passos.',
    },
  ]
  return base.slice(0, total)
}

function mockEvaluate(_ex: TAExercise, userAnswer: string): TAEvaluation {
  const len = userAnswer.trim().length
  if (len < 30) return { score: 0, feedback: 'Resposta muito curta.' }
  if (len < 60)
    return { score: 6, feedback: 'Boa tentativa, mas pode detalhar mais.' }
  return { score: 8, feedback: 'Resposta coerente e adequada.' }
}
