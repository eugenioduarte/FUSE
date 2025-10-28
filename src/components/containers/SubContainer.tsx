import { useTheme } from '@/hooks/useTheme'
import { ThemeType } from '@/types/theme.type'
import React from 'react'
import { StyleSheet, View } from 'react-native'

const SubContainer = ({ children }: { children: React.ReactNode }) => {
  const theme = useTheme()
  const styles = createStyles(theme)
  return <View style={styles.container}>{children}</View>
}

export default SubContainer

const createStyles = (theme: ThemeType) =>
  StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.colors.backgroundPrimary,
      borderTopLeftRadius: 25,
      borderTopRightRadius: 25,
      borderWidth: theme.border.size,
      borderColor: theme.colors.borderColor,
      paddingTop: theme.spacings.medium,
      paddingHorizontal: theme.spacings.medium,
      paddingBottom: theme.spacings.xLarge,
    },
  })
