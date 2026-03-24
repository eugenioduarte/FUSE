import { ThemeType } from '@/types/theme.type'
import { useEffect, useRef, useState } from 'react'
import { Animated, EmitterSubscription, Keyboard, Platform } from 'react-native'

export const useLoginAnimation = (theme: ThemeType) => {
  const translateY = useRef(new Animated.Value(0)).current
  const animatedTitleSize = useRef(new Animated.Value(100)).current
  const animatedTitleMargin = useRef(
    new Animated.Value(theme.spacings.large),
  ).current
  const [keyboardOpen, setKeyboardOpen] = useState(false)

  useEffect(() => {
    let showSub: EmitterSubscription | undefined
    let hideSub: EmitterSubscription | undefined

    const showEvent =
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow'
    const hideEvent =
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide'

    showSub = Keyboard.addListener(showEvent, () => {
      setKeyboardOpen(true)
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: -80,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(animatedTitleSize, {
          toValue: 40,
          duration: 300,
          useNativeDriver: false,
        }),
        Animated.timing(animatedTitleMargin, {
          toValue: theme.spacings.small,
          duration: 300,
          useNativeDriver: false,
        }),
      ]).start()
    })

    hideSub = Keyboard.addListener(hideEvent, () => {
      setKeyboardOpen(false)
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(animatedTitleSize, {
          toValue: 100,
          duration: 300,
          useNativeDriver: false,
        }),
        Animated.timing(animatedTitleMargin, {
          toValue: theme.spacings.large,
          duration: 300,
          useNativeDriver: false,
        }),
      ]).start()
    })

    return () => {
      showSub?.remove()
      hideSub?.remove()
    }
  }, [theme, translateY, animatedTitleSize, animatedTitleMargin])

  return {
    translateY,
    animatedTitleSize,
    animatedTitleMargin,
    keyboardOpen,
  }
}
