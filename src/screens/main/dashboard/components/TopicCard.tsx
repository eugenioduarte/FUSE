import DisplayNumber from '@/components/ui/DisplayNumber'
import { useTheme } from '@/hooks/useTheme'
import React from 'react'
import { FlatList, Image, TouchableOpacity, View } from 'react-native'
import { Card, Text } from '../../../../components'
import { navigatorManager } from '../../../../navigation/navigatorManager'
import { TopicCardChart } from './TopicCardChart'
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
  const { id, topicName, score, usersShared, summaries, backgroundColor } =
    payload
  const theme = useTheme()
  const goToTopic = () => navigatorManager.goToTopicDetails(id)
  const colored = !!backgroundColor
  const titleColor = colored ? '#111' : undefined

  return (
    <TouchableOpacity onPress={goToTopic} style={{ width: '100%' }}>
      <Card
        style={{
          marginBottom: 8,
          backgroundColor: theme.colors.backgroundPrimary,
          paddingBottom: 16,
        }}
      >
        <View
          style={{
            marginBottom: 8,
            backgroundColor: backgroundColor || theme.colors.accentYellow,
            padding: 16,
            borderBottomColor: theme.colors.borderColor,
            borderBottomWidth: 1,
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Text variant="large" color={titleColor}>
            {topicName}
          </Text>
          {!!summaries && <Text>{summaries?.length}</Text>}
        </View>

        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: 16,
            marginBottom: 16,
          }}
        >
          <DisplayNumber value={score} label="Score" />
          <View>
            {!!usersShared?.length && (
              <FlatList
                data={usersShared}
                keyExtractor={(item) => item.id}
                horizontal
                contentContainerStyle={{ gap: 8, marginTop: 8 }}
                renderItem={({ item, index }) => (
                  <View
                    style={{
                      borderWidth: 2,
                      borderColor: theme.colors.black,
                      marginLeft: index > 0 ? -20 : 0,
                      borderRadius: 999,
                      borderBottomWidth: 5,
                    }}
                  >
                    <View
                      style={{
                        borderWidth: 2,
                        borderColor: backgroundColor,
                        borderRadius: 999,
                      }}
                    >
                      <Image
                        source={{ uri: item.avatarUrl }}
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: 18,
                        }}
                      />
                    </View>
                  </View>
                )}
                showsHorizontalScrollIndicator={false}
              />
            )}
          </View>
        </View>

        <TopicCardChart />
      </Card>
    </TouchableOpacity>
  )
}

export default TopicCard
