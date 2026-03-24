import { useTheme } from '@/hooks/use-theme'
import useTrackTopicSession from '@/hooks/use-track-topic-session'
import { t } from '@/locales/translation'
import { RootStackParamList } from '@/navigation/navigator-manager'
import { useThemeStore } from '@/store/theme.store'
import { ThemeType } from '@/types/theme.type'
import { RouteProp, useRoute } from '@react-navigation/native'
import React from 'react'
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native'

import { Text } from '@/components'
import EmptyContainer from '@/components/containers/empty-container/empty-container'
import ChallengeReviewHeader from '../components/challenge-review-header'
import useChallengeReviewQuiz from './challenge-review-quiz.hook'

const ChallengeReviewQuizScreen: React.FC = () => {
  const route =
    useRoute<RouteProp<RootStackParamList, 'ChallengeReviewQuizScreen'>>()
  const challengeId = (route.params as any)?.challengeId as string

  const { challenge, topicId, attempt, explainIdxByQ, handleOptionPress } =
    useChallengeReviewQuiz(challengeId)

  const theme = useTheme()
  const color = useThemeStore((s) => s.colorLevelUp.background_color)
  const styles = createStyles(theme, color)

  useTrackTopicSession(topicId, 'challenge', challenge?.id)

  if (!challenge || !attempt) {
    return <EmptyContainer />
  }

  return (
    <View style={styles.container}>
      <ChallengeReviewHeader
        challengeType="quiz"
        challengeDate={attempt.at}
        score={`${attempt.score}/${attempt.total}`}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {attempt.questions.map((q, qi) => (
          <View key={`${qi}-${q.question}`} style={styles.itemContainer}>
            <Text variant="large">
              {t('challengeRunQuiz.question')}{' '}
              {`${qi + 1}/${attempt.questions.length}`}
            </Text>
            <Text style={styles.questionText} variant="medium">
              {q.question}
            </Text>
            {explainIdxByQ[qi] != null && (
              <View style={styles.explanationContainer}>
                <Text style={styles.explanationLabel}>
                  {t('challengeReviewQuiz.explanation')}
                </Text>
                <Text style={styles.explanationText}>
                  {q.options[explainIdxByQ[qi]!]?.explanation || ''}
                </Text>
              </View>
            )}
            <View style={styles.optionsWrapper}>
              {q.options.map((opt, oi) => {
                const isUser = q.choice === oi
                const isCorrect = opt.correct
                const bg = isCorrect
                  ? theme.colors.accentGreen
                  : isUser
                    ? theme.colors.accentPink
                    : 'transparent'
                return (
                  <TouchableOpacity
                    onPress={() => handleOptionPress(qi, oi)}
                    key={`${qi}-${oi}-${opt.text}`}
                    style={[
                      styles.option,
                      {
                        backgroundColor: bg,
                        borderColor: theme.colors.borderColor,
                      },
                    ]}
                  >
                    <Text variant={isCorrect ? 'large' : 'medium'}>
                      {opt.text}
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

const createStyles = (theme: ThemeType, color: string) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: color,
    },
    scrollView: { flex: 1 },
    contentContainer: {
      paddingVertical: theme.spacings.medium,
      paddingHorizontal: theme.spacings.small,
    },
    itemContainer: {
      borderBottomColor: theme.colors.borderColor,
      borderBottomWidth: 1,
      borderRadius: theme.border.radius12,
      padding: theme.spacings.xMedium,
      marginBottom: theme.spacings.xMedium,
    },
    questionText: { marginBottom: theme.spacings.xMedium },
    explanationContainer: {
      backgroundColor: theme.colors.black,
      borderWidth: 1,
      borderRadius: theme.border.radius8,
      padding: theme.spacings.xMedium,
      marginBottom: theme.spacings.xMedium,
    },
    explanationLabel: {
      marginBottom: theme.spacings.small,
      color: theme.colors.white,
    },
    explanationText: { color: theme.colors.white },
    optionsWrapper: { gap: theme.spacings.xMedium },
    option: {
      borderWidth: 1,
      borderRadius: theme.border.radius12,
      padding: theme.spacings.xMedium,
    },
  })
