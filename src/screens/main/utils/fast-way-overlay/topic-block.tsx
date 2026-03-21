import { PlusIcon } from '@/assets/icons'
import { Text } from '@/components'
import { useTheme } from '@/hooks/use-theme'
import { t } from '@/locales/translation'
import { ThemeType } from '@/types/theme.type'
import React from 'react'
import { StyleSheet, TouchableOpacity, View } from 'react-native'
import { navigatorManager } from '../../../../navigation/navigatorManager'
import { Challenge, Summary, Topic } from '../../../../types/domain'
import ChallengeRow from './challenge-row'
import SummaryItem from './summary-item'
import TopicRow from './topic-row'

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
          <TouchableOpacity
            style={styles.linkRow}
            onPress={() => {
              setFastWayOverlay(false)
              navigatorManager.goToTopicDetails(topic.id)
            }}
          >
            <Text variant="medium">{t('fastWay.view_all_summaries')}</Text>
          </TouchableOpacity>
          {summariesForTopic.length === 0 ? (
            <Text variant="medium">{t('fastWay.no_topic_summaries')}</Text>
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
                      {/* Link para a lista de challenges do resumo */}
                      <TouchableOpacity
                        style={[styles.linkRow, { marginBottom: 6 }]}
                        onPress={() => {
                          setFastWayOverlay(false)
                          navigatorManager.goToChallengesList({
                            summaryId: s.id,
                          })
                        }}
                      >
                        <Text variant="medium">
                          {t('fastWay.view_challenges_of_summary')}
                        </Text>
                      </TouchableOpacity>
                      {(challengesBySummary[s.id] || []).length === 0 ? (
                        <Text variant="medium">
                          {t('fastWay.no_challenges_for_summary')}
                        </Text>
                      ) : (
                        (challengesBySummary[s.id] || [])
                          .slice(0, 3)
                          .map((c) => {
                            const detail = challengeDetailsById[c.id]
                            const lastAt = detail?.payload?.lastAttempt?.at
                            const last = detail?.payload?.lastAttempt
                            const dateLabel = lastAt
                              ? ` | ${new Date(lastAt).toLocaleDateString()}`
                              : ''
                            let scoreLabel = ''
                            if (detail?.type === 'quiz' && last) {
                              const total = detail?.payload?.lastAttempt?.total
                              const totalSuffix = total ? '/' + total : ''
                              scoreLabel = ` – ${last.score}${totalSuffix}`
                            } else if (
                              last &&
                              (detail?.type === 'text' ||
                                detail?.type === 'hangman' ||
                                detail?.type === 'matrix')
                            ) {
                              const val =
                                detail?.type === 'text'
                                  ? Number(last.score).toFixed(1)
                                  : String(last.score)
                              scoreLabel = ` – ${val}`
                            }
                            const display = {
                              id: c.id,
                              title: `${c.title}${scoreLabel}${dateLabel}`,
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
    topicBlock: { marginBottom: theme.spacings.xMedium },
    summaryList: {
      paddingLeft: theme.spacings.xMedium,
      paddingTop: theme.spacings.xSmall,
    },
    summaryRow: { paddingVertical: theme.spacings.xSmall },
    summaryText: { color: theme.colors.textPrimary },

    linkRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: theme.spacings.xSmall,
    },
  })
