import {
  RootStackParamList,
  navigatorManager,
} from '@/navigation/navigatorManager'
import { challengesRepository } from '@/services/repositories/challenges.repository'
import { summariesRepository } from '@/services/repositories/summaries.repository'
import { topicsRepository } from '@/services/repositories/topics.repository'
import { startSession, stopSessionByKey } from '@/services/usage/usageTracker'
import { useAuthStore } from '@/store/useAuthStore'
import { useOverlay } from '@/store/useOverlay'
import { Challenge } from '@/types/domain'
import { RouteProp, useFocusEffect, useRoute } from '@react-navigation/native'
import React, { useEffect, useRef, useState } from 'react'
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  Easing,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'

// Types for AI quiz
type AIQuizQuestion = {
  question: string
  options: { text: string; correct: boolean; explanation: string }[]
}

type AIQuizResponse = {
  questions: AIQuizQuestion[]
}

// Persisted attempt types (stored inside challenge.payload)
type AttemptQuestion = AIQuizQuestion & { choice: number | null }
type Attempt = {
  at: number
  score: number
  total: number
  questions: AttemptQuestion[]
}

const StepDot = ({ active }: { active: boolean }) => (
  <View
    style={{
      width: 10,
      height: 10,
      borderRadius: 5,
      marginHorizontal: 4,
      backgroundColor: active ? '#60a5fa' : '#374151',
    }}
  />
)

