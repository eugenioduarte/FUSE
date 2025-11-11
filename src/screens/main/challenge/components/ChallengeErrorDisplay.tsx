import React from 'react'
import { Text, View } from 'react-native'

const ChallengeErrorDisplay = () => {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ color: 'white' }}>Challenge indisponível.</Text>
    </View>
  )
}

export default ChallengeErrorDisplay
