/* eslint-disable import/no-named-as-default */
import { ChevronIcon } from '@/assets/icons'
import { Button, Text } from '@/components'
import { t } from '@/locales/translation'
import { useThemeStore } from '@/store/useThemeStore'
import { ICON_SIZE_MEDIUM } from '@/utils/global'
import { useTheme } from '@react-navigation/native'
import React from 'react'
import { ScrollView, TouchableOpacity, View } from 'react-native'
import CalendarGrid from './components/calendar-grid'
import CalendarScheduleCard from './components/calendar-schedule-card'
import createStyles from './create-styles'
import useCalendarScreen from './hooks/use-calendar-screen'

const CalendarScreen: React.FC = () => {
  const theme = useTheme()
  const color = useThemeStore((s) => s.colorLevelUp.background_color)
  const styles = createStyles(theme, color)

  const {
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
    topicName,
    summaryName,
    isPendingForMe,
    onAddPress,
    onEditPress,
    onRemovePress,
  } = useCalendarScreen()

  return (
    <View style={styles.screen}>
      {/* Header: 2025  < Maio > */}
      <View style={styles.monthHeader}>
        <Text variant="xLarge">{year}</Text>
        <View style={styles.monthNav}>
          <TouchableOpacity onPress={goPrevMonth}>
            <ChevronIcon
              style={styles.chevronRotate}
              width={ICON_SIZE_MEDIUM}
              height={ICON_SIZE_MEDIUM}
            />
          </TouchableOpacity>
          <Text variant="xLarge" style={styles.monthTitle}>
            {monthNames[month]}
          </Text>
          <TouchableOpacity onPress={goNextMonth}>
            <ChevronIcon width={ICON_SIZE_MEDIUM} height={ICON_SIZE_MEDIUM} />
          </TouchableOpacity>
        </View>
        <Text variant="Large4xl">{day}</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Calendário */}
        <CalendarGrid
          currentDate={currentMonth}
          selectedDate={selectedDate}
          onSelect={(ymd) => setSelectedDate(ymd)}
          events={events}
        />

        {/* Ações + Lista do dia */}
        {selectedDate ? (
          <View style={styles.actionsContainer}>
            <Button
              title={t('calendar.add_appointment')}
              onPress={() => selectedDate && onAddPress(selectedDate)}
              background={color}
              style={styles.addButton}
            />

            {dayAppointments.length > 0 &&
              dayAppointments.map((item) => (
                <CalendarScheduleCard
                  key={item.id}
                  item={item}
                  topicName={topicName}
                  summaryName={summaryName}
                  isPendingForMe={isPendingForMe}
                  onEditPress={onEditPress}
                  onRemovePress={onRemovePress}
                />
              ))}
          </View>
        ) : null}
      </ScrollView>
    </View>
  )
}

export default CalendarScreen
