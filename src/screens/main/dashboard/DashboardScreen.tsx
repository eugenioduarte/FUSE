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
import TopicCard from '../topic/components/TopicCard/TopicCard'
import DashboardCalendarDisplay from './components/DashboardCalendarDisplay'
import DashboardNotificationDisplay from './components/DashboardNotificationDisplay'

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

  return (
    <Container
      style={{ backgroundColor: theme.colors.accentRed, paddingTop: 0 }}
    >
      <SubContainer>
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TopicCard item={{ id: item.id, title: item.topicName }} />
          )}
          ListHeaderComponent={
            <View style={{ marginBottom: 24, gap: 8, marginTop: 20 }}>
              <DashboardNotificationDisplay />
              <DashboardCalendarDisplay />
            </View>
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
            paddingTop: 16,
          }}
          showsVerticalScrollIndicator={false}
          style={{ width: '100%' }}
        />

        {/* Bottom CTA to create a new topic */}

        <Button
          title={' Criar novo tópico'}
          onPress={() => navigatorManager.goToTopicAdd()}
          style={{
            alignSelf: 'center',
            position: 'absolute',
            bottom: 20,
          }}
          background={theme.colors.accentRed}
          textColor={theme.colors.backgroundPrimary}
        />
      </SubContainer>
    </Container>
  )
}
