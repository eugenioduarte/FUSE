import { RouteProp, useFocusEffect, useRoute } from '@react-navigation/native'
import React, { useCallback, useEffect, useState } from 'react'
import {
  ActivityIndicator,
  FlatList,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import {
  RootStackParamList,
  navigatorManager,
} from '../../../navigation/navigatorManager'
import { getUserProfile } from '../../../services/firebase/connections.service'
import { challengesRepository } from '../../../services/repositories/challenges.repository'
import { summariesRepository } from '../../../services/repositories/summaries.repository'
import { topicsRepository } from '../../../services/repositories/topics.repository'
import { useAuthStore } from '../../../store/useAuthStore'
//

type Item = {
  id: string
  title: string
  type?: 'hangman' | 'matrix' | 'quiz' | 'text'
  lastAttempt?: { score: number; total: number; at: number }
  lastUserId?: string
}

const formatDateTime = (ts: number) => {
  const d = new Date(ts)
  const pad = (n: number) => String(n).padStart(2, '0')
  const day = pad(d.getDate())
  const month = pad(d.getMonth() + 1)
  const year = d.getFullYear()
  const hours = pad(d.getHours())
  const minutes = pad(d.getMinutes())
  return `${day}/${month}/${year} ${hours}:${minutes}`
}

const formatDateOnly = (ts: number) => {
  const d = new Date(ts)
  const pad = (n: number) => String(n).padStart(2, '0')
  const day = pad(d.getDate())
  const month = pad(d.getMonth() + 1)
  const year = d.getFullYear()
  return `${day}/${month}/${year}`
}

const ChallengesListScreen: React.FC = () => {
  const route =
    useRoute<RouteProp<RootStackParamList, 'ChallengesListScreen'>>()
  const summaryId = route.params?.summaryId
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)
  const [topicColor, setTopicColor] = useState<string | undefined>()

  const getLastUserIdFromPayload = (payload: any): string | undefined => {
    const lastAt = payload?.lastAttempt?.at
    if (!lastAt) return undefined
    const attempts = Array.isArray(payload?.attempts)
      ? (payload.attempts as any[])
      : []
    const match = attempts.find((a) => a?.at === lastAt)
    return match?.userId
  }

  const attachLastAttempt = useCallback(
    (
      base: { id: string; title: string }[],
      all: Awaited<ReturnType<typeof challengesRepository.list>>,
    ): Item[] => {
      return base
        .map((l) => {
          const found = all.find((a) => a.id === l.id)
          const type = found?.type as any as Item['type'] | undefined
          return {
            id: l.id,
            title: l.title,
            type,
            lastAttempt: found?.payload?.lastAttempt,
            lastUserId: getLastUserIdFromPayload(found?.payload),
          }
        })
        .filter((i) => !!i.lastAttempt)
    },
    [],
  )

  const meId = useAuthStore((s) => s.user?.id)
  const [userNames, setUserNames] = useState<Record<string, string>>({})

  useEffect(() => {
    let active = true
    const load = async () => {
      if (!summaryId) {
        const all = await challengesRepository.list()
        if (!active) return
        const next: Item[] = all
          .map((c) => ({
            id: c.id,
            title: c.title,
            type: c.type as Item['type'],
            lastAttempt: c.payload?.lastAttempt,
            lastUserId: getLastUserIdFromPayload(c.payload),
          }))
          .filter((i) => !!i.lastAttempt)
        setItems(next)
        setLoading(false)
        return
      }
      const [list, all] = await Promise.all([
        challengesRepository.listBySummary(summaryId),
        challengesRepository.list(),
      ])
      if (!active) return
      const withMeta: Item[] = attachLastAttempt(list, all)
      setItems(withMeta)
      setLoading(false)

      // Resolve topic color for this summary
      try {
        const summary = await summariesRepository.getById(summaryId)
        if (!summary) return
        const topic = await topicsRepository.getById(summary.topicId)
        if (!active) return
        setTopicColor(topic?.backgroundColor || undefined)
      } catch {}
    }
    load()
    return () => {
      active = false
    }
  }, [summaryId, attachLastAttempt])

  // On focus: flush pending local changes to backend and Firestore, then reload list
  useFocusEffect(
    React.useCallback(() => {
      let mounted = true
      ;(async () => {
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
        // quick reload similar to useEffect
        try {
          if (!mounted) return
          if (summaryId == null) {
            const all = await challengesRepository.list()
            if (!mounted) return
            const next: Item[] = all
              .map((c) => ({
                id: c.id,
                title: c.title,
                type: c.type as Item['type'],
                lastAttempt: c.payload?.lastAttempt,
                lastUserId: getLastUserIdFromPayload(c.payload),
              }))
              .filter((i) => !!i.lastAttempt)
            setItems(next)
          } else {
            const [list, all] = await Promise.all([
              challengesRepository.listBySummary(summaryId),
              challengesRepository.list(),
            ])
            if (!mounted) return
            const withMeta: Item[] = attachLastAttempt(list, all)
            setItems(withMeta)
          }
        } catch {}
      })()
      return () => {
        mounted = false
      }
    }, [summaryId, attachLastAttempt]),
  )

  // Fetch display names for users that completed last attempts
  useEffect(() => {
    let mounted = true
    ;(async () => {
      const ids = Array.from(
        new Set(items.map((i) => i.lastUserId).filter(Boolean) as string[]),
      )
      const missing = ids.filter((id) => !(id in userNames))
      if (missing.length === 0) return
      const entries = await Promise.all(
        missing.map(async (uid) => {
          const p = await getUserProfile(uid)
          return [uid, p?.name || p?.email || uid] as const
        }),
      )
      if (!mounted) return
      setUserNames((prev) => {
        const next = { ...prev }
        for (const [uid, name] of entries) next[uid] = name
        return next
      })
    })()
    return () => {
      mounted = false
    }
  }, [items, userNames])

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#0b0b0c',
        }}
      >
        <ActivityIndicator />
      </View>
    )
  }

  const colored = !!topicColor
  const bg = topicColor || '#0b0b0c'
  const titleColor = colored ? '#111' : 'white'
  const cardBg = colored ? '#ffffffaa' : '#111214'
  const cardBorder = colored ? '#e5e7eb' : '#2B2C30'
  const cardText = colored ? '#111' : 'white'

  return (
    <View style={{ flex: 1, backgroundColor: bg, padding: 16 }}>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 12,
        }}
      >
        <Text style={{ color: titleColor, fontSize: 18, fontWeight: '700' }}>
          Challenges
        </Text>
        {!!summaryId && (
          <TouchableOpacity
            onPress={() => navigatorManager.goToChallengeAdd({ summaryId })}
          >
            <Text style={{ color: '#2563eb', fontWeight: '700' }}>+ Criar</Text>
          </TouchableOpacity>
        )}
      </View>
      {items.length === 0 ? (
        <Text style={{ color: colored ? '#333' : '#9ca3af' }}>
          Nenhum challenge.
        </Text>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(it) => it.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => {
                if (item.type === 'hangman')
                  navigatorManager.goToChallengeReviewHangman({
                    challengeId: item.id,
                  })
                else if (item.type === 'matrix')
                  navigatorManager.goToChallengeReviewMatrix({
                    challengeId: item.id,
                  })
                else if (item.type === 'text')
                  navigatorManager.goToChallengeReviewTextAnswer({
                    challengeId: item.id,
                  })
                else
                  navigatorManager.goToChallengeReviewQuiz({
                    challengeId: item.id,
                  })
              }}
              style={{
                backgroundColor: cardBg,
                borderColor: cardBorder,
                borderWidth: 1,
                borderRadius: 10,
                padding: 12,
                marginBottom: 10,
              }}
            >
              <Text style={{ color: cardText, fontWeight: '600' }}>
                {item.type === 'hangman'
                  ? `Hangman – ${formatDateOnly(item.lastAttempt!.at)} – ${item.lastAttempt!.score}`
                  : item.type === 'matrix'
                    ? `Matrix – ${formatDateOnly(item.lastAttempt!.at)} – ${item.lastAttempt!.score}`
                    : item.type === 'text'
                      ? `Resposta em Texto – ${formatDateOnly(item.lastAttempt!.at)} – ${Number(item.lastAttempt!.score).toFixed(1)}`
                      : `Quiz – ${formatDateTime(item.lastAttempt!.at)} – ${item.lastAttempt!.score}/${item.lastAttempt!.total}`}
              </Text>
              {!!item.lastUserId && (
                <Text style={{ color: cardText, opacity: 0.8, marginTop: 4 }}>
                  {`por ${item.lastUserId === meId ? 'você' : userNames[item.lastUserId] || '…'}`}
                </Text>
              )}
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  )
}

export default ChallengesListScreen
