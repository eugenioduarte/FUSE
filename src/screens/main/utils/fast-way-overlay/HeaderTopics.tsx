import { PlusIcon } from '@/assets/icons'
import { Text } from '@/components'
import { useTheme } from '@/hooks/useTheme'
import { t } from '@/locales/translation'
import { ThemeType } from '@/types/theme.type'
import React from 'react'
import { StyleSheet, TouchableOpacity, View } from 'react-native'

const HeaderTopics = ({ onAddTopic }: { onAddTopic: () => void }) => {
  const theme = useTheme()
  const styles = createStyles(theme)

  return (
    <View style={styles.headerRow}>
      <Text variant="xxLarge">{t('fastWay.topics')}</Text>
      <TouchableOpacity onPress={onAddTopic}>
        <PlusIcon width={20} height={20} fill={theme.colors.textPrimary} />
      </TouchableOpacity>
    </View>
  )
}

export default HeaderTopics

const createStyles = (theme: ThemeType) =>
  StyleSheet.create({
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginVertical: theme.spacings.xMedium,
    },
  })
