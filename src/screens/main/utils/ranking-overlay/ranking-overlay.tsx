import { Text } from '@/components'
import { useTheme } from '@/hooks/use-theme'
import { t } from '@/locales/translation'
import { getUserProfile } from '@/services/firebase/connections.service'
import { challengesRepository } from '@/services/repositories/challenges.repository'
import { summariesRepository } from '@/services/repositories/summaries.repository'
import { topicsRepository } from '@/services/repositories/topics.repository'
import { useOverlay } from '@/store/useOverlay'
import { useThemeStore } from '@/store/useThemeStore'
import { ThemeType } from '@/types/theme.type'
import { Ionicons } from '@expo/vector-icons'
import React, { useEffect, useState } from 'react'
import {
  ActivityIndicator,
  FlatList,
  Modal,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native'
import OverlayContainer from '../components/overlay-container'

type AnyAttempt = { at: number; score: number; total: number; userId?: string }

type Row = {
  uid: string
  profile: ReturnType<typeof getUserProfile> extends Promise<infer U>
    ? U | null
    : any
  score: number
}

const RankingOverlay: React.FC = () => {
  const theme = useTheme()
  const color = useThemeStore((s) => s.colorLevelUp.background_color)
  const styles = createStyles(theme, color)

  const { rankingOverlay, setRankingOverlay } = useOverlay()
  const visible = !!rankingOverlay
  const topicId = rankingOverlay?.topicId

  const [loading, setLoading] = useState(true)
  const [rows, setRows] = useState<Row[]>([])

  useEffect(() => {
    let active = true
    if (!topicId) {
      return () => {}
    }

    const getParticipants = (topic: any) => {
      const ids = new Set<string>()
      if (topic?.createdBy) ids.add(topic.createdBy)
      for (const m of topic?.members ?? []) if (m) ids.add(m)
      return Array.from(ids)
    }

    const computePerUserScore = (inTopic: any[], participants: string[]) => {
      const perUserScore = new Map<string, number>()
      for (const uid of participants) perUserScore.set(uid, 0)

      for (const ch of inTopic) {
        const attempts: AnyAttempt[] = Array.isArray(ch.payload?.attempts)
          ? ch.payload.attempts
          : []
        const bestByUser = new Map<string, number>()
        for (const at of attempts) {
          if (!at?.userId) continue
          const curr = bestByUser.get(at.userId) ?? 0
          if (at.score > curr) bestByUser.set(at.userId, at.score)
        }
        for (const [uid, best] of bestByUser.entries()) {
          perUserScore.set(uid, (perUserScore.get(uid) || 0) + best)
        }
      }

      return perUserScore
    }

    ;(async function fetchRanking() {
      try {
        setLoading(true)
        const topic = await topicsRepository.getById(topicId)
        if (!active) return

        const participants = getParticipants(topic)

        const summaries = await summariesRepository.list(topicId)
        const sumIds = new Set(summaries.map((s) => s.id))

        const allChallenges = await challengesRepository.list()
        const inTopic = allChallenges.filter((c) => sumIds.has(c.summaryId))

        const perUserScore = computePerUserScore(inTopic, participants)

        const keys = Array.from(perUserScore.keys())
        const profiles = await Promise.all(
          keys.map((uid) => getUserProfile(uid)),
        )
        const profileMap = new Map<string, any>()
        for (let i = 0; i < keys.length; i++) {
          profileMap.set(keys[i], profiles[i] || null)
        }

        const computed: Row[] = keys.map((uid) => ({
          uid,
          score: perUserScore.get(uid) || 0,
          profile: profileMap.get(uid) || null,
        }))

        const nonZero = computed.filter((r) => r.score > 0)
        nonZero.sort((a, b) => b.score - a.score)
        if (active) setRows(nonZero)
      } catch (e) {
        console.error('RankingOverlay error', e)
        if (active) setRows([])
      } finally {
        if (active) setLoading(false)
      }
    })()

    return () => {
      active = false
    }
  }, [topicId])

  if (!rankingOverlay) return null

  const close = () => setRankingOverlay(null)

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      statusBarTranslucent
    >
      <OverlayContainer>
        <View style={styles.card}>
          <View style={styles.headerRow}>
            <Text variant="xLarge">{t('ranking.title')}</Text>
            <TouchableOpacity onPress={close}>
              <Ionicons
                name="close"
                size={26}
                color={theme.colors.textPrimary}
              />
            </TouchableOpacity>
          </View>

          {loading ? (
            <View style={styles.center}>
              <ActivityIndicator />
            </View>
          ) : rows.length === 0 ? (
            <Text variant="large">{t('ranking.empty')}</Text>
          ) : (
            <FlatList
              data={rows}
              keyExtractor={(r) => r.uid}
              style={styles.list}
              renderItem={({ item, index }) => (
                <View style={[styles.rowCard]}>
                  <View style={styles.rowLeft}>
                    <Text variant="xxLarge">{index + 1}</Text>
                    <View style={styles.nameBlock}>
                      <Text variant="large">
                        {item.profile?.name || item.profile?.email || item.uid}
                      </Text>
                      {!!item.profile?.email && (
                        <Text variant="small" style={styles.smallEmail}>
                          {item.profile.email}
                        </Text>
                      )}
                    </View>
                  </View>
                  <View style={styles.scoreCircle}>
                    <Text variant="large">{Math.round(item.score)}</Text>
                  </View>
                </View>
              )}
            />
          )}
        </View>
      </OverlayContainer>
    </Modal>
  )
}

export default RankingOverlay

const createStyles = (theme: ThemeType, color?: string) =>
  StyleSheet.create({
    card: {
      width: '100%',
      maxHeight: '80%',
      borderRadius: theme.spacings.xMedium,
      padding: theme.spacings.medium,
    },
    headerRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: theme.spacings.xMedium,
    },
    center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    list: { marginTop: theme.spacings.small },
    rowCard: {
      paddingVertical: theme.spacings.xMedium,
      marginBottom: theme.spacings.small,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    rowLeft: { flexDirection: 'row', alignItems: 'center' },
    nameBlock: { marginLeft: theme.spacings.medium },
    smallEmail: { marginTop: -theme.spacings.xSmall },
    scoreCircle: {
      backgroundColor: theme.colors.backgroundTertiary,
      width: theme.spacings.xLarge,
      height: theme.spacings.xLarge,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: theme.spacings.medium,
    },
  })
