import React, { useEffect } from 'react'
import { FlatList, Text, TouchableOpacity, View } from 'react-native'
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
  topicId: string
  location?: string
}) => {
  return (
    <View
      style={{
        backgroundColor: 'white',
        height: 200,
        padding: 10,
        width: 300,
        marginRight: 10,
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          padding: 20,
        }}
      >
        <Text>{title}</Text>
        <TouchableOpacity
          onPress={() => navigatorManager.goToTopicDetails(topicId)}
        >
          <Text style={{ color: 'blue' }}>Ver tópico</Text>
        </TouchableOpacity>
      </View>

      <View
        style={{ flexDirection: 'row', justifyContent: 'flex-start', gap: 15 }}
      >
        <View>
          <Text>{time}</Text>
          {!!location && <Text>{location}</Text>}
        </View>
        <View>
          <Text>ID do tópico: {topicId}</Text>
          <Text>(navegação passará esse id)</Text>
        </View>
      </View>
    </View>
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
    <View
      style={{
        backgroundColor: 'white',
        height: 200,
        padding: 10,
        width: '100%',
        marginBottom: 4,
      }}
    >
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
    </View>
  )
}

export default CalendarDisplay
