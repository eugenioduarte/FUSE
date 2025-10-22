import React from 'react'
import { View } from 'react-native'
import Toolbar from '../../../components/whiteboard/Toolbar'
import WhiteboardCanvas from '../../../components/whiteboard/WhiteboardCanvas'

const WhiteboardScreen = () => {
  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <Toolbar />
      <WhiteboardCanvas />
    </View>
  )
}

export default WhiteboardScreen
