import { useTheme } from '@/hooks/useTheme'
import { ThemeType } from '@/types/theme.type'
import React from 'react'
import {
  StyleProp,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
} from 'react-native'

type IconButtonProps = {
  icon: React.ReactNode
  onPress: () => void
  styles?: StyleProp<ViewStyle>
}

const IconButton = ({ icon, onPress, styles, ...props }: IconButtonProps) => {
  const theme = useTheme()
  const defaultStyles = createStyles(theme)

  const mergedStyles: StyleProp<ViewStyle> = [
    defaultStyles.touchable,
    ...(Array.isArray(styles) ? styles : [styles]),
  ]

  return (
    <TouchableOpacity onPress={onPress} style={mergedStyles} {...props}>
      {icon}
    </TouchableOpacity>
  )
}

export default IconButton

const createStyles = (theme: ThemeType) =>
  StyleSheet.create({
    touchable: {
      backgroundColor: theme.colors.backgroundTertiary,
      width: 35,
      height: 35,
      borderRadius: 99,
      justifyContent: 'center',
      alignItems: 'center',
      padding: theme.spacings.xSmall,
      borderWidth: theme.border.size,
      borderColor: theme.colors.borderColor,
    },
  })
