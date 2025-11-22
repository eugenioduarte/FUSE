import { useTheme } from '@/hooks/useTheme'
import React from 'react'
import { View } from 'react-native'

const StepDot = ({ active }: { active: boolean }) => {
  const theme = useTheme()

  return (
    <View
      style={{
        width: active ? 20 : 6,
        height: 6,
        borderRadius: 6,
        marginHorizontal: 4,
        backgroundColor: active ? theme.colors.white : theme.colors.black,
        borderWidth: theme.border.size,
        borderColor: theme.colors.borderColor,
      }}
    />
  )
}

export default StepDot
