import { Text } from '@/components'
import { useTheme } from '@/hooks/use-theme'
import { t } from '@/locales/translation'
import { aiService } from '@/services/ai/ai.service'
import {
  AppNotification,
  listenUserNotificationsTopLevel,
} from '@/services/firebase/notifications.service'
import { useAuthStore } from '@/store/useAuthStore'
import { useCalendarStore } from '@/store/useCalendarStore'
import { useOverlay } from '@/store/useOverlay'
import { useThemeStore } from '@/store/useThemeStore'
import { ThemeType } from '@/types/theme.type'
import { getCurrentLocale } from '@/locales'
import React, { useEffect, useState } from 'react'
import { StyleSheet, View } from 'react-native'

function buildHeaderDay(): string {
  const now = new Date()
  const locale = getCurrentLocale() || 'en'
  const monthShort = new Intl.DateTimeFormat(locale, { month: 'short' })
    .format(now)
    .replace('.', '')
    .toLowerCase()
  return `${now.getDate()}-${monthShort}`
}

function formatTime(dt: Date) {
  const hh = String(dt.getHours()).padStart(2, '0')
  const mm = String(dt.getMinutes()).padStart(2, '0')
  return `${hh}:${mm}`
}

function formatWhenFriendly(dt: Date) {
  const now = new Date()

  const tzNow = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const tzDt = new Date(dt.getFullYear(), dt.getMonth(), dt.getDate())
  const dayDiff = Math.round(
    (tzDt.getTime() - tzNow.getTime()) / (1000 * 60 * 60 * 24),
  )
  const time = formatTime(dt)
  if (dayDiff === 0) return `${t('dashboard.agent.today')} ${time}`
  if (dayDiff === 1) return `${t('dashboard.agent.tomorrow')} ${time}`
  if (dayDiff > 1 && dayDiff <= 6) {
    const locale = getCurrentLocale() || 'en'
    const weekday = new Intl.DateTimeFormat(locale, { weekday: 'long' }).format(dt)
    return `${t('dashboard.agent.on')} ${weekday} ${t('dashboard.agent.at')} ${time}`
  }
  const dd = String(dt.getDate()).padStart(2, '0')
  const mm = String(dt.getMonth() + 1).padStart(2, '0')
  return `${t('dashboard.agent.in')} ${dd}/${mm} ${t('dashboard.agent.at')} ${time}`
}

