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
import { summariesRepository } from '../../../services/repositories/summaries.repository'
import { topicsRepository } from '../../../services/repositories/topics.repository'
import { useCalendarStore } from '../../../store/useCalendarStore'
import type { Summary, Topic } from '../../../types/domain'

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
  const [topics, setTopics] = useState<Topic[]>([])
  const [topicId, setTopicId] = useState<string | undefined>(undefined)
  const [summaries, setSummaries] = useState<Summary[]>([])
  const [summaryId, setSummaryId] = useState<string | undefined>(undefined)

  const addAppointment = useCalendarStore((s) => s.addAppointment)
  const setSelectedDate = useCalendarStore((s) => s.setSelectedDate)

  useEffect(() => {
    ;(async () => {
      await topicsRepository.seedIfEmpty()
      const list = await topicsRepository.list()
      setTopics(list)
    })()
  }, [])

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

  const onSave = () => {
    if (!title.trim()) return
    addAppointment({
      date,
      title: title.trim(),
      description: description.trim(),
      topicId,
      summaryId,
    })
    setSelectedDate(date)
    navigatorManager.goBack()
  }

  return (
    <View style={styles.screen}>
      <Text style={styles.header}>Novo compromisso</Text>

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
        ListEmptyComponent={
          <EmptyListText
            text={
              topicId ? 'Sem resumos para este tópico.' : 'Selecione um tópico.'
            }
          />
        }
      />

      <TouchableOpacity style={styles.saveBtn} onPress={onSave}>
        <Text style={styles.saveBtnText}>Salvar</Text>
      </TouchableOpacity>
    </View>
  )
}

export default CalendarAddScreen

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
    backgroundColor: Colors.light.background,
    padding: spacings.medium,
  },
  header: {
    color: Colors.light.text,
    ...(typography.titleLarge as unknown as TextStyle),
    marginBottom: spacings.small,
  },
  label: {
    color: Colors.light.text,
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
    color: Colors.light.text,
  },
  pill: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  pillActive: { backgroundColor: '#DBEAFE' },
  pillText: { color: Colors.light.text },
  pillTextActive: { color: Colors.light.tertiary, fontWeight: '700' },
  helperText: { color: Colors.light.text, opacity: 0.6, alignSelf: 'center' },
  saveBtn: {
    backgroundColor: Colors.light.primary,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: spacings.medium,
  },
  saveBtnText: { color: '#fff', fontWeight: '700' },
})
