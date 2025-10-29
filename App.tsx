import { SnackbarProvider } from '@/components/ui/SnackbarProvider'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { registerRootComponent } from 'expo'
import { useFonts } from 'expo-font'
import React from 'react'
import { StatusBar } from 'react-native'
import 'react-native-reanimated'
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context'
import Navigation from './src/navigation/Navigation'
import { useThemeStore } from './src/store/useThemeStore'

import { firebaseConfig } from '@/services'
import { initializeApp } from 'firebase/app'
import { addDoc, collection, getFirestore } from 'firebase/firestore'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 30 * 60 * 1000,
      refetchOnWindowFocus: false,
    },
  },
})

export default function App() {
  // printHello()
  const { backgroundColor } = useThemeStore()
  const [fontsLoaded] = useFonts({
    'Fredoka-Light': require('./assets/fonts/Fredoka-Light.ttf'),
    'Fredoka-Regular': require('./assets/fonts/Fredoka-Regular.ttf'),
    'Fredoka-Medium': require('./assets/fonts/Fredoka-Medium.ttf'),
    'Fredoka-SemiBold': require('./assets/fonts/Fredoka-SemiBold.ttf'),
    'Fredoka-Bold': require('./assets/fonts/Fredoka-Bold.ttf'),
  })

  if (!fontsLoaded) return null

  const app = initializeApp(firebaseConfig)
  const db = getFirestore(app)

  addDoc(collection(db, 'test'), { foo: 'bar' })
  console.log('ok!')

  return (
    <SafeAreaProvider>
      <StatusBar backgroundColor="#000" barStyle="dark-content" />
      <SafeAreaView
        edges={['top']}
        style={{ flex: 1, backgroundColor: backgroundColor }}
      >
        <QueryClientProvider client={queryClient}>
          <SnackbarProvider>
            <Navigation />
          </SnackbarProvider>
        </QueryClientProvider>
      </SafeAreaView>
    </SafeAreaProvider>
  )
}

registerRootComponent(App)
