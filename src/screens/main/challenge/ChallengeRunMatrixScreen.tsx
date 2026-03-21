import { Container, Text } from '@/components'
import EmptyContainer from '@/components/containers/empty-container/EmptyContainer'
import LoadingContainer from '@/components/containers/loading-container/LoadingContainer'
import useChallengeMatrix from '@/hooks/use-challenge-matrix'
import { useTheme } from '@/hooks/use-theme'
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
import ChallengeRunClose from './components/ChallengeRunClose'

const ChallengeRunMatrixScreen: React.FC = () => {
  const theme = useTheme()
  const styles = createStyles(theme)

  const color = useThemeStore((s) => s.colorLevelUp.background_color)
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
    panHandlers,
    forceFinish,
    foundCellsMemo,
    allWordCellsMemo,
    currentPath,
    setGridAvailH,
  } = useChallengeMatrix(challengeId)

  const { setLoadingOverlay } = useOverlay()

  useEffect(() => {
    // overlay só durante loading inicial
    setLoadingOverlay(loading, 'ChallengeRunMatrixScreen')
  }, [loading, setLoadingOverlay])

  useEffect(() => {
    if (!finished) return
    navigatorManager.goToChallengeFinishedScore({
      score: finished.score,
      total: finished.total,
    })
  }, [finished])

  if (loading) {
    return <LoadingContainer screenName="Matrix Challenge" />
  }

  if (!challenge) {
    return <EmptyContainer />
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

        {/* Wrapper só mede altura */}
        <View
          style={styles.gridWrapper}
          onLayout={(e) => setGridAvailH(e.nativeEvent.layout.height)}
        >
          {gridRows > 0 && (
            <View
              ref={(r) => {
                gridRef.current = r
              }}
              {...panHandlers} // ✅ somente aqui
              style={[
                styles.gridBoard,
                { width: cellSize * 10, height: cellSize * gridRows },
              ]}
            >
              {/* DEBUG path overlay */}
              {currentPath.map((p, idx) => (
                <View
                  key={`dbg-${p.r}-${p.c}-${idx}`}
                  style={{
                    position: 'absolute',
                    left: p.c * cellSize,
                    top: p.r * cellSize,
                    width: cellSize,
                    height: cellSize,
                    backgroundColor: 'rgba(99,102,241,0.35)',
                    borderWidth: 1,
                    borderColor: 'rgba(99,102,241,0.8)',
                  }}
                />
              ))}

              {grid.map((row, rIdx) => {
                const rowKey = row.join('') || `row-${rIdx}`
                return (
                  <View key={rowKey} style={styles.row}>
                    {row.map((ch, cIdx) => {
                      const inPath = currentPath.some(
                        (p) => p.r === rIdx && p.c === cIdx,
                      )
                      const isFoundCell = foundCellsMemo.has(`${rIdx},${cIdx}`)
                      const bg =
                        isFoundCell || inPath
                          ? theme.colors.backgroundTertiary
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
                            style={
                              allWordCellsMemo.has(`${rIdx},${cIdx}`)
                                ? styles.cellUnderline
                                : undefined
                            }
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
      position: 'relative',
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
  })
