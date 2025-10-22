import React from 'react'
import { FlatList, Image, TouchableOpacity, View } from 'react-native'
import { Card, UiText } from '../../../../components'
import { navigatorManager } from '../../../../navigation/navigatorManager'

type users = {
  id: string
  name: string
  avatarUrl: string
}

export type TopicCardPayload = {
  id: string
  topicName: string
  score?: number
  createdAt?: string
  spendTime?: string
  usersShared?: users[]
  summaries?: { id: string; title?: string }[]
  backgroundColor?: string
}

const TopicCard = (payload: TopicCardPayload) => {
  const {
    id,
    topicName,
    score,
    createdAt,
    spendTime,
    usersShared,
    summaries,
    backgroundColor,
  } = payload
  const goToTopic = () => navigatorManager.goToTopicDetails(id)
  const colored = !!backgroundColor
  const titleColor = colored ? '#111' : undefined

  return (
    <TouchableOpacity onPress={goToTopic} style={{ width: '100%' }}>
      <Card
        style={{ marginBottom: 8, backgroundColor: backgroundColor || '#fff' }}
      >
        <UiText variant="title" color={titleColor}>
          {topicName}
        </UiText>
        {!!score && <UiText>Score: {score}</UiText>}
        {!!createdAt && <UiText>Criado em: {createdAt}</UiText>}
        {!!spendTime && <UiText>Tempo: {spendTime}</UiText>}
        {!!usersShared?.length && (
          <FlatList
            data={usersShared}
            keyExtractor={(item) => item.id}
            horizontal
            contentContainerStyle={{ gap: 8, marginTop: 8 }}
            renderItem={({ item }) => (
              <View>
                <Image
                  source={{ uri: item.avatarUrl }}
                  style={{ width: 36, height: 36, borderRadius: 18 }}
                />
              </View>
            )}
            showsHorizontalScrollIndicator={false}
          />
        )}

        {!!summaries?.length && (
          <View
            style={{
              flexDirection: 'row',
              flexWrap: 'wrap',
              gap: 8,
              marginTop: 8,
            }}
          >
            {summaries.map((s) => (
              <View
                key={s.id}
                style={{
                  backgroundColor: '#111827',
                  borderColor: '#374151',
                  borderWidth: 1,
                  borderRadius: 999,
                  paddingVertical: 6,
                  paddingHorizontal: 10,
                }}
              >
                <UiText color="#9ca3af">{s.title || 'Resumo'}</UiText>
              </View>
            ))}
          </View>
        )}
      </Card>
    </TouchableOpacity>
  )
}

export default TopicCard
