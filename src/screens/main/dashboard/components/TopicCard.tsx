import React from 'react'
import { FlatList, Image, Text, TouchableOpacity, View } from 'react-native'
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
    <TouchableOpacity
      onPress={goToTopic}
      style={{
        padding: 10,
        borderWidth: 1,
        borderColor: '#ccc',
        width: '100%',
        backgroundColor: 'white',
        marginBottom: 4,
      }}
    >
      <Text>{topicName}</Text>
      <Text>{score}</Text>
      <Text>{createdAt}</Text>
      <Text>{spendTime}</Text>
      <FlatList
        data={usersShared}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View>
            <Image
              source={{ uri: item.avatarUrl }}
              style={{ width: 50, height: 50 }}
            />
          </View>
        )}
      />
    </TouchableOpacity>
  )
}

export default TopicCard
