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
import { t } from '@/locales/translation'
import type { Summary, Topic } from '../../../types/domain'
import ReactMemo = React.memo

type CalendarAddRoute = RouteProp<RootStackParamList, 'CalendarAddScreen'>

const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`)

const EmptyListText: React.FC<{ text: string }> = ({ text }) => (
  <Text style={styles.helperText}>{text}</Text>
)

const CalendarAddScreen: React.FC = () => {
  const route = useRoute<CalendarAddRoute>()
  const preselected = route.params?.date
  const todayYmd = useMemo(() => {
    const now = new Date()
    return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`
  }, [])

  const date = preselected || todayYmd
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [time, setTime] = useState('')
  const [topics, setTopics] = useState<Topic[]>([])
  const [topicId, setTopicId] = useState<string | undefined>(undefined)
  const [summaries, setSummaries] = useState<Summary[]>([])
  const [summaryId, setSummaryId] = useState<string | undefined>(undefined)
  const [connections, setConnections] = useState<PublicUser[]>([])
  const [selectedInviteUids, setSelectedInviteUids] = useState<string[]>([])
  const [inviteBusy, setInviteBusy] = useState(false)
  const [inviteError, setInviteError] = useState<string | null>(null)

  const handleToggleInvite = React.useCallback((uid: string) => {
    setSelectedInviteUids((prev) =>
      prev.includes(uid) ? prev.filter((id) => id !== uid) : [...prev, uid],
    )
  }, [])

  // const addAppointment = useCalendarStore((s) => s.addAppointment) // no longer used; unified to Firestore
  const setSelectedDate = useCalendarStore((s) => s.setSelectedDate)
  const me = useAuthStore((s) => s.user)

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
    if (!title.trim()) return
    const t = normalizeTime(time)
    const ownerUid = me?.id || getCurrentUser()?.uid
    if (!ownerUid) {
      setInviteError(t('calendarAdd.not_authenticated'))
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

      if (selectedInviteUids.length > 0) {
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
      }
      setSelectedDate(date)
      navigatorManager.goBack()
    } catch (e: any) {
      setInviteError(e?.message || t('calendarAdd.error'))
    } finally {
      setInviteBusy(false)
    }
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

  return (
    <View style={styles.screen}>
      <Text style={styles.header}>{t('calendarAdd.title')}</Text>

      <Text style={styles.label}>{t('summary.date_label')}</Text>
      <View style={styles.readonlyBox}>
        <Text style={styles.readonlyText}>{date}</Text>
      </View>

      <Text style={styles.label}>{t('topicAdd.title')}</Text>
      <TextInput
        placeholder={t('calendarAdd.title_placeholder')}
        value={title}
        onChangeText={setTitle}
        style={styles.input}
      />

      <Text style={styles.label}>{t('editOverlay.field.description')}</Text>
      <TextInput
        placeholder={t('calendarAdd.optional')}
        value={description}
        onChangeText={setDescription}
        style={[styles.input, { height: 80 }]}
        multiline
      />

      <Text style={styles.label}>{t('calendarAdd.label.time')}</Text>
      <TextInput
        placeholder={t('calendarAdd.time_placeholder')}
        value={time}
        onChangeText={setTime}
        keyboardType="numbers-and-punctuation"
        style={styles.input}
        maxLength={5}
      />

      <Text style={styles.label}>{t('calendar.topic')}</Text>
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

      <Text style={styles.label}>{t('calendarAdd.label.summary')}</Text>
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
        ListEmptyComponent={
          <EmptyListText
            text={
              topicId ? t('calendarAdd.no_summaries') : t('calendarAdd.select_topic')
            }
          />
        }
      />

      <Text style={styles.label}>{t('calendarAdd.label.invite')}</Text>
      {connections.length === 0 ? (
        <Text style={styles.helperText}>
          {t('calendarAdd.no_connections')}
        </Text>
      ) : (
        <FlatList
          horizontal
          data={connections}
          keyExtractor={(u) => u.uid}
          contentContainerStyle={{ paddingVertical: 6 }}
          renderItem={({ item }) => (
            <InviteChip
              key={item.uid}
              user={item}
              selected={selectedInviteUids.includes(item.uid)}
              onToggle={handleToggleInvite}
            />
          )}
        />
      )}
      {!!inviteError && (
        <Text style={{ color: '#EF4444', marginTop: 4 }}>{inviteError}</Text>
      )}

      <TouchableOpacity
        style={styles.saveBtn}
        onPress={onSave}
        disabled={inviteBusy}
      >
        <Text style={styles.saveBtnText}>{t('calendarAdd.save')}</Text>
      </TouchableOpacity>
    </View>
  )
}

export default CalendarAddScreen

type InviteChipProps = {
  user: PublicUser
  selected: boolean
  onToggle: (uid: string) => void
}

const InviteChip: React.FC<InviteChipProps> = ReactMemo(
  ({ user, selected, onToggle }) => {
    return (
      <TouchableOpacity
        style={[styles.pill, selected && styles.pillActive]}
        onPress={() => onToggle(user.uid)}
      >
        <Text style={[styles.pillText, selected && styles.pillTextActive]}>
          {user.name || user.email || user.uid}
        </Text>
      </TouchableOpacity>
    )
  },
)

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
  pillTextActive: { color: Colors.light.accentBlue, fontWeight: '700' },
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
  saveBtnText: { color: 'red', fontWeight: '700' },
})
