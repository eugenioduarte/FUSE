import Container from '@/src/components/containers/Container'
import React, { useEffect, useState } from 'react'
import { FlatList } from 'react-native'
import { dashboardRepository } from '../../../services/repositories/dashboard.repository'
import { TopicCardModel } from '../../../types/dashboard.type'
import CalendarDisplay from './components/CalendarDisplay'
import TopicCard from './components/TopicCard'

export default function DashboardScreen() {
  const [topicCards, setTopicCards] = useState<TopicCardModel[]>([])

  useEffect(() => {
    let mounted = true
    ;(async () => {
      await dashboardRepository.seedTopicCardsIfEmpty()
      const list = await dashboardRepository.listTopicCards()
      if (mounted) setTopicCards(list)
    })()
    return () => {
      mounted = false
    }
  }, [])

  return (
    <Container>
      <FlatList
        data={topicCards}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <TopicCard {...item} />}
        ListHeaderComponent={<CalendarDisplay />}
        showsVerticalScrollIndicator={false}
      />
    </Container>
  )
}
