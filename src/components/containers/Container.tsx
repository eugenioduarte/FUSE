import React from 'react'
import { View } from 'react-native'

const Container = ({ children }: { children: React.ReactNode }) => {
  return (
    <View style={{ flex: 1, backgroundColor: '#fff', padding: 16 }}>
      {children}
    </View>
  )
}

export default Container
