import { PlusIcon } from '@/assets/icons'
import { Container, Text } from '@/components'
import { useTheme } from '@/hooks/useTheme'
import {
  RootStackParamList,
  navigatorManager,
} from '@/navigation/navigatorManager'
import { getUserProfile } from '@/services/firebase/connections.service'
import { challengesRepository } from '@/services/repositories/challenges.repository'
import { summariesRepository } from '@/services/repositories/summaries.repository'
import { startSession, stopSessionByKey } from '@/services/usage/usageTracker'
import { useAuthStore } from '@/store/useAuthStore'
import { useThemeStore } from '@/store/useThemeStore'
import { RouteProp, useFocusEffect, useRoute } from '@react-navigation/native'
import React, { useCallback, useEffect, useState } from 'react'
import {
  ActivityIndicator,
  FlatList,
  TouchableOpacity,
  View,
} from 'react-native'

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
  const theme = useTheme()
  const color = useThemeStore((s) => s.colorLevelUp.background_color)
  const route =
    useRoute<RouteProp<RootStackParamList, 'ChallengesListScreen'>>()
  const summaryId = route.params?.summaryId
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)

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

      try {
        const summary = await summariesRepository.getById(summaryId)
        if (!summary) return
        if (!active) return
      } catch {}
    }
    load()
    return () => {
      active = false
    }
  }, [summaryId, attachLastAttempt])

  useFocusEffect(
    React.useCallback(() => {
      let mounted = true
      ;(async () => {
        try {
          const { processOfflineQueue } = await import(
            '@/services/sync/sync.service'
          )
          await processOfflineQueue()
        } catch {}
        try {
          const { flushLocalCollaborativeChanges } = await import(
            '@/services/firebase/collabFlush.service'
          )
          await flushLocalCollaborativeChanges()
        } catch {}

        try {
          if (summaryId) {
            const { getFirestore, collection, getDocs, query, where } =
              await import('firebase/firestore')
            const { getFirebaseApp } = await import(
              '@/services/firebase/firebaseInit'
            )
            const db = getFirestore(getFirebaseApp())
            const q = query(
              collection(db, 'challenges'),
              where('summaryId', '==', summaryId),
            )
            const snap = await getDocs(q)
            const promises: Promise<any>[] = []
            for (const d of snap.docs) {
              const data: any = d.data()
              const c = {
                id: d.id,
                type: data.type,
                title: data.title,
                summaryId: data.summaryId,
                authorId: data.authorId,
                payload: data.payload,
                createdAt:
                  typeof data.createdAt === 'number'
                    ? data.createdAt
                    : (data.createdAt?.toMillis?.() ?? Date.now()),
                updatedAt:
                  typeof data.updatedAt === 'number'
                    ? data.updatedAt
                    : (data.updatedAt?.toMillis?.() ?? Date.now()),
              } as const
              promises.push(
                challengesRepository.upsert(c as any, '/sync/challenge', {
                  summaryId: c.summaryId,
                  fromSync: true,
                }),
              )
            }
            await Promise.all(promises)
          }
        } catch {}

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

  useFocusEffect(
    React.useCallback(() => {
      let sessionKey: string | null = null
      ;(async () => {
        try {
          if (!summaryId) return
          const summary = await summariesRepository.getById(summaryId)
          if (!summary) return
          sessionKey = await startSession(
            summary.topicId,
            'challenge_list',
            summaryId,
          )
        } catch {}
      })()
      return () => {
        if (sessionKey) stopSessionByKey(sessionKey)
      }
    }, [summaryId]),
  )

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

  return (
    <Container style={{ flex: 1, backgroundColor: color }}>
      {!!summaryId && (
        <TouchableOpacity
          onPress={() => navigatorManager.goToChallengeAdd({ summaryId })}
          style={{
            alignSelf: 'flex-end',
            paddingVertical: 16,
            paddingHorizontal: 16,
          }}
        >
          <PlusIcon width={20} height={20} fill={theme.colors.textPrimary} />
        </TouchableOpacity>
      )}

      {items.length === 0 ? (
        <Text variant="large">Nenhum challenge.</Text>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(it) => it.id}
          style={{ paddingHorizontal: 16 }}
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
                padding: 12,
                marginBottom: 10,
              }}
            >
              <Text variant="large">
                {item.type === 'hangman'
                  ? `Hangman – ${formatDateOnly(item.lastAttempt!.at)} – ${item.lastAttempt!.score}`
                  : item.type === 'matrix'
                    ? `Matrix – ${formatDateOnly(item.lastAttempt!.at)} – ${item.lastAttempt!.score}`
                    : item.type === 'text'
                      ? `Resposta em Texto – ${formatDateOnly(item.lastAttempt!.at)} – ${Number(item.lastAttempt!.score).toFixed(1)}`
                      : `Quiz – ${formatDateTime(item.lastAttempt!.at)} – ${item.lastAttempt!.score}/${item.lastAttempt!.total}`}
              </Text>
              {!!item.lastUserId && (
                <Text variant="large" style={{ opacity: 0.8, marginTop: 4 }}>
                  {`por ${item.lastUserId === meId ? 'você' : userNames[item.lastUserId] || '…'}`}
                </Text>
              )}
            </TouchableOpacity>
          )}
        />
      )}
    </Container>
  )
}

export default ChallengesListScreen
