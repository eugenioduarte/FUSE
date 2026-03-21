import { Button, Text } from '@/components'
import EmptyContainer from '@/components/containers/empty-container/EmptyContainer'
import LoadingContainer from '@/components/containers/loading-container/LoadingContainer'
import StepDot from '@/components/step-dot/StepDot'
import { useTheme } from '@/hooks/useTheme'
import { t } from '@/locales/translation'
import {
  navigatorManager,
  RootStackParamList,
} from '@/navigation/navigatorManager'
import { useThemeStore } from '@/store/useThemeStore'
import { ThemeType } from '@/types/theme.type'
import { RouteProp, useRoute } from '@react-navigation/native'
import React from 'react'
import {
  Animated,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native'
import ChallengeRunClose from './components/ChallengeRunClose'
import useChallengeRunHangman from './hooks/useChallengeRunHangman'
const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')

const ChallengeRunHangmanScreen: React.FC = () => {
  const theme = useTheme()
  const color = useThemeStore((s) => s.colorLevelUp.background_color)
  const styles = createStyles(theme, color)

  const route =
    useRoute<RouteProp<RootStackParamList, 'ChallengeRunHangmanScreen'>>()
  const challengeId = route.params?.challengeId!

  const {
    challenge,
    rounds,
    step,
    loading,
    letters,
    wrongs,
    maxWrongs,
    canContinue,
    isLast,
    screenWidth,
    slideX,
    onGuess,
    onContinue,
    forceFinish,
    finished,
  } = useChallengeRunHangman(challengeId)

  React.useEffect(() => {
    if (!finished) return
    navigatorManager.goToChallengeFinishedScore({
      score: finished.score,
      total: finished.total,
    })
  }, [finished])

  if (loading) {
    return <LoadingContainer screenName={'Hangman'} />
  }

  if (!challenge || rounds.length === 0) {
    return <EmptyContainer />
  }

  return (
    <View style={styles.container}>
      <ChallengeRunClose onConfirm={forceFinish} />

      <View style={styles.headerRow}>
        <Text variant="xxLarge">{challenge.title}</Text>
        <View style={styles.dotsRow}>
          {rounds.map((r, i) => (
            <StepDot key={`${i}-${r.word}`} active={i === step} />
          ))}
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
      >
        <View style={styles.list}>
          <Animated.View
            style={[
              styles.animatedRow,
              {
                width: screenWidth * rounds.length,
                transform: [{ translateX: slideX }],
              },
            ]}
          >
            {rounds.map((r, idx) => (
              <View
                key={`${idx}-${r.word}`}
                style={[styles.roundContainer, { width: screenWidth }]}
              >
                <Text style={styles.questionHeader} variant="xLarge">
                  {idx === step
                    ? rounds[step]?.question
                    : t('challengeRunHangman.placeholder_dash')}
                </Text>

                <View style={styles.letterBox}>
                  <View style={styles.lettersRow}>
                    {r.word.split('').map((letter, letterIndex) => {
                      const isCurrentRound = idx === step
                      const upperLetter = letter.toUpperCase()

                      const shouldReveal =
                        isCurrentRound && letters.has(upperLetter)

                      return (
                        <View
                          key={`${letter}-${letterIndex}`}
                          style={styles.letterCell}
                        >
                          <Text variant="large">
                            {shouldReveal ? upperLetter : ''}
                          </Text>
                        </View>
                      )
                    })}
                  </View>

                  <Text variant="large" style={styles.attemptsText}>
                    {t('challengeRunHangman.attempts_label')}{' '}
                    {idx === step ? maxWrongs - wrongs : maxWrongs}
                  </Text>
                </View>

                {idx === step && (
                  <View style={styles.alphabetContainer}>
                    {ALPHABET.map((ch) => {
                      const pressed = letters.has(ch)
                      return (
                        <TouchableOpacity
                          key={ch}
                          disabled={pressed || canContinue}
                          onPress={() => onGuess(ch)}
                          style={[
                            styles.letterButton,
                            { opacity: pressed || canContinue ? 0.4 : 1 },
                          ]}
                        >
                          <Text variant="large" style={styles.letterButtonText}>
                            {ch}
                          </Text>
                        </TouchableOpacity>
                      )
                    })}
                  </View>
                )}
              </View>
            ))}
          </Animated.View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title={
            isLast && canContinue
              ? t('challengeRunHangman.button.finish')
              : t('challengeRunHangman.button.continue')
          }
          onPress={onContinue}
          disabled={!canContinue}
          background={theme.colors.backgroundTertiary}
          style={styles.continueButton}
        />
      </View>
    </View>
  )
}

export default ChallengeRunHangmanScreen

const createStyles = (theme: ThemeType, color?: string) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: color },
    headerRow: {
      marginTop: theme.spacings.xLarge * 2,
      marginBottom: theme.spacings.large,
      justifyContent: 'center',
      alignItems: 'center',
      gap: theme.spacings.medium,
    },
    dotsRow: { flexDirection: 'row' },

    scrollView: { flex: 1 },
    list: { width: '100%', overflow: 'hidden' },
    contentContainer: { paddingBottom: theme.spacings.large },
    animatedRow: { flexDirection: 'row' },
    roundContainer: { paddingHorizontal: theme.spacings.medium },
    questionHeader: {
      marginBottom: theme.spacings.medium,
      textAlign: 'center',
    },

    letterBox: {
      padding: theme.spacings.medium,
      alignItems: 'center',
      marginBottom: theme.spacings.xMedium,
    },
    lettersRow: {
      flexDirection: 'row',
      justifyContent: 'center',
      flexWrap: 'wrap',
      gap: theme.spacings.small,
    },
    letterCell: {
      width: 40,
      height: 40,
      borderRadius: 6,
      borderWidth: 2,
      borderColor: theme.colors.borderColor,
      justifyContent: 'center',
      alignItems: 'center',
      margin: 4,
    },
    attemptsText: { marginVertical: theme.spacings.medium },

    alphabetContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: theme.spacings.xSmall,
      alignItems: 'center',
      justifyContent: 'center',
    },
    letterButton: {
      width: 40,
      height: 40,
      borderRadius: theme.spacings.small,
      backgroundColor: theme.colors.black,
      alignItems: 'center',
      justifyContent: 'center',
    },
    letterButtonText: { color: theme.colors.backgroundTertiary },

    footer: {
      paddingHorizontal: theme.spacings.medium,
      paddingBottom: theme.spacings.medium,
    },

    continueButton: {
      alignSelf: 'center',
      marginBottom: theme.spacings.xLarge,
    },
  })
