import { useTheme } from '@/hooks/useTheme'
import { ThemeType } from '@/types/theme.type'
import React from 'react'
import { StyleSheet, View, ViewStyle } from 'react-native'

const SubContainer = ({
  children,
  styleContainer,
}: {
  children: React.ReactNode
  styleContainer?: ViewStyle
}) => {
  const theme = useTheme()
  const styles = createStyles(theme)
  return <View style={[styles.container, styleContainer]}>{children}</View>
}

export default SubContainer

const createStyles = (theme: ThemeType) =>
  StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.colors.backgroundPrimary,
      borderWidth: theme.border.size,
      borderColor: theme.colors.borderColor,
      paddingTop: theme.spacings.xSmall,
      paddingHorizontal: theme.spacings.medium,
      borderTopLeftRadius: theme.border.radius16,
      borderTopRightRadius: theme.border.radius16,
    },
  })
