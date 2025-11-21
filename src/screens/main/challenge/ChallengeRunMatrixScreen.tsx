import { Container, Text } from '@/components'
import useChallengeMatrix from '@/hooks/useChallengeMatrix'
import { useTheme } from '@/hooks/useTheme'
import {
  RootStackParamList,
  navigatorManager,
} from '@/navigation/navigatorManager'
import { useOverlay } from '@/store/useOverlay'
import { useThemeStore } from '@/store/useThemeStore'
import { ThemeType } from '@/types/theme.type'
import { RouteProp, useRoute } from '@react-navigation/native'
import React, { useEffect } from 'react'
import { StyleSheet, View } from 'react-native'
import ChallengeErrorDisplay from './components/ChallengeErrorDisplay'
import ChallengeRunClose from './components/ChallengeRunClose'

const ChallengeRunMatrixScreen: React.FC = () => {
  const theme = useTheme()
  const styles = createStyles(theme)
  const color = useThemeStore((s) => s.colorLevelUp.level_eight)
  const setBackgroundColor = useThemeStore((state) => state.setBackgroundColor)
  useEffect(() => {
    setBackgroundColor(color)
  }, [color, setBackgroundColor])
  const route =
    useRoute<RouteProp<RootStackParamList, 'ChallengeRunMatrixScreen'>>()
  const challengeId = route.params?.challengeId!

  const {
    loading,
    challenge,
    question,
    grid,
    timer,
    finished,
    cellSize,
    gridRows,
    gridRef,
    onGridMeasure,
    panHandlers,
    forceFinish,
    foundCellsMemo,
    allWordCellsMemo,
    currentPath,
    setGridAvailH,
  } = useChallengeMatrix(challengeId)

  const { setLoadingOverlay } = useOverlay()

  // Keep global loading overlay visible not only while the hook-level `loading`
  // flag is true, but also while the grid hasn't been laid out and computed
  // (gridRows === 0). Otherwise we may hide the overlay too early and show
  // an empty screen for a short moment before the matrix renders.
  React.useEffect(() => {
    const show = loading || gridRows === 0
    setLoadingOverlay(show, 'ChallengeRunMatrixScreen')
  }, [loading, gridRows, setLoadingOverlay])

  React.useEffect(() => {
    if (!finished) return
    navigatorManager.goToChallengeFinishedScore({
      score: finished.score,
      total: finished.total,
    })
  }, [finished])

  if (!challenge) {
    return <ChallengeErrorDisplay />
  }

  return (
    <Container style={[styles.container, { backgroundColor: color }]}>
      <ChallengeRunClose onConfirm={forceFinish} />

      <View style={styles.headerRow}>
        <Text variant="xxLarge">{challenge.title}</Text>
        <Text variant="xLarge">{timer}s</Text>
      </View>

      <View style={styles.content}>
        <Text variant="xLarge" style={styles.question}>
          {question}
        </Text>

        <View
          style={styles.gridWrapper}
          onLayout={(e) => setGridAvailH(e.nativeEvent.layout.height)}
        >
          {gridRows > 0 && (
            <View
              ref={(r) => {
                gridRef.current = r
              }}
              onLayout={onGridMeasure}
              onStartShouldSetResponderCapture={() => true}
              onResponderTerminationRequest={() => false}
              {...panHandlers}
              style={[
                styles.gridBoard,
                { width: cellSize * 10, height: cellSize * gridRows },
              ]}
            >
              {grid.map((row, rIdx) => {
                const rowKey = row.join('') || `row-${rIdx}`
                return (
                  <View key={rowKey} style={styles.row}>
                    {row.map((ch, cIdx) => {
                      const inPath = currentPath.some(
                        (p) => p.r === rIdx && p.c === cIdx,
                      )
                      const isFoundCell = foundCellsMemo.has(`${rIdx},${cIdx}`)
                      const bg = isFoundCell
                        ? theme.colors.accentGreen
                        : inPath
                          ? theme.colors.accentGreen
                          : 'transparent'

                      const cellKey = `${ch}-${rIdx}-${cIdx}`
                      return (
                        <View
                          key={cellKey}
                          style={[
                            styles.cell,
                            {
                              width: cellSize,
                              height: cellSize,
                              backgroundColor: bg,
                            },
                          ]}
                        >
                          <Text
                            variant="large"
                            style={[
                              allWordCellsMemo.has(`${rIdx},${cIdx}`)
                                ? styles.cellUnderline
                                : undefined,
                            ]}
                          >
                            {ch}
                          </Text>
                        </View>
                      )
                    })}
                  </View>
                )
              })}
            </View>
          )}
        </View>
      </View>
    </Container>
  )
}

export default ChallengeRunMatrixScreen

const createStyles = (theme: ThemeType) =>
  StyleSheet.create({
    container: {
      flex: 1,
      paddingTop: theme.spacings.large,
    },
    headerRow: {
      paddingHorizontal: theme.spacings.medium,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: theme.spacings.xLarge,
    },
    content: {
      flex: 1,
      paddingHorizontal: theme.spacings.medium,
      paddingBottom: theme.spacings.medium,
    },
    question: {
      marginVertical: theme.spacings.medium,
    },
    gridWrapper: {
      flex: 1,
      alignItems: 'flex-start',
      justifyContent: 'flex-start',
    },
    gridBoard: {
      borderColor: theme.colors.borderColor,
      borderWidth: theme.border.size,
      borderRadius: theme.spacings.small,
      overflow: 'hidden',
    },
    row: { flexDirection: 'row' },
    cell: {
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
    },
    cellUnderline: {
      textDecorationLine: 'underline',
    },

    list: { width: '100%', paddingTop: theme.spacings.medium },
    contentContainer: { paddingBottom: 100 },
    emptyContainer: { padding: theme.spacings.medium },
    emptyText: { color: theme.colors.textPrimary },
    button: {
      alignSelf: 'center',
      position: 'absolute',
      bottom: theme.spacings.large,
    },
  })
