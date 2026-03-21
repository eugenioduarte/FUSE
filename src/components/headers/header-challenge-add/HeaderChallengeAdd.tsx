import { ChevronIcon, PathIcon } from '@/assets/icons'
import { Text } from '@/components'
import { useTheme } from '@/hooks/useTheme'
import { navigatorManager } from '@/navigation/navigatorManager'
import { useOverlay } from '@/store/useOverlay'
import { ThemeType } from '@/types/theme.type'
import React from 'react'
import { StyleSheet, View } from 'react-native'
import IconButton from '../../buttons/icon-button/IconButton'

const HeaderChallengeAdd = () => {
  const theme = useTheme()
  const styles = createStyles(theme)

  const setFastWayOverlay = useOverlay((s) => s.setFastWayOverlay)

  const handleMenuPress = () => {
    navigatorManager.goBack()
  }

  const handleFastWayPress = () => {
    setFastWayOverlay(true)
  }

  return (
    <View style={styles.container}>
      <IconButton
        icon={
          <View style={styles.chevronIcon}>
            <ChevronIcon />
          </View>
        }
        onPress={handleMenuPress}
      />
      <Text variant="xxLarge">Challenges</Text>
      <IconButton icon={<PathIcon />} onPress={handleFastWayPress} />
    </View>
  )
}

export default HeaderChallengeAdd

const createStyles = (theme: ThemeType) =>
  StyleSheet.create({
    container: {
      flex: 1,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    chevronIcon: {
      transform: [{ rotate: '180deg' }],
      marginRight: theme.spacings.xSmall,
    },
  })
