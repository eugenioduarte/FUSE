import useTrackTopicSession from '@/hooks/useTrackTopicSession'
import { useThemeStore } from '@/store/useThemeStore'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Animated, Dimensions, Easing } from 'react-native'
// navigatorManager not required in hook
import { challengesRepository } from '@/services/repositories/challenges.repository'
import { summariesRepository } from '@/services/repositories/summaries.repository'
import { topicsRepository } from '@/services/repositories/topics.repository'
import { useAuthStore } from '@/store/useAuthStore'
import { useOverlay } from '@/store/useOverlay'
import { Challenge } from '@/types/domain'

// alphabet unused in current implementation

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

type UseHangmanResult = {
  loading: boolean
  topicColor?: string
  challenge: Challenge | null
  rounds: Round[]
  step: number
  revealed: string
  letters: Set<string>
  wrongs: number
  maxWrongs: number
  isSolved: boolean
  isFailed: boolean
  canContinue: boolean
  isLast: boolean
  screenWidth: number
  slideX: Animated.Value
  doSlide: (to: number) => void
  onGuess: (letter: string) => void
  onContinue: () => Promise<void>
  forceFinish: () => Promise<void>
  finished: null | { score: number; total: number }
}

export default function useChallengeRunHangman(
  challengeId: string,
): UseHangmanResult {
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

  const color = useThemeStore((s) => s.colorLevelUp.level_eight)
  const setBackgroundColor = useThemeStore((state) => state.setBackgroundColor)
  useEffect(() => {
    setBackgroundColor(color)
  }, [color, setBackgroundColor])

  useEffect(() => {
    let active = true
    ;(async () => {
      try {
        setLoadingOverlay(true, 'ChallengeRunHangmanScreen')
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
        let roundsLocal: Round[] = roundsGen
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

        if (roundsLocal.length === 0) {
          const words = pickWordsFromText(summary.content, totalRounds)
          const pool = words.length
            ? words
            : ['REACT', 'MOBILE', 'RESUMO', 'ESTUDO', 'PALAVRA']
          roundsLocal = Array.from({
            length: Math.max(2, Math.min(5, totalRounds)),
          }).map((_, i) => {
            const w = pool[i % pool.length]
            return {
              question: `Adivinhe a palavra de ${w.length} letras relacionada ao conteúdo.`,
              word: w,
            }
          })
        }

        setRounds(roundsLocal)
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

  // Local accumulation of per-round attempt details
  const persistedRoundsRef = useRef<AttemptRound[]>([])
  const setPersistedRounds = (
    updater: (prev: AttemptRound[]) => AttemptRound[],
  ) => {
    persistedRoundsRef.current = updater(persistedRoundsRef.current)
  }

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
      // append attempt so far into a transient array on ref
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
      setLoadingOverlay(true, 'ChallengeRunHangmanScreen')
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
    loading,
    topicColor,
    challenge,
    rounds,
    step,
    revealed,
    letters,
    wrongs,
    maxWrongs,
    isSolved,
    isFailed,
    canContinue,
    isLast,
    screenWidth,
    slideX,
    doSlide,
    onGuess,
    onContinue,
    forceFinish,
    finished,
  }
}

// Helper functions
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
    '""",',
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
