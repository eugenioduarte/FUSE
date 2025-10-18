import { RouteProp, useRoute } from '@react-navigation/native'
import React, { useEffect, useState } from 'react'
import { ActivityIndicator, Text, View } from 'react-native'
import { RootStackParamList } from '../../../../navigation/navigatorManager'
import { topicsRepository } from '../../../../services/repositories/topics.repository'
import { Topic } from '../../../../types/domain'

const TopicDetailsScreen: React.FC = () => {
  const route = useRoute<RouteProp<RootStackParamList, 'TopicDetailsScreen'>>()
  const { topicId } = route.params
  const [topic, setTopic] = useState<Topic | null>(null)
  const [loading, setLoading] = useState(true)

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
    </View>
  )
}

export default TopicDetailsScreen
