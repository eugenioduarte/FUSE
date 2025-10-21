import { RouteProp, useRoute } from '@react-navigation/native'
import React, { useEffect, useState } from 'react'
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
import { challengesRepository } from '../../../services/repositories/challenges.repository'
//

type Item = {
  id: string
  title: string
  type?: 'hangman' | 'matrix' | 'quiz' | 'text'
  lastAttempt?: { score: number; total: number; at: number }
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

  const attachLastAttempt = (
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
        }
      })
      .filter((i) => !!i.lastAttempt)
  }

  useEffect(() => {
    let active = true
    const load = async () => {
      if (!summaryId) {
        const all = await challengesRepository.list()
        if (!active) return
        setItems(
          all
            .map((c) => ({
              id: c.id,
              title: c.title,
              type: c.type as Item['type'],
              lastAttempt: c.payload?.lastAttempt,
            }))
            .filter((i) => !!i.lastAttempt),
        )
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
    }
    load()
    return () => {
      active = false
    }
  }, [summaryId])

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
    <View style={{ flex: 1, backgroundColor: '#0b0b0c', padding: 16 }}>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 12,
        }}
      >
        <Text style={{ color: 'white', fontSize: 18, fontWeight: '700' }}>
          Challenges
        </Text>
        {!!summaryId && (
          <TouchableOpacity
            onPress={() => navigatorManager.goToChallengeAdd({ summaryId })}
          >
            <Text style={{ color: '#60a5fa', fontWeight: '700' }}>+ Criar</Text>
          </TouchableOpacity>
        )}
      </View>
      {items.length === 0 ? (
        <Text style={{ color: '#9ca3af' }}>Nenhum challenge.</Text>
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
                else
                  navigatorManager.goToChallengeReviewQuiz({
                    challengeId: item.id,
                  })
              }}
              style={{
                backgroundColor: '#111214',
                borderColor: '#2B2C30',
                borderWidth: 1,
                borderRadius: 10,
                padding: 12,
                marginBottom: 10,
              }}
            >
              <Text style={{ color: 'white', fontWeight: '600' }}>
                {item.type === 'hangman'
                  ? `Hangman – ${formatDateOnly(item.lastAttempt!.at)} – ${item.lastAttempt!.score}`
                  : item.type === 'matrix'
                    ? `Matrix – ${formatDateOnly(item.lastAttempt!.at)} – ${item.lastAttempt!.score}`
                    : `Quiz – ${formatDateTime(item.lastAttempt!.at)} – ${item.lastAttempt!.score}/${item.lastAttempt!.total}`}
              </Text>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  )
}

export default ChallengesListScreen
