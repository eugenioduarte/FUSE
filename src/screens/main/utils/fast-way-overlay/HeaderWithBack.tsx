import { Text } from '@/components'
import { useTheme } from '@/hooks/useTheme'
import { t } from '@/locales/translation'
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
        <Text variant="medium">← {t('common.goBack')}</Text>
      </TouchableOpacity>
      <Text variant="large">{title}</Text>
      {rightLabel ? (
        <TouchableOpacity onPress={onRightPress}>
          <Text variant="medium">{rightLabel}</Text>
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
      marginBottom: theme.spacings.medium,
    },
  })
