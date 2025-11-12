import { CloseIcon } from '@/assets/icons'
import React from 'react'
import IconButton from './IconButton'

const CloseButton = ({ onPress }: { onPress: () => void }) => {
  return (
    <IconButton
      onPress={onPress}
      styles={{ borderWidth: 0, backgroundColor: 'transparent' }}
      icon={<CloseIcon width={24} height={24} />}
    />
  )
}

export default CloseButton
