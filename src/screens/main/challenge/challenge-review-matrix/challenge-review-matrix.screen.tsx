import { useTheme } from '@/hooks/use-theme'
import useTrackTopicSession from '@/hooks/use-track-topic-session'
import { t } from '@/locales/translation'

import { Text } from '@/components'
import { RootStackParamList } from '@/navigation/navigatorManager'
import { useThemeStore } from '@/store/theme.store'
import { ThemeType } from '@/types/theme.type'
import { RouteProp, useRoute } from '@react-navigation/native'
import React from 'react'
import { Dimensions, ScrollView, StyleSheet, View } from 'react-native'
import ChallengeReviewHeader from '../components/challenge-review-header'
import useChallengeReviewMatrix from './challenge-review-matrix.hook'

const ChallengeReviewMatrixScreen: React.FC = () => {
  const route =
    useRoute<RouteProp<RootStackParamList, 'ChallengeReviewMatrixScreen'>>()
  const challengeId = (route.params as any)?.challengeId as string

  const { challenge, topicId, attempt, foundCells, dateStr } =
    useChallengeReviewMatrix(challengeId)

  useTrackTopicSession(topicId, 'challenge', challenge?.id)

  const theme = useTheme()
  const color = useThemeStore((s) => s.colorLevelUp.background_color)
  const styles = createStyles(theme, color)

  if (!challenge || !attempt) {
    return (
      <View style={styles.containerEmpty}>
        <Text style={styles.emptyText}>
          {t('challengeReviewMatrix.noData')}
        </Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <ChallengeReviewHeader
        challengeType="matrix"
        challengeDate={dateStr}
        score={attempt.score}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
      >
        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12 }}>
          {attempt.found.map((w) => (
            <Text key={w} variant="large">
              {t('challengeReviewMatrix.foundPrefix', { word: w })}
            </Text>
          ))}
        </View>
        <Text style={styles.questionText} variant="large">
          {attempt.question}
        </Text>

        <View style={styles.gridWrapper}>
          {Array.isArray(attempt.grid) && attempt.grid.length > 0 ? (
            attempt.grid.map((row, ri) => {
              const rowKey = Array.isArray(row)
                ? row.join('')
                : String(row || '')
              const rowArr: string[] = Array.isArray(row)
                ? row
                : row
                  ? String(row).split('')
                  : []
              return (
                <View key={`${rowKey}-${ri}`} style={styles.row}>
                  {rowArr.map((ch, ci) => {
                    const isFound = foundCells.has(`${ri},${ci}`)
                    return (
                      <View
                        key={`${ch}-${ri}-${ci}`}
                        style={[styles.cell, isFound && styles.cellFound]}
                      >
                        <Text style={styles.cellText}>{ch}</Text>
                      </View>
                    )
                  })}
                </View>
              )
            })
          ) : (
            <Text style={styles.gridUnavailable}>
              {t('challengeReviewMatrix.gridUnavailable')}
            </Text>
          )}
        </View>
      </ScrollView>
    </View>
  )
}

export default ChallengeReviewMatrixScreen

const createStyles = (theme: ThemeType, color: string) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: color,
    },
    containerEmpty: {
      flex: 1,
      backgroundColor: '#0b0b0c',
      padding: 16,
    },
    emptyText: { color: 'white' },
    scrollView: { flex: 1 },
    contentContainer: { padding: 16 },
    questionText: { marginBottom: 12 },
    gridWrapper: { alignItems: 'center' },
    row: { flexDirection: 'row' },
    cell: {
      width: Dimensions.get('window').width / 12,
      height: Dimensions.get('window').width / 12,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 0.5,
      borderColor: '#2B2C30',
      backgroundColor: 'transparent',
    },
    cellFound: {
      borderColor: theme.colors.black,
      backgroundColor: theme.colors.accentPurple,
    },
    cellText: { color: 'white' },
    gridUnavailable: { color: '#9ca3af' },
    spacer: { height: 12 },
  })
