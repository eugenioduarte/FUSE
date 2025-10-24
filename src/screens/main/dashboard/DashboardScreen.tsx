import Container from '@/src/components/containers/Container'
import { useFocusEffect } from '@react-navigation/native'
import React, { useCallback, useEffect, useState } from 'react'
import { FlatList, Text, View } from 'react-native'
import { summariesRepository } from '../../../services/repositories/summaries.repository'
import { topicsRepository } from '../../../services/repositories/topics.repository'
import CalendarDisplay from './components/CalendarDisplay'
import TopicCard from './components/TopicCard'

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
  const [items, setItems] = useState<DashItem[]>([])
  const [loading, setLoading] = useState(true)

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

  return (
    <Container>
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <TopicCard {...item} />}
        ListHeaderComponent={<CalendarDisplay />}
        ListEmptyComponent={
          loading ? null : (
            <View style={{ padding: 16 }}>
              <Text style={{ color: 'white' }}>
                Nenhum tópico encontrado. Crie um tópico para começar.
              </Text>
            </View>
          )
        }
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      />

      {/* Bottom CTA to create a new topic */}
      <View style={{ position: 'absolute', left: 16, right: 16, bottom: 16 }}>
        <View
          style={{
            backgroundColor: '#3b82f6',
            borderRadius: 10,
            paddingVertical: 14,
            alignItems: 'center',
          }}
          // @ts-ignore RN Pressable types not imported here; keep simple
          onTouchEnd={() =>
            import('../../../navigation/navigatorManager').then((m) =>
              m.navigatorManager.goToTopicAdd(),
            )
          }
        >
          <Text style={{ color: 'white', fontWeight: '700' }}>
            Criar novo tópico
          </Text>
        </View>
      </View>
    </Container>
  )
}
