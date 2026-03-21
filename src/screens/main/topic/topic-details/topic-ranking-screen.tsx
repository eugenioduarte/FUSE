import { RouteProp, useRoute } from '@react-navigation/native'
import React, { useEffect, useState } from 'react'
import { ActivityIndicator, FlatList, Text, View } from 'react-native'
import {
  navigatorManager,
  RootStackParamList,
} from '../../../../navigation/navigatorManager'
import {
  getUserProfile,
  PublicUser,
} from '../../../../services/firebase/connections.service'
import { challengesRepository } from '../../../../services/repositories/challenges.repository'
import { summariesRepository } from '../../../../services/repositories/summaries.repository'
import { topicsRepository } from '../../../../services/repositories/topics.repository'

// Minimal shape for reading attempts from challenge payload
// We will consider only attempts that carry userId

type AnyAttempt = { at: number; score: number; total: number; userId?: string }

type Row = {
  uid: string
  profile: PublicUser | null
  score: number
}

const TopicRankingScreen: React.FC = () => {
  const route = useRoute<RouteProp<RootStackParamList, 'TopicRankingScreen'>>()
  const topicId = route.params?.topicId

  const [loading, setLoading] = useState(true)
  const [rows, setRows] = useState<Row[]>([])
  const [bgColor, setBgColor] = useState<string | undefined>(undefined)

  useEffect(() => {
    let active = true
    ;(async () => {
      try {
        const topic = await topicsRepository.getById(topicId)
        if (!active) return
        setBgColor(topic?.backgroundColor)
        // Determine participants: owner + members (unique)
        const ids = new Set<string>()
        if (topic?.createdBy) ids.add(topic.createdBy)
        for (const m of topic?.members ?? []) {
          if (m) ids.add(m)
        }
        const participants = Array.from(ids)

        // Gather summaries for this topic
        const summaries = await summariesRepository.list(topicId)
        const sumIds = new Set(summaries.map((s) => s.id))

        // All challenges (local cache)
        const allChallenges = await challengesRepository.list()
        const inTopic = allChallenges.filter((c) => sumIds.has(c.summaryId))

        // Compute per-user best-per-challenge sum
        const perUserScore = new Map<string, number>()
        for (const uid of participants) perUserScore.set(uid, 0)

        for (const ch of inTopic) {
          const attempts: AnyAttempt[] = Array.isArray(ch.payload?.attempts)
            ? ch.payload.attempts
            : []
          // Best score per user for this challenge
          const bestByUser = new Map<string, number>()
          for (const at of attempts) {
            if (!at || !at.userId) continue
            const curr = bestByUser.get(at.userId) ?? 0
            if (at.score > curr) bestByUser.set(at.userId, at.score)
          }
          for (const [uid, best] of bestByUser.entries()) {
            if (!perUserScore.has(uid)) perUserScore.set(uid, 0)
            perUserScore.set(uid, (perUserScore.get(uid) || 0) + best)
          }
        }

        // Fetch minimal profiles
        const profiles = await Promise.all(
          Array.from(perUserScore.keys()).map((uid) => getUserProfile(uid)),
        )
        const profileMap = new Map<string, PublicUser | null>()
        const keys = Array.from(perUserScore.keys())
        for (let i = 0; i < keys.length; i++) {
          profileMap.set(keys[i], profiles[i] || null)
        }

        const computed: Row[] = Array.from(perUserScore.entries()).map(
          ([uid, score]) => ({
            uid,
            score,
            profile: profileMap.get(uid) || null,
          }),
        )
        // Only show users with some score to avoid empty rows? The spec implies ranking of those who "fizeram" challenges.
        const nonZero = computed.filter((r) => r.score > 0)
        // Sort descending
        nonZero.sort((a, b) => b.score - a.score)
        if (active) setRows(nonZero)
      } catch (e) {
        console.error(e)
        if (active) setRows([])
      } finally {
        if (active) setLoading(false)
      }
    })()
    return () => {
      active = false
    }
  }, [topicId])

  const bg = bgColor || '#0b0b0c'
  const titleColor = bgColor ? '#111' : 'white'
  const cardBg = bgColor ? '#ffffffaa' : '#111214'
  const cardText = bgColor ? '#111' : 'white'
  const border = bgColor ? '#e5e7eb' : '#2B2C30'

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
          Ranking do Tópico
        </Text>
        <Text
          onPress={() => navigatorManager.goBack()}
          style={{ color: '#3b82f6', fontWeight: '700' }}
        >
          Fechar
        </Text>
      </View>

      {loading ? (
        <View
          style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
        >
          <ActivityIndicator />
        </View>
      ) : rows.length === 0 ? (
        <Text style={{ color: bgColor ? '#333' : '#9ca3af' }}>
          Ainda não há pontuações para este tópico.
        </Text>
      ) : (
        <FlatList
          data={rows}
          keyExtractor={(r) => r.uid}
          renderItem={({ item, index }) => (
            <View
              style={{
                backgroundColor: cardBg,
                borderColor: border,
                borderWidth: 1,
                borderRadius: 10,
                padding: 12,
                marginBottom: 10,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={{ color: cardText, fontWeight: '800', width: 24 }}>
                  {index + 1}.
                </Text>
                <View>
                  <Text style={{ color: cardText, fontWeight: '700' }}>
                    {item.profile?.name || item.profile?.email || item.uid}
                  </Text>
                  {!!item.profile?.email && (
                    <Text style={{ color: bgColor ? '#333' : '#9ca3af' }}>
                      {item.profile.email}
                    </Text>
                  )}
                </View>
              </View>
              <Text style={{ color: cardText, fontWeight: '800' }}>
                {Math.round(item.score)}
              </Text>
            </View>
          )}
        />
      )}
    </View>
  )
}

export default TopicRankingScreen
