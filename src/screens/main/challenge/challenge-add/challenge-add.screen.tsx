import { Container } from '@/components'
import SubContainer from '@/components/containers/sub-container/sub-container'
import { useTheme } from '@/hooks/use-theme'
import { t } from '@/locales/translation'
import { RootStackParamList } from '@/navigation/navigatorManager'
import { useThemeStore } from '@/store/theme.store'
import { ThemeType } from '@/types/theme.type'
import { RouteProp, useRoute } from '@react-navigation/native'
import React from 'react'
import { StyleSheet } from 'react-native'
import ChallengeOptionCard from './components/challenge-option-card'
import useChallengeAdd from './challenge-add.hook'
const ChallengeAddScreen = () => {
  const route = useRoute<RouteProp<RootStackParamList, 'ChallengeAddScreen'>>()
  const summaryId = (route.params as any)?.summaryId as string | undefined
  const {
    avgScores,
    totals,
    handleStartQuiz,
    handleStartHangman,
    handleStartMatrix,
    handleStartText,
  } = useChallengeAdd(summaryId)

  const theme = useTheme()
  const color = useThemeStore((s) => s.colorLevelUp.background_color)
  const styles = createStyles(theme, color)

  return (
    <Container style={styles.container}>
      <SubContainer styleContainer={styles.subContainer}>
        <ChallengeOptionCard
          label={t('challengeAdd.option.quiz')}
          onPress={handleStartQuiz}
          score={avgScores['quiz'] ?? 0}
          total={totals['quiz'] ?? 0}
        />
        <ChallengeOptionCard
          label={t('challengeAdd.option.hangman')}
          onPress={handleStartHangman}
          score={avgScores['hangman'] ?? 0}
          total={totals['hangman'] ?? 0}
        />
        <ChallengeOptionCard
          label={t('challengeAdd.option.matrix')}
          onPress={handleStartMatrix}
          score={avgScores['matrix'] ?? 0}
          total={totals['matrix'] ?? 0}
        />
        <ChallengeOptionCard
          label={t('challengeAdd.option.text_answer')}
          onPress={handleStartText}
          score={avgScores['text'] ?? 0}
          total={totals['text'] ?? 0}
        />
      </SubContainer>
    </Container>
  )
}

export default ChallengeAddScreen

const createStyles = (theme: ThemeType, color: string) =>
  StyleSheet.create({
    container: {
      backgroundColor: color,
    },
    subContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      paddingHorizontal: 8,
      paddingTop: 8,
      gap: 8 as any,
    },
  })
