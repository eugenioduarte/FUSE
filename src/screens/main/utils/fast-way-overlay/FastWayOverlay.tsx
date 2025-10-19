import React, { useCallback, useEffect, useMemo, useState } from 'react'
import {
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import { ROUTES } from '../../../../constants/routes'
import { navigationRef } from '../../../../navigation/navigationRef'
import { navigatorManager } from '../../../../navigation/navigatorManager'
import { challengesRepository } from '../../../../services/repositories/challenges.repository'
import { summariesRepository } from '../../../../services/repositories/summaries.repository'
import { topicsRepository } from '../../../../services/repositories/topics.repository'
import { useFastwayStore } from '../../../../store/useFastwayStore'
import { useOverlay } from '../../../../store/useOverlay'
import { Challenge, Summary, Topic } from '../../../../types/domain'

type FWMode = 'topics' | 'topic' | 'summaries' | 'challenges' | 'challenge'

const HeaderTopics = ({ onAddTopic }: { onAddTopic: () => void }) => (
  <View style={styles.headerRow}>
    <Text style={styles.headerTitle}>Topics</Text>
    <TouchableOpacity onPress={onAddTopic}>
      <Text style={styles.link}>Adicionar</Text>
    </TouchableOpacity>
  </View>
)

const HeaderWithBack = ({
  title,
  rightLabel,
  onBack,
  onRightPress,
}: {
  title: string
  rightLabel?: string
  onBack: () => void
  onRightPress?: () => void
}) => (
  <View style={styles.headerRow}>
    <TouchableOpacity onPress={onBack}>
      <Text style={styles.link}>← Voltar</Text>
    </TouchableOpacity>
    <Text style={styles.headerTitle}>{title}</Text>
    {rightLabel ? (
      <TouchableOpacity onPress={onRightPress}>
        <Text style={styles.link}>{rightLabel}</Text>
      </TouchableOpacity>
    ) : (
      <View style={{ width: 64 }} />
    )}
  </View>
)

const TopicRow = ({
  topic,
  onSelect,
}: {
  topic: Topic
  onSelect: (topicId: string) => void
}) => (
  <TouchableOpacity style={styles.topicRow} onPress={() => onSelect(topic.id)}>
    <Text style={styles.topicName}>{topic.title}</Text>
  </TouchableOpacity>
)

const SummaryItem = ({
  summary,
  onPress,
}: {
  summary: Summary
  onPress?: () => void
}) => (
  <TouchableOpacity style={styles.summaryRow} onPress={onPress}>
    <Text style={styles.summaryText} numberOfLines={1}>
      • {summary.content}
    </Text>
  </TouchableOpacity>
)

const FastWayOverlay: React.FC = () => {
  const { fastWayOverlay, setFastWayOverlay } = useOverlay()
  const fast = useFastwayStore()
  const [topics, setTopics] = useState<Topic[]>([])
  const [summaries, setSummaries] = useState<Record<string, Summary[]>>({})
  const [challengesBySummary, setChallengesBySummary] = useState<
    Record<string, { id: string; title: string }[]>
  >({})
  const [challengeDetailsById, setChallengeDetailsById] = useState<
    Record<string, Challenge>
  >({})
  const [loading, setLoading] = useState(false)

  // Derive UI mode
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

  // Inicialização
  useEffect(() => {
    if (!fastWayOverlay) return
    let mounted = true
    ;(async () => {
      setLoading(true)
      await topicsRepository.seedIfEmpty()
      const list = await topicsRepository.list()
      if (mounted) setTopics(list)
      setLoading(false)
      useFastwayStore.getState().enterDashboard()
    })()
    return () => {
      mounted = false
    }
  }, [fastWayOverlay])

  // Ao clicar em Topic
  const enterTopicMode = useCallback(
    async (topicId: string) => {
      setLoading(true)
      const list = await summariesRepository.list(topicId)
      setSummaries((prev) => ({ ...prev, [topicId]: list }))
      fast.enterTopic(topicId)
      setLoading(false)
    },
    [fast],
  )

  // Ao clicar em Summary
  const enterChallengesForSummary = useCallback(
    async (summaryId: string) => {
      setLoading(true)
      fast.enterSummary(summaryId)
      if (!challengesBySummary[summaryId]) {
        const list = await challengesRepository.listBySummary(summaryId)
        setChallengesBySummary((prev) => ({ ...prev, [summaryId]: list }))
      }
      setLoading(false)
    },
    [challengesBySummary, fast],
  )

  const onAddTopic = () => {
    setFastWayOverlay(false)
    navigatorManager.goToTopicAdd()
  }

  const onAddSummary = () => {
    // Navega para criar Summary associado ao Topic atual (se houver)
    setFastWayOverlay(false)
    if (selectedTopic?.id)
      navigatorManager.goToSummary({ topicId: selectedTopic.id })
    else navigatorManager.goToSummary()
  }

  const onAddChallenge = () => {
    setFastWayOverlay(false)
    if (fast.selectedSummaryId)
      navigatorManager.goToChallengeAdd({ summaryId: fast.selectedSummaryId })
    else navigatorManager.goToChallengeAdd()
  }

  const selectedTopic = topics.find((t) => t.id === fast.selectedTopicId)
  const topicSummaries = fast.selectedTopicId
    ? summaries[fast.selectedTopicId] || []
    : []
  const selectedSummary = topicSummaries.find(
    (s) => s.id === fast.selectedSummaryId,
  )
  const selectedChallenge: Challenge | null = fast.selectedChallengeId
    ? (challengeDetailsById[fast.selectedChallengeId] ?? null)
    : null

  const enterChallengeDetails = async (challengeId: string) => {
    if (!challengeDetailsById[challengeId]) {
      const all = await challengesRepository.list()
      const found = all.find((c) => c.id === challengeId)
      if (found)
        setChallengeDetailsById((p) => ({ ...p, [challengeId]: found }))
    }
    fast.enterChallenge(challengeId)
  }

  // Navegar para a tela de Topics (fora do overlay)
  const goToTopicsScreen = () => {
    setFastWayOverlay(false)
    navigatorManager.goToTopic()
  }

  // Navegar para a tela de detalhes do Summary atual
  const goToSummaryDetails = () => {
    if (!fast.selectedSummaryId) return
    setFastWayOverlay(false)
    navigatorManager.goToSummaryDetails(fast.selectedSummaryId, selectedSummary)
  }

  // Detecta se está na Dashboard para exibir atalho apenas quando não estiver
  const isOnDashboard =
    navigationRef.isReady() &&
    navigationRef.getCurrentRoute()?.name === ROUTES.DashboardScreen
  const goToDashboard = () => {
    setFastWayOverlay(false)
    navigatorManager.goToDashboard()
  }

  return (
    <Modal
      visible={fastWayOverlay}
      animationType="fade"
      transparent
      statusBarTranslucent
    >
      <View style={styles.backdrop}>
        <View style={styles.card}>
          {mode === 'topics' && <HeaderTopics onAddTopic={onAddTopic} />}
          {mode === 'topic' && (
            <HeaderWithBack
              title={selectedTopic?.title || 'Topic'}
              rightLabel="Fechar"
              onBack={() => fast.backFromTopic()}
              onRightPress={() => {
                setFastWayOverlay(false)
                fast.reset()
              }}
            />
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
                <FlatList
                  data={topics}
                  keyExtractor={(i) => i.id}
                  renderItem={({ item }) => (
                    <TopicRow topic={item} onSelect={enterTopicMode} />
                  )}
                />
              )}
              <TouchableOpacity
                style={styles.closeBtn}
                onPress={() => {
                  setFastWayOverlay(false)
                  fast.reset()
                }}
              >
                <Text style={styles.buttonText}>Fechar</Text>
              </TouchableOpacity>
            </>
          )}

          {!loading && mode === 'topic' && (
            <View>
              {/* Ação para ir para a tela de Topics */}
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
                  {/* Adicionar summary no fim da lista */}
                  <TouchableOpacity
                    style={[styles.summaryRow, { marginTop: 8 }]}
                    onPress={onAddSummary}
                  >
                    <Text style={styles.link}>＋ Adicionar summary</Text>
                  </TouchableOpacity>
                </View>
              )}
              {/* Mesmo sem summaries, ainda permitir adicionar */}
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
              {/* Link para abrir a tela do Summary */}
              <View style={{ alignItems: 'flex-end', marginBottom: 6 }}>
                <TouchableOpacity onPress={goToSummaryDetails}>
                  <Text style={styles.link}>Ir para summary →</Text>
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
              {/* Mesmo sem challenges, ainda permitir adicionar */}
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

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxHeight: '85%',
    backgroundColor: '#1c1c1e',
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
  summaryText: { color: '#ddd' },
  emptyText: { color: '#bbb', fontStyle: 'italic' },
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
    color: '#9ca3af',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  detailValue: {
    color: '#e5e7eb',
    fontSize: 14,
  },
  detailValueMono: {
    color: '#e5e7eb',
    fontFamily: 'Courier',
    fontSize: 12,
  },
})