export default function DashboardAgentDisplay() {
  const theme = useTheme()
  const color = useThemeStore((s) => s.colorLevelUp.background_color)
  const styles = createStyles(theme, color)

  const user = useAuthStore((s) => s.user)
  const events = useCalendarStore((s) => s.events)
  const rankingOverlay = useOverlay((s) => s.rankingOverlay)

  const [notifs, setNotifs] = useState<any[] | null>(null)
  const [generatedMessage, setGeneratedMessage] = useState<string | null>(null)
  const [lastPromptHash, setLastPromptHash] = useState<string | null>(null)

  useEffect(() => {
    try {
      useCalendarStore.getState().seedIfEmpty()
    } catch {}
  }, [])

  useEffect(() => {
    if (!user?.id) return
    let unsub: (() => void) | undefined
    try {
      unsub = listenUserNotificationsTopLevel(user.id, (list) => {
        setNotifs(list.slice(0, 5))
      })
    } catch {
      // ignore
    }
    return () => unsub?.()
  }, [user?.id])

  function getNextEventDetails(): { ev: any; dt: Date } | null {
    const now = Date.now()
    let best: { ev: any; dt: Date } | null = null
    for (const ev of events || []) {
      const time = ev.time || '00:00'
      const dateIso = `${ev.date}T${time}:00`
      const dt = new Date(dateIso)
      const ts = dt.getTime()
      if (ts <= now) continue
      if (!best || ts < best.dt.getTime()) best = { ev, dt }
    }
    return best
  }

  function getNotificationsMessage() {
    if (!notifs || notifs.length === 0) return null
    const latest = notifs[0] as AppNotification
    if (latest.event) {
      const dt = new Date(
        `${latest.event.date}T${latest.event.time || '00:00'}:00`,
      )
      return {
        kind: 'invite',
        title: latest.event.title,
        when: formatWhenFriendly(dt),
      }
    }
    if (latest.title)
      return { kind: 'note', title: latest.title, count: notifs.length }
    return { kind: 'count', count: notifs.length }
  }

  const agentMessage = (() => {
    const firstName = (user?.name || '').split(' ').find(Boolean)
    const greet = firstName
      ? t('dashboard.agent.greet_name', { name: firstName })
      : t('dashboard.agent.greet')

    const n = getNotificationsMessage()
    if (n) {
      if ((n as any).kind === 'invite')
        return greet + t('dashboard.agent.msg.invite', { title: (n as any).title, when: (n as any).when })
      if ((n as any).kind === 'note')
        return greet + t('dashboard.agent.msg.notifs_with_latest', { count: (n as any).count, title: (n as any).title })
      if ((n as any).kind === 'count')
        return greet + t('dashboard.agent.msg.notifs', { count: (n as any).count })
    }

    const next = getNextEventDetails()
    if (next) {
      const when = formatWhenFriendly(next.dt)
      return greet + t('dashboard.agent.msg.event_reminder', { title: next.ev.title, when })
    }

    if (rankingOverlay?.topicId)
      return greet + t('dashboard.agent.msg.ranking_update')

    return greet + t('dashboard.agent.msg.no_updates')
  })()

  function buildCombinedMessage(
    latestNotif: AppNotification | null,
    nextEvent: { ev: any; dt: Date } | null,
  ) {
    const firstName = (user?.name || '').split(' ').find(Boolean)
    const greet = firstName
      ? t('dashboard.agent.greet_combined_name', { name: firstName })
      : t('dashboard.agent.greet_combined')
    const notifLabel = latestNotif
      ? latestNotif.event?.title ||
        latestNotif.title ||
        latestNotif.body ||
        t('dashboard.agent.msg.a_new_notification')
      : null
    const when = nextEvent ? formatWhenFriendly(nextEvent.dt) : null
    const evTitle = nextEvent
      ? nextEvent.ev?.title || t('dashboard.agent.msg.an_appointment')
      : null

    if (notifLabel && when && evTitle) {
      return greet + t('dashboard.agent.msg.combined', { label: notifLabel, when, title: evTitle })
    }

    return agentMessage
  }

  const next = getNextEventDetails()
  const latestNotif =
    notifs && notifs.length > 0 ? (notifs[0] as AppNotification) : null
  const whenFriendly = next ? formatWhenFriendly(next.dt) : null
  let prompt = ''
  let promptHash = ''
  if (latestNotif || next) {
    const name = user?.name || ''
    const parts: string[] = []
    if (latestNotif) {
      const title = latestNotif.title || ''
      const body = latestNotif.body || ''
      if (latestNotif.event) {
        const ev = latestNotif.event
        parts.push(
          `Notification: invite '${ev.title || title}' on ${ev.date}${ev.time ? ' at ' + ev.time : ''}.`,
        )
      } else {
        parts.push(`Notification: ${title}${body ? ' - ' + body : ''}.`)
      }
    }
    if (next) {
      parts.push(`Next appointment: '${next.ev.title}' ${whenFriendly}.`)
    }

    prompt = `You are a concise assistant. Generate ONE single short and direct sentence (max 25 words). No opinions, no suggestions, no paragraphs. Start with a short greeting 'Hello${name ? ', ' + name : ''}' and state only the facts: ${parts.join(' ')}.`
    promptHash = JSON.stringify([parts, user?.name || ''])
  }

  useEffect(() => {
    if (!prompt) {
      setGeneratedMessage(null)
      return
    }
    if (promptHash === lastPromptHash) return

    let cancelled = false
    ;(async () => {
      try {
        const summary = await aiService.generateSummary(prompt)
        if (cancelled) return
        const raw = (summary?.content || summary?.title || '').trim()
        if (raw) {
          const norm = raw.split(/\s+/).join(' ')

          const firstSentence = norm.split(/[.?!]\s/)[0]
          const limited =
            firstSentence.length > 180
              ? firstSentence.slice(0, 177) + '...'
              : firstSentence
          const final = limited.endsWith('.') ? limited : limited + '.'
          setGeneratedMessage(final)
          setLastPromptHash(promptHash)
        }
      } catch (err) {
        console.warn('AI generate failed', err)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [prompt, promptHash, lastPromptHash])

  const headerDayText = buildHeaderDay()

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text variant="xLarge" style={styles.headerTitle}>
          {t('dashboard.agent.title') || 'Agente'}
        </Text>
        <Text variant="xxLarge" style={styles.headerDay}>
          {headerDayText}
        </Text>
      </View>

      <View style={styles.messageBubble}>
        <Text variant="medium">
          {notifs && notifs.length > 0 && next
            ? buildCombinedMessage(notifs[0] as AppNotification, next)
            : (generatedMessage ?? agentMessage)}
        </Text>
      </View>
    </View>
  )
}

const createStyles = (theme: ThemeType, color: string) =>
  StyleSheet.create({
    card: {
      borderWidth: 1,
      borderColor: theme.colors.borderColor,
      borderRadius: theme.border.radius16,
      backgroundColor: theme.colors.backgroundPrimary,
      overflow: 'hidden',
      marginBottom: theme.spacings.small,
      borderBottomWidth: theme.border.shadow,
      borderRightWidth: theme.border.shadow,
    },

    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-end',
      backgroundColor: color,
      paddingHorizontal: theme.spacings.medium,
      paddingVertical: theme.spacings.small,
      borderTopLeftRadius: theme.border.radius16,
      borderTopRightRadius: theme.border.radius16,
    },

    headerTitle: {
      color: theme.colors.textPrimary,
    },

    headerDay: {
      fontSize: 40,
      lineHeight: 40,
      color: theme.colors.textPrimary,
    },

    messageBubble: {
      borderRadius: theme.border.radius12,
      padding: theme.spacings.medium,
    },
  })
