import { Container } from '@/components'
import SubContainer from '@/components/containers/SubContainer'
import {
  navigatorManager,
  RootStackParamList,
} from '@/navigation/navigatorManager'
import { RouteProp, useRoute } from '@react-navigation/native'
import React from 'react'
import ChallengeOptionCard from './components/ChallengeOptionCard'
import useChallengeAdd from './hooks/useChallengeAdd'

const ChallengeAddScreen = () => {
  const route = useRoute<RouteProp<RootStackParamList, 'ChallengeAddScreen'>>()
  const summaryId = (route.params as any)?.summaryId as string | undefined
  const {
    topicColor,
    avgScores,
    totals,
    handleStartQuiz,
    handleStartHangman,
    handleStartMatrix,
  } = useChallengeAdd(summaryId)

  const bg = topicColor || '#0b0b0c'

  return (
    <Container style={{ backgroundColor: bg }}>
      <SubContainer
        styleContainer={{
          flexDirection: 'row',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          paddingHorizontal: 8,
          gap: 8,
          paddingTop: 8,
        }}
      >
        <ChallengeOptionCard
          label="Quiz"
          onPress={handleStartQuiz}
          score={avgScores['quiz'] ?? 0}
          total={totals['quiz'] ?? 0}
        />
        <ChallengeOptionCard
          label="Hangman"
          onPress={handleStartHangman}
          score={avgScores['hangman'] ?? 0}
          total={totals['hangman'] ?? 0}
        />
        <ChallengeOptionCard
          label="Matrix"
          onPress={handleStartMatrix}
          score={avgScores['matrix'] ?? 0}
          total={totals['matrix'] ?? 0}
        />
        <ChallengeOptionCard
          label="Resposta em Texto"
          onPress={() =>
            navigatorManager.goToChallengeAddTextAnswer({ summaryId })
          }
          score={avgScores['text'] ?? 0}
          total={totals['text'] ?? 0}
        />
      </SubContainer>
    </Container>
  )
}

export default ChallengeAddScreen
