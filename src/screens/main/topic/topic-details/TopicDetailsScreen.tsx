import { RouteProp, useFocusEffect, useRoute } from '@react-navigation/native'
import React, { useCallback, useEffect, useState } from 'react'
import {
  ActivityIndicator,
  Alert,
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
import { useOverlay } from '../../../../store/useOverlay'
import { Summary, Topic } from '../../../../types/domain'

const TopicDetailsScreen: React.FC = () => {
  const route = useRoute<RouteProp<RootStackParamList, 'TopicDetailsScreen'>>()
  const { topicId } = route.params
  const { setEditOverlay } = useOverlay()
  const [topic, setTopic] = useState<Topic | null>(null)
  const [loading, setLoading] = useState(true)
  const [summaries, setSummaries] = useState<Summary[]>([])
  const [loadingSummaries, setLoadingSummaries] = useState(false)
  // Removed inline modal; we navigate to SummaryDetailsScreen instead

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

  const colored = !!topic.backgroundColor
  const bg = topic.backgroundColor || '#0b0b0c'
  const titleColor = colored ? '#111' : 'white'
  const textColor = colored ? '#222' : '#ddd'

  return (
    <View style={{ flex: 1, backgroundColor: bg }}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 100 }}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <View style={{ flex: 1, marginRight: 12 }}>
            <Text
              style={{ color: titleColor, fontSize: 20, fontWeight: '700' }}
            >
              {topic.title}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() =>
              setEditOverlay({
                type: 'topic',
                topic,
                onSaved: () => {
                  topicsRepository
                    .getById(topicId)
                    .then((updated) => setTopic(updated))
                },
              })
            }
          >
            <Text style={{ color: '#2563eb', fontWeight: '700' }}>Editar</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              Alert.alert(
                'Apagar tópico?',
                'Isto irá apagar o tópico e todos os seus resumos e challenges associados. Deseja continuar?',
                [
                  { text: 'Cancelar', style: 'cancel' },
                  {
                    text: 'Apagar',
                    style: 'destructive',
                    onPress: () => {
                      ;(async () => {
                        try {
                          await topicsRepository.deleteById(topicId)
                          navigatorManager.goBack()
                        } catch (e) {
                          console.error(e)
                          Alert.alert(
                            'Erro',
                            'Não foi possível apagar o tópico.',
                          )
                        }
                      })()
                    },
                  },
                ],
              )
            }}
            style={{ marginLeft: 12 }}
          >
            <Text style={{ color: '#ef4444', fontWeight: '700' }}>Apagar</Text>
          </TouchableOpacity>
        </View>
        {!!topic.description && (
          <Text style={{ color: textColor, marginTop: 8 }}>
            {topic.description}
          </Text>
        )}
        <Text style={{ color: colored ? '#333' : '#aaa', marginTop: 12 }}>
          Atualizado em: {new Date(topic.updatedAt).toLocaleString()}
        </Text>

        <View style={{ height: 20 }} />
        <Text style={{ color: titleColor, fontSize: 16, fontWeight: '700' }}>
          Summaries
        </Text>
        {loadingSummaries ? (
          <View style={{ paddingVertical: 16 }}>
            <ActivityIndicator />
          </View>
        ) : summaries.length === 0 ? (
          <Text style={{ color: colored ? '#444' : '#bbb', marginTop: 8 }}>
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
                  onPress={() => navigatorManager.goToSummaryDetails(s.id, s)}
                  style={{
                    backgroundColor: s.backgroundColor || '#1c1c1e',
                    borderRadius: 10,
                    padding: 12,
                    borderColor: '#2f2f31',
                    borderWidth: 1,
                    marginBottom: 10,
                  }}
                >
                  <Text
                    style={{
                      color: s.backgroundColor ? '#111' : 'white',
                      fontWeight: '700',
                      marginBottom: 6,
                    }}
                  >
                    {title}
                  </Text>
                  <Text
                    style={{ color: s.backgroundColor ? '#222' : '#cfcfcf' }}
                    numberOfLines={3}
                  >
                    {snippet}
                  </Text>
                </TouchableOpacity>
              )
            })}
          </View>
        )}

        {/* Modal removed: we navigate to SummaryDetailsScreen instead */}
      </ScrollView>
      <View style={{ position: 'absolute', left: 16, right: 16, bottom: 16 }}>
        <TouchableOpacity
          onPress={() => navigatorManager.goToSummary({ topicId })}
          style={{
            backgroundColor: '#3b82f6',
            borderRadius: 10,
            paddingVertical: 14,
            alignItems: 'center',
          }}
        >
          <Text style={{ color: 'white', fontWeight: '700' }}>
            Criar resumo com ChatGPT
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

export default TopicDetailsScreen
