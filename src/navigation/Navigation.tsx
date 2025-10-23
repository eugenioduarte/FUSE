import {
  createDrawerNavigator,
  DrawerContentComponentProps,
} from '@react-navigation/drawer'
import { NavigationContainer } from '@react-navigation/native'
import { createStackNavigator } from '@react-navigation/stack'
import React, { useEffect, useState } from 'react'
import { ActivityIndicator, Easing, View } from 'react-native'
import { EasingFunction } from 'react-native-reanimated'

import { Header } from '../components'
import { RouteName, ROUTES } from '../constants/routes'
import { useAuthStore } from '../store/useAuthStore'
import { useThemeStore } from '../store/useThemeStore'
import { navigationRef } from './navigationRef'

// Menu (drawer content)
import MenuScreen from '../screens/main/menu/MenuScreen'

// Auth
import LoginScreen from '../screens/auth/login/LoginScreen'
import RecoveryPassScreen from '../screens/auth/recovery-password/RecoveryPasswordScreen'
import RegisterScreen from '../screens/auth/register/RegisterScreen'

// Main
import DashboardScreen from '../screens/main/dashboard/DashboardScreen'
import TopicScreen from '../screens/main/topic/TopicScreen'

// Calendar
import CalendarScreen from '../screens/CalendarScreen/CalendarScreen'
import CalendarAddScreen from '../screens/main/calendar/CalendarAddScreen'
import CalendarDetailsScreen from '../screens/main/calendar/CalendarDetailsScreen'

// Challenge
import ChallengeAddHangmanScreen from '../screens/main/challenge/challenge-add/ChallengeAddHangmanScreen'
import ChallengeAddMatrixScreen from '../screens/main/challenge/challenge-add/ChallengeAddMatrixScreen'
import ChallengeAddQuizScreen from '../screens/main/challenge/challenge-add/ChallengeAddQuizScreen'
import ChallengeAddScreen from '../screens/main/challenge/challenge-add/ChallengeAddScreen'
import ChallengeAddTextAnswerScreen from '../screens/main/challenge/challenge-add/ChallengeAddTextAnswerScreen'
import ChallengeReviewHangmanScreen from '../screens/main/challenge/ChallengeReviewHangmanScreen'
import ChallengeReviewMatrixScreen from '../screens/main/challenge/ChallengeReviewMatrixScreen'
import ChallengeReviewQuizScreen from '../screens/main/challenge/ChallengeReviewQuizScreen'
import ChallengeReviewTextAnswerScreen from '../screens/main/challenge/ChallengeReviewTextAnswerScreen'
import ChallengeRunHangmanScreen from '../screens/main/challenge/ChallengeRunHangmanScreen'
import ChallengeRunMatrixScreen from '../screens/main/challenge/ChallengeRunMatrixScreen'
import ChallengeRunQuizScreen from '../screens/main/challenge/ChallengeRunQuizScreen'
import ChallengeRunTextAnswerScreen from '../screens/main/challenge/ChallengeRunTextAnswerScreen'
import ChallengeScreen from '../screens/main/challenge/ChallengeScreen'
import ChallengesListScreen from '../screens/main/challenge/ChallengesListScreen'

// Topic details & summary
import SummaryAudioScreen from '../screens/main/topic/summary/SummaryAudioScreen'
import SummaryDetailsScreen from '../screens/main/topic/summary/SummaryDetailsScreen'
import SummaryScreen from '../screens/main/topic/summary/SummaryScreen'
import TopicAddScreen from '../screens/main/topic/topic-add/TopicAddScreen'
import TopicDetailsScreen from '../screens/main/topic/topic-details/TopicDetailsScreen'

// Menu screens (as regular stack screens)
import ConnectionsScreen from '../screens/main/menu/connections/ConnectionsScreen'
import PaymentScreen from '../screens/main/menu/payment/PaymentScreen'
import ProfileScreen from '../screens/main/menu/profile/ProfileScreen'
import NotificationsScreen from '../screens/main/notifications/NotificationsScreen'

// Whiteboard (keep legacy path casing for now)
import WhiteboardScreen from '../screens/main/whiteBoard/WhiteBoardScreen'

