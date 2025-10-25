/**
 * Button (React Native)
 * A pill-like button that uses theme tokens, supports optional left/right icons,
 * animates a quick scale on press, and defaults its background to theme.colors.backgroundPrimary.
 * Height is fixed to 50; width grows with content.
 */
import React, { useMemo, useRef } from 'react'
import {
  Animated,
  Pressable,
  StyleProp,
  StyleSheet,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native'
import { useTheme } from '../../hooks/useTheme'
import { Text } from '../ui/UiText'

type ButtonSize = 'default' | 'sm' | 'lg' | 'icon'

type ButtonProps = {
  title: string
  onPress: () => void
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  disabled?: boolean
  style?: StyleProp<ViewStyle>
  size?: ButtonSize
  background?: string
}

const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  leftIcon,
  rightIcon,
  disabled = false,
  style,
  size = 'default',
  background,
}) => {
  const theme = useTheme()

  const sizeStyle = useMemo(() => {
    switch (size) {
      case 'sm':
        return {
          paddingVertical: theme.spacings.small * 0.75,
          paddingHorizontal: theme.spacings.small * 1.5,
        } as const
      case 'lg':
        return {
          paddingVertical: theme.spacings.small * 1.5,
          paddingHorizontal: theme.spacings.xLarge,
        } as const
      case 'icon':
        return {
          paddingVertical: 0,
          paddingHorizontal: 0,
        } as const
      case 'default':
      default:
        return {
          paddingVertical: theme.spacings.small,
          paddingHorizontal: theme.spacings.medium,
        } as const
    }
  }, [size, theme])

  const scale = useRef(new Animated.Value(1)).current
  const styles = useMemo(
    () =>
      createStyles(theme, {
        bgColor: background ?? theme.colors.backgroundPrimary,
        textColor: theme.colors.textPrimary,
        borderColor: theme.colors.borderColor,
        sizeStyle,
        hasLeftIcon: !!leftIcon,
        hasRightIcon: !!rightIcon,
        scale,
        disabled,
      }),
    [theme, background, sizeStyle, leftIcon, rightIcon, scale, disabled],
  )

  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => {
        if (disabled) return
        Animated.timing(scale, {
          toValue: 0.95,
          duration: 90,
          useNativeDriver: true,
        }).start()
      }}
      onPressOut={() => {
        Animated.timing(scale, {
          toValue: 1,
          duration: 120,
          useNativeDriver: true,
        }).start()
      }}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      style={({ pressed }) => [
        styles.pressable,
        pressed && styles.pressed,
        style,
      ]}
    >
      <Animated.View style={styles.container}>
        {leftIcon ? <View style={styles.iconLeft}>{leftIcon}</View> : null}
        <View pointerEvents="none" style={styles.labelWrap}>
          <Text
            weight="bold"
            style={styles.label}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {title}
          </Text>
        </View>
        {rightIcon ? <View style={styles.iconRight}>{rightIcon}</View> : null}
      </Animated.View>
    </Pressable>
  )
}

export default Button

type SizeStyle = {
  paddingVertical?: number
  paddingHorizontal?: number
}

type DynamicOptions = {
  bgColor: string
  textColor: string
  borderColor: string
  sizeStyle: SizeStyle
  hasLeftIcon: boolean
  hasRightIcon: boolean
  scale: Animated.Value
  disabled: boolean
}

const createStyles = (
  theme: ReturnType<typeof useTheme>,
  opts: DynamicOptions,
) => {
  const base = StyleSheet.create({
    pressable: {
      alignSelf: 'flex-start',
      position: 'relative',
    },
    pressed: {
      opacity: 0.98,
    },
    containerBase: {
      justifyContent: 'center',
    },
    labelWrap: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    labelBase: {
      textAlign: 'center',
      letterSpacing: 0.5,
    },
    iconLeft: {
      position: 'absolute',
      left: theme.spacings.medium,
      justifyContent: 'center',
      alignItems: 'center',
      height: '100%',
    },
    iconRight: {
      position: 'absolute',
      right: theme.spacings.medium,
      justifyContent: 'center',
      alignItems: 'center',
      height: '100%',
    },
  })

  const paddingH = opts.sizeStyle.paddingHorizontal ?? 0

  return {
    ...base,
    container: [
      base.containerBase,
      {
        backgroundColor: opts.bgColor,
        borderColor: opts.borderColor,
        borderWidth: theme.border.size,
        opacity: opts.disabled ? 0.6 : 1,
        borderRadius: 999,
        height: 50,
        paddingVertical: opts.sizeStyle.paddingVertical,
        paddingLeft:
          paddingH +
          (opts.hasLeftIcon ? theme.spacings.medium + theme.spacings.large : 0),
        paddingRight:
          paddingH +
          (opts.hasRightIcon
            ? theme.spacings.medium + theme.spacings.large
            : 0),
        transform: [{ scale: opts.scale }],
      },
    ] as StyleProp<ViewStyle>,
    label: [base.labelBase, { color: opts.textColor }] as StyleProp<TextStyle>,
  }
}
