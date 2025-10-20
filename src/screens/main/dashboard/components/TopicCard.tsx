import React from 'react'
import { FlatList, Image, TouchableOpacity, View } from 'react-native'
import { Card, UiText } from '../../../../components'
import { navigatorManager } from '../../../../navigation/navigatorManager'

type users = {
  id: string
  name: string
  avatarUrl: string
}

type TopicCardPayload = {
  id: string
  topicName: string
  score: number
  createdAt: string
  spendTime: string
  usersShared: users[]
}

const TopicCard = (payload: TopicCardPayload) => {
  const { id, topicName, score, createdAt, spendTime, usersShared } = payload
  const goToTopic = () => navigatorManager.goToTopicDetails(id)

  return (
    <TouchableOpacity onPress={goToTopic} style={{ width: '100%' }}>
      <Card style={{ marginBottom: 8 }}>
        <UiText variant="title">{topicName}</UiText>
        <UiText>Score: {score}</UiText>
        <UiText>Criado em: {createdAt}</UiText>
        <UiText>Tempo: {spendTime}</UiText>
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
      </Card>
    </TouchableOpacity>
  )
}

export default TopicCard
