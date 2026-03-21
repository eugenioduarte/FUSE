import { useTheme } from '@/hooks/use-theme'
import React, { useRef } from 'react'
import { Animated, Pressable, View, ViewProps, ViewStyle } from 'react-native'

type Props = ViewProps & {
  style?: ViewStyle | ViewStyle[]
  onPress?: () => void
  disabled?: boolean
}

const Card: React.FC<Props> = ({
  style,
  children,
  onPress,
  disabled = false,
  ...rest
}) => {
  const theme = useTheme()
  const scale = useRef(new Animated.Value(1)).current

  const baseStyle = [
    {
      backgroundColor: '#fff',
      borderWidth: theme.border.size,
      borderColor: theme.colors.borderColor,
      borderRadius: theme.border.radius12,
      overflow: 'hidden',
    },
    style as any,
  ]

  if (!onPress) {
    return (
      <View {...rest} style={baseStyle}>
        {children}
      </View>
    )
  }

  const handlePressIn = () => {
    if (disabled) return
    Animated.timing(scale, {
      toValue: 0.97,
      duration: 80,
      useNativeDriver: true,
    }).start()
  }

  const handlePressOut = () => {
    Animated.timing(scale, {
      toValue: 1,
      duration: 100,
      useNativeDriver: true,
    }).start()
  }

  return (
    <Pressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      {...rest}
    >
      <Animated.View
        style={[
          ...baseStyle,
          {
            transform: [{ scale }],
            opacity: disabled ? 0.6 : 1,
          },
        ]}
      >
        {children}
      </Animated.View>
    </Pressable>
  )
}

export default Card
