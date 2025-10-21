import { RouteProp, useRoute } from '@react-navigation/native'
import React, { useEffect, useState } from 'react'
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import {
  RootStackParamList,
  navigatorManager,
} from '../../../navigation/navigatorManager'
import { challengesRepository } from '../../../services/repositories/challenges.repository'
import { Challenge } from '../../../types/domain'

// Types aligned with ChallengeRunQuizScreen persisted payload
type AIQuizQuestion = {
  question: string
  options: { text: string; correct: boolean; explanation: string }[]
}

type AttemptQuestion = AIQuizQuestion & { choice: number | null }

type Attempt = {
  at: number
  score: number
  total: number
  questions: AttemptQuestion[]
}

const formatDate = (ts: number) => {
  const d = new Date(ts)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`
}

const ChallengeReviewQuizScreen: React.FC = () => {
  const route =
    useRoute<RouteProp<RootStackParamList, 'ChallengeReviewQuizScreen'>>()
  const challengeId = (route.params as any)?.challengeId as string

  const [challenge, setChallenge] = useState<Challenge | null>(null)
  const [attempt, setAttempt] = useState<Attempt | null>(null)
  const [loading, setLoading] = useState(true)
  const [explainIdxByQ, setExplainIdxByQ] = useState<
    Record<number, number | null>
  >({})

  const handleOptionPress = (questionIndex: number, optionIndex: number) => {
    setExplainIdxByQ((prev) => ({ ...prev, [questionIndex]: optionIndex }))
  }

  useEffect(() => {
    let active = true
    ;(async () => {
      try {
        const all = await challengesRepository.list()
        if (!active) return
        const ch = all.find((c) => c.id === challengeId) || null
        if (!ch) throw new Error('Challenge não encontrado')
        setChallenge(ch)
        const attempts: Attempt[] = ch.payload?.attempts || []
        const last = (attempts as Attempt[]).at(-1) || null
        setAttempt(last)
        if (last) {
          const init: Record<number, number | null> = {}
          for (let i = 0; i < last.questions.length; i++) init[i] = null
          setExplainIdxByQ(init)
        }
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

  if (!challenge || !attempt) {
    return (
      <View style={{ flex: 1, backgroundColor: '#0b0b0c', padding: 16 }}>
        <Text style={{ color: 'white' }}>Sem dados para rever.</Text>
      </View>
    )
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#0b0b0c' }}>
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
          Quiz – {formatDate(attempt.at)} – {attempt.score}/{attempt.total}
        </Text>
        <Text
          onPress={() =>
            navigatorManager.goToChallengesList({
              summaryId: challenge.summaryId,
            })
          }
          style={{ color: '#60a5fa', fontWeight: '700' }}
        >
          Lista
        </Text>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16 }}>
        {attempt.questions.map((q, qi) => (
          <View
            key={`${qi}-${q.question}`}
            style={{
              backgroundColor: '#111214',
              borderColor: '#2B2C30',
              borderWidth: 1,
              borderRadius: 10,
              padding: 12,
              marginBottom: 12,
            }}
          >
            <Text
              style={{ color: 'white', fontWeight: '700', marginBottom: 8 }}
            >
              {`Pergunta ${qi + 1}/${attempt.questions.length}`}
            </Text>
            <Text style={{ color: '#e5e7eb', marginBottom: 12 }}>
              {q.question}
            </Text>
            {explainIdxByQ[qi] != null && (
              <View
                style={{
                  backgroundColor: '#0b0b0c',
                  borderColor: '#2B2C30',
                  borderWidth: 1,
                  borderRadius: 8,
                  padding: 10,
                  marginBottom: 12,
                }}
              >
                <Text style={{ color: '#9ca3af', marginBottom: 4 }}>
                  Explicação
                </Text>
                <Text style={{ color: '#d1d5db' }}>
                  {q.options[explainIdxByQ[qi]!]?.explanation || ''}
                </Text>
              </View>
            )}
            <View style={{ gap: 10 }}>
              {q.options.map((opt, oi) => {
                const isUser = q.choice === oi
                const isCorrect = opt.correct
                const bg = isCorrect ? '#0f172a' : '#111214'
                const border = isCorrect
                  ? '#22c55e'
                  : isUser
                    ? '#ef4444'
                    : '#2B2C30'
                return (
                  <TouchableOpacity
                    onPress={() => handleOptionPress(qi, oi)}
                    key={`${qi}-${oi}-${opt.text}`}
                    style={{
                      backgroundColor: bg,
                      borderColor: border,
                      borderWidth: 1,
                      borderRadius: 10,
                      padding: 12,
                    }}
                  >
                    <Text style={{ color: 'white' }}>
                      {opt.text} {isCorrect ? '✓' : isUser ? '✗' : ''}
                    </Text>
                  </TouchableOpacity>
                )
              })}
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  )
}

export default ChallengeReviewQuizScreen
