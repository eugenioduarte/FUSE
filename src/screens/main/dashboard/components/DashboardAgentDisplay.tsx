import { useTheme } from '@/hooks/useTheme'
import { t } from '@/locales/translation'
import { useOverlay } from '@/store/useOverlay'
import { ThemeType } from '@/types/theme.type'
import React, { useEffect, useState } from 'react'
import { Image, StyleSheet, View } from 'react-native'
import { Text } from '../../../../components'
import { aiService } from '../../../../services/ai/ai.service'
import {
  AppNotification,
  listenUserNotificationsTopLevel,
} from '../../../../services/firebase/notifications.service'
import { useAuthStore } from '../../../../store/useAuthStore'
import { useCalendarStore } from '../../../../store/useCalendarStore'

const IMAGE_SIZE = 60
const IMAGE_PLACEHOLDER = 'https://picsum.photos/200/300'

export default function DashboardAgentDisplay() {
  const theme = useTheme()
  const styles = createStyles(theme)

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

  // Subscribe once to the top-level user notifications (if available).
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

  // Helpers: find next event details (ev + Date) or null
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
    // midnight for day comparison
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
    // fallback to numeric date
    const dd = String(dt.getDate()).padStart(2, '0')
    const mm = String(dt.getMonth() + 1).padStart(2, '0')
    return `em ${dd}/${mm} às ${time}`
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

  // Build a humanized message (friendly tone + user's first name when available)
  const agentMessage = (() => {
    const firstName = (user?.name || '').split(' ').find(Boolean)
    const greet = firstName ? `Olá, ${firstName}! ` : 'Olá! '

    // 1) notifications should be top priority
    const n = getNotificationsMessage()
    if (n) {
      if ((n as any).kind === 'invite')
        return `${greet}Você recebeu um convite para “${(n as any).title}” ${(n as any).when}.`
      if ((n as any).kind === 'note')
        return `${greet}Você tem ${(n as any).count} novas notificações. A mais recente: “${(n as any).title}”.`
      if ((n as any).kind === 'count')
        return `${greet}Você tem ${(n as any).count} novas notificações.`
    }

    // 2) next event
    const next = getNextEventDetails()
    if (next) {
      const when = formatWhenFriendly(next.dt)
      return `${greet}Não esqueça: “${next.ev.title}” ${when}.`
    }

    // 3) ranking hint
    if (rankingOverlay?.topicId)
      return `${greet}Há novidades no ranking do seu tópico — confira para ver sua posição.`

    // fallback
    return `${greet}Sem novidades urgentes — que tal revisar um resumo rápido hoje?`
  })()

  // If both a latest notification and a next event exist, build a deterministic combined message
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
    // Compose concise secretary-style sentence
    if (notifLabel && when && evTitle) {
      // Example: "Olá, João, existe uma nova mensagem nas notificações e amanhã temos um compromisso 'Teste' às 09:00. Não se esqueça."
      // Keep it short and factual
      return `${greet}existe uma nova mensagem nas notificações${notifLabel ? `: "${notifLabel}"` : ''} e ${when} temos um compromisso "${evTitle}". Não se esqueça.`
    }
    // Fallback to agentMessage if something missing
    return agentMessage
  }

  // Use AI to generate a combined friendly message when there are new notifications or upcoming events.
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
    // Strong instruction: return a single concise factual sentence (like a secretary).
    // - Max ~25 words
    // - No opinions, no suggestions, no multi-sentence answers
    // - Start with a short greeting 'Olá, {Nome}, ' when name provided
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
          // normalize whitespace
          const norm = raw.split(/\s+/).join(' ')
          // take only the first sentence and limit length (defensive)
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
        // keep fallback agentMessage if AI fails
        console.warn('AI generate failed', err)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [prompt, promptHash, lastPromptHash])

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
          {t('dashboard.agent.title') || 'Agente'}
        </Text>

        <View style={styles.messageBubble}>
          <Text variant="medium">
            {
              // prefer combined local message when both notif+event exist; else prefer AI-generated short message; else fallback
              notifs && notifs.length > 0 && next
                ? buildCombinedMessage(notifs[0] as AppNotification, next)
                : (generatedMessage ?? agentMessage)
            }
          </Text>
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
      borderWidth: theme.border.size,
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
    messageBubble: {
      marginTop: theme.spacings.medium,
      width: '100%',
      backgroundColor: theme.colors.white,
      borderRadius: 12,
      padding: theme.spacings.small,
    },
  })
