import { Text } from '@/components'
import { useTheme } from '@/hooks/useTheme'
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
import * as Localization from 'expo-localization'
import React, { useEffect, useState } from 'react'
import { StyleSheet, View } from 'react-native'

function buildHeaderDay(): string {
  const now = new Date()
  const locale =
    Localization.getLocales?.()[0]?.languageTag ||
    Localization.getLocales?.()[0]?.languageCode ||
    'pt-BR'
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

const WEEKDAYS_PT = [
  'domingo',
  'segunda-feira',
  'terça-feira',
  'quarta-feira',
  'quinta-feira',
  'sexta-feira',
  'sábado',
]

function formatWhenFriendly(dt: Date) {
  const now = new Date()

  const tzNow = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const tzDt = new Date(dt.getFullYear(), dt.getMonth(), dt.getDate())
  const dayDiff = Math.round(
    (tzDt.getTime() - tzNow.getTime()) / (1000 * 60 * 60 * 24),
  )
  const time = formatTime(dt)
  if (dayDiff === 0) return `hoje às ${time}`
  if (dayDiff === 1) return `amanhã às ${time}`
  if (dayDiff > 1 && dayDiff <= 6)
    return `na ${WEEKDAYS_PT[dt.getDay()]} às ${time}`
  const dd = String(dt.getDate()).padStart(2, '0')
  const mm = String(dt.getMonth() + 1).padStart(2, '0')
  return `em ${dd}/${mm} às ${time}`
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
    const greet = firstName ? `Olá, ${firstName}! ` : 'Olá! '

    const n = getNotificationsMessage()
    if (n) {
      if ((n as any).kind === 'invite')
        return `${greet}Você recebeu um convite para “${(n as any).title}” ${(n as any).when}.`
      if ((n as any).kind === 'note')
        return `${greet}Você tem ${(n as any).count} novas notificações. A mais recente: “${(n as any).title}”.`
      if ((n as any).kind === 'count')
        return `${greet}Você tem ${(n as any).count} novas notificações.`
    }

    const next = getNextEventDetails()
    if (next) {
      const when = formatWhenFriendly(next.dt)
      return `${greet}Não esqueça: “${next.ev.title}” ${when}.`
    }

    if (rankingOverlay?.topicId)
      return `${greet}Há novidades no ranking do seu tópico — confira para ver sua posição.`

    return `${greet}Sem novidades urgentes — que tal revisar um resumo rápido hoje?`
  })()

  function buildCombinedMessage(
    latestNotif: AppNotification | null,
    nextEvent: { ev: any; dt: Date } | null,
  ) {
    const firstName = (user?.name || '').split(' ').find(Boolean)
    const greet = firstName ? `Olá, ${firstName}, ` : 'Olá, '
    const notifLabel = latestNotif
      ? latestNotif.event?.title ||
        latestNotif.title ||
        latestNotif.body ||
        'uma nova notificação'
      : null
    const when = nextEvent ? formatWhenFriendly(nextEvent.dt) : null
    const evTitle = nextEvent ? nextEvent.ev?.title || 'um compromisso' : null

    if (notifLabel && when && evTitle) {
      return (
        greet +
        'existe uma nova mensagem nas notificações' +
        (notifLabel ? ': "' + notifLabel + '"' : '') +
        ' e ' +
        when +
        ' temos um compromisso "' +
        evTitle +
        '". Não se esqueça.'
      )
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
          `Notificação: convite '${ev.title || title}' em ${ev.date}${ev.time ? ' às ' + ev.time : ''}.`,
        )
      } else {
        parts.push(`Notificação: ${title}${body ? ' - ' + body : ''}.`)
      }
    }
    if (next) {
      parts.push(`Próximo compromisso: '${next.ev.title}' ${whenFriendly}.`)
    }

    prompt = `Você é uma secretária objetiva. Gere UMA única frase curta e direta em PT-BR (máx. 25 palavras). Sem opiniões, sem sugestões, sem parágrafos. Comece com uma saudação curta 'Olá${name ? ', ' + name : ''}' e relate apenas os fatos: ${parts.join(' ')}.`
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
