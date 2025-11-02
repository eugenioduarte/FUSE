import { t } from '@/locales/translation'
import { getUserProfile } from '@/services/firebase/connections.service'
import { challengesRepository } from '@/services/repositories/challenges.repository'
import { summariesRepository } from '@/services/repositories/summaries.repository'
import { topicsRepository } from '@/services/repositories/topics.repository'
import { useOverlay } from '@/store/useOverlay'
import React, { useEffect, useState } from 'react'
import {
  ActivityIndicator,
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'

type AnyAttempt = { at: number; score: number; total: number; userId?: string }

type Row = {
  uid: string
  profile: ReturnType<typeof getUserProfile> extends Promise<infer U>
    ? U | null
    : any
  score: number
}

const RankingOverlay: React.FC = () => {
  const { rankingOverlay, setRankingOverlay } = useOverlay()
  const visible = !!rankingOverlay
  const topicId = rankingOverlay?.topicId

  const [loading, setLoading] = useState(true)
  const [rows, setRows] = useState<Row[]>([])
  const [bgColor, setBgColor] = useState<string | undefined>(undefined)

  useEffect(() => {
    let active = true
    if (!topicId) return () => {}
    ;(async () => {
      try {
        setLoading(true)
        const topic = await topicsRepository.getById(topicId)
        if (!active) return
        setBgColor(topic?.backgroundColor)
        const ids = new Set<string>()
        if (topic?.createdBy) ids.add(topic.createdBy)
        for (const m of topic?.members ?? []) if (m) ids.add(m)
        const participants = Array.from(ids)

        const summaries = await summariesRepository.list(topicId)
        const sumIds = new Set(summaries.map((s) => s.id))

        const allChallenges = await challengesRepository.list()
        const inTopic = allChallenges.filter((c) => sumIds.has(c.summaryId))

        const perUserScore = new Map<string, number>()
        for (const uid of participants) perUserScore.set(uid, 0)

        for (const ch of inTopic) {
          const attempts: AnyAttempt[] = Array.isArray(ch.payload?.attempts)
            ? ch.payload.attempts
            : []
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

        const profiles = await Promise.all(
          Array.from(perUserScore.keys()).map((uid) => getUserProfile(uid)),
        )
        const profileMap = new Map<string, any>()
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

  const bg = bgColor || '#0b0b0c'
  const titleColor = bgColor ? '#111' : 'white'
  const cardBg = bgColor ? '#ffffffaa' : '#111214'
  const cardText = bgColor ? '#111' : 'white'
  const border = bgColor ? '#e5e7eb' : '#2B2C30'

  const close = () => setRankingOverlay(null)

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      statusBarTranslucent
    >
      <View style={styles.backdrop}>
        <View style={[styles.card, { backgroundColor: bg }]}>
          <View style={styles.headerRow}>
            <Text style={[styles.title, { color: titleColor }]}>
              Ranking do Tópico
            </Text>
            <TouchableOpacity onPress={close}>
              <Text style={styles.closeText}>{t('common.close')}</Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <View style={styles.center}>
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
              style={styles.list}
              renderItem={({ item, index }) => (
                <View
                  style={[
                    styles.rowCard,
                    { backgroundColor: cardBg, borderColor: border },
                  ]}
                >
                  <View style={styles.rowLeft}>
                    <Text style={[styles.rankText, { color: cardText }]}>
                      {index + 1}.
                    </Text>
                    <View>
                      <Text style={[styles.nameText, { color: cardText }]}>
                        {item.profile?.name || item.profile?.email || item.uid}
                      </Text>
                      {!!item.profile?.email && (
                        <Text style={{ color: bgColor ? '#333' : '#9ca3af' }}>
                          {item.profile.email}
                        </Text>
                      )}
                    </View>
                  </View>
                  <Text style={[styles.scoreText, { color: cardText }]}>
                    {Math.round(item.score)}
                  </Text>
                </View>
              )}
            />
          )}
        </View>
      </View>
    </Modal>
  )
}

export default RankingOverlay

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    width: '100%',
    maxHeight: '80%',
    borderRadius: 12,
    padding: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: { fontSize: 18, fontWeight: '700' },
  closeText: { color: '#3b82f6', fontWeight: '700' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  list: { marginTop: 8 },
  rowCard: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rowLeft: { flexDirection: 'row', alignItems: 'center' },
  rankText: { fontWeight: '800', width: 24 },
  nameText: { fontWeight: '700' },
  scoreText: { fontWeight: '800' },
})
