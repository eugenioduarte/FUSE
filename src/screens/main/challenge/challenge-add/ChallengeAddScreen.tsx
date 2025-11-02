import { Container } from '@/components'
import SubContainer from '@/components/containers/SubContainer'
import {
  navigatorManager,
  RootStackParamList,
} from '@/navigation/navigatorManager'
import { challengesRepository } from '@/services/repositories/challenges.repository'
import { summariesRepository } from '@/services/repositories/summaries.repository'
import { topicsRepository } from '@/services/repositories/topics.repository'
import { useOverlay } from '@/store/useOverlay'
import { Challenge } from '@/types/domain'
import { RouteProp, useRoute } from '@react-navigation/native'
import React, { useEffect, useState } from 'react'
import { Text, TouchableOpacity } from 'react-native'
import ChallengeOptionCard from './components/ChallengeOptionCard'

const ChallengeAddScreen = () => {
  const route = useRoute<RouteProp<RootStackParamList, 'ChallengeAddScreen'>>()
  const summaryId = (route.params as any)?.summaryId as string | undefined
  const { setLoadingOverlay, setErrorOverlay } = useOverlay()
  const [topicColor, setTopicColor] = useState<string | undefined>()

  useEffect(() => {
    let active = true
    ;(async () => {
      try {
        if (!summaryId) return
        const summary = await summariesRepository.getById(summaryId)
        if (!active || !summary) return
        const topic = await topicsRepository.getById(summary.topicId)
        if (active) setTopicColor(topic?.backgroundColor || undefined)
      } catch (e) {
        console.warn('ChallengeAddScreen: failed to load topic color', e)
      }
    })()
    return () => {
      active = false
    }
  }, [summaryId])

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

  const handleStartMatrix = async () => {
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
        type: 'matrix',
        title: 'Matrix',
        summaryId,
        payload: { totalWords: 5, durationSec: 60 },
        createdAt: now,
        updatedAt: now,
      }
      await challengesRepository.upsert(challenge, '/sync/challenge', {
        summaryId,
      })
      navigatorManager.goToChallengeRunMatrix({ challengeId: id })
    } catch (e) {
      console.error(e)
      setErrorOverlay(
        true,
        'Não foi possível iniciar o matrix. Tente novamente.',
      )
    } finally {
      setLoadingOverlay(false)
    }
  }

  const colored = !!topicColor
  const bg = topicColor || '#0b0b0c'

  return (
    <Container style={{ backgroundColor: bg }}>
      <SubContainer
        styleContainer={{
          alignItems: 'flex-start',
          justifyContent: 'flex-start',
          paddingTop: 20,
        }}
      >
        <ChallengeOptionCard label="Quiz" onPress={handleStartQuiz} score={0} />
        <Option label="Quiz" onPress={handleStartQuiz} colored={colored} />

        <Option
          label="Hangman"
          onPress={handleStartHangman}
          colored={colored}
        />
        <Option label="Matrix" onPress={handleStartMatrix} colored={colored} />
        {/* Flashcard removido */}
        <Option
          label="Resposta em Texto"
          onPress={() =>
            navigatorManager.goToChallengeAddTextAnswer({ summaryId })
          }
          colored={colored}
        />
      </SubContainer>
    </Container>
  )
}

export default ChallengeAddScreen

const Option = ({
  label,
  onPress,
  colored,
}: {
  label: string
  onPress: () => void
  colored?: boolean
}) => (
  <TouchableOpacity
    onPress={onPress}
    style={{
      backgroundColor: colored ? '#ffffffaa' : '#111214',
      borderColor: colored ? '#e5e7eb' : '#2B2C30',
      borderWidth: 1,
      borderRadius: 10,
      paddingVertical: 16,
      paddingHorizontal: 14,
      marginBottom: 12,
    }}
  >
    <Text
      style={{
        color: colored ? '#111' : 'white',
        fontWeight: '600',
        fontSize: 15,
      }}
    >
      {label}
    </Text>
  </TouchableOpacity>
)
