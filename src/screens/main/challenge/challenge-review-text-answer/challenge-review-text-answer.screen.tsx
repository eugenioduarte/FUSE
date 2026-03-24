import { RootStackParamList } from '@/navigation/navigatorManager'
import { RouteProp, useRoute } from '@react-navigation/native'
import React from 'react'
import { ScrollView, StyleSheet, View } from 'react-native'

import { Text } from '@/components'
import EmptyContainer from '@/components/containers/empty-container/empty-container'
import { useTheme } from '@/hooks/use-theme'
import { t } from '@/locales/translation'
import { useThemeStore } from '@/store/theme.store'
import { ThemeType } from '@/types/theme.type'
import ChallengeReviewHeader from '../components/challenge-review-header'
import useChallengeReviewTextAnswer from './challenge-review-text-answer.hook'

const ChallengeReviewTextAnswerScreen: React.FC = () => {
  const route =
    useRoute<RouteProp<RootStackParamList, 'ChallengeReviewTextAnswerScreen'>>()
  const challengeId = route.params?.challengeId!
  const { challenge, exercises, lastAttempt } =
    useChallengeReviewTextAnswer(challengeId)

  const theme = useTheme()
  const color = useThemeStore((s) => s.colorLevelUp.background_color)
  const styles = createStyles(theme, color)

  if (!challenge) return <EmptyContainer />

  return (
    <View style={styles.container}>
      <ChallengeReviewHeader
        challengeType="text_answer"
        challengeDate={lastAttempt ? lastAttempt.at : Date.now()}
        score={
          lastAttempt ? `${Number(lastAttempt.score).toFixed(1)}/10` : '0/10'
        }
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {exercises.length === 0 ? (
          <Text variant="large">{t('challengeReviewText.no_answers')}</Text>
        ) : (
          exercises.map((it: any, idx: number) => (
            <View key={`ex-${idx}-${it.question}`} style={styles.itemContainer}>
              <Text
                variant="large"
                style={styles.title}
              >{`${t('challengeReviewText.exercise')} ${idx + 1}`}</Text>
              <Text style={styles.questionText} variant="medium">
                {it.question}
              </Text>
              <Text variant="large" style={styles.title}>
                {t('challengeReviewText.your_answer')}
              </Text>
              <Text style={styles.explanationText}>{it.userAnswer || '—'}</Text>
              <Text variant="large" style={styles.title}>
                {t('challengeReviewText.correct_answer')}
              </Text>
              <Text style={styles.explanationText}>{it.correctAnswer}</Text>
              <Text variant="large" style={styles.title}>
                {t('challengeReviewText.score')} {it.score}/10
              </Text>
              {!!it.feedback && (
                <Text style={styles.explanationText}>{it.feedback}</Text>
              )}
            </View>
          ))
        )}
      </ScrollView>
    </View>
  )
}

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
      paddingBottom: theme.spacings.xLarge,
    },
    itemContainer: {
      borderBottomColor: theme.colors.borderColor,
      borderBottomWidth: 1,
      borderRadius: theme.border.radius12,
      padding: theme.spacings.xMedium,
      marginBottom: theme.spacings.xMedium,
      backgroundColor: theme.colors.black,
    },
    questionText: {
      marginBottom: theme.spacings.small,
      color: theme.colors.white,
    },
    explanationContainer: {
      backgroundColor: theme.colors.black,
      borderWidth: 1,
      borderRadius: theme.border.radius8,
      padding: theme.spacings.xMedium,
      marginBottom: theme.spacings.xMedium,
    },
    explanationLabel: {
      marginTop: theme.spacings.small,
      marginBottom: theme.spacings.xSmall,
      color: theme.colors.white,
      fontWeight: '700',
    },
    explanationText: {
      color: theme.colors.white,
      marginBottom: theme.spacings.small,
    },
    title: {
      marginVertical: theme.spacings.small,
      color: theme.colors.white,
    },
  })

export default ChallengeReviewTextAnswerScreen
