import React, { useEffect, useMemo, useState } from 'react'
import {
  FlatList,
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native'
import { Colors, spacings, typography } from '../../constants/theme'
import { navigatorManager } from '../../navigation/navigatorManager'
import { summariesRepository } from '../../services/repositories/summaries.repository'
import { topicsRepository } from '../../services/repositories/topics.repository'
import { useCalendarStore } from '../../store/useCalendarStore'
import type { Summary, Topic } from '../../types/domain'

const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`)

const DayButton = ({
  label,
  selected,
  onPress,
}: {
  label: string
  selected: boolean
  onPress: () => void
}) => (
  <TouchableOpacity
    onPress={onPress}
    style={[styles.dayCell, selected && styles.dayCellSelected]}
  >
    <Text style={[styles.dayLabel, selected && styles.dayLabelSelected]}>
      {label}
    </Text>
  </TouchableOpacity>
)

const CalendarGrid = ({
  currentDate,
  selectedDate,
  onSelect,
}: {
  currentDate: Date
  selectedDate: string | null
  onSelect: (ymd: string) => void
}) => {
  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()
  const first = new Date(year, month, 1)
  const startWeekday = first.getDay() // 0-6 (Sun-Sat)
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const cells: { key: string; label: string; ymd?: string }[] = []
  // Do not render visible cells before day 1; keep placeholders for layout only
  for (let i = 0; i < startWeekday; i++)
    cells.push({ key: `e-${i}`, label: '' })
  for (let d = 1; d <= daysInMonth; d++) {
    const ymd = `${year}-${pad(month + 1)}-${pad(d)}`
    cells.push({ key: `d-${d}`, label: pad(d), ymd })
  }

  return (
    <View style={styles.grid}>
      {cells.map((c) => (
        <View key={c.key} style={styles.gridItem}>
          {c.ymd ? (
            <DayButton
              label={c.label}
              selected={selectedDate === c.ymd}
              onPress={() => onSelect(c.ymd!)}
            />
          ) : (
            // Render an invisible spacer to preserve layout but not show a cell
            <View style={{ height: 44 }} />
          )}
        </View>
      ))}
    </View>
  )
}

const CalendarScreen: React.FC = () => {
  const selectedDate = useCalendarStore((s) => s.selectedDate)
  const setSelectedDate = useCalendarStore((s) => s.setSelectedDate)
  const removeAppointment = useCalendarStore((s) => s.removeAppointment)
  // Subscribe to events so the screen re-renders immediately after adding
  const events = useCalendarStore((s) => s.events)

  // Month navigation state
  const [currentMonth, setCurrentMonth] = useState<Date>(() => {
    const now = new Date()
    return new Date(now.getFullYear(), now.getMonth(), 1)
  })

  const [topics, setTopics] = useState<Topic[]>([])
  const [summariesAll, setSummariesAll] = useState<Summary[]>([])

  // Seed topics and load
  useEffect(() => {
    ;(async () => {
      await topicsRepository.seedIfEmpty()
      const list = await topicsRepository.list()
      setTopics(list)
      // load summaries for name lookup
      const allSummaries = await summariesRepository.listAll()
      setSummariesAll(allSummaries)
    })()
  }, [])

  // Ensure a date is selected by default (today)
  useEffect(() => {
    if (!selectedDate) {
      const now = new Date()
      const y = now.getFullYear()
      const m = pad(now.getMonth() + 1)
      const d = pad(now.getDate())
      setSelectedDate(`${y}-${m}-${d}`)
    }
  }, [selectedDate, setSelectedDate])

  // Load summaries when topic selected in form
  // (No inline form anymore)

  const dayAppointments = useMemo(
    () => (selectedDate ? events.filter((e) => e.date === selectedDate) : []),
    [events, selectedDate],
  )

  const topicName = (id?: string) =>
    topics.find((t) => t.id === id)?.title || '—'
  const summaryName = (_topicId?: string, summaryId?: string) =>
    summaryId ? summariesAll.find((s) => s.id === summaryId)?.title || '—' : '—'

  // Month header helpers
  const monthNames = [
    'Janeiro',
    'Fevereiro',
    'Março',
    'Abril',
    'Maio',
    'Junho',
    'Julho',
    'Agosto',
    'Setembro',
    'Outubro',
    'Novembro',
    'Dezembro',
  ]
  const year = currentMonth.getFullYear()
  const month = currentMonth.getMonth()
  const goPrevMonth = () =>
    setCurrentMonth((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1))
  const goNextMonth = () =>
    setCurrentMonth((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1))

  return (
    <View style={styles.screen}>
      {/* Header: 2025  < Maio > */}
      <View style={styles.monthHeader}>
        <Text style={styles.yearText}>{year}</Text>
        <View style={styles.monthNav}>
          <TouchableOpacity onPress={goPrevMonth}>
            <Text style={styles.monthNavText}>{'<'}</Text>
          </TouchableOpacity>
          <Text style={styles.monthText}>{monthNames[month]}</Text>
          <TouchableOpacity onPress={goNextMonth}>
            <Text style={styles.monthNavText}>{'>'}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Calendário */}
      <CalendarGrid
        currentDate={currentMonth}
        selectedDate={selectedDate}
        onSelect={(ymd) => setSelectedDate(ymd)}
      />

      {/* Ações + Lista do dia */}
      {selectedDate ? (
        <View style={{ marginTop: spacings.medium }}>
          <TouchableOpacity
            style={styles.addBtn}
            onPress={() =>
              navigatorManager.goToCalendarAdd({ date: selectedDate })
            }
          >
            <Text style={styles.addBtnText}>Adicionar compromisso</Text>
          </TouchableOpacity>

          {dayAppointments.length === 0 ? (
            <Text style={styles.emptyText}>
              Nenhum compromisso para esta data.
            </Text>
          ) : (
            <FlatList
              style={{ marginTop: spacings.small }}
              data={dayAppointments}
              keyExtractor={(i) => i.id}
              renderItem={({ item }) => (
                <View style={styles.card}>
                  <Text style={styles.title}>{item.title}</Text>
                  {!!item.description && (
                    <Text style={styles.desc}>{item.description}</Text>
                  )}
                  <Text style={styles.meta}>
                    {item.time ? `Hora: ${item.time} · ` : ''}Topic:{' '}
                    {topicName(item.topicId)} · Summary:{' '}
                    {summaryName(item.topicId, item.summaryId)}
                  </Text>
                  <View
                    style={{
                      flexDirection: 'row',
                      gap: 12,
                      marginTop: spacings.small,
                    }}
                  >
                    <TouchableOpacity
                      onPress={() => removeAppointment(item.id)}
                    >
                      <Text style={[styles.link, { color: '#EF4444' }]}>
                        Remover
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            />
          )}
        </View>
      ) : null}
    </View>
  )
}

export default CalendarScreen

const styles = StyleSheet.create<{
  screen: ViewStyle
  grid: ViewStyle
  gridItem: ViewStyle
  monthHeader: ViewStyle
  yearText: TextStyle
  monthNav: ViewStyle
  monthText: TextStyle
  monthNavText: TextStyle
  dayCell: ViewStyle
  dayCellSelected: ViewStyle
  dayLabel: TextStyle
  dayLabelSelected: TextStyle
  addBtn: ViewStyle
  addBtnText: TextStyle
  emptyText: TextStyle
  card: ViewStyle
  title: TextStyle
  desc: TextStyle
  meta: TextStyle
  link: TextStyle
  // removed inline form styles
}>({
  screen: {
    flex: 1,
    backgroundColor: Colors.light.background,
    padding: spacings.medium,
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  gridItem: { width: '14.2857%', padding: 2 },
  monthHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacings.small,
  },
  yearText: {
    color: Colors.light.text,
    fontWeight: '700',
  },
  monthNav: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  monthText: {
    color: Colors.light.text,
    fontWeight: '700',
  },
  monthNavText: {
    color: Colors.light.primary,
    fontWeight: '700',
  },
  dayCell: {
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#3a3a3a',
  },
  dayCellSelected: { backgroundColor: '#E5F0FF', borderColor: '#1f2937' },
  dayLabel: { color: '#000' },
  dayLabelSelected: { color: '#000', fontWeight: '700' },
  addBtn: {
    backgroundColor: Colors.light.primary,
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  addBtnText: { color: '#fff', fontWeight: '700' },
  emptyText: {
    color: Colors.light.text,
    opacity: 0.6,
    marginTop: spacings.small,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: spacings.medium,
    marginBottom: spacings.small,
    borderWidth: 1,
    borderColor: '#3a3a3a',
  },
  title: {
    color: '#000',
    ...(typography.titleMedium as unknown as TextStyle),
  },
  desc: { color: '#000', opacity: 0.8, marginTop: 4 },
  meta: { color: '#000', opacity: 0.7, marginTop: 6 },
  link: { color: '#1d4ed8', fontWeight: '700' },
  // removed modal and inline form styles
})