import EditOverlay from '../screens/main/utils/edit-overlay/EditOverlay'
import ErrorOverlay from '../screens/main/utils/error-overlay/ErrorOverlay'
import FastWayOverlay from '../screens/main/utils/fast-way-overlay/FastWayOverlay'
import LoadingOverlay from '../screens/main/utils/loading-overlay/LoadingOverlay'
import SuccessOverlay from '../screens/main/utils/success-overlay/SuccessOverlay'
import {
  initFirebaseAuthListener,
  waitForAuthReady,
} from '../services/firebase/authService'
import { useOverlay } from '../store/useOverlay'
import { RootStackParamList } from './navigatorManager'

const Stack = createStackNavigator<RootStackParamList>()
const Drawer = createDrawerNavigator()
const DRAWER_APP = 'App'

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

function MainStack() {
  return (
    <Stack.Navigator screenOptions={defaultScreenOptions}>
      {/* Auth */}
      <Stack.Screen
        name={ROUTES.LoginScreen}
        component={LoginScreen}
        options={{ title: ROUTES.LoginScreen }}
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

      {/* Main */}
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

      {/* Calendar */}
      <Stack.Screen
        name={ROUTES.CalendarScreen}
        component={CalendarScreen}
        options={{ title: ROUTES.CalendarScreen }}
      />
      <Stack.Screen
        name={ROUTES.CalendarAddScreen}
        component={CalendarAddScreen}
        options={{ title: ROUTES.CalendarAddScreen }}
      />
      <Stack.Screen
        name={ROUTES.CalendarDetailsScreen}
        component={CalendarDetailsScreen}
        options={{ title: ROUTES.CalendarDetailsScreen }}
      />

      {/* Challenge */}
      <Stack.Screen
        name={ROUTES.ChallengeScreen}
        component={ChallengeScreen}
        options={{ title: ROUTES.ChallengeScreen }}
      />
      <Stack.Screen
        name={ROUTES.ChallengeAddScreen}
        component={ChallengeAddScreen}
        options={{ title: ROUTES.ChallengeAddScreen }}
      />
      <Stack.Screen
        name={ROUTES.ChallengeAddHangmanScreen}
        component={ChallengeAddHangmanScreen}
        options={{ title: ROUTES.ChallengeAddHangmanScreen }}
      />
      <Stack.Screen
        name={ROUTES.ChallengeAddMatrixScreen}
        component={ChallengeAddMatrixScreen}
        options={{ title: ROUTES.ChallengeAddMatrixScreen }}
      />
      <Stack.Screen
        name={ROUTES.ChallengeRunTextAnswerScreen}
        component={ChallengeRunTextAnswerScreen}
        options={{
          title: ROUTES.ChallengeRunTextAnswerScreen,
          gestureEnabled: false,
        }}
      />
      <Stack.Screen
        name={ROUTES.ChallengeAddQuizScreen}
        component={ChallengeAddQuizScreen}
        options={{ title: ROUTES.ChallengeAddQuizScreen }}
      />
      <Stack.Screen
        name={ROUTES.ChallengeReviewTextAnswerScreen}
        component={ChallengeReviewTextAnswerScreen}
        options={{ title: ROUTES.ChallengeReviewTextAnswerScreen }}
      />
      <Stack.Screen
        name={ROUTES.ChallengeAddTextAnswerScreen}
        component={ChallengeAddTextAnswerScreen}
        options={{ title: ROUTES.ChallengeAddTextAnswerScreen }}
      />
      <Stack.Screen
        name={ROUTES.ChallengesListScreen}
        component={ChallengesListScreen}
        options={{ title: ROUTES.ChallengesListScreen }}
      />
      <Stack.Screen
        name={ROUTES.ChallengeRunQuizScreen}
        component={ChallengeRunQuizScreen}
        options={{ title: ROUTES.ChallengeRunQuizScreen }}
      />
      <Stack.Screen
        name={ROUTES.ChallengeRunHangmanScreen}
        component={ChallengeRunHangmanScreen}
        options={{ title: ROUTES.ChallengeRunHangmanScreen }}
      />
      <Stack.Screen
        name={ROUTES.ChallengeReviewQuizScreen}
        component={ChallengeReviewQuizScreen}
        options={{ title: ROUTES.ChallengeReviewQuizScreen }}
      />
      <Stack.Screen
        name={ROUTES.ChallengeReviewHangmanScreen}
        component={ChallengeReviewHangmanScreen}
        options={{ title: ROUTES.ChallengeReviewHangmanScreen }}
      />
      <Stack.Screen
        name={ROUTES.ChallengeRunMatrixScreen}
        component={ChallengeRunMatrixScreen}
        options={{
          title: ROUTES.ChallengeRunMatrixScreen,
          gestureEnabled: false,
        }}
      />
      <Stack.Screen
        name={ROUTES.ChallengeReviewMatrixScreen}
        component={ChallengeReviewMatrixScreen}
        options={{ title: ROUTES.ChallengeReviewMatrixScreen }}
      />

      {/* Topic details & summary */}
      <Stack.Screen
        name={ROUTES.TopicDetailsScreen}
        component={TopicDetailsScreen}
        options={{ title: ROUTES.TopicDetailsScreen }}
      />
      <Stack.Screen
        name={ROUTES.TopicAddScreen}
        component={TopicAddScreen}
        options={{ title: ROUTES.TopicAddScreen }}
      />
      <Stack.Screen
        name={ROUTES.SummaryScreen}
        component={SummaryScreen}
        options={{ title: ROUTES.SummaryScreen }}
      />
      <Stack.Screen
        name={ROUTES.SummaryDetailsScreen}
        component={SummaryDetailsScreen}
        options={{ title: ROUTES.SummaryDetailsScreen }}
      />
      <Stack.Screen
        name={ROUTES.SummaryAudioScreen}
        component={SummaryAudioScreen}
        options={{ title: ROUTES.SummaryAudioScreen }}
      />

      {/* Menu */}
      <Stack.Screen
        name={ROUTES.ProfileScreen}
        component={ProfileScreen}
        options={{ title: ROUTES.ProfileScreen }}
      />
      <Stack.Screen
        name={ROUTES.ConnectionsScreen}
        component={ConnectionsScreen}
        options={{ title: ROUTES.ConnectionsScreen }}
      />
      <Stack.Screen
        name={ROUTES.PaymentScreen}
        component={PaymentScreen}
        options={{ title: ROUTES.PaymentScreen }}
      />
      <Stack.Screen
        name={ROUTES.NotificationsScreen}
        component={NotificationsScreen}
        options={{ title: ROUTES.NotificationsScreen }}
      />

      {/* Whiteboard */}
      <Stack.Screen
        name={ROUTES.WhiteboardScreen}
        component={WhiteboardScreen}
        options={{ title: ROUTES.WhiteboardScreen }}
      />
    </Stack.Navigator>
  )
}

