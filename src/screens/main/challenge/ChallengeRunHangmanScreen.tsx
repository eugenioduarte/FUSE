import useTrackTopicSession from '@/hooks/useTrackTopicSession'
import { RouteProp, useRoute } from '@react-navigation/native'
import React, { useEffect, useMemo, useRef, useState } from 'react'
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
import {
  navigatorManager,
  RootStackParamList,
} from '../../../navigation/navigatorManager'
import { challengesRepository } from '../../../services/repositories/challenges.repository'
import { summariesRepository } from '../../../services/repositories/summaries.repository'
import { topicsRepository } from '../../../services/repositories/topics.repository'
import { useAuthStore } from '../../../store/useAuthStore'
import { useOverlay } from '../../../store/useOverlay'
import { Challenge } from '../../../types/domain'
import ChallengeRunClose from './components/ChallengeRunClose'

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')

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

type Round = {
  question: string
  word: string
}

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

const ChallengeRunHangmanScreen: React.FC = () => {
  const route =
    useRoute<RouteProp<RootStackParamList, 'ChallengeRunHangmanScreen'>>()
  const challengeId = route.params?.challengeId!
  const { setLoadingOverlay, setErrorOverlay } = useOverlay()

  const [challenge, setChallenge] = useState<Challenge | null>(null)
  const [topicId, setTopicId] = useState<string | null>(null)
  const [rounds, setRounds] = useState<Round[]>([])
  const [loading, setLoading] = useState(true)
  const [topicColor, setTopicColor] = useState<string | undefined>()

  // Per-round state
  const [step, setStep] = useState(0)
  const [guesses, setGuesses] = useState<string[]>([])
  const [wrongs, setWrongs] = useState(0)
  const [score, setScore] = useState(0)
  const maxWrongs = 3

  // Finish state
  const [finished, setFinished] = useState<null | {
    score: number
    total: number
  }>(null)
  const meId = useAuthStore((s) => s.user?.id)

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

  const currentRound = rounds[step]
  const letters = useMemo(
    () => new Set((guesses || []).map((g) => g)),
    [guesses],
  )
  const revealed = useMemo(() => {
    const w = currentRound?.word || ''
    return w
      .split('')
      .map((ch) => (letters.has(ch.toUpperCase()) ? ch.toUpperCase() : '_'))
      .join(' ')
  }, [currentRound, letters])
  const isSolved = useMemo(() => {
    const w = currentRound?.word || ''
    return w
      .toUpperCase()
      .split('')
      .every((ch) => letters.has(ch))
  }, [currentRound, letters])
  const isFailed = wrongs >= maxWrongs
  const canContinue = isSolved || isFailed
  const isLast = step >= Math.max(0, rounds.length - 1)

  useEffect(() => {
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
        if (active) setTopicId(summary.topicId)

        // Resolve topic color for theming
        try {
          const topic = await topicsRepository.getById(summary.topicId)
          if (active) setTopicColor(topic?.backgroundColor || undefined)
        } catch {}

        // Build rounds (question + answer) from summary content
        const totalRounds = Number(
          ch.payload?.totalRounds ||
            Math.floor(Math.random() * (5 - 2 + 1)) + 2,
        )
        let roundsGen = await generateHangmanRounds(
          buildHangmanPrompt(summary.content, totalRounds),
        )
        // sanitize and clamp
        let rounds: Round[] = roundsGen
          .map((r) => ({
            question: String(r.question || '').trim(),
            word: String(r.answer || '')
              .toUpperCase()
              .split(/[^A-ZÀ-Ý]/g)
              .join('')
              .slice(0, 10),
          }))
          .filter((r) => r.question && r.word.length >= 3)
          .slice(0, Math.max(2, Math.min(5, totalRounds)))

        if (rounds.length === 0) {
          const words = pickWordsFromText(summary.content, totalRounds)
          const pool = words.length
            ? words
            : ['REACT', 'MOBILE', 'RESUMO', 'ESTUDO', 'PALAVRA']
          rounds = Array.from({
            length: Math.max(2, Math.min(5, totalRounds)),
          }).map((_, i) => {
            const w = pool[i % pool.length]
            return {
              question: `Adivinhe a palavra de ${w.length} letras relacionada ao conteúdo.`,
              word: w,
            }
          })
        }

        setRounds(rounds)
        setGuesses([])
        setWrongs(0)
        setScore(0)
        setLoading(false)
      } catch (e) {
        console.error(e)
        setErrorOverlay(true, 'Falha ao preparar o hangman. Tente novamente.')
        setLoading(false)
      } finally {
        setLoadingOverlay(false)
      }
    })()
    return () => {
      active = false
    }
  }, [challengeId, setErrorOverlay, setLoadingOverlay])

  // Track session for this challenge (topicId becomes available after loading summary)
  useTrackTopicSession(topicId, 'challenge', challengeId)

  const onGuess = (letter: string) => {
    if (!currentRound || canContinue) return
    const up = letter.toUpperCase()
    if (letters.has(up)) return
    setGuesses((prev) => [...prev, up])
    const w = currentRound.word.toUpperCase()
    if (!w.includes(up)) setWrongs((n) => n + 1)
  }

  useEffect(() => {
    if (!currentRound) return
    if (isSolved) {
      // solved: nothing extra here, wait for continue
    }
    if (isFailed) {
      // failed: wait for continue
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSolved, isFailed])

  const onContinue = async () => {
    if (!challenge || !currentRound || !canContinue) return

    // Update score if solved
    const solved = isSolved
    const attemptRound: AttemptRound = {
      word: currentRound.word.toUpperCase(),
      success: solved,
      wrongs,
      guesses: guesses.map((g) => g.toUpperCase()),
    }
    const nextScore = solved ? score + 1 : score

    const nextStep = step + 1
    if (nextStep < rounds.length) {
      // proceed to next round
      setScore(nextScore)
      setStep(nextStep)
      doSlide(nextStep)
      setGuesses([])
      setWrongs(0)
      // append attempt so far into a transient array on ref? we can store locally
      setPersistedRounds((prev) => [...prev, attemptRound])
      return
    }

    // finish
    const now = Date.now()
    const finalRounds = [...persistedRoundsRef.current, attemptRound]
    const attempt: Attempt & { userId?: string } = {
      at: now,
      score: nextScore,
      total: rounds.length,
      userId: meId || undefined,
      rounds: finalRounds,
    }
    const updated: Challenge = {
      ...challenge,
      updatedAt: now,
      payload: {
        ...challenge.payload,
        attempts: [...(challenge.payload?.attempts ?? []), attempt],
        lastAttempt: { score: nextScore, total: rounds.length, at: now },
      },
    }
    await challengesRepository.upsert(updated, '/sync/challenge', {
      summaryId: challenge.summaryId,
    })
    // Update UI immediately, then run a capped-time flush
    setChallenge(updated)
    setFinished({ score: nextScore, total: rounds.length })
    try {
      setLoadingOverlay(true, 'Sincronizando…')
      const { immediateCollaborativeFlush } = await import(
        '../../../services/firebase/immediateFlush'
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
      setLoadingOverlay(true)
      const currentAttempt: AttemptRound = {
        word: currentRound?.word || '',
        success: !!isSolved,
        wrongs,
        guesses: guesses.map((g) => g.toUpperCase()),
      }
      // build final rounds: persisted + current + remaining as failed
      const finalRounds = [...persistedRoundsRef.current, currentAttempt]
      const remaining = rounds.length - finalRounds.length
      for (let i = 0; i < remaining; i++) {
        finalRounds.push({
          word: '',
          success: false,
          wrongs: maxWrongs,
          guesses: [],
        })
      }
      const finalScore = finalRounds.filter((r) => r.success).length
      const now = Date.now()
      const attempt: Attempt & { userId?: string } = {
        at: now,
        score: finalScore,
        total: rounds.length,
        userId: meId || undefined,
        rounds: finalRounds,
      }
      const updated: Challenge = {
        ...challenge,
        updatedAt: now,
        payload: {
          ...challenge.payload,
          attempts: [...(challenge.payload?.attempts ?? []), attempt],
          lastAttempt: { score: finalScore, total: rounds.length, at: now },
        },
      }
      await challengesRepository.upsert(updated, '/sync/challenge', {
        summaryId: challenge.summaryId,
      })
      setChallenge(updated)
      setFinished({ score: finalScore, total: rounds.length })
      try {
        const { immediateCollaborativeFlush } = await import(
          '../../../services/firebase/immediateFlush'
        )
        await immediateCollaborativeFlush(1500)
      } catch {}
    } catch (e) {
      console.error(e)
    } finally {
      setLoadingOverlay(false)
    }
  }

  // Local accumulation of per-round attempt details
  const persistedRoundsRef = useRef<AttemptRound[]>([])
  const setPersistedRounds = (
    updater: (prev: AttemptRound[]) => AttemptRound[],
  ) => {
    persistedRoundsRef.current = updater(persistedRoundsRef.current)
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

  if (!challenge || rounds.length === 0) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: topicColor || '#0b0b0c',
          padding: 16,
        }}
      >
        <Text style={{ color: topicColor ? '#111' : 'white' }}>
          Hangman indisponível.
        </Text>
      </View>
    )
  }

  return (
    <View style={{ flex: 1, backgroundColor: topicColor || '#0b0b0c' }}>
      <ChallengeRunClose onConfirm={forceFinish} />
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
          {rounds.map((r, i) => (
            <StepDot key={`${i}-${r.word}`} active={i === step} />
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
                width: screenWidth * rounds.length,
                flexDirection: 'row',
                transform: [{ translateX: slideX }],
              }}
            >
              {rounds.map((r, idx) => (
                <View
                  key={`${idx}-${r.word}`}
                  style={{ width: screenWidth, paddingHorizontal: 16 }}
                >
                  <Text
                    style={{
                      color: 'white',
                      fontWeight: '700',
                      marginBottom: 8,
                    }}
                  >{`Desafio ${idx + 1}/${rounds.length}`}</Text>

                  {/* Pergunta */}
                  <Text style={{ color: '#e5e7eb', marginBottom: 8 }}>
                    {idx === step
                      ? (currentRound as Round | undefined)?.question
                      : '—'}
                  </Text>

                  {/* Revealed word */}
                  <View
                    style={{
                      backgroundColor: '#111214',
                      borderColor: '#2B2C30',
                      borderWidth: 1,
                      borderRadius: 10,
                      padding: 16,
                      alignItems: 'center',
                      marginBottom: 12,
                    }}
                  >
                    <Text
                      style={{ color: 'white', fontSize: 24, letterSpacing: 2 }}
                    >
                      {idx === step
                        ? revealed
                        : r.word
                            .split('')
                            .map(() => '_ ')
                            .join('')
                            .trim()}
                    </Text>
                    <Text style={{ color: '#9ca3af', marginTop: 8 }}>
                      Erros: {idx === step ? wrongs : 0}/{maxWrongs}
                    </Text>
                  </View>

                  {/* Keyboard */}
                  {idx === step && (
                    <View
                      style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}
                    >
                      {ALPHABET.map((ch) => {
                        const pressed = letters.has(ch)
                        return (
                          <TouchableOpacity
                            key={ch}
                            disabled={pressed || canContinue}
                            onPress={() => onGuess(ch)}
                            style={{
                              paddingVertical: 10,
                              paddingHorizontal: 12,
                              borderRadius: 6,
                              backgroundColor: pressed ? '#1f2937' : '#3b82f6',
                              opacity: pressed || canContinue ? 0.6 : 1,
                            }}
                          >
                            <Text style={{ color: 'white', fontWeight: '700' }}>
                              {ch}
                            </Text>
                          </TouchableOpacity>
                        )
                      })}
                    </View>
                  )}
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
              {isLast && canContinue ? 'Finalizar' : 'Continuar'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  )
}

function pickWordsFromText(text: string, total: number): string[] {
  const normalized = text
    .split(/[^A-Za-zÀ-ÿ\s]/g)
    .join(' ')
    .split(/\s+/)
    .map((w) => w.trim())
    .filter(Boolean)
  const uniq: string[] = []
  for (const raw of normalized) {
    const up = raw.toUpperCase()
    // only letters, length 3..10
    if (!/^[A-ZÀ-Ý]+$/.test(up)) continue
    if (up.length < 3 || up.length > 10) continue
    if (!uniq.includes(up)) uniq.push(up)
  }
  // shuffle
  for (let i = uniq.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[uniq[i], uniq[j]] = [uniq[j], uniq[i]]
  }
  return uniq.slice(0, Math.max(2, Math.min(5, total)))
}

// ===== AI generation for hangman rounds =====
type HangmanGen = { question: string; answer: string }

function buildHangmanPrompt(summaryText: string, total: number) {
  return [
    'Você criará desafios de Hangman baseados no texto de estudo.',
    'Responda SOMENTE em JSON com a chave: rounds (array).',
    'Cada item de rounds deve ter:',
    '- question: string (a pergunta ou dica)',
    '- answer: string (apenas uma palavra, somente letras, até 10 caracteres, sem espaços)',
    `Gere exatamente ${Math.max(2, Math.min(5, total))} itens.`,
    'Baseie-se exclusivamente no texto abaixo:',
    '"""',
    summaryText,
    '"""',
  ].join('\n')
}

async function generateHangmanRounds(prompt: string): Promise<HangmanGen[]> {
  try {
    const body = JSON.stringify({
      model: process.env.EXPO_PUBLIC_OPENAI_MODEL || 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content:
            'Você gera rounds de Hangman. Responda SOMENTE em JSON com { rounds: Array<{question, answer}> }.',
        },
        { role: 'user', content: prompt },
      ],
      temperature: 0.4,
    })
    const base =
      process.env.EXPO_PUBLIC_OPENAI_BASE_URL || 'https://api.openai.com/v1'
    const key = process.env.EXPO_PUBLIC_OPENAI_API_KEY
    if (!key) return mockHangmanRounds()
    const res = await fetch(`${base}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${key}`,
      },
      body,
    })
    if (!res.ok) return mockHangmanRounds()
    const data = await res.json()
    const content = data?.choices?.[0]?.message?.content?.trim?.() ?? ''
    const json = toJSONSafe(content)
    const rounds = Array.isArray(json?.rounds) ? json.rounds : []
    const parsed: HangmanGen[] = rounds
      .slice(0, 5)
      .map((r: any) => ({
        question: String(r?.question || ''),
        answer: String(r?.answer || ''),
      }))
      .filter((r: HangmanGen) => r.question && r.answer)
    return parsed.length ? parsed : mockHangmanRounds()
  } catch (e) {
    console.error(e)
    return mockHangmanRounds()
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

function mockHangmanRounds(): HangmanGen[] {
  return [
    {
      question: 'Tecnologia base usada para apps mobile com JS?',
      answer: 'REACT',
    },
    {
      question: 'O resumo estudado trata de qual atividade principal?',
      answer: 'ESTUDO',
    },
  ]
}

export default ChallengeRunHangmanScreen
