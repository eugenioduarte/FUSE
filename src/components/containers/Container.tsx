import React from 'react'
import { View, ViewProps } from 'react-native'

type ContainerProps = {
  children: React.ReactNode
  style?: ViewProps['style']
} & ViewProps

const Container = ({ children, style, ...props }: ContainerProps) => {
  return (
    <View
      style={[
        {
          flex: 1,
        },
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  )
}

export default Container
