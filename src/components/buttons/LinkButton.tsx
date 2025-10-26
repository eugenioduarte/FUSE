import { Text } from '@/src/components'
import React from 'react'
import { StyleSheet, TouchableOpacity, View } from 'react-native'

import { useTheme } from '@/src/hooks/useTheme'

type Props = {
  text: string
  textColor?: string
  variant?: 'medium' | 'small' | 'large' | 'xLarge' | 'xxLarge'
  onPress?: () => void
}

const LinkButton: React.FC<Props> = ({
  text,
  textColor,
  variant = 'medium',
  onPress,
}) => {
  const theme = useTheme()
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={styles.container}
    >
      <Text variant={variant} color={textColor}>
        {text}
      </Text>
      <View
        style={{
          height: theme.border.size,
          backgroundColor: theme.colors.borderColor,
          marginTop: 2,
          borderRadius: theme.border.radius8,
        }}
      />
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
})

export default LinkButton
