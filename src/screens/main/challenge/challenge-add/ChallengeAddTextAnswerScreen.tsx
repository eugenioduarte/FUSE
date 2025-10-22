import { useRoute } from '@react-navigation/native'
import React from 'react'
import { Text, TouchableOpacity, View } from 'react-native'
import { navigatorManager } from '../../../../navigation/navigatorManager'
import { challengesRepository } from '../../../../services/repositories/challenges.repository'
import { useOverlay } from '../../../../store/useOverlay'
import { Challenge } from '../../../../types/domain'

const ChallengeAddTextAnswerScreen = () => {
  const route = useRoute<any>()
  const summaryId = route?.params?.summaryId as string | undefined
  const { setLoadingOverlay, setErrorOverlay } = useOverlay()

  const handleStart = async () => {
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
      const challenge: Challenge = {
        id,
        type: 'text',
        title: 'Resposta em Texto',
        summaryId,
        payload: { totalExercises: 5, perExerciseSeconds: 120 },
        createdAt: now,
        updatedAt: now,
      }
      await challengesRepository.upsert(challenge, '/sync/challenge', {
        summaryId,
      })
      navigatorManager.goToChallengeRunTextAnswer({ challengeId: id })
    } catch (e) {
      console.error(e)
      setErrorOverlay(true, 'Não foi possível iniciar Resposta em Texto.')
    } finally {
      setLoadingOverlay(false)
    }
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#0b0b0c', padding: 16 }}>
      <Text
        style={{
          color: 'white',
          fontSize: 18,
          fontWeight: '700',
          marginBottom: 12,
        }}
      >
        Resposta em Texto
      </Text>
      <Text style={{ color: '#9ca3af', marginBottom: 16 }}>
        Serão 5 exercícios de resposta aberta. Cada exercício tem 2 minutos.
      </Text>
      <TouchableOpacity
        onPress={handleStart}
        style={{
          backgroundColor: '#3b82f6',
          borderRadius: 10,
          paddingVertical: 14,
          alignItems: 'center',
        }}
      >
        <Text style={{ color: 'white', fontWeight: '700' }}>Começar</Text>
      </TouchableOpacity>
    </View>
  )
}

export default ChallengeAddTextAnswerScreen
