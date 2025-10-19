import { registerRootComponent } from 'expo'
import React from 'react'
import { StatusBar } from 'react-native'
import 'react-native-reanimated'
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context'
import Navigation from './src/navigation/Navigation'

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar backgroundColor="#000" barStyle="light-content" />
      <SafeAreaView
        edges={['top']}
        style={{ flex: 1, backgroundColor: '#000' }}
      >
        <Navigation />
      </SafeAreaView>
    </SafeAreaProvider>
  )
}

registerRootComponent(App)
