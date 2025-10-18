import { RouteProp, useFocusEffect, useRoute } from '@react-navigation/native'
import React, { useCallback, useEffect, useState } from 'react'
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import {
  navigatorManager,
  RootStackParamList,
} from '../../../../navigation/navigatorManager'
import { summariesRepository } from '../../../../services/repositories/summaries.repository'
import { topicsRepository } from '../../../../services/repositories/topics.repository'
import { Summary, Topic } from '../../../../types/domain'

const TopicDetailsScreen: React.FC = () => {
  const route = useRoute<RouteProp<RootStackParamList, 'TopicDetailsScreen'>>()
  const { topicId } = route.params
  const [topic, setTopic] = useState<Topic | null>(null)
  const [loading, setLoading] = useState(true)
  const [summaries, setSummaries] = useState<Summary[]>([])
  const [loadingSummaries, setLoadingSummaries] = useState(false)
  const [selectedSummary, setSelectedSummary] = useState<Summary | null>(null)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      await topicsRepository.seedIfEmpty()
      const t = await topicsRepository.getById(topicId)
      if (mounted) setTopic(t)
      if (mounted) setLoading(false)
    })()
    return () => {
      mounted = false
    }
  }, [topicId])

  useFocusEffect(
    useCallback(() => {
      let active = true
      ;(async () => {
        setLoadingSummaries(true)
        const list = await summariesRepository.list(topicId)
        if (active) setSummaries(list)
        if (active) setLoadingSummaries(false)
      })()
      return () => {
        active = false
      }
    }, [topicId]),
  )

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator />
      </View>
    )
  }

  if (!topic) {
    return (
      <View style={{ padding: 16 }}>
        <Text style={{ color: 'white' }}>Tópico não encontrado.</Text>
        <Text style={{ color: 'white' }}>ID: {topicId}</Text>
      </View>
    )
  }

  return (
    <View style={{ padding: 16 }}>
      <Text style={{ color: 'white', fontSize: 20, fontWeight: '700' }}>
        {topic.title}
      </Text>
      {!!topic.description && (
        <Text style={{ color: '#ddd', marginTop: 8 }}>{topic.description}</Text>
      )}
      <Text style={{ color: '#aaa', marginTop: 12 }}>
        Atualizado em: {new Date(topic.updatedAt).toLocaleString()}
      </Text>

      <View style={{ height: 16 }} />
      <TouchableOpacity
        onPress={() => navigatorManager.goToSummary({ topicId })}
        style={{
          backgroundColor: '#3b82f6',
          borderRadius: 8,
          paddingVertical: 12,
          alignItems: 'center',
          width: '100%',
        }}
      >
        <Text style={{ color: 'white', fontWeight: '700' }}>
          Criar resumo com ChatGPT
        </Text>
      </TouchableOpacity>
      <View style={{ height: 20 }} />
      <Text style={{ color: 'white', fontSize: 16, fontWeight: '700' }}>
        Summaries
      </Text>
      {loadingSummaries ? (
        <View style={{ paddingVertical: 16 }}>
          <ActivityIndicator />
        </View>
      ) : summaries.length === 0 ? (
        <Text style={{ color: '#bbb', marginTop: 8 }}>
          Nenhum summary ainda. Crie o primeiro acima.
        </Text>
      ) : (
        <View style={{ marginTop: 8 }}>
          {summaries.map((s) => {
            const title = s.title || s.content.slice(0, 60)
            const snippet = s.content.slice(0, 160)
            return (
              <TouchableOpacity
                key={s.id}
                onPress={() => setSelectedSummary(s)}
                style={{
                  backgroundColor: '#1c1c1e',
                  borderRadius: 10,
                  padding: 12,
                  borderColor: '#2f2f31',
                  borderWidth: 1,
                  marginBottom: 10,
                }}
              >
                <Text
                  style={{ color: 'white', fontWeight: '700', marginBottom: 6 }}
                >
                  {title}
                </Text>
                <Text style={{ color: '#cfcfcf' }} numberOfLines={3}>
                  {snippet}
                </Text>
              </TouchableOpacity>
            )
          })}
        </View>
      )}

      <Modal visible={!!selectedSummary} transparent animationType="fade">
        <View
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.8)',
            padding: 20,
            justifyContent: 'center',
          }}
        >
          <View
            style={{
              backgroundColor: '#0b0b0c',
              borderRadius: 12,
              padding: 16,
            }}
          >
            <Text style={{ color: 'white', fontSize: 18, fontWeight: '700' }}>
              {selectedSummary?.title || 'Resumo'}
            </Text>
            <View style={{ height: 10 }} />
            <ScrollView style={{ maxHeight: '70%' }}>
              <Text style={{ color: '#ddd', lineHeight: 20 }}>
                {selectedSummary?.content}
              </Text>
              {!!selectedSummary?.keywords?.length && (
                <View style={{ marginTop: 12 }}>
                  <Text style={{ color: 'white', fontWeight: '700' }}>
                    Palavras-chave
                  </Text>
                  <View
                    style={{
                      flexDirection: 'row',
                      flexWrap: 'wrap',
                      gap: 8,
                      marginTop: 8,
                    }}
                  >
                    {selectedSummary?.keywords?.map((k) => (
                      <View
                        key={k}
                        style={{
                          backgroundColor: '#111827',
                          borderColor: '#374151',
                          borderWidth: 1,
                          borderRadius: 999,
                          paddingVertical: 6,
                          paddingHorizontal: 10,
                        }}
                      >
                        <Text style={{ color: '#9ca3af' }}>{k}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}
            </ScrollView>
            <View style={{ height: 12 }} />
            <TouchableOpacity
              onPress={() => setSelectedSummary(null)}
              style={{
                backgroundColor: '#3b82f6',
                borderRadius: 8,
                paddingVertical: 10,
                alignItems: 'center',
              }}
            >
              <Text style={{ color: 'white', fontWeight: '700' }}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  )
}

export default TopicDetailsScreen
