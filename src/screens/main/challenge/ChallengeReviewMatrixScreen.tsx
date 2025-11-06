import useTrackTopicSession from '@/hooks/useTrackTopicSession'
import { RouteProp, useRoute } from '@react-navigation/native'
import React, { useEffect, useMemo, useState } from 'react'
import { ActivityIndicator, ScrollView, Text, View } from 'react-native'
import {
  RootStackParamList,
  navigatorManager,
} from '../../../navigation/navigatorManager'
import { challengesRepository } from '../../../services/repositories/challenges.repository'
import { Challenge } from '../../../types/domain'

// Types from run screen persistence
type MatrixAttempt = {
  at: number
  score: number
  total: number
  question: string
  words: string[]
  found: string[]
  grid: string[][]
  placements: { word: string; cells: { r: number; c: number }[] }[]
}

const ChallengeReviewMatrixScreen: React.FC = () => {
  const route =
    useRoute<RouteProp<RootStackParamList, 'ChallengeReviewMatrixScreen'>>()
  const challengeId = (route.params as any)?.challengeId as string

  const [challenge, setChallenge] = useState<Challenge | null>(null)
  const [topicId, setTopicId] = useState<string | null>(null)
  const [attempt, setAttempt] = useState<MatrixAttempt | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    ;(async () => {
      try {
        const all = await challengesRepository.list()
        if (!active) return
        const ch = all.find((c) => c.id === challengeId) || null
        if (!ch) throw new Error('Challenge não encontrado')
        setChallenge(ch)
        const attempts: MatrixAttempt[] = ch.payload?.attempts || []
        const last = attempts.at(-1) || null
        setAttempt(last)
        try {
          const { summariesRepository } = await import(
            '../../../services/repositories/summaries.repository'
          )
          const summary = await summariesRepository.getById(ch.summaryId)
          if (summary) setTopicId(summary.topicId)
        } catch {}
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    })()
    return () => {
      active = false
    }
  }, [challengeId])

  useTrackTopicSession(topicId, 'challenge', challenge?.id)

  const foundCells = useMemo(() => {
    const set = new Set<string>()
    if (!attempt) return set
    for (const pl of attempt.placements) {
      if (!attempt.found.includes(pl.word)) continue
      for (const cell of pl.cells) set.add(`${cell.r},${cell.c}`)
    }
    return set
  }, [attempt])

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

  if (!challenge || !attempt) {
    return (
      <View style={{ flex: 1, backgroundColor: '#0b0b0c', padding: 16 }}>
        <Text style={{ color: 'white' }}>Sem dados para rever.</Text>
      </View>
    )
  }

  const dateStr = (() => {
    const d = new Date(attempt.at)
    const pad = (n: number) => String(n).padStart(2, '0')
    return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`
  })()

  return (
    <View style={{ flex: 1, backgroundColor: '#0b0b0c' }}>
      {/* Header */}
      <View
        style={{
          paddingHorizontal: 16,
          paddingTop: 16,
          paddingBottom: 8,
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Text style={{ color: 'white', fontSize: 18, fontWeight: '700' }}>
          Matrix – {dateStr} – {attempt.score}
        </Text>
        <Text
          onPress={() =>
            navigatorManager.goToChallengesList({
              summaryId: challenge.summaryId,
            })
          }
          style={{ color: '#60a5fa', fontWeight: '700' }}
        >
          Lista
        </Text>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16 }}>
        <Text style={{ color: '#e5e7eb', marginBottom: 12 }}>
          {attempt.question}
        </Text>
        {/* Grid with highlights for found words */}
        <View style={{ alignItems: 'flex-start' }}>
          {attempt.grid.map((row, ri) => (
            <View
              key={`${row.join('')}-${ri}`}
              style={{ flexDirection: 'row' }}
            >
              {row.map((ch, ci) => {
                const isFound = foundCells.has(`${ri},${ci}`)
                return (
                  <View
                    key={`${ch}-${ri}-${ci}`}
                    style={{
                      width: 22,
                      height: 22,
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderWidth: 0.5,
                      borderColor: isFound ? '#22c55e' : '#2B2C30',
                      backgroundColor: isFound ? '#14532d' : 'transparent',
                    }}
                  >
                    <Text
                      style={{
                        color: 'white',
                        fontSize: 12,
                        fontWeight: '700',
                      }}
                    >
                      {ch}
                    </Text>
                  </View>
                )
              })}
            </View>
          ))}
        </View>

        <View style={{ height: 12 }} />
        <View>
          {attempt.found.map((w) => (
            <Text key={w} style={{ color: '#e5e7eb' }}>
              • {w}
            </Text>
          ))}
        </View>
      </ScrollView>
    </View>
  )
}

export default ChallengeReviewMatrixScreen
