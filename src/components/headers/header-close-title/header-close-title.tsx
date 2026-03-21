import { Text } from '@/components'
import { spacings } from '@/constants/theme'
import { navigatorManager } from '@/navigation'
import React from 'react'
import { StyleSheet, View } from 'react-native'
import CloseButton from '../../buttons/close-button/close-button'
const HeaderCloseTitle = ({
  title,
  onPress,
}: {
  title?: string
  onPress?: () => void
}) => {
  return (
    <View>
      <CloseButton
        onPress={() => onPress ?? navigatorManager.goBack()}
        styles={styles.button}
      />

      <Text variant="xxLarge" style={styles.title}>
        {title}
      </Text>
    </View>
  )
}

export default HeaderCloseTitle

const styles = StyleSheet.create({
  button: { alignSelf: 'flex-end' },
  title: {
    marginBottom: spacings.large,
  },
})
