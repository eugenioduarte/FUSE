import { useTheme } from '@/hooks/useTheme'
import React from 'react'
import { View, ViewProps, ViewStyle } from 'react-native'

type Props = ViewProps & {
  style?: ViewStyle | ViewStyle[]
}

const Card: React.FC<Props> = ({ style, children, ...rest }) => {
  const theme = useTheme()
  return (
    <View
      {...rest}
      style={[
        {
          backgroundColor: '#fff',
          borderWidth: theme.border.size,
          borderColor: theme.colors.borderColor,
          borderRadius: theme.border.radius12,
          overflow: 'hidden',
        },
        style as any,
      ]}
    >
      {children}
    </View>
  )
}

export default Card
