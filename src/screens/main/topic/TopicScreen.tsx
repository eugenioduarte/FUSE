import React, { useCallback, useEffect, useState } from 'react'
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import { navigatorManager } from '../../../navigation/navigatorManager'
import { topicsRepository } from '../../../services/repositories/topics.repository'
import { Topic } from '../../../types/domain'

const Separator = () => <View style={{ height: 8 }} />

const TopicScreen = () => {
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [topics, setTopics] = useState<Topic[]>([])

  const load = useCallback(async () => {
    setLoading(true)
    await topicsRepository.seedIfEmpty()
    const list = await topicsRepository.list()
    setTopics(list)
    setLoading(false)
  }, [])

  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    const list = await topicsRepository.list()
    setTopics(list)
    setRefreshing(false)
  }, [])

  useEffect(() => {
    load()
  }, [load])

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator />
      </View>
    )
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#0b0b0c', padding: 12 }}>
      <Text
        style={{
          color: 'white',
          fontSize: 18,
          fontWeight: '700',
          marginBottom: 8,
        }}
      >
        Tópicos
      </Text>
      <FlatList
        data={topics}
        keyExtractor={(t) => t.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ItemSeparatorComponent={Separator}
        renderItem={({ item }) => {
          const colored = !!item.backgroundColor
          const bg = item.backgroundColor || '#1c1c1e'
          const titleColor = colored ? '#111' : 'white'
          const descColor = colored ? '#222' : '#cfcfcf'
          return (
            <TouchableOpacity
              onPress={() => navigatorManager.goToTopicDetails(item.id)}
              style={{
                backgroundColor: bg,
                borderRadius: 10,
                padding: 12,
                borderColor: '#2f2f31',
                borderWidth: 1,
              }}
            >
              <Text style={{ color: titleColor, fontWeight: '700' }}>
                {item.title}
              </Text>
              {!!item.description && (
                <Text
                  style={{ color: descColor, marginTop: 6 }}
                  numberOfLines={2}
                >
                  {item.description}
                </Text>
              )}
            </TouchableOpacity>
          )
        }}
        contentContainerStyle={{ paddingBottom: 80 }}
      />
      <View
        style={{
          position: 'absolute',
          left: 12,
          right: 12,
          bottom: 16,
        }}
      >
        <TouchableOpacity
          onPress={() => navigatorManager.goToTopicAdd()}
          style={{
            backgroundColor: '#3b82f6',
            borderRadius: 10,
            padding: 14,
            alignItems: 'center',
          }}
        >
          <Text style={{ color: 'white', fontWeight: '700' }}>
            Criar tópico
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

export default TopicScreen
