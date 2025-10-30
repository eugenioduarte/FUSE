import { PlusIcon } from '@/assets/icons'
import { Text } from '@/components'
import { useTheme } from '@/hooks/useTheme'
import { ThemeType } from '@/types/theme.type'
import React from 'react'
import { StyleSheet, TouchableOpacity, View } from 'react-native'
import { navigatorManager } from '../../../../navigation/navigatorManager'
import { Challenge, Summary, Topic } from '../../../../types/domain'
import ChallengeRow from './ChallengeRow'
import SummaryItem from './SummaryItem'
import TopicRow from './TopicRow'

const TopicBlock = ({
  topic,
  summariesForTopic,
  challengesBySummary,
  challengeDetailsById,
  expandedTopicId,
  expandedSummaryId,
  toggleTopicInline,
  toggleSummaryInline,
  enterChallengeDetails,
  setFastWayOverlay,
}: {
  topic: Topic
  summariesForTopic: Summary[]
  challengesBySummary: Record<string, { id: string; title: string }[]>
  challengeDetailsById: Record<string, Challenge>
  expandedTopicId: string | null
  expandedSummaryId: string | null
  toggleTopicInline: (id: string) => void
  toggleSummaryInline: (id: string) => void
  enterChallengeDetails: (id: string) => void
  setFastWayOverlay: (v: boolean) => void
}) => {
  const theme = useTheme()
  const styles = createStyles(theme)
  return (
    <View key={topic.id} style={styles.topicBlock}>
      <TopicRow
        topic={topic}
        onSelect={toggleTopicInline}
        onGoToTopic={(topicId) => {
          setFastWayOverlay(false)
          navigatorManager.goToTopicDetails(topicId)
        }}
      />
      {expandedTopicId === topic.id && (
        <View style={styles.summaryList}>
          {summariesForTopic.length === 0 ? (
            <Text style={styles.emptyText}>Sem summaries para este topic.</Text>
          ) : (
            <View>
              {summariesForTopic.map((s) => (
                <View key={s.id}>
                  <SummaryItem
                    summary={s}
                    onPress={() => toggleSummaryInline(s.id)}
                    onGoToSummary={(summaryId) => {
                      setFastWayOverlay(false)
                      navigatorManager.goToSummaryDetails(summaryId, s)
                    }}
                  />
                  {expandedSummaryId === s.id && (
                    <View style={{ paddingLeft: 12, paddingVertical: 12 }}>
                      {(challengesBySummary[s.id] || []).length === 0 ? (
                        <Text style={styles.emptyText}>
                          Sem challenges para este summary.
                        </Text>
                      ) : (
                        (challengesBySummary[s.id] || []).map((c) => {
                          const detail = challengeDetailsById[c.id]
                          const lastAt = detail?.payload?.lastAttempt?.at
                          const dateLabel = lastAt
                            ? ` | ${new Date(lastAt).toLocaleDateString()}`
                            : ''
                          const display = {
                            id: c.id,
                            title: `${c.title}${dateLabel}`,
                          }

                          const openReview = () => {
                            setFastWayOverlay(false)
                            const type = detail?.type
                            if (type === 'hangman')
                              navigatorManager.goToChallengeReviewHangman({
                                challengeId: c.id,
                              })
                            else if (type === 'matrix')
                              navigatorManager.goToChallengeReviewMatrix({
                                challengeId: c.id,
                              })
                            else if (type === 'text')
                              navigatorManager.goToChallengeReviewTextAnswer({
                                challengeId: c.id,
                              })
                            else
                              navigatorManager.goToChallengeReviewQuiz({
                                challengeId: c.id,
                              })
                          }
                          return (
                            <ChallengeRow
                              key={c.id}
                              challenge={display}
                              onGoToList={openReview}
                            />
                          )
                        })
                      )}
                    </View>
                  )}
                </View>
              ))}

              <TouchableOpacity
                onPress={() => {
                  setFastWayOverlay(false)
                  navigatorManager.goToSummary({ topicId: topic.id })
                }}
                style={{
                  alignSelf: 'flex-end',
                  marginBottom: 12,
                  marginVertical: 8,
                }}
              >
                <PlusIcon
                  width={20}
                  height={20}
                  fill={theme.colors.textPrimary}
                />
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}
    </View>
  )
}

export default TopicBlock

const createStyles = (theme: ThemeType) =>
  StyleSheet.create({
    topicBlock: { marginBottom: 10 },
    summaryList: { paddingLeft: 12, paddingTop: 6 },
    summaryRow: { paddingVertical: 4 },
    summaryText: { color: theme.colors.textPrimary },
    emptyText: { color: theme.colors.textPrimary, fontStyle: 'italic' },
    link: { color: '#60a5fa', fontWeight: '700' },
  })
