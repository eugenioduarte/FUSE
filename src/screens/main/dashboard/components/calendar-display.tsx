import { format } from 'date-fns'
import React, { useEffect, useMemo, useRef } from 'react'
import { FlatList, TouchableOpacity, View } from 'react-native'
import { Card, Text } from '../../../../components'
import { navigatorManager } from '../../../../navigation/navigatorManager'
import { useCalendarStore } from '../../../../store/calendar.store'

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
        <Text variant="medium">{title}</Text>
        <TouchableOpacity
          disabled={!topicId}
          onPress={() => topicId && navigatorManager.goToTopicDetails(topicId)}
        >
          <Text style={{ color: '#1d4ed8' }}>Ver tópico</Text>
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
          <Text>ID do tópico: {topicId ?? '—'}</Text>
          <Text>(navegação passará esse id)</Text>
        </View>
      </View>
    </Card>
  )
}

const CalendarDisplay = () => {
  // Use a stable reference to avoid re-running effect on each render
  // Seed demo data once on mount without subscribing or causing re-renders
  const seededRef = useRef(false)
  const today = useMemo(() => format(new Date(), 'yyyy-MM-dd'), [])
  const events = useCalendarStore((s) => s.events)
  const dailyData = useMemo(
    () => events.filter((e) => e.date === today),
    [events, today],
  )

  useEffect(() => {
    if (!seededRef.current) {
      seededRef.current = true
      // Access the store state directly; do not subscribe
      const fn = useCalendarStore.getState().seedIfEmpty
      void fn?.()
    }
  }, [])
  const sortedDaily = useMemo(() => {
    const toMinutes = (t?: string | null) => {
      if (!t) return null
      const m = /^(\d{2}):(\d{2})$/.exec(t)
      if (!m) return null
      const hh = Number(m[1])
      const mm = Number(m[2])
      if (Number.isNaN(hh) || Number.isNaN(mm)) return null
      return hh * 60 + mm
    }
    const copy = [...dailyData]
    copy.sort((a, b) => {
      const ta = toMinutes(a.time)
      const tb = toMinutes(b.time)
      if (ta != null && tb != null) return ta - tb
      if (ta != null) return -1
      if (tb != null) return 1
      return (a.title || '').localeCompare(b.title || '')
    })
    return copy
  }, [dailyData])

  if (sortedDaily.length === 0) return null

  return (
    <Card style={{ height: 240, width: '100%', marginBottom: 8 }}>
      <View style={{ paddingHorizontal: 8, paddingTop: 8, paddingBottom: 4 }}>
        <Text variant="medium">Hoje ({sortedDaily.length})</Text>
      </View>
      <FlatList
        data={sortedDaily}
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
