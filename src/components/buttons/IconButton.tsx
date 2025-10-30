import React from 'react'
import { TouchableOpacity, ViewStyle } from 'react-native'

type IconButtonProps = {
  icon: React.ReactNode
  onPress: () => void
  styles?: ViewStyle
}

const IconButton = ({ icon, onPress, styles, ...props }: IconButtonProps) => {
  return (
    <TouchableOpacity onPress={onPress} {...props} style={styles}>
      {icon}
    </TouchableOpacity>
  )
}

export default IconButton