const ChallengeRunQuizScreen: React.FC = () => {
  const route =
    useRoute<RouteProp<RootStackParamList, 'ChallengeRunQuizScreen'>>()
  const challengeId = route.params?.challengeId!
  const { setLoadingOverlay, setErrorOverlay } = useOverlay()

  const [challenge, setChallenge] = useState<Challenge | null>(null)
  const [questions, setQuestions] = useState<AIQuizQuestion[]>([])
  const [loading, setLoading] = useState(true)
  const [topicColor, setTopicColor] = useState<string | undefined>()
  const [step, setStep] = useState(0)
  const [finished, setFinished] = useState<null | {
    score: number
    total: number
  }>(null)
  const meId = useAuthStore((s) => s.user?.id)

  // Attempt state
  const [firstChoiceByIndex, setFirstChoiceByIndex] = useState<
    Record<number, number | null>
  >({})
  const [currentChoice, setCurrentChoice] = useState<number | null>(null)

  // Slide animation
  const screenWidth = Dimensions.get('window').width
  const slideX = useRef(new Animated.Value(0)).current
  const doSlide = (to: number) => {
    Animated.timing(slideX, {
      toValue: -to * screenWidth,
      duration: 300,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start()
  }

  useEffect(() => {
    let active = true
    ;(async () => {
      try {
        setLoadingOverlay(true)
        // get challenge details
        const all = await challengesRepository.list()
        const ch = all.find((c) => c.id === challengeId) || null
        if (!active) return
        if (!ch) throw new Error('Challenge not found')
        setChallenge(ch)

        // get summary content
        const summary = await summariesRepository.getById(ch.summaryId)
        if (!active) return
        if (!summary) throw new Error('Summary not found for this challenge')
        // Resolve topic color for theming
        try {
          const topic = await topicsRepository.getById(summary.topicId)
          if (active) setTopicColor(topic?.backgroundColor || undefined)
        } catch {}

        // total questions from payload or fallback (random 5-10)
        const total = Number(
          ch.payload?.totalQuestions ||
            Math.floor(Math.random() * (10 - 5 + 1)) + 5,
        )
        const prompt = buildQuizPrompt(summary.content, total)
        const quiz = await generateQuiz(prompt)
        if (!active) return
        // Shuffle options inside each question so the correct answer isn't always first
        const shuffled = quiz.questions.map((q) => ({
          ...q,
          options: shuffleArray(q.options),
        }))
        setQuestions(shuffled)

        // init first choice mapping
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
  }, [challengeId, setErrorOverlay, setLoadingOverlay])

  // Track study session while running this challenge (start on focus, stop on blur)
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
  const canContinue = currentChoice !== null

  const onSelect = (optionIdx: number) => {
    setCurrentChoice(optionIdx)
    setFirstChoiceByIndex((prev) => ({
      ...prev,
      [step]: prev[step] ?? optionIdx, // score counts only first selection
    }))
  }

  const onContinue = async () => {
    if (!canContinue || !challenge) return
    const nextStep = step + 1
    if (nextStep < questions.length) {
      setStep(nextStep)
      setCurrentChoice(null)
      doSlide(nextStep)
      return
    }
    // finish
    const score = computeScore(questions, firstChoiceByIndex)
    const now = Date.now()
    // Build attempt with immutable snapshot for review later
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
    // Update UI immediately, then run a capped-time flush to avoid hanging overlay
    setChallenge(updated)
    setFinished({ score, total: questions.length })
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

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: topicColor || '#0b0b0c',
        }}
      >
        <ActivityIndicator />
      </View>
    )
  }

  if (!challenge || questions.length === 0) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: topicColor || '#0b0b0c',
          padding: 16,
        }}
      >
        <Text style={{ color: topicColor ? '#111' : 'white' }}>
          Quiz indisponível.
        </Text>
      </View>
    )
  }

  return (
    <View style={{ flex: 1, backgroundColor: topicColor || '#0b0b0c' }}>
      {/* Header with progress */}
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
        <Text
          style={{
            color: topicColor ? '#111' : 'white',
            fontSize: 18,
            fontWeight: '700',
          }}
        >
          {challenge.title}
        </Text>
        <View style={{ flexDirection: 'row' }}>
          {questions.map((q, i) => (
            <StepDot key={`${i}-${q.question}`} active={i === step} />
          ))}
        </View>
      </View>

      {finished ? (
        <View
          style={{ flex: 1, paddingHorizontal: 16, justifyContent: 'center' }}
        >
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
            Você marcou {finished.score} de {finished.total}
          </Text>
        </View>
      ) : (
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingBottom: 24 }}
        >
          <View style={{ width: '100%', overflow: 'hidden' }}>
            <Animated.View
              style={{
                width: screenWidth * questions.length,
                flexDirection: 'row',
                transform: [{ translateX: slideX }],
              }}
            >
              {questions.map((q, idx) => (
                <View
                  key={`${idx}-${q.question}`}
                  style={{ width: screenWidth, paddingHorizontal: 16 }}
                >
                  <Text
                    style={{
                      color: 'white',
                      fontWeight: '700',
                      marginBottom: 12,
                    }}
                  >{`Pergunta ${idx + 1}/${questions.length}`}</Text>
                  <Text style={{ color: '#e5e7eb', marginBottom: 12 }}>
                    {q.question}
                  </Text>
                  <View style={{ gap: 10 }}>
                    {q.options.map((opt, oi) => {
                      const selected = currentChoice === oi
                      const isCorrect = opt.correct
                      const bg = selected
                        ? isCorrect
                          ? '#14532d'
                          : '#7f1d1d'
                        : '#111214'
                      const border = selected
                        ? isCorrect
                          ? '#22c55e'
                          : '#ef4444'
                        : '#2B2C30'
                      return (
                        <View key={`${idx}-${oi}-${opt.text}`}>
                          <TouchableOpacity
                            onPress={() => onSelect(oi)}
                            style={{
                              backgroundColor: bg,
                              borderColor: border,
                              borderWidth: 1,
                              borderRadius: 10,
                              padding: 12,
                            }}
                          >
                            <Text style={{ color: 'white' }}>{opt.text}</Text>
                          </TouchableOpacity>
                          {selected && (
                            <Text style={{ color: '#9ca3af', marginTop: 6 }}>
                              {opt.explanation}
                            </Text>
                          )}
                        </View>
                      )
                    })}
                  </View>
                </View>
              ))}
            </Animated.View>
          </View>
        </ScrollView>
      )}

      <View style={{ paddingHorizontal: 16, paddingBottom: 16 }}>
        {finished ? (
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
        ) : (
          <TouchableOpacity
            disabled={!canContinue}
            onPress={onContinue}
            style={{
              backgroundColor: canContinue ? '#3b82f6' : '#1f2937',
              borderRadius: 10,
              paddingVertical: 14,
              alignItems: 'center',
            }}
          >
            <Text style={{ color: 'white', fontWeight: '700' }}>
              {isLast ? 'Finalizar' : 'Continuar'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  )
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

// Fisher–Yates shuffle
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
    // Handle cases where the model wraps JSON in code fences
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

export default ChallengeRunQuizScreen
