import { Text } from '@/components/ui-text/ui-text'
import { Colors } from '@/constants/theme'
import React, { useEffect, useRef } from 'react'
import { Animated, StyleSheet } from 'react-native'

export enum SnackbarTypeEnum {
  INFO = 'info',
  SUCCESS = 'success',
  ERROR = 'error',
}
export type SnackbarType = 'info' | 'success' | 'error'

interface SnackbarProps {
  visible: boolean
  message: string
  type?: SnackbarType
  onHide?: () => void
  duration?: number
}

const COLORS = {
  info: Colors.light.accentOrange,
  success: Colors.light.accentBlue,
  error: Colors.light.accentPink,
}

export const Snackbar: React.FC<SnackbarProps> = ({
  visible,
  message,
  type = 'info',
  onHide,
  duration = 7000,
}) => {
  const translateY = useRef(new Animated.Value(-100)).current

  useEffect(() => {
    if (visible) {
      Animated.timing(translateY, {
        toValue: 70,
        duration: 300,
        useNativeDriver: true,
      }).start()

      if (duration > 0) {
        const timer = setTimeout(() => {
          Animated.timing(translateY, {
            toValue: -100,
            duration: 300,
            useNativeDriver: true,
          }).start(() => onHide?.())
        }, duration)
        return () => clearTimeout(timer)
      }
    } else {
      Animated.timing(translateY, {
        toValue: -100,
        duration: 300,
        useNativeDriver: true,
      }).start()
    }
  }, [visible, duration, onHide, translateY])

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: COLORS[type],
          transform: [{ translateY }, { translateX: -0.5 * 300 }],
        },
      ]}
      pointerEvents="none"
    >
      <Text style={styles.text} variant="large">
        {message}
      </Text>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: '50%',
    zIndex: 9999,
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 999,
    elevation: 4,
    minWidth: 300,
    borderWidth: 2,
    borderColor: 'black',
  },
  text: {
    color: 'black',
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
  },
})

export default Snackbar
