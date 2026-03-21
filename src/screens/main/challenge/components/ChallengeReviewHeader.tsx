import { Text } from '@/components'
import { useTheme } from '@/hooks/use-theme'
import { t } from '@/locales/translation'
import { ThemeType } from '@/types/theme.type'
import { format } from 'date-fns'
import React from 'react'
import { StyleSheet, View } from 'react-native'

enum challengeTypesMap {
  quiz = 'Quiz',
  flashcards = 'Flashcards',
  coding = 'Coding',
  hangman = 'Hangman',
  text_answer = 'Resposta de Texto',
  matrix = 'Matriz',
}

type ChallengeReviewHeaderProps = {
  challengeType: keyof typeof challengeTypesMap
  // Accept either a timestamp (number) or a pre-formatted date string
  challengeDate: number | string
  score: string | number
}

const formatDate = (ts: number) => format(ts, 'dd-MM-yyyy')

const ChallengeReviewHeader: React.FC<ChallengeReviewHeaderProps> = ({
  challengeType,
  challengeDate,
  score,
}) => {
  const theme = useTheme()
  const styles = createStyles(theme)

  const dateDisplay =
    typeof challengeDate === 'number'
      ? formatDate(challengeDate)
      : String(challengeDate)

  return (
    <View style={styles.header}>
      <Text variant="large">{challengeTypesMap[challengeType]}</Text>
      <Text variant="large">
        {t('challengeReview.header.date', { date: dateDisplay })}
      </Text>
      <Text variant="large">
        {t('challengeReview.header.total', { score })}
      </Text>
    </View>
  )
}

export default ChallengeReviewHeader

const createStyles = (theme: ThemeType) =>
  StyleSheet.create({
    header: {
      paddingHorizontal: theme.spacings.medium,
      paddingTop: theme.spacings.medium,
      paddingBottom: theme.spacings.small,
      justifyContent: 'flex-start',
      alignItems: 'flex-start',
    },
  })
