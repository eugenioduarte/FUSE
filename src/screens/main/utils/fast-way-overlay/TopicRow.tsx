import { ChevronIcon } from '@/assets/icons'
import { Text } from '@/components'
import { NAVIGATION_ICON_SIZE } from '@/constants/sizes'
import { useTheme } from '@/hooks/useTheme'
import { ThemeType } from '@/types/theme.type'
import React from 'react'
import { StyleSheet, TouchableOpacity, View } from 'react-native'
import { Topic } from '../../../../types/domain'
const TopicRow = ({
  topic,
  onSelect,
  onGoToTopic,
}: {
  topic: Topic
  onSelect: (topicId: string) => void
  onGoToTopic?: (topicId: string) => void
}) => {
  const theme = useTheme()
  const styles = createStyles(theme)

  return (
    <View style={styles.topicRow}>
      <TouchableOpacity onPress={() => onSelect(topic.id)}>
        <Text variant="large">{topic.title}</Text>
      </TouchableOpacity>
      {onGoToTopic ? (
        <TouchableOpacity onPress={() => onGoToTopic(topic.id)}>
          <ChevronIcon
            width={NAVIGATION_ICON_SIZE}
            height={NAVIGATION_ICON_SIZE}
            fill={theme.colors.textPrimary}
          />
        </TouchableOpacity>
      ) : null}
    </View>
  )
}

export default TopicRow

const createStyles = (theme: ThemeType) =>
  StyleSheet.create({
    topicRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: theme.spacings.small,
    },
    smallLink: { fontWeight: '700' },
  })
