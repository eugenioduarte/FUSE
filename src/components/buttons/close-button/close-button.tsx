import { CloseIcon } from '@/assets/icons'
import React from 'react'
import { StyleProp, ViewStyle } from 'react-native'
import IconButton from '../icon-button/IconButton'

type Props = {
  onPress: () => void
  styles?: StyleProp<ViewStyle>
}

const CloseButton = ({ onPress, styles, ...props }: Props) => {
  const baseStyle = { borderWidth: 0, backgroundColor: 'transparent' }

  return (
    <IconButton
      onPress={onPress}
      styles={[baseStyle, styles]}
      icon={<CloseIcon width={24} height={24} />}
      {...props}
    />
  )
}

export default CloseButton
