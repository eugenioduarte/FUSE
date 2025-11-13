import React, { useRef } from 'react'
import {
  Animated,
  GestureResponderEvent,
  Pressable,
  PressableProps,
  StyleProp,
  ViewStyle,
} from 'react-native'

type PressableScaleProps = {
  children: React.ReactNode
  style?: StyleProp<ViewStyle>
  activeScale?: number // immediate press scale (default 0.9)
  minScale?: number // max hold scale (default 0.8)
  holdDuration?: number // time in ms to reach minScale (default 400)
  onPress?: (e: GestureResponderEvent) => void
} & PressableProps

/**
 * PressableScale
 * A Pressable wrapper that scales its children on press.
 * - onPressIn: quickly scales to `activeScale` (default 0.9)
 * - while held: gradually scales to `minScale` (default 0.8) over `holdDuration`
 * - onPressOut: bounces back to 1
 *
 * Use this instead of TouchableOpacity for a tactile scale effect.
 */
const PressableScale: React.FC<PressableScaleProps> = ({
  children,
  style,
  activeScale = 0.9,
  minScale = 0.8,
  holdDuration = 400,
  onPress,
  onLongPress,
  disabled,
  ...rest
}) => {
  const scale = useRef(new Animated.Value(1)).current
  const holdAnimRef = useRef<Animated.CompositeAnimation | null>(null)

  const onPressIn = (e: GestureResponderEvent) => {
    if (disabled) return
    // quick shrink to activeScale
    Animated.timing(scale, {
      toValue: activeScale,
      duration: 80,
      useNativeDriver: true,
    }).start(() => {
      // after initial shrink, start gradual hold animation to minScale
      holdAnimRef.current = Animated.timing(scale, {
        toValue: minScale,
        duration: holdDuration,
        useNativeDriver: true,
      })
      holdAnimRef.current.start()
    })
    // call user-provided onPressIn if present
    if (rest.onPressIn) rest.onPressIn(e)
  }

  const onPressOut = (e: GestureResponderEvent) => {
    if (disabled) return
    // stop hold animation if running
    try {
      holdAnimRef.current?.stop()
    } catch {
      /* ignore */
    }
    // nice bounce back: slight overshoot then settle to 1
    Animated.sequence([
      Animated.timing(scale, {
        toValue: 1.05,
        duration: 120,
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: 1,
        duration: 160,
        useNativeDriver: true,
      }),
    ]).start()
    if (rest.onPressOut) rest.onPressOut(e)
  }

  const handlePress = (e: GestureResponderEvent) => {
    if (disabled) return
    onPress?.(e)
  }

  return (
    <Pressable
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      onPress={handlePress}
      onLongPress={onLongPress}
      disabled={disabled}
      {...rest}
    >
      <Animated.View style={[{ transform: [{ scale }] }, style]}>
        {children}
      </Animated.View>
    </Pressable>
  )
}

export default PressableScale
