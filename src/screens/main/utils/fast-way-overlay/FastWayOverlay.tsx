import { CloseIcon, HomeIcon } from '@/assets/icons'
import { Text } from '@/components'
import IconButton from '@/components/buttons/icon-button/IconButton'
import { useTheme } from '@/hooks/use-theme'
import { t } from '@/locales/translation'
import { navigatorManager } from '@/navigation/navigatorManager'
import { useThemeStore } from '@/store/useThemeStore'
import { ThemeType } from '@/types/theme.type'
import React, { useMemo } from 'react'
import {
  Modal,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native'
import HeaderTopics from './HeaderTopics'
import HeaderWithBack from './HeaderWithBack'
import SummaryItem from './SummaryItem'
import TopicBlock from './TopicBlock'
import { useFastWayOverlayLogic } from './useFastWayOverlayLogic'

type FWMode = 'topics' | 'topic' | 'summaries' | 'challenges' | 'challenge'

const FastWayOverlay: React.FC = () => {
  const {
    topics,
    summaries,
    challengesBySummary,
    challengeDetailsById,
    loading,
    expandedTopicId,
    expandedSummaryId,
    toggleTopicInline,
    toggleSummaryInline,
    enterChallengesForSummary,
    enterChallengeDetails,
    onAddTopic,
    onAddSummary,
    onAddChallenge,
    topicSummaries,
    selectedSummary,
    selectedChallenge,
    goToTopicsScreen,
    goToSummaryDetails,
    goToChallengesListForSummary,
    isOnDashboard,
    setFastWayOverlay,
    fast,
    fastWayOverlay,
  } = useFastWayOverlayLogic()

  const theme = useTheme()
  const color = useThemeStore((s) => s.colorLevelUp.background_color)
  const styles = createStyles(theme, color)

  const mode: FWMode = useMemo(() => {
    switch (fast.level) {
      case 'dashboard':
        return 'topics'
      case 'topic':
        return 'topic'
      case 'summary':
        return 'summaries'
      case 'challenge':
        return 'challenge'
      default:
        return 'topics'
    }
  }, [fast.level])

  return (
    <Modal
      visible={fastWayOverlay}
      animationType="slide"
      presentationStyle="overFullScreen"
      transparent
      statusBarTranslucent
    >
      <View style={styles.backdrop}>
        <View
          style={[
            styles.topBar,
            isOnDashboard ? styles.topBarDashboard : styles.topBarNotDashboard,
          ]}
        >
          {!isOnDashboard && (
            <IconButton
              onPress={() => {
                navigatorManager.goToDashboard()
                setFastWayOverlay(false)
                fast.reset()
              }}
              styles={styles.iconButtonTransparent}
              icon={<HomeIcon width={24} height={24} />}
            />
          )}
          <IconButton
            onPress={() => {
              setFastWayOverlay(false)
              fast.reset()
            }}
            styles={styles.iconButtonTransparent}
            icon={<CloseIcon width={24} height={24} />}
          />
        </View>
        <ScrollView style={styles.card} showsVerticalScrollIndicator={false}>
          {mode === 'topics' && (
            <>
              <TouchableOpacity
                style={styles.headerRow}
                onPress={() => {
                  setFastWayOverlay(false)
                  navigatorManager.goToCalendar()
                }}
              >
                <Text variant="xxLarge">{t('fastWay.calendar')}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.headerRow, styles.headerRowBottom]}
                onPress={() => {
                  setFastWayOverlay(false)
                  navigatorManager.goToNotifications()
                }}
              >
                <Text variant="xxLarge">{t('fastWay.notifications')}</Text>
              </TouchableOpacity>

              <HeaderTopics onAddTopic={onAddTopic} />

              {/* Link para todos os tópicos */}
              <TouchableOpacity
                style={styles.linkRow}
                onPress={goToTopicsScreen}
              >
                <Text variant="medium">{t('fastWay.view_all_topics')}</Text>
              </TouchableOpacity>
            </>
          )}
          {mode === 'summaries' && (
            <HeaderWithBack
              title={selectedSummary?.title || t('fastWay.summary')}
              rightLabel={t('fastWay.add_challenge_label')}
              onBack={() => fast.backFromSummary()}
              onRightPress={onAddChallenge}
            />
          )}
          {mode === 'challenge' && (
            <HeaderWithBack
              title={selectedChallenge?.title || t('fastWay.challenge')}
              rightLabel={t('fastWay.close')}
              onBack={() => fast.backFromChallenge()}
              onRightPress={() => {
                setFastWayOverlay(false)
                fast.reset()
              }}
            />
          )}

          {loading && (
            <View style={styles.loadingWrapper}>
              <Text variant="medium">{t('fastWay.loading')}</Text>
            </View>
          )}

          {!loading && mode === 'topics' && (
            <>
              {topics.length === 0 ? (
                <Text variant="medium">{t('fastWay.no_topics_found')}</Text>
              ) : (
                <View>
                  {topics.map((t) => (
                    <TopicBlock
                      key={t.id}
                      topic={t}
                      summariesForTopic={summaries[t.id] || []}
                      challengesBySummary={challengesBySummary}
                      challengeDetailsById={challengeDetailsById}
                      expandedTopicId={expandedTopicId}
                      expandedSummaryId={expandedSummaryId}
                      toggleTopicInline={toggleTopicInline}
                      toggleSummaryInline={toggleSummaryInline}
                      enterChallengeDetails={enterChallengeDetails}
                      setFastWayOverlay={setFastWayOverlay}
                    />
                  ))}
                </View>
              )}
            </>
          )}

          {!loading && mode === 'topic' && (
            <View>
              <View style={styles.alignEndMb6}>
                <TouchableOpacity onPress={goToTopicsScreen}>
                  <Text variant="medium">{t('fastWay.go_to_topics')}</Text>
                </TouchableOpacity>
              </View>
              {/* Link para lista de summaries do tópico */}
              {!!fast.selectedTopicId && (
                <TouchableOpacity
                  style={[styles.linkRow, styles.mt4]}
                  onPress={() => {
                    setFastWayOverlay(false)
                    navigatorManager.goToTopicDetails(fast.selectedTopicId!)
                  }}
                >
                  <Text variant="medium">
                    {t('fastWay.view_topic_summaries')}
                  </Text>
                </TouchableOpacity>
              )}
              {topicSummaries.length === 0 ? (
                <Text variant="medium">{t('fastWay.no_topic_summaries')}</Text>
              ) : (
                <View style={styles.summaryList}>
                  {topicSummaries.map((s) => (
                    <SummaryItem
                      key={s.id}
                      summary={s}
                      onPress={() => enterChallengesForSummary(s.id)}
                    />
                  ))}

                  <TouchableOpacity
                    style={[styles.summaryRow, styles.mt8]}
                    onPress={onAddSummary}
                  >
                    <Text variant="medium">{t('fastWay.add_summary')}</Text>
                  </TouchableOpacity>
                </View>
              )}

              {topicSummaries.length === 0 && (
                <TouchableOpacity
                  style={[styles.summaryRow, styles.mt8]}
                  onPress={onAddSummary}
                >
                  <Text variant="medium">{t('fastWay.add_summary')}</Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          {!loading && mode === 'summaries' && (
            <View>
              <View style={styles.mb6}>
                <TouchableOpacity
                  style={styles.linkRow}
                  onPress={goToSummaryDetails}
                >
                  <Text variant="medium">{t('fastWay.go_to_summary')}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.linkRow, styles.mt4]}
                  onPress={goToChallengesListForSummary}
                >
                  <Text variant="medium">
                    {t('fastWay.view_challenges_done')}
                  </Text>
                </TouchableOpacity>
              </View>
              {fast.selectedSummaryId && (
                <View>
                  {(challengesBySummary[fast.selectedSummaryId] || [])
                    .length === 0 ? (
                    <Text variant="medium">
                      {t('fastWay.no_challenges_for_summary')}
                    </Text>
                  ) : (
                    <View style={styles.paddingVertical6}>
                      {(challengesBySummary[fast.selectedSummaryId] || []).map(
                        (c) => (
                          <TouchableOpacity
                            key={c.id}
                            style={styles.summaryRow}
                            onPress={() => enterChallengeDetails(c.id)}
                          >
                            <Text style={styles.summaryText}>
                              {(() => {
                                const details = challengeDetailsById[c.id]
                                const last = details?.payload?.lastAttempt
                                if (!details || !last) return `• ${c.title}`
                                if (details.type === 'quiz') {
                                  const total = last.total ?? undefined
                                  const totalSuffix = total ? '/' + total : ''
                                  return `• ${c.title} – ${last.score}${totalSuffix}`
                                }
                                if (details.type === 'text') {
                                  return `• ${c.title} – ${Number(last.score).toFixed(1)}`
                                }

                                return `• ${c.title} – ${last.score}`
                              })()}
                            </Text>
                          </TouchableOpacity>
                        ),
                      )}

                      <TouchableOpacity
                        style={[styles.summaryRow, styles.mt8]}
                        onPress={onAddChallenge}
                      >
                        <Text variant="medium">
                          {t('fastWay.add_challenge')}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              )}

              {fast.selectedSummaryId &&
                (challengesBySummary[fast.selectedSummaryId] || []).length ===
                  0 && (
                  <TouchableOpacity
                    style={[styles.summaryRow, styles.mt8]}
                    onPress={onAddChallenge}
                  >
                    <Text variant="medium">{t('fastWay.add_challenge')}</Text>
                  </TouchableOpacity>
                )}
            </View>
          )}

          {mode === 'challenge' && (
            <View>
              {selectedChallenge ? (
                <View style={styles.detailGap8}>
                  <Text variant="medium">{t('fastWay.detail.title')}</Text>
                  <Text variant="medium">{selectedChallenge.title}</Text>
                  <Text variant="medium" style={styles.mt8}>
                    {t('fastWay.detail.type')}
                  </Text>
                  <Text variant="medium">{selectedChallenge.type}</Text>
                  <Text variant="medium" style={styles.mt8}>
                    {t('fastWay.detail.payload')}
                  </Text>
                  <Text variant="medium">
                    {JSON.stringify(selectedChallenge.payload, null, 2)}
                  </Text>
                </View>
              ) : (
                <Text variant="medium">{t('fastWay.loading_challenge')}</Text>
              )}
            </View>
          )}
        </ScrollView>
      </View>
    </Modal>
  )
}

export default FastWayOverlay

const createStyles = (theme: ThemeType, color: string) =>
  StyleSheet.create({
    backdrop: {
      flex: 1,
      backgroundColor: color,
      alignItems: 'center',
      justifyContent: 'center',
      padding: theme.spacings.large,
    },
    card: {
      width: '100%',
      borderRadius: theme.spacings.xMedium,
      padding: theme.spacings.medium,
    },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: theme.spacings.xMedium,
    },
    summaryList: { paddingLeft: theme.spacings.xMedium, paddingTop: 6 },
    summaryRow: { paddingVertical: 4 },
    summaryText: { color: theme.colors.textPrimary },
    detailValue: {
      color: theme.colors.textPrimary,
      fontSize: 14,
    },
    topBar: {
      width: '100%',
      flexDirection: 'row',
      marginVertical: 50,
    },
    topBarDashboard: {
      justifyContent: 'flex-end',
    },
    topBarNotDashboard: {
      justifyContent: 'space-between',
    },
    iconButtonTransparent: {
      borderWidth: 0,
      backgroundColor: theme.colors.backgroundTertiary,
    },
    headerRowBottom: {
      marginBottom: 8,
    },
    loadingWrapper: {
      padding: 20,
    },
    alignEndMb6: {
      alignItems: 'flex-end',
      marginBottom: 6,
    },
    mb6: { marginBottom: 6 },
    paddingVertical6: {
      paddingVertical: 6,
    },
    mt8: {
      marginTop: 8,
    },
    mt4: {
      marginTop: 4,
    },
    detailGap8: {
      gap: 8,
    },
    linkRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 6,
    },
  })
