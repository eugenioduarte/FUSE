import {
  AudioIcon,
  ChevronIcon,
  QuizIcon,
  WhiteboardIcon,
} from '@/assets/icons'
import { Text } from '@/components'
import IconButton from '@/components/buttons/IconButton'
import { useTheme } from '@/hooks/useTheme'
import { navigatorManager } from '@/navigation/navigatorManager'
import { Summary } from '@/types/domain'
import { ThemeType } from '@/types/theme.type'
import React from 'react'
import { StyleSheet, TouchableOpacity, View } from 'react-native'

type TopicSummaryCardProps = {
  summary: Summary
  bg?: string
}

const ICON_SIZE = 20
const TOTAL_CHARACTERS = 160

const TopicSummaryCard = ({ summary, bg }: TopicSummaryCardProps) => {
  const theme = useTheme()
  const styles = createStyles(theme, bg || theme.colors.backgroundSecondary)

  return (
    <TouchableOpacity
      key={summary.id}
      onPress={() => navigatorManager.goToSummaryDetails(summary.id, summary)}
      style={styles.card}
    >
      <View style={styles.titleContainer}>
        <Text variant="xLarge" style={styles.title}>
          {summary.title}
        </Text>
      </View>
      <View style={{ padding: theme.spacings.small }}>
        <Text variant="medium" style={[styles.snippet]} numberOfLines={3}>
          {summary.content.slice(0, TOTAL_CHARACTERS)}
        </Text>
        <View style={styles.row}>
          <View style={styles.leftIcons}>
            <IconButton
              icon={<WhiteboardIcon width={ICON_SIZE} height={ICON_SIZE} />}
              onPress={() =>
                navigatorManager.goToWhiteboard({ summaryId: summary.id })
              }
            />
            <IconButton
              icon={<AudioIcon width={ICON_SIZE} height={ICON_SIZE} />}
              onPress={() =>
                navigatorManager.goToSummaryAudio({ summaryId: summary.id })
              }
            />
            <IconButton
              icon={<QuizIcon width={ICON_SIZE} height={ICON_SIZE} />}
              onPress={() =>
                navigatorManager.goToChallengesList({ summaryId: summary.id })
              }
            />
          </View>
          <ChevronIcon width={ICON_SIZE} height={ICON_SIZE} />
        </View>
      </View>
    </TouchableOpacity>
  )
}

export default TopicSummaryCard

const createStyles = (theme: ThemeType, bg: string) =>
  StyleSheet.create({
    card: {
      borderRadius: theme.border.radius10,
      marginBottom: theme.spacings.small,
      borderWidth: theme.border.size,
      borderColor: theme.colors.borderColor,
      backgroundColor: theme.colors.backgroundTertiary,
      overflow: 'hidden',
    },
    titleContainer: {
      backgroundColor: bg,
      padding: theme.spacings.small,
      borderBottomWidth: theme.border.size,
      borderBottomColor: theme.colors.borderColor,
    },
    title: {
      marginBottom: theme.spacings.xSmall,
    },
    snippet: {
      marginBottom: theme.spacings.small,
    },
    row: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: theme.spacings.small,
    },
    leftIcons: {
      flexDirection: 'row',
      gap: theme.spacings.small,
      alignItems: 'center',
    },
  })
