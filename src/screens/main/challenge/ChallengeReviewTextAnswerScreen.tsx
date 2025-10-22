import { RouteProp, useRoute } from '@react-navigation/native'
import React, { useEffect, useState } from 'react'
import { ActivityIndicator, ScrollView, Text, View } from 'react-native'
import { RootStackParamList } from '../../../navigation/navigatorManager'
import { challengesRepository } from '../../../services/repositories/challenges.repository'
import { useOverlay } from '../../../store/useOverlay'
import { Challenge } from '../../../types/domain'

const ChallengeReviewTextAnswerScreen: React.FC = () => {
  const route =
    useRoute<RouteProp<RootStackParamList, 'ChallengeReviewTextAnswerScreen'>>()
  const challengeId = route.params?.challengeId!
  const { setErrorOverlay } = useOverlay()

  const [challenge, setChallenge] = useState<Challenge | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    ;(async () => {
      try {
        const all = await challengesRepository.list()
        if (!active) return
        const ch = all.find((c) => c.id === challengeId) || null
        if (!ch) throw new Error('Challenge not found')
        setChallenge(ch)
      } catch (e) {
        console.error(e)
        setErrorOverlay(true, 'Não foi possível carregar o review.')
      } finally {
        setLoading(false)
      }
    })()
    return () => {
      active = false
    }
  }, [challengeId, setErrorOverlay])

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

  if (!challenge) {
    return (
      <View style={{ flex: 1, padding: 16, backgroundColor: '#0b0b0c' }}>
        <Text style={{ color: 'white' }}>Review indisponível.</Text>
      </View>
    )
  }

  const lastAttempt = (challenge.payload?.attempts || []).at(-1)
  const exercises = lastAttempt?.exercises || []

  return (
    <View style={{ flex: 1, backgroundColor: '#0b0b0c' }}>
      <View style={{ padding: 16 }}>
        <Text style={{ color: 'white', fontSize: 18, fontWeight: '700' }}>
          {challenge.title || 'Resposta em Texto'}
        </Text>
        {lastAttempt && (
          <Text style={{ color: '#9ca3af', marginTop: 6 }}>
            Pontuação final: {Number(lastAttempt.score).toFixed(1)}/10
          </Text>
        )}
      </View>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 16, paddingBottom: 24 }}
      >
        {exercises.length === 0 ? (
          <Text style={{ color: '#9ca3af' }}>Sem respostas registradas.</Text>
        ) : (
          exercises.map((it: any, idx: number) => (
            <View
              key={`ex-${idx}-${it.question}`}
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
                style={{ color: '#e5e7eb', fontWeight: '700', marginBottom: 6 }}
              >{`Exercício ${idx + 1}`}</Text>
              <Text style={{ color: 'white', marginBottom: 8 }}>
                {it.question}
              </Text>
              <Text style={{ color: '#9ca3af', fontWeight: '700' }}>
                Sua resposta
              </Text>
              <Text style={{ color: 'white', marginBottom: 8 }}>
                {it.userAnswer || '—'}
              </Text>
              <Text style={{ color: '#9ca3af', fontWeight: '700' }}>
                Resposta correta
              </Text>
              <Text style={{ color: 'white', marginBottom: 8 }}>
                {it.correctAnswer}
              </Text>
              <Text style={{ color: '#9ca3af' }}>Nota: {it.score}/10</Text>
              {!!it.feedback && (
                <Text style={{ color: '#9ca3af', marginTop: 6 }}>
                  {it.feedback}
                </Text>
              )}
            </View>
          ))
        )}
      </ScrollView>
    </View>
  )
}

export default ChallengeReviewTextAnswerScreen
