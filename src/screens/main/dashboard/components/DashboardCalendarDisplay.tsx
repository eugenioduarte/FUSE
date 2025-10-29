import { useTheme } from '@/hooks/useTheme'
import { t } from '@/locales/translation'
import { ThemeType } from '@/types/theme.type'
import React, { useEffect, useMemo, useState } from 'react'
import { Image, StyleSheet, View } from 'react-native'
import { Text } from '../../../../components'
import { topicsRepository } from '../../../../services/repositories/topics.repository'
import { useCalendarStore } from '../../../../store/useCalendarStore'

const IMAGE_SIZE = 60
const IMAGE_PLACEHOLDER = 'https://picsum.photos/200/300'

export default function DashboardCalendarDisplay() {
  const theme = useTheme()
  const styles = createStyles(theme)

  const getEventsForDate = useCalendarStore((s) => s.getEventsForDate)

  const today = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  const todayKey = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(
    today.getDate(),
  )}`

  useEffect(() => {
    try {
      useCalendarStore.getState().seedIfEmpty()
    } catch {}
  }, [])

  const events = useMemo(
    () => getEventsForDate(todayKey),
    [getEventsForDate, todayKey],
  )

  const [topicMeta, setTopicMeta] = useState<
    Record<string, { title: string; backgroundColor?: string }>
  >({})

  const eventTopicIdsKey = useMemo(
    () =>
      events
        .map((e) => e.topicId)
        .filter(Boolean)
        .join(','),
    [events],
  )

  // We intentionally depend on `eventTopicIdsKey` instead of `events` to
  // avoid re-fetching metadata for the same set of topic ids.

  useEffect(() => {
    if (!eventTopicIdsKey) return
    let mounted = true

    ;(async () => {
      const ids = Array.from(
        new Set(events.map((e) => e.topicId).filter(Boolean) as string[]),
      )

      const entries = await Promise.all(
        ids.map(async (id) => {
          try {
            const t = await topicsRepository.getById(id)
            return [id, t?.title || '', t?.backgroundColor] as const
          } catch {
            return [id, '', undefined] as const
          }
        }),
      )

      if (!mounted) return
      const map: Record<string, { title: string; backgroundColor?: string }> =
        {}
      for (const e of entries) {
        const [id, title, bg] = e
        if (id) map[id] = { title, backgroundColor: bg }
      }
      setTopicMeta(map)
    })()

    return () => {
      mounted = false
    }
  }, [eventTopicIdsKey, events])

  if (!events || events.length === 0) return null

  return (
    <View style={styles.container}>
      {events.map((ev) => {
        const day = ev.date.split('-')[2] || ''
        const time = ev.time || ''
        const topicTitle = ev.topicId ? topicMeta[ev.topicId]?.title || '' : ''
        const topicBg = ev.topicId
          ? topicMeta[ev.topicId]?.backgroundColor || theme.colors.accentYellow
          : theme.colors.accentYellow

        return (
          <View key={ev.id} style={styles.card}>
            <View style={styles.avatarContainer}>
              <View style={[styles.avatarBorder, { backgroundColor: topicBg }]}>
                <Image
                  style={styles.avatar}
                  source={{ uri: IMAGE_PLACEHOLDER }}
                />
              </View>
            </View>

            <Text variant="xLarge" style={styles.name}>
              {ev.title}
            </Text>

            <View style={styles.statsRow}>
              <View style={styles.stat}>
                <Text variant="large" style={styles.statValue}>
                  {day}
                </Text>
                <Text variant="small" style={styles.statLabel}>
                  {t('dashboard.calendar.day')}
                </Text>
              </View>
              <View style={[styles.divider, { backgroundColor: topicBg }]} />
              <View style={styles.stat}>
                <Text variant="large" style={styles.statValue}>
                  {time}
                </Text>
                <Text variant="small" style={styles.statLabel}>
                  {t('dashboard.calendar.hour')}
                </Text>
              </View>
            </View>

            <View style={styles.tagsContainer}>
              <View
                style={[
                  styles.tag,
                  {
                    backgroundColor: topicBg,
                    borderWidth: theme.border.size,
                    borderColor: theme.colors.borderColor,
                  },
                ]}
              >
                <Text variant="medium" style={styles.tagText} numberOfLines={1}>
                  {topicTitle || t('dashboard.calendar.topic')}
                </Text>
              </View>
            </View>
          </View>
        )
      })}
    </View>
  )
}

const createStyles = (theme: ThemeType) =>
  StyleSheet.create({
    container: { paddingTop: 30, flex: 1, minWidth: 0, height: 250 },
    card: {
      backgroundColor: theme.colors.backgroundSecondary,
      borderColor: theme.colors.borderColor,
      borderWidth: 1,
      borderRadius: theme.border.radius16,
      alignItems: 'center',
      paddingTop: 40,
      paddingBottom: 20,
      paddingHorizontal: theme.spacings.small,
      width: '100%',
      alignSelf: 'center',
      position: 'relative',
      height: '100%',
    },
    avatarContainer: {
      position: 'absolute',
      top: -30,
      alignSelf: 'center',
    },
    avatarBorder: {
      borderWidth: 2,
      borderColor: theme.colors.borderColor,
      borderRadius: 60,
      padding: 2,
      borderBottomWidth: 6,
    },
    avatar: {
      width: IMAGE_SIZE,
      height: IMAGE_SIZE,
      borderRadius: IMAGE_SIZE / 2,
      backgroundColor: theme.colors.borderColor,
    },
    name: {
      width: '100%',
      textAlign: 'center',
      borderBottomColor: theme.colors.borderColor,
      borderBottomWidth: theme.border.size,
      paddingVertical: theme.spacings.xSmall,
    },
    statsRow: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      alignItems: 'center',
      backgroundColor: theme.colors.white,
      borderRadius: theme.border.radius16,
      marginTop: theme.spacings.medium,
      paddingVertical: theme.spacings.medium,
      width: '100%',
    },
    stat: {
      alignItems: 'center',
      flex: 1,
    },
    statValue: { fontWeight: '700' },
    statLabel: { color: '#A28D9F', fontWeight: '500' },
    divider: { width: 1, height: 30 },
    tagsContainer: {
      marginTop: 16,
      gap: 8,
      width: '100%',
      alignItems: 'center',
    },
    tag: { borderRadius: 20, paddingHorizontal: 14, paddingVertical: 4 },
    tagText: { overflow: 'hidden', textOverflow: 'ellipsis' },
  })
