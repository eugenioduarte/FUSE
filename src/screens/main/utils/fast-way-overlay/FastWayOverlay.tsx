import React, { useEffect, useMemo, useState } from 'react'
import {
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import { navigationRef } from '../../../../navigation/navigationRef'
import { navigatorManager } from '../../../../navigation/navigatorManager'
import { challengesRepository } from '../../../../services/repositories/challenges.repository'
import { summariesRepository } from '../../../../services/repositories/summaries.repository'
import { topicsRepository } from '../../../../services/repositories/topics.repository'
import { useOverlay } from '../../../../store/useOverlay'
import { Summary, Topic } from '../../../../types/domain'

type FWMode = 'topics' | 'topic' | 'challengesAll' | 'challenges'

const HeaderTopics = ({ onAddTopic }: { onAddTopic: () => void }) => {
  return (
    <View style={styles.headerRow}>
      <Text style={styles.headerTitle}>Topics</Text>
      <TouchableOpacity onPress={onAddTopic}>
        <Text style={styles.link}>Adicionar</Text>
      </TouchableOpacity>
    </View>
  )
}

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
}) => {
  return (
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
}

const TopicRow = ({
  topic,
  expanded,
  onToggle,
}: {
  topic: Topic
  expanded: boolean
  onToggle: () => void
}) => (
  <View style={styles.topicRow}>
    <TouchableOpacity style={{ flex: 1 }} onPress={onToggle}>
      <Text style={styles.topicName}>{topic.title}</Text>
    </TouchableOpacity>
  </View>
)

const SummaryItem = ({
  summary,
  onPress,
}: {
  summary: Summary
  onPress?: () => void
}) => {
  return (
    <TouchableOpacity style={styles.summaryRow} onPress={onPress}>
      <Text style={styles.summaryText} numberOfLines={1}>
        • {summary.content}
      </Text>
    </TouchableOpacity>
  )
}

const FastWayOverlay: React.FC = () => {
  const { fastWayOverlay, setFastWayOverlay } = useOverlay()
  const [topics, setTopics] = useState<Topic[]>([])
  const [mode, setMode] = useState<FWMode>('topics')
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null)
  const [selectedSummaryId, setSelectedSummaryId] = useState<string | null>(
    null,
  )
  const [summaries, setSummaries] = useState<Record<string, Summary[]>>({})
  const [challengesBySummary, setChallengesBySummary] = useState<
    Record<string, { id: string; title: string }[]>
  >({})

  useEffect(() => {
    if (!fastWayOverlay) return
    let mounted = true
    ;(async () => {
      await topicsRepository.seedIfEmpty()
      const list = await topicsRepository.list()
      if (mounted) setTopics(list)

      // Choose initial mode based on current route
      const route = navigationRef.getCurrentRoute()
      if (route?.name === 'TopicDetailsScreen') {
        const topicId = (route.params as any)?.topicId as string | undefined
        if (topicId) {
          setSelectedTopicId(topicId)
          setMode('topic')
          const sList = await summariesRepository.list(topicId)
          if (mounted) setSummaries((p) => ({ ...p, [topicId]: sList }))
          return
        }
      }
      if (route?.name === 'SummaryScreen') {
        setMode('challengesAll')
        return
      }
      setMode('topics')
    })()
    return () => {
      mounted = false
    }
  }, [fastWayOverlay])

  const [entering, setEntering] = useState(false)
  const enterTopicMode = async (topicId: string) => {
    if (entering) return
    setEntering(true)
    try {
      setSelectedTopicId(topicId)
      setMode('topic')
      const list = await summariesRepository.list(topicId)
      setSummaries((prev) => ({ ...prev, [topicId]: list }))
    } finally {
      setEntering(false)
    }
  }

  const onAddTopic = () => {
    setFastWayOverlay(false)
    // Placeholder: navegar para a área de tópicos (tela de listagem/criação)
    navigatorManager.goToTopic()
  }

  // '+ Summary' action removed: creation only from summary fastway

  const enterChallengesForSummary = async (summaryId: string) => {
    setSelectedSummaryId(summaryId)
    setMode('challenges')
    if (!challengesBySummary[summaryId]) {
      const list = await challengesRepository.listBySummary(summaryId)
      setChallengesBySummary((prev) => ({ ...prev, [summaryId]: list }))
    }
  }

  const onAddChallenge = () => {
    setFastWayOverlay(false)
    navigatorManager.goToChallengeAdd()
  }

  const renderTopic = ({ item }: { item: Topic }) => {
    return (
      <View style={styles.topicBlock}>
        <TopicRow
          topic={item}
          expanded={false}
          onToggle={() => enterTopicMode(item.id)}
        />
      </View>
    )
  }

  const selectedTopic = useMemo(
    () => topics.find((t) => t.id === selectedTopicId) || null,
    [topics, selectedTopicId],
  )

  const topicSummaries = useMemo(() => {
    if (!selectedTopicId) return [] as Summary[]
    return summaries[selectedTopicId] || []
  }, [summaries, selectedTopicId])

  return (
    <Modal
      visible={fastWayOverlay}
      animationType="fade"
      transparent
      statusBarTranslucent
    >
      <View style={styles.backdrop}>
        <View style={styles.card}>
          {mode === 'topics' && (
            <>
              <HeaderTopics onAddTopic={onAddTopic} />
              {topics.length === 0 ? (
                <Text style={styles.emptyText}>Nenhum tópico encontrado.</Text>
              ) : (
                <FlatList
                  data={topics}
                  keyExtractor={(t) => t.id}
                  renderItem={renderTopic}
                  contentContainerStyle={{ paddingBottom: 12 }}
                />
              )}
            </>
          )}

          {mode === 'topic' && selectedTopic && (
            <>
              <HeaderWithBack
                title={selectedTopic.title}
                onBack={() => setMode('topics')}
              />
              <View style={styles.summaryList}>
                {topicSummaries.length === 0 ? (
                  <Text style={styles.emptyText}>Sem summaries ainda.</Text>
                ) : (
                  topicSummaries.map((s) => (
                    <SummaryItem
                      key={s.id}
                      summary={s}
                      onPress={() => enterChallengesForSummary(s.id)}
                    />
                  ))
                )}
              </View>
            </>
          )}

          {mode === 'challenges' && selectedSummaryId && (
            <>
              <HeaderWithBack
                title={'Challenges'}
                rightLabel={'Adicionar'}
                onBack={() => setMode('topic')}
                onRightPress={onAddChallenge}
              />
              <View style={styles.summaryList}>
                {(challengesBySummary[selectedSummaryId] || []).length === 0 ? (
                  <Text style={styles.emptyText}>Sem challenges ainda.</Text>
                ) : (
                  (challengesBySummary[selectedSummaryId] || []).map((c) => (
                    <View key={c.id} style={styles.summaryRow}>
                      <Text style={styles.summaryText}>• {c.title}</Text>
                    </View>
                  ))
                )}
              </View>
            </>
          )}

          {mode === 'challengesAll' && (
            <>
              <HeaderWithBack
                title={'Challenges'}
                rightLabel={'Adicionar'}
                onBack={() => setMode('topics')}
                onRightPress={onAddChallenge}
              />
              <View style={styles.summaryList}>
                {/* For now, we don’t aggregate; prompt user to selecionar um summary no tópico */}
                <Text style={styles.emptyText}>
                  Abra um tópico e selecione um summary para ver os challenges.
                </Text>
              </View>
            </>
          )}
          <TouchableOpacity
            style={styles.closeBtn}
            onPress={() => setFastWayOverlay(false)}
          >
            <Text style={styles.buttonText}>Fechar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  )
}

export default FastWayOverlay

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,1)',
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
})
