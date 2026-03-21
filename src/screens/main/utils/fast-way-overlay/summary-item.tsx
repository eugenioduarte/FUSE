import { ChevronIcon } from '@/assets/icons'
import { Text } from '@/components'
import { NAVIGATION_ICON_SIZE } from '@/constants/sizes'
import { useTheme } from '@/hooks/use-theme'
import { ThemeType } from '@/types/theme.type'
import React from 'react'
import { StyleSheet, TouchableOpacity, View } from 'react-native'
import { Summary } from '../../../../types/domain'

const SummaryItem = ({
  summary,
  onPress,
  onGoToSummary,
}: {
  summary: Summary
  onPress?: () => void
  onGoToSummary?: (summaryId: string) => void
}) => {
  const theme = useTheme()
  const styles = createStyles(theme)

  return (
    <View style={styles.summaryRow}>
      <TouchableOpacity style={styles.textContainer} onPress={onPress}>
        <Text
          variant="large"
          numberOfLines={1}
          ellipsizeMode="tail"
          style={styles.summaryText}
        >
          {summary.content}
        </Text>
      </TouchableOpacity>

      {onGoToSummary && (
        <TouchableOpacity
          onPress={() => onGoToSummary(summary.id)}
          style={styles.iconButton}
        >
          <ChevronIcon
            width={NAVIGATION_ICON_SIZE}
            height={NAVIGATION_ICON_SIZE}
            fill={theme.colors.textPrimary}
          />
        </TouchableOpacity>
      )}
    </View>
  )
}

export default SummaryItem

const createStyles = (theme: ThemeType) =>
  StyleSheet.create({
    summaryRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: theme.spacings.xSmall,
    },
    textContainer: {
      flex: 1,
      flexShrink: 1,
      paddingRight: theme.spacings.small,
    },
    summaryText: {
      color: theme.colors.textPrimary,
    },
    iconButton: {
      justifyContent: 'center',
      alignItems: 'center',
    },
  })
