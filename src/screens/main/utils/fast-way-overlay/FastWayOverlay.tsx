import { CloseIcon } from '@/assets/icons'
import { Text } from '@/components'
import IconButton from '@/components/buttons/IconButton'
import { useTheme } from '@/hooks/useTheme'
import { ThemeType } from '@/types/theme.type'
import React, { useMemo } from 'react'
import { Modal, StyleSheet, TouchableOpacity, View } from 'react-native'
import { navigatorManager } from '../../../../navigation/navigatorManager'
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
    goToDashboard,
    setFastWayOverlay,
    fast,
    fastWayOverlay,
  } = useFastWayOverlayLogic()

  const theme = useTheme()
  const styles = createStyles(theme)

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
        <IconButton
          onPress={() => {
            setFastWayOverlay(false)
            fast.reset()
          }}
          icon={<CloseIcon width={24} height={24} />}
          styles={{
            position: 'absolute',
            top: '10%',
            right: '10%',
          }}
        />
        <View style={styles.card}>
          {mode === 'topics' && (
            <>
              <TouchableOpacity
                style={styles.headerRow}
                onPress={() => {
                  setFastWayOverlay(false)
                  navigatorManager.goToCalendar()
                }}
              >
                <Text variant="xxLarge">Calendário</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.headerRow, { marginBottom: 8 }]}
                onPress={() => {
                  setFastWayOverlay(false)
                  navigatorManager.goToNotifications()
                }}
              >
                <Text variant="xxLarge">Notificações</Text>
              </TouchableOpacity>

              <HeaderTopics onAddTopic={onAddTopic} />
            </>
          )}
          {mode === 'summaries' && (
            <HeaderWithBack
              title={selectedSummary?.title || 'Summary'}
              rightLabel="+ Challenge"
              onBack={() => fast.backFromSummary()}
              onRightPress={onAddChallenge}
            />
          )}
          {mode === 'challenge' && (
            <HeaderWithBack
              title={selectedChallenge?.title || 'Challenge'}
              rightLabel="Fechar"
              onBack={() => fast.backFromChallenge()}
              onRightPress={() => {
                setFastWayOverlay(false)
                fast.reset()
              }}
            />
          )}

          {loading && (
            <View style={{ padding: 20 }}>
              <Text style={styles.emptyText}>Carregando...</Text>
            </View>
          )}

          {!loading && mode === 'topics' && (
            <>
              {!isOnDashboard && (
                <View style={{ alignItems: 'flex-end', marginBottom: 6 }}>
                  <TouchableOpacity onPress={goToDashboard}>
                    <Text style={styles.link}>Ir para Dashboard →</Text>
                  </TouchableOpacity>
                </View>
              )}
              {topics.length === 0 ? (
                <Text style={styles.emptyText}>Nenhum topic encontrado.</Text>
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
              <View style={{ alignItems: 'flex-end', marginBottom: 6 }}>
                <TouchableOpacity onPress={goToTopicsScreen}>
                  <Text style={styles.link}>Ir para Topics →</Text>
                </TouchableOpacity>
              </View>
              {topicSummaries.length === 0 ? (
                <Text style={styles.emptyText}>
                  Sem summaries para este topic.
                </Text>
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
                    style={[styles.summaryRow, { marginTop: 8 }]}
                    onPress={onAddSummary}
                  >
                    <Text style={styles.link}>＋ Adicionar summary</Text>
                  </TouchableOpacity>
                </View>
              )}

              {topicSummaries.length === 0 && (
                <TouchableOpacity
                  style={[styles.summaryRow, { marginTop: 8 }]}
                  onPress={onAddSummary}
                >
                  <Text style={styles.link}>＋ Adicionar summary</Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          {!loading && mode === 'summaries' && (
            <View>
              <View style={{ alignItems: 'flex-end', marginBottom: 6 }}>
                <TouchableOpacity onPress={goToSummaryDetails}>
                  <Text style={styles.link}>Ir para summary →</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={goToChallengesListForSummary}
                  style={{ marginTop: 4 }}
                >
                  <Text style={styles.link}>Ir para challenges →</Text>
                </TouchableOpacity>
              </View>
              {fast.selectedSummaryId && (
                <View>
                  {(challengesBySummary[fast.selectedSummaryId] || [])
                    .length === 0 ? (
                    <Text style={styles.emptyText}>
                      Sem challenges para este summary.
                    </Text>
                  ) : (
                    <View style={{ paddingVertical: 6 }}>
                      {(challengesBySummary[fast.selectedSummaryId] || []).map(
                        (c) => (
                          <TouchableOpacity
                            key={c.id}
                            style={styles.summaryRow}
                            onPress={() => enterChallengeDetails(c.id)}
                          >
                            <Text style={styles.summaryText}>• {c.title}</Text>
                          </TouchableOpacity>
                        ),
                      )}
                      {/* Adicionar challenge no fim da lista */}
                      <TouchableOpacity
                        style={[styles.summaryRow, { marginTop: 8 }]}
                        onPress={onAddChallenge}
                      >
                        <Text style={styles.link}>＋ Adicionar challenge</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              )}

              {fast.selectedSummaryId &&
                (challengesBySummary[fast.selectedSummaryId] || []).length ===
                  0 && (
                  <TouchableOpacity
                    style={[styles.summaryRow, { marginTop: 8 }]}
                    onPress={onAddChallenge}
                  >
                    <Text style={styles.link}>＋ Adicionar challenge</Text>
                  </TouchableOpacity>
                )}
            </View>
          )}

          {mode === 'challenge' && (
            <View>
              {selectedChallenge ? (
                <View style={{ gap: 8 }}>
                  <Text style={styles.detailLabel}>Título</Text>
                  <Text style={styles.detailValue}>
                    {selectedChallenge.title}
                  </Text>
                  <Text style={[styles.detailLabel, { marginTop: 8 }]}>
                    Tipo
                  </Text>
                  <Text style={styles.detailValue}>
                    {selectedChallenge.type}
                  </Text>
                  <Text style={[styles.detailLabel, { marginTop: 8 }]}>
                    Payload
                  </Text>
                  <Text style={styles.detailValueMono}>
                    {JSON.stringify(selectedChallenge.payload, null, 2)}
                  </Text>
                </View>
              ) : (
                <Text style={styles.emptyText}>Carregando challenge...</Text>
              )}
            </View>
          )}
        </View>
      </View>
    </Modal>
  )
}

export default FastWayOverlay

const createStyles = (theme: ThemeType) =>
  StyleSheet.create({
    backdrop: {
      flex: 1,
      backgroundColor: theme.colors.accentYellow,
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
    },
    card: {
      width: '100%',
      maxHeight: '85%',
      borderRadius: 12,
      padding: 16,
    },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 12,
    },
    headerTitle: { color: 'white', fontSize: 18, fontWeight: '700' },
    link: { color: '#60a5fa', fontWeight: '700' },
    topicBlock: { marginBottom: 10 },
    topicRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 8,
    },
    topicName: { color: 'white', fontSize: 16, fontWeight: '600' },
    smallLink: { color: '#93c5fd', fontWeight: '700' },
    summaryList: { paddingLeft: 12, paddingTop: 6 },
    summaryRow: { paddingVertical: 4 },
    summaryText: { color: theme.colors.textPrimary },
    emptyText: { color: theme.colors.textPrimary, fontStyle: 'italic' },
    closeBtn: {
      alignSelf: 'flex-end',
      backgroundColor: '#3b82f6',
      borderRadius: 8,
      paddingVertical: 10,
      paddingHorizontal: 16,
      marginTop: 8,
    },
    buttonText: { color: 'white', fontWeight: '700' },
    detailLabel: {
      color: theme.colors.textPrimary,
      fontSize: 12,
      fontWeight: '700',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    detailValue: {
      color: theme.colors.textPrimary,
      fontSize: 14,
    },
    detailValueMono: {
      color: theme.colors.textPrimary,
      fontFamily: 'Courier',
      fontSize: 12,
    },
  })
