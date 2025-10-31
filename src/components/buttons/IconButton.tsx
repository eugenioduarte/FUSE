import { useTheme } from '@/hooks/useTheme'
import { ThemeType } from '@/types/theme.type'
import React from 'react'
import { StyleSheet, TouchableOpacity, ViewStyle } from 'react-native'

type IconButtonProps = {
  icon: React.ReactNode
  onPress: () => void
  styles?: ViewStyle
}

const IconButton = ({ icon, onPress, styles, ...props }: IconButtonProps) => {
  const theme = useTheme()
  const defaultStyles = createStyles(theme)
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[defaultStyles.touchable, styles]}
    >
      {icon}
    </TouchableOpacity>
  )
}

export default IconButton

const createStyles = (theme: ThemeType) =>
  StyleSheet.create({
    touchable: {
      backgroundColor: theme.colors.backgroundSecondary,
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
