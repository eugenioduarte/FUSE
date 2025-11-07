import { Button, Container, Text } from '@/components'
import EmptyContainer from '@/components/containers/EmptyContainer'
import { useTheme } from '@/hooks/useTheme'
import {
  RootStackParamList,
  navigatorManager,
} from '@/navigation/navigatorManager'
import { useThemeStore } from '@/store/useThemeStore'
import { RouteProp, useRoute } from '@react-navigation/native'
import React, { useRef } from 'react'

import { t } from '@/locales/translation'
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  Easing,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native'
import ChallengeRunClose from './components/ChallengeRunClose'
import { useChallengeRunQuiz } from './hooks/useChallengeRunQuiz'

type StepDotProps = {
  active: boolean
  styles: any
  theme: any
  questionsLength: number
}

const StepDot = ({ active, styles, theme, questionsLength }: StepDotProps) => {
  const dotColor = useThemeStore((s) => s.colorLevelUp.level_five)
  return (
    <View
      style={[
        styles.stepDot,
        {
          backgroundColor: dotColor,
          opacity: active ? 1 : 0.3,
          width: Dimensions.get('window').width / (questionsLength * 4),
          borderWidth: theme.border.size,
          borderColor: theme.colors.borderColor,
        },
      ]}
    />
  )
}

const ChallengeRunQuizScreen: React.FC = () => {
  const theme = useTheme()
  const color = useThemeStore((s) => s.colorLevelUp.level_two)
  const styles = createStyles(theme, color)
  const route =
    useRoute<RouteProp<RootStackParamList, 'ChallengeRunQuizScreen'>>()
  const challengeId = route.params?.challengeId!

  const {
    challenge,
    questions,
    loading,
    topicColor,
    step,
    currentChoice,
    firstChoiceByIndex,
    finished,
    isLast,
    canContinue,
    onSelect,
    onContinue,
    forceFinish,
  } = useChallengeRunQuiz(challengeId, true)

  React.useEffect(() => {
    if (!finished) return
    navigatorManager.goToChallengeFinishedScore({
      score: finished.score,
      total: finished.total,
    })
  }, [finished])

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

  const handleContinue = async () => {
    if (!canContinue) return
    const next = step + 1
    if (next < questions.length) doSlide(next)
    await onContinue()
  }

  if (loading) {
    return (
      <View
        style={[
          styles.loadingContainer,
          { backgroundColor: topicColor || '#0b0b0c' },
        ]}
      >
        <ActivityIndicator />
      </View>
    )
  }

  if (!challenge || questions.length === 0) {
    return <EmptyContainer />
  }

  return (
    <Container style={styles.container}>
      <ChallengeRunClose onConfirm={forceFinish} />

      <View style={styles.headerRow}>
        <Text variant="xxLarge">{challenge.title}</Text>
        <View style={styles.dotsRow}>
          {questions.map((q, i) => (
            <StepDot
              key={`${i}-${q.question}`}
              active={i === step}
              styles={styles}
              theme={theme}
              questionsLength={questions.length}
            />
          ))}
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
      >
        <View style={styles.slideWrapper}>
          <Animated.View
            style={{
              width: screenWidth * questions.length,
              ...styles.animatedRow,
              transform: [{ translateX: slideX }],
            }}
          >
            {questions.map((q, idx) => (
              <View
                key={`${idx}-${q.question}`}
                style={[styles.questionContainer, { width: screenWidth }]}
              >
                <Text
                  style={styles.questionHeader}
                  variant="medium"
                >{`${t('challengeRunQuiz.question')} ${idx + 1}/${questions.length}`}</Text>
                <Text variant="large" style={styles.questionText}>
                  {q.question}
                </Text>
                <View style={styles.optionsContainer}>
                  {q.options.map((opt, oi) => {
                    const selected = currentChoice === oi
                    const isCorrect = opt.correct
                    const border = selected
                      ? isCorrect
                        ? theme.colors.accentBlue
                        : theme.colors.accentRed
                      : theme.colors.borderColor

                    const revealExplanations =
                      (firstChoiceByIndex?.[step] ?? null) !== null

                    return (
                      <View key={`${idx}-${oi}-${opt.text}`}>
                        <TouchableOpacity
                          onPress={() => onSelect(oi)}
                          style={[styles.option, { borderColor: border }]}
                        >
                          <Text variant="large">{opt.text}</Text>
                        </TouchableOpacity>
                        {revealExplanations && (
                          <Text variant="medium" style={{ margin: 4 }}>
                            {opt.explanation}
                          </Text>
                        )}
                      </View>
                    )
                  })}
                </View>
              </View>
            ))}
          </Animated.View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title={
            isLast
              ? t('challengeRunQuiz.button.finish')
              : t('challengeRunQuiz.button.continue')
          }
          onPress={handleContinue}
          disabled={!canContinue}
          background={color}
          style={styles.continueButton}
        />
      </View>
    </Container>
  )
}

export default ChallengeRunQuizScreen

const createStyles = (theme: any, color?: string) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: color || theme.colors.accentRed,
      paddingTop: 50,
    },
    loadingContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    unavailableContainer: { flex: 1, padding: 16 },
    unavailableText: { color: theme.colors.textPrimary },
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
    stepDot: { height: 6, borderRadius: 5, marginHorizontal: 4 },
    finishedContainer: {
      flex: 1,
      paddingHorizontal: 16,
      justifyContent: 'center',
    },
    finishedTitle: {
      color: 'white',
      fontSize: 22,
      fontWeight: '800',
      textAlign: 'center',
      marginBottom: 12,
    },
    finishedResult: { color: '#e5e7eb', textAlign: 'center' },
    scrollView: { flex: 1 },
    contentContainer: { paddingBottom: 24 },
    animatedRow: { flexDirection: 'row' },
    slideWrapper: { width: '100%', overflow: 'hidden' },
    questionContainer: { paddingHorizontal: 16 },
    questionHeader: { marginVertical: 12 },
    questionText: { marginBottom: 12 },
    optionsContainer: { gap: 10, marginTop: 24 },
    option: { borderWidth: 2, borderRadius: 16, padding: 12 },
    optionText: { color: 'white' },
    footer: { paddingHorizontal: 16, paddingBottom: 16 },
    finishedButtonText: { color: 'white', fontWeight: '700' },
    continueButton: {
      borderRadius: 10,
      paddingVertical: 14,
      alignSelf: 'center',
    },
    continueButtonText: { color: 'white', fontWeight: '700' },
  })
