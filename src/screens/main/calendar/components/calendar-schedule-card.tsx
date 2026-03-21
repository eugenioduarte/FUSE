import { Text } from '@/components'
import { useTheme } from '@/hooks/use-theme'
import { t } from '@/locales/translation'
import { useThemeStore } from '@/store/useThemeStore'
import type { CalendarCommitment } from '@/types/calendar.type'
import React from 'react'
import { TouchableOpacity, View } from 'react-native'
import createStyles from '../create-styles'

type Props = {
  item: CalendarCommitment
  topicName: (id?: string) => string
  summaryName: (topicId?: string, summaryId?: string) => string
  isPendingForMe: (ev: CalendarCommitment) => boolean
  onEditPress: (id: string) => void
  onRemovePress: (item: CalendarCommitment) => void
}

const CalendarScheduleCard = ({
  item,
  topicName,
  summaryName,
  isPendingForMe,
  onEditPress,
  onRemovePress,
}: Props) => {
  const theme = useTheme()
  const color = useThemeStore((s) => s.colorLevelUp.background_color)
  const styles = createStyles(theme, color)

  return (
    <View style={styles.card}>
      <View style={styles.titleRow}>
        <Text variant="large">{item.title}</Text>
        {isPendingForMe(item) ? (
          <View style={styles.badge}>
            <Text variant="large">{t('calendar.pending')}</Text>
          </View>
        ) : null}
      </View>
      {!!item.description && (
        <Text style={styles.desc}>{item.description}</Text>
      )}
      <Text style={styles.meta}>
        {item.time ? `${t('calendar.hour_label')}: ${item.time} | ` : ''}
        {t('calendar.topic')}: {topicName(item.topicId)} |{' '}
        {t('calendar.summary')}: {summaryName(item.topicId, item.summaryId)}
      </Text>
      <View style={styles.actionRow}>
        <TouchableOpacity onPress={() => onEditPress(item.id)}>
          <Text variant="large">{t('calendar.edit')}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => onRemovePress(item)}>
          <Text variant="large" style={styles.removeText}>
            {t('calendar.remove')}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

export default CalendarScheduleCard
