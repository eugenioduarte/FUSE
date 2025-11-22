import { Button, Container, Text } from '@/components'
import EmptyContainer from '@/components/containers/EmptyContainer'
import LoadingContainer from '@/components/containers/LoadingContainer'
import StepDot from '@/components/stepDot/StepDot'
import { useTheme } from '@/hooks/useTheme'
import { t } from '@/locales/translation'
import { RootStackParamList } from '@/navigation/navigatorManager'
import { useThemeStore } from '@/store/useThemeStore'
import { RouteProp, useRoute } from '@react-navigation/native'
import React, { useEffect } from 'react'
import { ScrollView, StyleSheet, TextInput, View } from 'react-native'
import ChallengeRunClose from './components/ChallengeRunClose'
import useChallengeRunTextAnswer from './hooks/useChallengeRunTextAnswer'

type StepDotProps = {
  active: boolean
}

const StepDotContainer = ({ active }: StepDotProps) => {
  return <StepDot active={active} />
}

export type TAExercise = { question: string; correctAnswer: string }
export type TAEvaluation = { score: number; feedback?: string }
export type TAAttemptItem = TAExercise & {
  userAnswer: string
  score: number
  feedback?: string
}
export type TAAttempt = {
  at: number
  score: number
  total: number
  exercises: TAAttemptItem[]
}

const ChallengeRunTextAnswerScreen: React.FC = () => {
  const route =
    useRoute<RouteProp<RootStackParamList, 'ChallengeRunTextAnswerScreen'>>()
  const challengeId = route.params?.challengeId!

  const theme = useTheme()
  const color = useThemeStore((s) => s.colorLevelUp.background_color)
  const styles = createStyles(theme, color)

  const {
    challenge,
    exercises,
    step,
    answer,
    setAnswer,
    evaluated,
    loading,
    canSubmit,
    doSubmit,
    onContinue,
    forceFinish,
  } = useChallengeRunTextAnswer(challengeId)

  useEffect(() => {
    const setBackgroundColor = useThemeStore.getState().setBackgroundColor
    try {
      setBackgroundColor(color)
    } catch {}
  }, [color])

  if (loading) {
    return <LoadingContainer screenName={t('challengeRunText.loading')} />
  }

  if (!challenge || exercises.length === 0) {
    return <EmptyContainer />
  }

  const current = exercises[step]

  return (
    <Container style={styles.container}>
      <ChallengeRunClose onConfirm={forceFinish} />
      <View style={styles.headerRow}>
        <Text variant="xxLarge">{challenge.title}</Text>
        <View style={styles.dotsRow}>
          {exercises.map((q, i) => (
            <StepDotContainer key={`${i}-${q.question}`} active={i === step} />
          ))}
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        <Text variant="large" style={styles.question}>
          {current.question}
        </Text>

        <TextInput
          editable={evaluated == null}
          multiline
          textAlignVertical="top"
          placeholder={t('challengeRunText.placeholder')}
          placeholderTextColor="#6b7280"
          style={styles.textInput}
          value={answer}
          onChangeText={setAnswer}
        />
        <Text variant="large" style={styles.charCount}>
          {t('challengeRunText.charCount')
            .replace('{count}', String(answer.trim().length))
            .replace('{min}', '30')}
        </Text>

        {evaluated && (
          <View style={styles.evaluatedBox}>
            <Text style={styles.correctLabel}>
              {t('challengeRunText.correct_answer')}
            </Text>
            <Text style={styles.correctAnswer}>{current.correctAnswer}</Text>
            <Text style={styles.scoreText}>
              {t('challengeRunText.score').replace(
                '{score}',
                String(evaluated.score),
              )}
            </Text>
            {!!evaluated.feedback && (
              <Text style={styles.feedbackText}>{evaluated.feedback}</Text>
            )}
          </View>
        )}
      </ScrollView>
      <Button
        title={
          evaluated
            ? t('challengeRunQuiz.button.continue')
            : t('challengeRunText.button.send')
        }
        onPress={evaluated ? onContinue : doSubmit}
        disabled={!canSubmit && !evaluated}
        background={theme.colors.white}
        style={styles.button}
      />
    </Container>
  )
}

export default ChallengeRunTextAnswerScreen

const createStyles = (theme: any, color?: string) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: color || theme.colors.accentRed,
      paddingTop: 50,
    },
    headerRow: {
      paddingHorizontal: 16,
      marginTop: 24,
      paddingBottom: 8,
      justifyContent: 'space-between',
      alignItems: 'center',
      width: '100%',
      gap: 12,
    },
    dotsRow: {
      flexDirection: 'row',
      width: '100%',
      justifyContent: 'center',
    },
    scrollView: { flex: 1, padding: 16 },
    scrollContent: { flexGrow: 1, paddingBottom: 100 },
    question: { marginBottom: 16 },
    textInput: {
      borderColor: theme.colors.borderColor,
      borderWidth: 1,
      borderRadius: theme.border.radius16,
      padding: theme.spacings.large,
      minHeight: '30%',
    },
    charCount: { marginTop: 6 },
    evaluatedBox: {
      marginTop: theme.spacings.large,
      borderColor: theme.colors.borderColor,
      borderWidth: theme.border.size,
      borderRadius: theme.border.radius16,
      padding: theme.spacings.large,
    },
    correctLabel: { color: theme.colors.white, marginBottom: 6 },
    correctAnswer: { color: theme.colors.white, marginBottom: 10 },
    scoreText: { color: theme.colors.white },
    feedbackText: { color: theme.colors.white, marginTop: 6 },
    button: { alignSelf: 'center', marginBottom: theme.spacings.xLarge },
  })
