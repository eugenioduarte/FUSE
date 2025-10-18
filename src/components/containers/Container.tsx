import React from 'react'
import { View } from 'react-native'

const Container = ({ children }: { children: React.ReactNode }) => {
  return <View style={{ backgroundColor: 'red', padding: 16 }}>{children}</View>
}

export default Container
