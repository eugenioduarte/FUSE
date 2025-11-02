import { Text } from '@/components'
import { useTheme } from '@/hooks/useTheme'
import React from 'react'
import { TouchableOpacity, View } from 'react-native'
const ChallengeOptionCard = ({
  label,
  onPress,
  score,
}: {
  label: string
  onPress: () => void
  score: number
}) => {
  const theme = useTheme()

  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        width: '50%',
        backgroundColor: 'lightgray',
        height: 100,
        margin: 5,
        borderRadius: 8,
        overflow: 'hidden',
        borderWidth: theme.border.size,
      }}
    >
      <View
        style={{
          backgroundColor: 'red',
          height: 40,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Text variant="large">{label}</Text>
      </View>
    </TouchableOpacity>
  )
}

export default ChallengeOptionCard
