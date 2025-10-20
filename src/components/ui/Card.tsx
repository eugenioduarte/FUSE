import React from 'react'
import { View, ViewProps, ViewStyle } from 'react-native'

type Props = ViewProps & {
  style?: ViewStyle | ViewStyle[]
}

const Card: React.FC<Props> = ({ style, children, ...rest }) => {
  return (
    <View
      {...rest}
      style={[
        {
          backgroundColor: '#fff',
          borderWidth: 1,
          borderColor: '#3a3a3a',
          borderRadius: 10,
          padding: 12,
        },
        style as any,
      ]}
    >
      {children}
    </View>
  )
}

export default Card
