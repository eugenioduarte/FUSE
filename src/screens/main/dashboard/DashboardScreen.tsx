import { Button } from '@/components'
import Container from '@/components/containers/Container'
import SubContainer from '@/components/containers/SubContainer'
import { useTheme } from '@/hooks/useTheme'
import { useAuthStore } from '@/store'
import { useFocusEffect } from '@react-navigation/native'
import React, { useCallback, useEffect, useState } from 'react'
import { FlatList, Text, View } from 'react-native'
import { navigatorManager } from '../../../navigation/navigatorManager'
import { summariesRepository } from '../../../services/repositories/summaries.repository'
import { topicsRepository } from '../../../services/repositories/topics.repository'
import CalendarDisplay from './components/CalendarDisplay'
import FrequencyDisplay from './components/FrequencyDisplay'
import TopicCard, { TopicCardPayload } from './components/TopicCard'

type DashItem = {
  id: string
  topicName: string
  createdAt: string
  summaries: { id: string; title?: string }[]
  score?: number
  spendTime?: string
  usersShared?: { id: string; name: string; avatarUrl: string }[]
  backgroundColor?: string
}

export default function DashboardScreen() {
  const theme = useTheme()
  const [items, setItems] = useState<DashItem[]>([])
  const [loading, setLoading] = useState(true)
  const user = useAuthStore((s) => s.user)

  useEffect(() => {
    if (!user) {
      navigatorManager.goToLoginScreen()
    }
  }, [user])

  useEffect(() => {
    let mounted = true
    ;(async () => {
      // Only show topics that actually exist in topicsRepository
      const topics = await topicsRepository.list()
      const enriched: DashItem[] = []
      for (const t of topics) {
        const summaries = await summariesRepository.list(t.id)
        enriched.push({
          id: t.id,
          topicName: t.title,
          createdAt: new Date(t.createdAt).toLocaleDateString(),
          summaries: summaries.map((s) => ({ id: s.id, title: s.title })),
          backgroundColor: t.backgroundColor,
        })
      }
      if (mounted) setItems(enriched)
      if (mounted) setLoading(false)
    })()
    return () => {
      mounted = false
    }
  }, [])

  useFocusEffect(
    useCallback(() => {
      let active = true
      ;(async () => {
        // Ensure we sync any topics where the user was added as a member
        try {
          const { syncUserTopicsMembership } = await import(
            '../../../services/firebase/invites.service'
          )
          await syncUserTopicsMembership()
        } catch {}
        // Flush local changes to backend and Firestore collaborators only when entering Dashboard
        try {
          const { processOfflineQueue } = await import(
            '../../../services/sync/sync.service'
          )
          await processOfflineQueue()
        } catch {}
        try {
          const { flushLocalCollaborativeChanges } = await import(
            '../../../services/firebase/collabFlush.service'
          )
          await flushLocalCollaborativeChanges()
        } catch {}
        const topics = await topicsRepository.list()
        const enriched: DashItem[] = []
        for (const t of topics) {
          const summaries = await summariesRepository.list(t.id)
          enriched.push({
            id: t.id,
            topicName: t.title,
            createdAt: new Date(t.createdAt).toLocaleDateString(),
            summaries: summaries.map((s) => ({ id: s.id, title: s.title })),
            backgroundColor: t.backgroundColor,
          })
        }
        if (active) setItems(enriched)
      })()
      return () => {
        active = false
      }
    }, []),
  )

  const mockTopicCard: TopicCardPayload = {
    id: 'topic-001',
    topicName: 'Machine Learning Fundamentals',
    score: 85,
    createdAt: '2025-10-21T10:30:00Z',
    spendTime: '2h 15min',
    backgroundColor: '#F5F7FF',
    usersShared: [
      {
        id: 'user-001',
        name: 'Alice Johnson',
        avatarUrl: 'https://randomuser.me/api/portraits/women/45.jpg',
      },
      {
        id: 'user-002',
        name: 'Bruno Costa',
        avatarUrl: 'https://randomuser.me/api/portraits/men/46.jpg',
      },
      {
        id: 'user-003',
        name: 'Chen Wei',
        avatarUrl: 'https://randomuser.me/api/portraits/men/24.jpg',
      },
    ],
    summaries: [
      { id: 'summary-001', title: 'What is Machine Learning?' },
      { id: 'summary-002', title: 'Supervised vs Unsupervised Learning' },
      { id: 'summary-003', title: 'Key Algorithms Overview' },
    ],
  }

  return (
    <Container style={{ backgroundColor: 'green', paddingTop: 0 }}>
      <SubContainer>
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <TopicCard {...mockTopicCard} />}
          ListHeaderComponent={
            <>
              <FrequencyDisplay />
              <CalendarDisplay />
            </>
          }
          ListEmptyComponent={
            loading ? null : (
              <View style={{ padding: 16 }}>
                <Text style={{ color: 'white' }}>
                  Nenhum tópico encontrado. Crie um tópico para começar.
                </Text>
              </View>
            )
          }
          contentContainerStyle={{
            paddingBottom: 100,
          }}
          showsVerticalScrollIndicator={false}
          style={{ width: '100%' }}
        />

        {/* Bottom CTA to create a new topic */}

        <Button
          title={' Criar novo tópico'}
          onPress={() => navigatorManager.goToTopicAdd()}
          style={{ marginTop: 16, alignSelf: 'center' }}
          background={theme.colors.accentRed}
          textColor={theme.colors.backgroundPrimary}
        />
      </SubContainer>
    </Container>
  )
}