// Lint-safe drawer content renderer (outside component to avoid re-creation on every render)
const DrawerContent = (_props: DrawerContentComponentProps) => <MenuScreen />

export default function Navigation() {
  const [isNavReady, setIsNavReady] = useState(false)
  const [initialRouteSet, setInitialRouteSet] = useState(false)
  const [authReady, setAuthReady] = useState(false)

  const setHeaderConfig = useThemeStore((s) => s.setHeaderConfig)
  const { user, rehydrated } = useAuthStore()

  // Attach Firebase auth listener once on mount
  useEffect(() => {
    initFirebaseAuthListener()
    waitForAuthReady().then(() => setAuthReady(true))
  }, [])

  useEffect(() => {
    if (
      rehydrated &&
      authReady &&
      isNavReady &&
      !initialRouteSet &&
      navigationRef.isReady()
    ) {
      const targetRoute = user ? ROUTES.DashboardScreen : ROUTES.LoginScreen

      navigationRef.reset({
        index: 0,
        routes: [
          {
            name: DRAWER_APP as never,
            state: {
              index: 0,
              routes: [{ name: targetRoute as never }],
            },
          } as never,
        ],
      })
      setInitialRouteSet(true)
    }
  }, [rehydrated, isNavReady, authReady, user, initialRouteSet])

  if (!rehydrated || !authReady) {
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
        <Drawer.Navigator
          screenOptions={{
            headerShown: false,
            swipeEnabled: false,
            drawerType: 'front',
          }}
          drawerContent={DrawerContent}
          initialRouteName={DRAWER_APP}
        >
          <Drawer.Screen name={DRAWER_APP} component={MainStack} />
        </Drawer.Navigator>
      </NavigationContainer>
      <OverlayHost />
    </>
  )
}

// Renders overlays (modals) whenever the store flags are true
const OverlayHost: React.FC = () => {
  const { errorOverlay, loadingOverlay, fastWayOverlay, editOverlay } =
    useOverlay()
  return (
    <>
      {loadingOverlay ? <LoadingOverlay /> : null}
      {errorOverlay ? <ErrorOverlay /> : null}
      {fastWayOverlay ? <FastWayOverlay /> : null}
      {editOverlay ? <EditOverlay /> : null}
      <SuccessOverlay />
    </>
  )
}
