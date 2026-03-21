import { RouteProp, useRoute } from '@react-navigation/native'
import React, { useEffect, useMemo, useState } from 'react'
import {
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native'
import { Colors, spacings, typography } from '../../../constants/theme'
import {
  navigatorManager,
  RootStackParamList,
} from '../../../navigation/navigatorManager'
import { getCurrentUser } from '../../../services/firebase/authService'
import { createSharedEvent } from '../../../services/firebase/calendar.service'
import {
  listAcceptedConnections,
  type PublicUser,
} from '../../../services/firebase/connections.service'
import { pushCalendarInviteToUid } from '../../../services/firebase/notifications.service'
import { summariesRepository } from '../../../services/repositories/summaries.repository'
import { topicsRepository } from '../../../services/repositories/topics.repository'
import { useAuthStore } from '../../../store/useAuthStore'
import { useCalendarStore } from '../../../store/useCalendarStore'
import type { Summary, Topic } from '../../../types/domain'

type CalendarEditRoute = RouteProp<RootStackParamList, 'CalendarEditScreen'>

const CalendarEditScreen: React.FC = () => {
  const route = useRoute<CalendarEditRoute>()
  const eventId = route.params?.id

  const events = useCalendarStore((s) => s.events)
  const editAppointment = useCalendarStore((s) => s.editAppointment)
  const setSelectedDate = useCalendarStore((s) => s.setSelectedDate)
  const me = useAuthStore((s) => s.user)

  const current = useMemo(
    () => events.find((e) => e.id === eventId),
    [events, eventId],
  )

  const date = current?.date || ''
  const [title, setTitle] = useState(current?.title || '')
  const [description, setDescription] = useState(current?.description || '')
  const [time, setTime] = useState(current?.time || '')
  const [topics, setTopics] = useState<Topic[]>([])
  const [topicId, setTopicId] = useState<string | undefined>(current?.topicId)
  const [summaries, setSummaries] = useState<Summary[]>([])
  const [summaryId, setSummaryId] = useState<string | undefined>(
    current?.summaryId,
  )
  const [connections, setConnections] = useState<PublicUser[]>([])
  const [selectedInviteUids, setSelectedInviteUids] = useState<string[]>([])
  const [inviteBusy, setInviteBusy] = useState(false)
  const [inviteError, setInviteError] = useState<string | null>(null)

  const handleToggleInvite = React.useCallback((uid: string) => {
    setSelectedInviteUids((prev) =>
      prev.includes(uid) ? prev.filter((id) => id !== uid) : [...prev, uid],
    )
  }, [])

  useEffect(() => {
    ;(async () => {
      await topicsRepository.seedIfEmpty()
      const list = await topicsRepository.list()
      setTopics(list)
      if (me?.id) {
        try {
          const cons = await listAcceptedConnections(me.id)
          setConnections(cons)
        } catch {}
      }
    })()
  }, [me?.id])

  useEffect(() => {
    ;(async () => {
      if (!topicId) {
        setSummaries([])
        setSummaryId(undefined)
        return
      }
      const list = await summariesRepository.list(topicId)
      setSummaries(list)
    })()
  }, [topicId])

  const onSave = async () => {
    if (!current) return
    if (!title.trim()) return
    const t = normalizeTime(time)
    editAppointment(current.id, {
      date,
      title: title.trim(),
      description: description.trim(),
      topicId,
      summaryId,
      time: t || undefined,
    })
    setSelectedDate(date)

    // Optional invite flow - only connections (create shared event and notify)
    if (selectedInviteUids.length > 0) {
      const ownerUid = me?.id || getCurrentUser()?.uid
      if (!ownerUid) {
        setInviteError('Não autenticado. Tente entrar novamente.')
        return
      }
      setInviteBusy(true)
      setInviteError(null)
      try {
        const eventId = await createSharedEvent(
          ownerUid,
          {
            title: title.trim(),
            description: description.trim(),
            date,
            time: t || undefined,
            topicId,
            summaryId,
          },
          selectedInviteUids,
        )
        await Promise.all(
          selectedInviteUids.map((toUid) =>
            pushCalendarInviteToUid(toUid, {
              eventId,
              title: title.trim(),
              description: description.trim(),
              date,
              time: t || undefined,
              topicId,
              summaryId,
              invitedBy: ownerUid,
            }),
          ),
        )
      } catch (e: any) {
        setInviteError(e?.message || 'Falha ao enviar convite')
      } finally {
        setInviteBusy(false)
      }
    }

    navigatorManager.goBack()
  }

  // Accepts formats like HH:mm, H:mm and validates 00-23/00-59; returns normalized HH:mm or null
  const normalizeTime = (input: string): string | null => {
    const raw = (input || '').trim()
    if (!raw) return null
    // If user typed 4 digits like 0830 coerce to 08:30
    const onlyDigits = raw.replaceAll(/\D/g, '')
    if (/^\d{4}$/.test(onlyDigits)) {
      const hh = Number(onlyDigits.slice(0, 2))
      const mm = Number(onlyDigits.slice(2))
      if (hh >= 0 && hh <= 23 && mm >= 0 && mm <= 59)
        return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`
    }
    // Match H:mm or HH:mm
    const regex = /^(\d{1,2}):(\d{2})$/
    const m = regex.exec(raw)
    if (!m) return null
    const hh = Number(m[1])
    const mm = Number(m[2])
    if (Number.isNaN(hh) || Number.isNaN(mm)) return null
    if (hh < 0 || hh > 23 || mm < 0 || mm > 59) return null
    return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`
  }

  if (!current) {
    return (
      <View style={styles.screen}>
        <Text style={styles.header}>Compromisso não encontrado</Text>
      </View>
    )
  }

  return (
    <View style={styles.screen}>
      <Text style={styles.header}>Editar compromisso</Text>

      <Text style={styles.label}>Data</Text>
      <View style={styles.readonlyBox}>
        <Text style={styles.readonlyText}>{date}</Text>
      </View>

      <Text style={styles.label}>Título</Text>
      <TextInput
        placeholder="Digite o título"
        value={title}
        onChangeText={setTitle}
        style={styles.input}
      />

      <Text style={styles.label}>Descrição</Text>
      <TextInput
        placeholder="Opcional"
        value={description}
        onChangeText={setDescription}
        style={[styles.input, { height: 80 }]}
        multiline
      />

      <Text style={styles.label}>Hora (opcional)</Text>
      <TextInput
        placeholder="HH:mm (ex.: 08:30)"
        value={time}
        onChangeText={setTime}
        keyboardType="numbers-and-punctuation"
        style={styles.input}
        maxLength={5}
      />

      <Text style={styles.label}>Tópico</Text>
      <FlatList
        horizontal
        data={topics}
        keyExtractor={(t) => t.id}
        contentContainerStyle={{ paddingVertical: 6 }}
        renderItem={({ item }) => {
          const active = item.id === topicId
          return (
            <TouchableOpacity
              style={[styles.pill, active && styles.pillActive]}
              onPress={() => setTopicId(active ? undefined : item.id)}
            >
              <Text style={[styles.pillText, active && styles.pillTextActive]}>
                {item.title}
              </Text>
            </TouchableOpacity>
          )
        }}
      />

      <Text style={styles.label}>Resumo (opcional)</Text>
      <FlatList
        horizontal
        data={summaries}
        keyExtractor={(s) => s.id}
        contentContainerStyle={{ paddingVertical: 6 }}
        renderItem={({ item }) => {
          const active = item.id === summaryId
          return (
            <TouchableOpacity
              style={[styles.pill, active && styles.pillActive]}
              onPress={() => setSummaryId(active ? undefined : item.id)}
            >
              <Text style={[styles.pillText, active && styles.pillTextActive]}>
                {item.title}
              </Text>
            </TouchableOpacity>
          )
        }}
      />

      <Text style={styles.label}>Convidar (apenas conexões)</Text>
      {connections.length === 0 ? (
        <Text style={styles.helperText}>
          Você ainda não tem conexões aceitas.
        </Text>
      ) : (
        <FlatList
          horizontal
          data={connections}
          keyExtractor={(u) => u.uid}
          contentContainerStyle={{ paddingVertical: 6 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.pill,
                selectedInviteUids.includes(item.uid) && styles.pillActive,
              ]}
              onPress={() => handleToggleInvite(item.uid)}
            >
              <Text
                style={[
                  styles.pillText,
                  selectedInviteUids.includes(item.uid) &&
                    styles.pillTextActive,
                ]}
              >
                {item.name || item.email || item.uid}
              </Text>
            </TouchableOpacity>
          )}
        />
      )}
      {!!inviteError && (
        <Text style={{ color: '#EF4444', marginTop: 4 }}>{inviteError}</Text>
      )}

      <TouchableOpacity
        style={[styles.saveBtn, inviteBusy && { opacity: 0.7 }]}
        onPress={onSave}
        disabled={inviteBusy}
      >
        <Text style={styles.saveBtnText}>Salvar alterações</Text>
      </TouchableOpacity>
    </View>
  )
}

