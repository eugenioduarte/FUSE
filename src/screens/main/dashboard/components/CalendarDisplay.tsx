import React, { useEffect } from 'react'
import { FlatList, TouchableOpacity, View } from 'react-native'
import { Card, UiText } from '../../../../components'
import { navigatorManager } from '../../../../navigation/navigatorManager'
import { useCalendarStore } from '../../../../store/useCalendarStore'

const CalendarCard = ({
  title,
  time,
  topicId,
  location,
}: {
  title: string
  time: string
  topicId?: string
  location?: string
}) => {
  return (
    <Card style={{ height: 200, width: 300, marginRight: 10 }}>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          padding: 8,
        }}
      >
        <UiText variant="title">{title}</UiText>
        <TouchableOpacity
          disabled={!topicId}
          onPress={() => topicId && navigatorManager.goToTopicDetails(topicId)}
        >
          <UiText style={{ color: '#1d4ed8' }}>Ver tópico</UiText>
        </TouchableOpacity>
      </View>

      <View
        style={{ flexDirection: 'row', justifyContent: 'flex-start', gap: 15 }}
      >
        <View>
          <UiText>{time}</UiText>
          {!!location && <UiText>{location}</UiText>}
        </View>
        <View>
          <UiText>ID do tópico: {topicId ?? '—'}</UiText>
          <UiText>(navegação passará esse id)</UiText>
        </View>
      </View>
    </Card>
  )
}

const CalendarDisplay = () => {
  const seedIfEmpty = useCalendarStore((s) => s.seedIfEmpty)
  const getEventsForDate = useCalendarStore((s) => s.getEventsForDate)
  const dailyData = getEventsForDate('2024-10-01')

  useEffect(() => {
    seedIfEmpty()
  }, [seedIfEmpty])

  return (
    <Card style={{ height: 200, width: '100%', marginBottom: 8 }}>
      <FlatList
        data={dailyData}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <CalendarCard
            title={item.title}
            time={item.time}
            topicId={item.topicId}
            location={item.location}
          />
        )}
        horizontal
      />
    </Card>
  )
}

export default CalendarDisplay
