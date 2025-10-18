import { NavigationContainer } from '@react-navigation/native'
import { createStackNavigator } from '@react-navigation/stack'
import React, { useEffect, useState } from 'react'
import { ActivityIndicator, Easing, View } from 'react-native'
import { EasingFunction } from 'react-native-reanimated'
import { Header } from '../components'
import { ROUTES, RouteName } from '../constants/routes'
import LoginScreen from '../screens/auth/loginScreen/LoginScreen'
import RecoveryPassScreen from '../screens/auth/recoveryPassScreen/RecoveryPassScreen'
import RegisterScreen from '../screens/auth/registerScreen/RegisterScreen'
import DashboardScreen from '../screens/main/dashboardScreen/DashboardScreen'
import TopicScreen from '../screens/main/topicScreen/TopicScreen'
import { useAuthStore } from '../store/useAuthStore'
import { useThemeStore } from '../store/useThemeStore'
import { navigationRef } from './navigationRef'
import { RootStackParamList } from './navigatorManager'

const Stack = createStackNavigator<RootStackParamList>()

const verticalTransition = {
  gestureDirection: 'vertical' as const,
  transitionSpec: {
    open: {
      animation: 'timing' as const,
      config: {
        duration: 550,
        easing: Easing.bezier(0.25, 1, 0.5, 1) as unknown as EasingFunction,
      },
    },
    close: {
      animation: 'timing' as const,
      config: {
        duration: 500,
        easing: Easing.bezier(0.25, 1, 0.5, 1) as unknown as EasingFunction,
      },
    },
  },
  cardStyleInterpolator: ({ current, layouts }: any) => ({
    cardStyle: {
      transform: [
        {
          translateY: current.progress.interpolate({
            inputRange: [0, 1],
            outputRange: [layouts.screen.height * 0.9, 0],
          }),
        },
      ],
      opacity: current.progress.interpolate({
        inputRange: [0, 0.5, 1],
        outputRange: [0, 0.6, 1],
      }),
    },
  }),
}

const defaultScreenOptions = {
  headerShown: false,
  ...verticalTransition,
}

export default function Navigation() {
  const [isNavReady, setIsNavReady] = useState(false)
  const [initialRouteSet, setInitialRouteSet] = useState(false)

  const setHeaderConfig = useThemeStore((s) => s.setHeaderConfig)
  const { user, rehydrated } = useAuthStore()

  useEffect(() => {
    if (
      rehydrated &&
      isNavReady &&
      !initialRouteSet &&
      navigationRef.isReady()
    ) {
      const targetRoute = user ? ROUTES.DashboardScreen : ROUTES.LoginScreen

      navigationRef.reset({
        index: 0,
        routes: [{ name: targetRoute }],
      })

      setInitialRouteSet(true)
    }
  }, [rehydrated, isNavReady, user, initialRouteSet])

  if (!rehydrated) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#000',
        }}
      >
        <ActivityIndicator size="large" color="#fff" />
      </View>
    )
  }

  return (
    <>
      <Header />
      <NavigationContainer
        ref={navigationRef}
        onReady={() => setIsNavReady(true)}
        onStateChange={() => {
          const route = navigationRef.getCurrentRoute()
          const name = (route?.name ?? '') as RouteName
          setHeaderConfig(name)
        }}
      >
        <Stack.Navigator screenOptions={defaultScreenOptions}>
          <Stack.Screen
            name={ROUTES.LoginScreen}
            component={LoginScreen}
            options={{ title: ROUTES.LoginScreen }}
          />
          <Stack.Screen
            name={ROUTES.DashboardScreen}
            component={DashboardScreen}
            options={{ title: ROUTES.DashboardScreen }}
          />
          <Stack.Screen
            name={ROUTES.TopicScreen}
            component={TopicScreen}
            options={{ title: ROUTES.TopicScreen }}
          />
          <Stack.Screen
            name={ROUTES.RegisterScreen}
            component={RegisterScreen}
            options={{ title: ROUTES.RegisterScreen }}
          />
          <Stack.Screen
            name={ROUTES.RecoveryScreen}
            component={RecoveryPassScreen}
            options={{ title: ROUTES.RecoveryScreen }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </>
  )
}
