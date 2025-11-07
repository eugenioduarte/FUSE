import { useAuthStore } from '@/store'
import { useFocusEffect } from '@react-navigation/native'
import { useCallback, useEffect, useState } from 'react'
import { navigatorManager } from '../../../../navigation/navigatorManager'
import { summariesRepository } from '../../../../services/repositories/summaries.repository'
import { topicsRepository } from '../../../../services/repositories/topics.repository'

export type DashItem = {
  id: string
  topicName: string
  createdAt: string
  summaries: { id: string; title?: string }[]
  score?: number
  spendTime?: string
  usersShared?: { id: string; name: string; avatarUrl: string }[]
  backgroundColor?: string
}

export default function useDashboard() {
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

  useEffect(() => {
    const unsub = topicsRepository.onChange(async () => {
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
      setItems(enriched)
    })
    return () => {
      unsub()
    }
  }, [])

  useFocusEffect(
    useCallback(() => {
      let active = true
      ;(async () => {
        // Ensure we sync any topics where the user was added as a member
        try {
          const { syncUserTopicsMembership } = await import(
            '../../../../services/firebase/invites.service'
          )
          await syncUserTopicsMembership()
        } catch {}
        // Flush local changes to backend and Firestore collaborators only when entering Dashboard
        try {
          const { processOfflineQueue } = await import(
            '../../../../services/sync/sync.service'
          )
          await processOfflineQueue()
        } catch {}
        try {
          const { flushLocalCollaborativeChanges } = await import(
            '../../../../services/firebase/collabFlush.service'
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

  return { items, loading }
}
