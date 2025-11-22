import React from 'react'
import { Text, View } from 'react-native'

const LoadingContainer = ({ screenName }: { screenName: string }) => {
  return (
    <View>
      <Text>LoadingContainer</Text>
      <Text>{screenName}</Text>
    </View>
  )
}

export default LoadingContainer
