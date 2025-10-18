import { registerRootComponent } from 'expo'
import React from 'react'
import { SafeAreaView, StatusBar } from 'react-native'
import 'react-native-reanimated'
import Navigation from './src/navigation/Navigation'

export default function App() {
  return (
    <>
      <StatusBar backgroundColor="#000" barStyle="light-content" />
      <SafeAreaView style={{ flex: 1, backgroundColor: '#000' }}>
        <Navigation />
      </SafeAreaView>
    </>
  )
}

registerRootComponent(App)
