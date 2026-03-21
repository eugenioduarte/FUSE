import { useTheme } from '@/hooks/useTheme'
import useTrackTopicSession from '@/hooks/useTrackTopicSession'
import { t } from '@/locales/translation'
import { RootStackParamList } from '@/navigation/navigatorManager'
import { useThemeStore } from '@/store/useThemeStore'
import { ThemeType } from '@/types/theme.type'
import { RouteProp, useRoute } from '@react-navigation/native'
import React from 'react'
import { ScrollView, StyleSheet, View } from 'react-native'

import { Text } from '@/components'
import EmptyContainer from '@/components/containers/empty-container/EmptyContainer'
import ChallengeReviewHeader from '../components/ChallengeReviewHeader'
import useChallengeReviewHangman from './useChallengeReviewHangman'

const ChallengeReviewHangmanScreen: React.FC = () => {
  const route =
    useRoute<RouteProp<RootStackParamList, 'ChallengeReviewHangmanScreen'>>()
  const challengeId = (route.params as any)?.challengeId as string

  const { challenge, topicId, attempt } = useChallengeReviewHangman(challengeId)

  const theme = useTheme()
  const color = useThemeStore((s) => s.colorLevelUp.background_color)
  const styles = createStyles(theme, color)

  useTrackTopicSession(topicId, 'challenge', challenge?.id)

  if (!challenge || !attempt) return <EmptyContainer />

  return (
    <View style={styles.container}>
      <ChallengeReviewHeader
        challengeType="hangman"
        challengeDate={attempt.at}
        score={`${attempt.score}/${attempt.total}`}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {attempt.rounds.map((r, ri) => (
          <View key={`${ri}-${r.word}`} style={styles.itemContainer}>
            <Text variant="large">
              {t('challengeReviewHangman.round', {
                current: ri + 1,
                total: attempt.rounds.length,
              })}
            </Text>
            <Text style={styles.questionText} variant="medium">
              {r.word}
            </Text>
            <View style={styles.explanationContainer}>
              <Text style={styles.explanationText}>
                {r.success
                  ? t('challengeReviewHangman.correct')
                  : t('challengeReviewHangman.wrong')}
              </Text>
            </View>
          </View>
        ))}
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

export default ChallengeReviewHangmanScreen
