import { Text } from '@/components'
import { useTheme } from '@/hooks/useTheme'
import { ThemeType } from '@/types/theme.type'
import React from 'react'
import { StyleSheet, TouchableOpacity, View } from 'react-native'

const HeaderWithBack = ({
  title,
  rightLabel,
  onBack,
  onRightPress,
}: {
  title: string
  rightLabel?: string
  onBack: () => void
  onRightPress?: () => void
}) => {
  const theme = useTheme()
  const styles = createStyles(theme)
  return (
    <View style={styles.headerRow}>
      <TouchableOpacity onPress={onBack}>
        <Text style={styles.link}>← Voltar</Text>
      </TouchableOpacity>
      <Text style={styles.headerTitle}>{title}</Text>
      {rightLabel ? (
        <TouchableOpacity onPress={onRightPress}>
          <Text style={styles.link}>{rightLabel}</Text>
        </TouchableOpacity>
      ) : (
        <View style={{ width: 64 }} />
      )}
    </View>
  )
}

export default HeaderWithBack

const createStyles = (theme: ThemeType) =>
  StyleSheet.create({
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 12,
    },
    headerTitle: { color: 'white', fontSize: 18, fontWeight: '700' },
    link: { color: '#60a5fa', fontWeight: '700' },
  })
