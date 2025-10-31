import Container from '@/components/containers/Container'
import SubContainer from '@/components/containers/SubContainer'
import { useTheme } from '@/hooks/useTheme'
import { useFocusEffect } from '@react-navigation/native'
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
import { useThemeStore } from '../../../store/useThemeStore'
import { Topic } from '../../../types/domain'

const Separator = () => <View style={{ height: 8 }} />

const TopicScreen = () => {
  const theme = useTheme()
  const setBackgroundColor = useThemeStore((s) => s.setBackgroundColor)
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

  // Ensure header background updates immediately when TopicScreen gains focus
  useFocusEffect(
    React.useCallback(() => {
      setBackgroundColor(theme.colors.accentGreen)
    }, [setBackgroundColor, theme.colors.accentGreen]),
  )
  useEffect(() => {
    setBackgroundColor(theme.colors.accentGreen)
  }, [setBackgroundColor, theme.colors.accentGreen])

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator />
      </View>
    )
  }

  return (
    <Container style={{ backgroundColor: theme.colors.accentGreen }}>
      <SubContainer>
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
          style={{ width: '100%' }}
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
      </SubContainer>
    </Container>
  )
}

export default TopicScreen
