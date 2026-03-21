import { Text } from '@/components'
import { useThemeStore } from '@/store/useThemeStore'
import { useTheme } from '@react-navigation/native'
import React from 'react'
import { TouchableOpacity, View } from 'react-native'
import createStyles from '../create-styles'

const DayButton = ({
  label,
  selected,
  onPress,
  hasEvent,
}: {
  label: string
  selected: boolean
  onPress: () => void
  hasEvent?: boolean
}) => {
  const theme = useTheme()
  const color = useThemeStore((s) => s.colorLevelUp.background_color)
  const styles = createStyles(theme, color)

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.dayCell, selected && styles.dayCellSelected]}
    >
      <Text variant="large">{label}</Text>
      {hasEvent ? <View style={styles.dayDot} /> : null}
    </TouchableOpacity>
  )
}

export default DayButton
