import { RouteProp, useRoute } from '@react-navigation/native'
import React, { useEffect, useState } from 'react'
import { ActivityIndicator, ScrollView, Text, View } from 'react-native'
import {
  RootStackParamList,
  navigatorManager,
} from '../../../navigation/navigatorManager'
import { challengesRepository } from '../../../services/repositories/challenges.repository'
import { Challenge } from '../../../types/domain'

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

const formatDate = (ts: number) => {
  const d = new Date(ts)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`
}

const ChallengeReviewHangmanScreen: React.FC = () => {
  const route =
    useRoute<RouteProp<RootStackParamList, 'ChallengeReviewHangmanScreen'>>()
  const challengeId = (route.params as any)?.challengeId as string

  const [challenge, setChallenge] = useState<Challenge | null>(null)
  const [attempt, setAttempt] = useState<Attempt | null>(null)
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
        const attempts: Attempt[] = ch.payload?.attempts || []
        const last = (attempts as Attempt[]).at(-1) || null
        setAttempt(last)
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
          Hangman – {formatDate(attempt.at)} – {attempt.score}
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
        {attempt.rounds.map((r, ri) => (
          <View
            key={`${ri}-${r.word}`}
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
              style={{ color: 'white', fontWeight: '700', marginBottom: 4 }}
            >
              {`Desafio ${ri + 1}/${attempt.rounds.length}`}
            </Text>
            <Text style={{ color: '#e5e7eb', marginBottom: 6 }}>{r.word}</Text>
            <Text style={{ color: r.success ? '#22c55e' : '#ef4444' }}>
              {r.success ? 'Acertou' : 'Errou'}
            </Text>
          </View>
        ))}
      </ScrollView>
    </View>
  )
}

export default ChallengeReviewHangmanScreen
