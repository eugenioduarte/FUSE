import { challengesRepository } from '@/services/repositories/challenges.repository'
import { summariesRepository } from '@/services/repositories/summaries.repository'
import { topicsRepository } from '@/services/repositories/topics.repository'
import { startSession, stopSessionByKey } from '@/services/usage/usageTracker'
import { useAuthStore } from '@/store/useAuthStore'
import { useOverlay } from '@/store/useOverlay'
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

export const useChallengeRunQuiz = (challengeId: string, mock = false) => {
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
        setLoadingOverlay(true)
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

        const total = Number(
          ch.payload?.totalQuestions ||
            Math.floor(Math.random() * (10 - 5 + 1)) + 5,
        )
        const prompt = buildQuizPrompt(summary.content, total)
        // If mock flag is true, use the local mockQuiz instead of calling the AI
        const quiz = mock ? mockQuiz() : await generateQuiz(prompt)
        if (!active) return
        const shuffled = quiz.questions.map((q) => ({
          ...q,
          options: shuffleArray(q.options),
        }))
        setQuestions(shuffled)

        const init: Record<number, number | null> = {}
        for (let i = 0; i < quiz.questions.length; i++) init[i] = null
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
  }, [challengeId, setErrorOverlay, setLoadingOverlay, mock])

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
    await challengesRepository.upsert(updated, '/sync/challenge', {
      summaryId: challenge.summaryId,
    })
    setChallenge(updated)
    setFinished({ score, total: questions.length })
    try {
      setLoadingOverlay(true, 'Sincronizando…')
      const { immediateCollaborativeFlush } = await import(
        '@/services/firebase/immediateFlush'
      )
      await immediateCollaborativeFlush(1500)
    } catch {}
    setLoadingOverlay(false)
  }

  const forceFinish = async () => {
    if (!challenge) return
    try {
      setLoadingOverlay(true)
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
      await challengesRepository.upsert(updated, '/sync/challenge', {
        summaryId: challenge.summaryId,
      })
      setChallenge(updated)
      setFinished({ score, total: questions.length })
      try {
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

function buildQuizPrompt(summaryText: string, total: number) {
  return [
    'Você é um assistente que cria quizzes de múltipla escolha a partir de um texto de estudo.',
    'Responda SOMENTE em JSON com a chave: questions (array).',
    'Cada item de questions deve ter:',
    '- question: string;',
    '- options: array de 5 itens, cada item: { text: string; correct: boolean; explanation: string }',
    `Gere exatamente ${total} perguntas.`,
    'O texto de estudo é o seguinte:',
    '"""',
    summaryText,
    '"""',
  ].join('\n')
}

async function generateQuiz(prompt: string): Promise<AIQuizResponse> {
  try {
    const body = JSON.stringify({
      model: process.env.EXPO_PUBLIC_OPENAI_MODEL || 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content:
            'Você cria quizzes. Responda SOMENTE em JSON com { questions: Array } conforme especificado.',
        },
        { role: 'user', content: prompt },
      ],
      temperature: 0.3,
    })
    const base =
      process.env.EXPO_PUBLIC_OPENAI_BASE_URL || 'https://api.openai.com/v1'
    const key = process.env.EXPO_PUBLIC_OPENAI_API_KEY
    if (!key) return mockQuiz()
    const res = await fetch(`${base}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${key}`,
      },
      body,
    })
    if (!res.ok) return mockQuiz()
    const data = await res.json()
    const content = data?.choices?.[0]?.message?.content?.trim?.() ?? ''
    const json = toJSONSafe(content)
    if (!json?.questions || !Array.isArray(json.questions)) return mockQuiz()
    const parsed: AIQuizResponse = {
      questions: json.questions
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
        .filter((q: AIQuizQuestion) => q.question && q.options.length === 5),
    }
    if (parsed.questions.length === 0) return mockQuiz()
    return parsed
  } catch (e) {
    console.error(e)
    return mockQuiz()
  }
}

function shuffleArray<T>(arr: T[]): T[] {
  const a = arr.slice()
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
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

function mockQuiz(): AIQuizResponse {
  return {
    questions: [
      {
        question: 'Qual é o objetivo principal do resumo?',
        options: [
          {
            text: 'Introduzir o tema',
            correct: true,
            explanation: 'O resumo apresenta os pontos principais do tema.',
          },
          {
            text: 'Detalhar todos os tópicos',
            correct: false,
            explanation: 'O resumo não entra em todos os detalhes.',
          },
          {
            text: 'Apresentar dados brutos',
            correct: false,
            explanation:
              'Dados brutos geralmente aparecem em anexos, não no resumo.',
          },
          {
            text: 'Fornecer código-fonte',
            correct: false,
            explanation: 'Código-fonte não é o foco do resumo.',
          },
          {
            text: 'Descrever autores',
            correct: false,
            explanation: 'A descrição de autores não é o objetivo principal.',
          },
        ],
      },
      {
        question: 'Como o conteúdo está estruturado?',
        options: [
          {
            text: 'Em seções lógicas',
            correct: true,
            explanation:
              'O conteúdo é dividido em seções para facilitar a compreensão.',
          },
          {
            text: 'De forma aleatória',
            correct: false,
            explanation: 'A estrutura não é aleatória.',
          },
          {
            text: 'Sem títulos',
            correct: false,
            explanation: 'Há títulos para cada seção.',
          },
          {
            text: 'Apenas com tabelas',
            correct: false,
            explanation: 'Tabelas não são a única forma de apresentação.',
          },
          {
            text: 'Somente imagens',
            correct: false,
            explanation: 'Imagens complementam, mas não são o único recurso.',
          },
        ],
      },
    ],
  }
}

export default useChallengeRunQuiz
