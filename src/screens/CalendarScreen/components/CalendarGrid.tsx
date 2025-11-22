import React from 'react'
import { View } from 'react-native'
import DayButton from './DayButton'

const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`)

const CalendarGrid = ({
  currentDate,
  selectedDate,
  onSelect,
  events,
}: {
  currentDate: Date
  selectedDate: string | null
  onSelect: (ymd: string) => void
  events: { date: string }[]
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
    <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
      {cells.map((c) => (
        <View key={c.key} style={{ width: '14.2857%', padding: 2 }}>
          {c.ymd ? (
            <DayButton
              label={c.label}
              selected={selectedDate === c.ymd}
              onPress={() => onSelect(c.ymd!)}
              hasEvent={events.some((ev) => ev.date === c.ymd)}
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

export default CalendarGrid
