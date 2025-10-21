import { RouteProp, useRoute } from '@react-navigation/native'
import React from 'react'
import { Text, TouchableOpacity, View } from 'react-native'
import {
  navigatorManager,
  RootStackParamList,
} from '../../../../navigation/navigatorManager'
import { challengesRepository } from '../../../../services/repositories/challenges.repository'
import { useOverlay } from '../../../../store/useOverlay'
import { Challenge } from '../../../../types/domain'

const ChallengeAddScreen = () => {
  const route = useRoute<RouteProp<RootStackParamList, 'ChallengeAddScreen'>>()
  const summaryId = (route.params as any)?.summaryId as string | undefined
  const { setLoadingOverlay, setErrorOverlay } = useOverlay()

  const handleStartQuiz = async () => {
    if (!summaryId) {
      setErrorOverlay(
        true,
        'Abra a criação de challenge a partir de um Summary.',
      )
      return
    }
    try {
      setLoadingOverlay(true)
      const now = Date.now()
      const id = `${now}`
      // random between 5 and 10 inclusive
      const totalQuestions = Math.floor(Math.random() * (10 - 5 + 1)) + 5
      const challenge: Challenge = {
        id,
        type: 'quiz',
        title: 'Quiz',
        summaryId,
        payload: { totalQuestions },
        createdAt: now,
        updatedAt: now,
      }
      await challengesRepository.upsert(challenge, '/sync/challenge', {
        summaryId,
      })
      // Go straight to running the quiz
      navigatorManager.goToChallengeRunQuiz({ challengeId: id })
    } catch (e) {
      console.error(e)
      setErrorOverlay(true, 'Não foi possível iniciar o quiz. Tente novamente.')
    } finally {
      setLoadingOverlay(false)
    }
  }

  const handleStartHangman = async () => {
    if (!summaryId) {
      setErrorOverlay(
        true,
        'Abra a criação de challenge a partir de um Summary.',
      )
      return
    }
    try {
      setLoadingOverlay(true)
      const now = Date.now()
      const id = `${now}`
      const totalRounds = Math.floor(Math.random() * (5 - 2 + 1)) + 2
      const challenge: Challenge = {
        id,
        type: 'hangman',
        title: 'Hangman',
        summaryId,
        payload: { totalRounds, maxErrorsPerRound: 3 },
        createdAt: now,
        updatedAt: now,
      }
      await challengesRepository.upsert(challenge, '/sync/challenge', {
        summaryId,
      })
      navigatorManager.goToChallengeRunHangman({ challengeId: id })
    } catch (e) {
      console.error(e)
      setErrorOverlay(
        true,
        'Não foi possível iniciar o hangman. Tente novamente.',
      )
    } finally {
      setLoadingOverlay(false)
    }
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#0b0b0c', padding: 16 }}>
      <Text style={{ color: 'white', fontSize: 18, fontWeight: '700' }}>
        Tipo de Challenge
      </Text>
      <View style={{ height: 16 }} />

      <Option label="Quiz" onPress={handleStartQuiz} />
      <Option label="Hangman" onPress={handleStartHangman} />
      <Option
        label="Matrix"
        onPress={() => navigatorManager.goToChallengeAddMatrix({ summaryId })}
      />
      {/* Flashcard removido */}
      <Option
        label="Resposta em Texto"
        onPress={() =>
          navigatorManager.goToChallengeAddTextAnswer({ summaryId })
        }
      />
    </View>
  )
}

export default ChallengeAddScreen

const Option = ({ label, onPress }: { label: string; onPress: () => void }) => (
  <TouchableOpacity
    onPress={onPress}
    style={{
      backgroundColor: '#111214',
      borderColor: '#2B2C30',
      borderWidth: 1,
      borderRadius: 10,
      paddingVertical: 16,
      paddingHorizontal: 14,
      marginBottom: 12,
    }}
  >
    <Text style={{ color: 'white', fontWeight: '600', fontSize: 15 }}>
      {label}
    </Text>
  </TouchableOpacity>
)
