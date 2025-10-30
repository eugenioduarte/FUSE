import { Text } from '@/components'
import { useTheme } from '@/hooks/useTheme'
import { ThemeType } from '@/types/theme.type'
import React from 'react'
import { StyleSheet, TouchableOpacity, View } from 'react-native'

const ChallengeRow = ({
  challenge,
  onGoToList,
}: {
  challenge: { id: string; title: string }
  onGoToList?: () => void
}) => {
  const theme = useTheme()
  const styles = createStyles(theme)
  return (
    <View style={styles.summaryRow}>
      <TouchableOpacity onPress={onGoToList}>
        <Text variant="medium" style={styles.summaryText}>
          {challenge.title}
        </Text>
      </TouchableOpacity>
    </View>
  )
}

export default ChallengeRow

const createStyles = (theme: ThemeType) =>
  StyleSheet.create({
    summaryRow: {
      paddingVertical: 4,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    summaryText: { color: theme.colors.textPrimary },
  })
