import { registerRootComponent } from 'expo'
import { useFonts } from 'expo-font'
import React from 'react'
import { StatusBar } from 'react-native'
import 'react-native-reanimated'
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context'
import Navigation from './src/navigation/Navigation'

export default function App() {
  const [fontsLoaded] = useFonts({
    'Quicksand-Light': require('./assets/fonts/Quicksand-Light.ttf'),
    'Quicksand-Regular': require('./assets/fonts/Quicksand-Regular.ttf'),
    'Quicksand-Medium': require('./assets/fonts/Quicksand-Medium.ttf'),
    'Quicksand-SemiBold': require('./assets/fonts/Quicksand-SemiBold.ttf'),
    'Quicksand-Bold': require('./assets/fonts/Quicksand-Bold.ttf'),
  })

  if (!fontsLoaded) return null
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
