import { useTheme } from '@/hooks/use-theme'
import React from 'react'
import { View } from 'react-native'
import { Text } from '@/components/ui-text/UiText'

type DisplayNumberProps = {
  value: number | string | undefined
  label?: string
  backgroundColor?: string
}
const DisplayNumber = ({
  value,
  label,
  backgroundColor,
}: DisplayNumberProps) => {
  const theme = useTheme()
  return (
    <View
      style={{
        backgroundColor: backgroundColor || theme.colors.accentYellow,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 99,
        borderWidth: 1,
        borderColor: 'black',
        flexDirection: 'row',
        alignItems: 'flex-end',
        justifyContent: 'center',
        gap: 4,
      }}
    >
      <Text variant="xLarge">{value}</Text>
      <Text variant="small" style={{ marginBottom: 4 }}>
        {label}
      </Text>
    </View>
  )
}

export default DisplayNumber
