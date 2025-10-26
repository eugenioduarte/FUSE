import React from 'react'
import { View, ViewProps } from 'react-native'

const Container = ({
  children,
  style,
  ...props
}: {
  children: React.ReactNode
  style?: ViewProps['style']
  props?: ViewProps
}) => {
  return (
    <View
      style={[{ flex: 1, backgroundColor: 'blue', paddingTop: 50 }, style]}
      {...props}
    >
      {children}
    </View>
  )
}

export default Container
