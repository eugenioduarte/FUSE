import { useTheme } from '@/hooks/use-theme'
import { t } from '@/locales/translation'
import { ThemeType } from '@/types/theme.type'
import React, { useEffect, useMemo, useState } from 'react'
import { Image, StyleSheet, View } from 'react-native'
import { Text } from '../../../../components'
import { topicsRepository } from '../../../../services/repositories/topics.repository'
import { useCalendarStore } from '../../../../store/calendar.store'

const IMAGE_SIZE = 60
const IMAGE_PLACEHOLDER = 'https://picsum.photos/200/300'

export default function DashboardCalendarDisplay() {
  const theme = useTheme()
  const styles = createStyles(theme)

  const eventsAll = useCalendarStore((s) => s.events)

  useEffect(() => {
    try {
      useCalendarStore.getState().seedIfEmpty()
    } catch {}
  }, [])

  // compute next 3 upcoming events (date + time)
  const events = useMemo(() => {
    const now = Date.now()
    const parsed = eventsAll
      .map((e) => {
        // combine date (YYYY-MM-DD) and time (HH:MM) into Date
        const [y, m, d] = String(e.date).split('-').map(Number)
        const [hh, mm] = String(e.time || '00:00')
          .split(':')
          .map(Number)
        const dt = new Date(y, (m || 1) - 1, d || 1, hh || 0, mm || 0).getTime()
        return { ev: e, at: dt }
      })
      .filter((p) => !Number.isNaN(p.at) && p.at >= now)
      .sort((a, b) => a.at - b.at)
      .slice(0, 3)
      .map((p) => p.ev)
    return parsed
  }, [eventsAll])

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

  const fmtDateTime = (ev: any) => {
    try {
      const [y, m, d] = String(ev.date).split('-').map(Number)
      const [hh, mm] = String(ev.time || '00:00')
        .split(':')
        .map(Number)
      const dt = new Date(y, (m || 1) - 1, d || 1, hh || 0, mm || 0)
      return dt.toLocaleString()
    } catch {
      return `${ev.date} ${ev.time || ''}`
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.avatarContainer}>
          <View
            style={[
              styles.avatarBorder,
              { backgroundColor: theme.colors.accentYellow },
            ]}
          >
            <Image style={styles.avatar} source={{ uri: IMAGE_PLACEHOLDER }} />
          </View>
        </View>

        <Text variant="xLarge" style={styles.name}>
          {t('dashboard.calendar.title')}
        </Text>

        <View style={styles.listContainer}>
          {events.map((ev) => {
            const topicTitle = ev.topicId
              ? topicMeta[ev.topicId]?.title || ''
              : ''
            return (
              <View key={ev.id} style={styles.listRow}>
                <View style={styles.listLeft}>
                  <Text
                    variant="medium"
                    style={styles.rowTitle}
                    numberOfLines={1}
                  >
                    {ev.title}
                  </Text>
                  <Text
                    variant="small"
                    style={styles.rowMeta}
                    numberOfLines={1}
                  >
                    {topicTitle}
                  </Text>
                </View>
                <View style={styles.listRight}>
                  <Text
                    variant="small"
                    style={styles.rowTime}
                    numberOfLines={1}
                  >
                    {fmtDateTime(ev)}
                  </Text>
                </View>
              </View>
            )
          })}
        </View>
      </View>
    </View>
  )
}

const createStyles = (theme: ThemeType) =>
  StyleSheet.create({
    container: { paddingTop: 8, minWidth: 0 },
    card: {
      backgroundColor: theme.colors.backgroundSecondary,
      borderColor: theme.colors.borderColor,
      borderWidth: 1,
      borderRadius: theme.border.radius16,
      alignItems: 'center',
      paddingTop: 36,
      paddingBottom: 12,
      paddingHorizontal: theme.spacings.small,
      width: '100%',
      alignSelf: 'center',
      position: 'relative',
      marginBottom: theme.spacings.small,
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
      backgroundColor: theme.colors.backgroundTertiary,
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
      marginTop: theme.spacings.medium,
      width: '100%',
    },
    listContainer: { width: '100%' },
    listRow: {
      width: '100%',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: theme.spacings.xSmall,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.borderColor,
    },
    listLeft: { flex: 1, paddingRight: theme.spacings.small },
    listRight: { minWidth: 100, alignItems: 'flex-end' },
    rowTitle: { fontWeight: '700' },
    rowMeta: { color: theme.colors.textSecondary, marginTop: 2 },
    rowTime: { color: theme.colors.textSecondary },
  })