export default CalendarEditScreen

const styles = StyleSheet.create<{
  screen: ViewStyle
  header: TextStyle
  label: TextStyle
  input: TextStyle
  readonlyBox: ViewStyle
  readonlyText: TextStyle
  pill: ViewStyle
  pillActive: ViewStyle
  pillText: TextStyle
  pillTextActive: TextStyle
  helperText: TextStyle
  saveBtn: ViewStyle
  saveBtnText: TextStyle
}>({
  screen: {
    flex: 1,
    backgroundColor: Colors.light.backgroundPrimary,
    padding: spacings.medium,
  },
  header: {
    color: Colors.light.textPrimary,
    ...(typography.xLarge as unknown as TextStyle),
    marginBottom: spacings.small,
  },
  label: {
    color: Colors.light.textPrimary,
    opacity: 0.8,
    marginTop: spacings.small,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 10,
    marginTop: 6,
  },
  readonlyBox: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 10,
    marginTop: 6,
  },
  readonlyText: {
    color: Colors.light.textPrimary,
  },
  pill: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  pillActive: { backgroundColor: '#DBEAFE' },
  pillText: { color: Colors.light.textPrimary },
  pillTextActive: { color: Colors.light.textSecondary, fontWeight: '700' },
  helperText: {
    color: Colors.light.textPrimary,
    opacity: 0.6,
    alignSelf: 'center',
  },
  saveBtn: {
    backgroundColor: Colors.light.accentBlue,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: spacings.medium,
  },
  saveBtnText: { color: '#fff', fontWeight: '700' },
})
