import { Button, Container, Text } from '@/components'
import { useTheme } from '@/hooks/use-theme'
import { t } from '@/locales/translation'
import {
  RootStackParamList,
  navigatorManager,
} from '@/navigation/navigator-manager'
import { useThemeStore } from '@/store/theme.store'
import { ThemeType } from '@/types/theme.type'
import { RouteProp, useRoute } from '@react-navigation/native'
import React from 'react'
import { BackHandler, StyleSheet, View } from 'react-native'

const ChallengeFinishedScoreScreen: React.FC = () => {
  const route =
    useRoute<RouteProp<RootStackParamList, 'ChallengeFinishedScoreScreen'>>()
  const score = route.params?.score ?? 0
  const total = route.params?.total ?? 0
  const summaryId = route.params?.summaryId

  const theme = useTheme()
  const color = useThemeStore((s) => s.colorLevelUp.background_color)
  const styles = createStyles(theme, color)

  const handleBack = () => {
    if (summaryId) {
      navigatorManager.goToSummaryDetails(summaryId)
    } else {
      navigatorManager.goToChallengesList()
    }
  }

  React.useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      handleBack()
      return true
    })
    return () => sub.remove()
  }, [summaryId])

  const percentage = total > 0 ? Math.round((score / total) * 100) : 0

  return (
    <Container style={styles.container}>
      <View style={styles.content}>
        <View style={styles.scoreCard}>
          <Text variant="xxLarge" style={styles.scoreFraction}>
            {score}/{total}
          </Text>
          <Text variant="xLarge" style={styles.scorePercent}>
            {percentage}%
          </Text>
        </View>
      </View>

      <View style={styles.footer}>
        <Button
          title={t('common.goBack')}
          onPress={handleBack}
          background={theme.colors.backgroundTertiary}
          style={styles.button}
        />
      </View>
    </Container>
  )
}

export default ChallengeFinishedScoreScreen

const createStyles = (theme: ThemeType, color: string) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: color,
      paddingTop: theme.spacings.large,
    },
    content: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: theme.spacings.medium,
      gap: theme.spacings.large,
    },
    scoreCard: {
      width: 180,
      height: 180,
      borderRadius: 90,
      borderWidth: theme.border.size,
      borderColor: theme.colors.borderColor,
      backgroundColor: theme.colors.black,
      alignItems: 'center',
      justifyContent: 'center',
      gap: theme.spacings.xSmall,
    },
    scoreFraction: {
      color: theme.colors.backgroundTertiary,
      fontWeight: '800',
    },
    scorePercent: {
      color: theme.colors.backgroundTertiary,
      opacity: 0.7,
    },
    footer: {
      paddingHorizontal: theme.spacings.medium,
      paddingBottom: theme.spacings.xLarge,
    },
    button: {
      alignSelf: 'center',
    },
  })
