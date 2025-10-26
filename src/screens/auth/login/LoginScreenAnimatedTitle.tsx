import { width } from '@/src/utils/dimensions'
import React, { useEffect, useRef } from 'react'
import { Animated, Easing } from 'react-native'

type Props = {
  keyboardOpen: boolean
}

const ANIMATION_DURATION = 800

const LoginScreenAnimatedTitle = ({ keyboardOpen }: Props) => {
  const animatedSize = useRef(new Animated.Value(width)).current
  const animatedTop = useRef(new Animated.Value(50)).current
  const animatedX = useRef(new Animated.Value(0)).current

  useEffect(() => {
    const easing = Easing.inOut(Easing.exp)

    Animated.parallel([
      Animated.timing(animatedSize, {
        toValue: keyboardOpen ? 100 : width,
        duration: ANIMATION_DURATION,
        easing,
        useNativeDriver: false,
      }),
      Animated.timing(animatedTop, {
        toValue: keyboardOpen ? 10 : 50,
        duration: ANIMATION_DURATION,
        easing,
        useNativeDriver: false,
      }),
      Animated.timing(animatedX, {
        toValue: keyboardOpen ? 0 : width / 2 - width / 2,
        duration: ANIMATION_DURATION,
        easing,
        useNativeDriver: false,
      }),
    ]).start()
  }, [keyboardOpen, animatedSize, animatedTop, animatedX])

  return (
    <Animated.View
      style={{
        position: 'absolute',
        top: animatedTop,
        left: animatedX,
        zIndex: 1,
      }}
    >
      <Animated.Image
        source={require('@/src/assets/images/logo.png')}
        style={{
          width: animatedSize,
          height: animatedSize,
        }}
        resizeMode="contain"
      />
    </Animated.View>
  )
}

export default LoginScreenAnimatedTitle
