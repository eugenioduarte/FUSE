import { navigatorManager } from '@/navigation/navigatorManager'
import {
  deleteOwnedCalendarEvent,
  leaveCalendarEvent,
} from '@/services/firebase/calendar.service'
import { summariesRepository } from '@/services/repositories/summaries.repository'
import { topicsRepository } from '@/services/repositories/topics.repository'
import { useAuthStore } from '@/store/useAuthStore'
import { useCalendarStore } from '@/store/useCalendarStore'
import { useFocusEffect } from '@react-navigation/native'
import React, { useEffect, useMemo, useState } from 'react'

const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`)

export const useCalendarScreen = () => {
  const selectedDate = useCalendarStore((s) => s.selectedDate)
  const setSelectedDate = useCalendarStore((s) => s.setSelectedDate)
  const removeAppointment = useCalendarStore((s) => s.removeAppointment)
  const events = useCalendarStore((s) => s.events)
  const me = useAuthStore((s) => s.user)

  // Month navigation state
  const [currentMonth, setCurrentMonth] = useState<Date>(() => {
    const now = new Date()
    return new Date(now.getFullYear(), now.getMonth(), now.getDate())
  })

  const [topics, setTopics] = useState<any[]>([])
  const [summariesAll, setSummariesAll] = useState<any[]>([])

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

  // Always open on today's date when the screen gains focus
  useFocusEffect(
    React.useCallback(() => {
      const now = new Date()
      const y = now.getFullYear()
      const m = pad(now.getMonth() + 1)
      const d = pad(now.getDate())
      setSelectedDate(`${y}-${m}-${d}`)
      setCurrentMonth(
        new Date(now.getFullYear(), now.getMonth(), now.getDate()),
      )
    }, [setSelectedDate]),
  )

  const dayAppointments = useMemo(
    () => (selectedDate ? events.filter((e) => e.date === selectedDate) : []),
    [events, selectedDate],
  )

  const topicName = (id?: string) =>
    topics.find((t) => t.id === id)?.title || '—'
  const summaryName = (_topicId?: string, summaryId?: string) =>
    summaryId ? summariesAll.find((s) => s.id === summaryId)?.title || '—' : '—'

  const isPendingForMe = (ev: any) => {
    const myId = me?.id
    if (!myId) return false
    if (ev.ownerUid === myId) return false
    const accepted = ev.accepted || []
    const participants = ev.participants || []
    return participants.includes(myId) && !accepted.includes(myId)
  }

  // Month header helpers
  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ]
  // Prefer the day from the currently selected date (YYYY-MM-DD) so the big day
  // shown in the header updates whenever the user picks a different day.
  const day = React.useMemo(() => {
    if (selectedDate) {
      const parts = selectedDate.split('-')
      const d = Number(parts[2])
      return Number.isFinite(d) ? d : currentMonth.getDate()
    }
    return currentMonth.getDate()
  }, [selectedDate, currentMonth])
  const year = currentMonth.getFullYear()
  const month = currentMonth.getMonth()

  const goPrevMonth = () =>
    setCurrentMonth((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1))
  const goNextMonth = () =>
    setCurrentMonth((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1))

  const onAddPress = (date: string) =>
    navigatorManager.goToCalendarAdd({ date })
  const onEditPress = (id: string) => navigatorManager.goToCalendarEdit({ id })

  const onRemovePress = async (item: any) => {
    const myId = me?.id
    if (!myId) return
    try {
      if (item.ownerUid && item.ownerUid === myId) {
        await deleteOwnedCalendarEvent(item.id)
      } else {
        await leaveCalendarEvent(item.id, myId)
      }
      // Optimistic local removal; realtime will reconcile
      removeAppointment(item.id)
    } catch (e) {
      console.error('Failed to remove calendar event', e)
    }
  }

  return {
    currentMonth,
    goPrevMonth,
    goNextMonth,
    monthNames,
    day,
    year,
    month,
    selectedDate,
    setSelectedDate,
    events,
    dayAppointments,
    topics,
    summariesAll,
    topicName,
    summaryName,
    isPendingForMe,
    onAddPress,
    onEditPress,
    onRemovePress,
  }
}

export default useCalendarScreen
