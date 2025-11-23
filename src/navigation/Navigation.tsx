import {
  createDrawerNavigator,
  DrawerContentComponentProps,
} from '@react-navigation/drawer'
import { NavigationContainer } from '@react-navigation/native'
import { createStackNavigator } from '@react-navigation/stack'
import React, { useEffect, useState } from 'react'
import { ActivityIndicator, AppState, Easing, View } from 'react-native'
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
import CalendarEditScreen from '../screens/main/calendar/CalendarEditScreen'

// Challenge
import ChallengeAddHangmanScreen from '../screens/main/challenge/challenge-add/ChallengeAddHangmanScreen'
import ChallengeAddMatrixScreen from '../screens/main/challenge/challenge-add/ChallengeAddMatrixScreen'
import ChallengeAddQuizScreen from '../screens/main/challenge/challenge-add/ChallengeAddQuizScreen'
import ChallengeAddScreen from '../screens/main/challenge/challenge-add/ChallengeAddScreen'
import ChallengeAddTextAnswerScreen from '../screens/main/challenge/challenge-add/ChallengeAddTextAnswerScreen'
import ChallengeFinishedScoreScreen from '../screens/main/challenge/ChallengeFinishedScoreScreen'
import ChallengeReviewHangmanScreen from '../screens/main/challenge/ChallengeReviewHangmanScreen'
import ChallengeReviewMatrixScreen from '../screens/main/challenge/ChallengeReviewMatrixScreen'
import ChallengeReviewQuizScreen from '../screens/main/challenge/ChallengeReviewQuizScreen'
import ChallengeReviewTextAnswerScreen from '../screens/main/challenge/ChallengeReviewTextAnswerScreen'
import ChallengeRunHangmanScreen from '../screens/main/challenge/ChallengeRunHangmanScreen'
import ChallengeRunMatrixScreen from '../screens/main/challenge/ChallengeRunMatrixScreen'
import ChallengeRunQuizScreen from '../screens/main/challenge/ChallengeRunQuizScreen'
import ChallengeRunTextAnswerScreen from '../screens/main/challenge/ChallengeRunTextAnswerScreen'
import ChallengesListScreen from '../screens/main/challenge/ChallengesListScreen'

// Topic details & summary
import SummaryDetailsScreen from '../screens/main/topic/summary/SummaryDetailsScreen'
import SummaryScreen from '../screens/main/topic/summary/SummaryScreen'
import TopicAddScreen from '../screens/main/topic/topic-add/TopicAddScreen'
import TopicChatScreen from '../screens/main/topic/topic-chat/TopicChatScreen'
import TopicDetailsScreen from '../screens/main/topic/topic-details'

// Menu screens (as regular stack screens)
import ComponentsScreen from '../screens/main/components/ComponentsScreen'
import ConnectionsScreen from '../screens/main/menu/connections/ConnectionsScreen'
import PaymentScreen from '../screens/main/menu/payment/PaymentScreen'
import ProfileScreen from '../screens/main/menu/profile/ProfileScreen'
import NotificationsScreen from '../screens/main/notifications/NotificationsScreen'

import EditOverlay from '../screens/main/utils/edit-overlay/EditOverlay'
import ErrorOverlay from '../screens/main/utils/error-overlay/ErrorOverlay'
import FastWayOverlay from '../screens/main/utils/fast-way-overlay/FastWayOverlay'
import LoadingOverlay from '../screens/main/utils/loading-overlay/LoadingOverlay'
import NotificationOverlay from '../screens/main/utils/notification-overlay/NotificationOverlay'
import RankingOverlay from '../screens/main/utils/ranking-overlay/RankingOverlay'
import ShareOverlay from '../screens/main/utils/share-overlay/ShareOverlay'
import SuccessOverlay from '../screens/main/utils/success-overlay/SuccessOverlay'
import {
  initFirebaseAuthListener,
  waitForAuthReady,
} from '../services/firebase/authService'
import {
  acceptCalendarEvent,
  listenCalendarForUser,
} from '../services/firebase/calendar.service'
import {
  startCollabSyncForUser,
  triggerInitialCollaborativeSync,
} from '../services/firebase/collabSync.service'
import {
  decideNotification,
  decideNotificationTopLevel,
  listenUserNotifications,
  listenUserNotificationsTopLevel,
} from '../services/firebase/notifications.service'
import { registerForPushNotificationsAsync } from '../services/push/expoPush.service'
import { useCalendarStore } from '../store/useCalendarStore'
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
  // Decide the very first screen based on auth state to avoid any login flicker
  const { user } = useAuthStore()
  const initialRouteName: keyof RootStackParamList = user
    ? 'DashboardScreen'
    : 'LoginScreen'

  return (
    <Stack.Navigator
      screenOptions={defaultScreenOptions}
      initialRouteName={initialRouteName}
    >
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
      <Stack.Screen
        name={ROUTES.CalendarEditScreen}
        component={CalendarEditScreen}
        options={{ title: ROUTES.CalendarEditScreen }}
      />

      {/* Challenge */}
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
        name={ROUTES.ChallengeReviewHangmanScreen}
        component={ChallengeReviewHangmanScreen}
        options={{ title: ROUTES.ChallengeReviewHangmanScreen }}
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
        name={ROUTES.ChallengeFinishedScoreScreen}
        component={ChallengeFinishedScoreScreen}
        options={{ title: ROUTES.ChallengeFinishedScoreScreen }}
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
        name={ROUTES.TopicChatScreen}
        component={TopicChatScreen}
        options={{ title: ROUTES.TopicChatScreen }}
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

      {/* Dev / Components */}
      <Stack.Screen
        name={ROUTES.ComponentsScreen}
        component={ComponentsScreen}
        options={{ title: ROUTES.ComponentsScreen }}
      />
    </Stack.Navigator>
  )
}

// Lint-safe drawer content renderer (outside component to avoid re-creation on every render)
const DrawerContent = (_props: DrawerContentComponentProps) => <MenuScreen />

export default function Navigation() {
  const [authReady, setAuthReady] = useState(false)

  const { user, rehydrated } = useAuthStore()

  // Build a stable notification handler with minimal nesting
  const buildNotificationHandler = React.useCallback((uid: string) => {
    const shown = new Set<string>()
    return (
      list: import('../services/firebase/notifications.service').AppNotification[],
    ) => {
      const pending = list.find(
        (n) => n.status === 'pending' && !shown.has(n.id),
      )
      if (!pending) return
      shown.add(pending.id)
      // If it's a calendar invite, prefer server accept (eventId) and never show to inviter
      if (pending.type === 'calendar_invite' && pending.event) {
        if (pending.event.invitedBy === uid) return
        const ev = pending.event
        useOverlay.getState().setNotificationOverlay({
          id: pending.id,
          title: pending.title,
          body: pending.body,
          requireDecision: !!pending.requireDecision,
          acceptLabel: pending.acceptLabel,
          denyLabel: pending.denyLabel,
          onAccept: () => {
            if (ev.eventId) {
              void acceptCalendarEvent(ev.eventId, uid)
            } else {
              // Fallback to local add if no eventId present
              const add = useCalendarStore.getState().addAppointment
              add({
                date: ev.date,
                title: ev.title,
                description: ev.description || '',
                topicId: ev.topicId,
                summaryId: ev.summaryId,
                time: ev.time,
              })
            }
            void decideNotification(uid, pending.id, 'accepted')
          },
          onDeny: () => {
            void decideNotification(uid, pending.id, 'denied')
          },
          onClose: () => {
            // For invite, treat close as deny unless accepted
            void decideNotification(uid, pending.id, 'denied')
          },
        })
        return
      }
      // Default notification overlay
      useOverlay.getState().setNotificationOverlay({
        id: pending.id,
        title: pending.title,
        body: pending.body,
        requireDecision: !!pending.requireDecision,
        acceptLabel: pending.acceptLabel,
        denyLabel: pending.denyLabel,
      })
    }
  }, [])

  // Back-compat handler for top-level notifications (root collection)
  const buildTopLevelNotificationHandler = React.useCallback((uid: string) => {
    const shown = new Set<string>()
    return (
      list: import('../services/firebase/notifications.service').AppNotification[],
    ) => {
      const pending = list.find(
        (n) => n.status === 'pending' && !shown.has(n.id),
      )
      if (!pending) return
      shown.add(pending.id)
      if (pending.type === 'calendar_invite' && pending.event) {
        if (pending.event.invitedBy === uid) return
        const ev = pending.event
        useOverlay.getState().setNotificationOverlay({
          id: pending.id,
          title: pending.title,
          body: pending.body,
          requireDecision: !!pending.requireDecision,
          acceptLabel: pending.acceptLabel,
          denyLabel: pending.denyLabel,
          onAccept: () => {
            if (ev.eventId) {
              void acceptCalendarEvent(ev.eventId, uid)
            } else {
              const add = useCalendarStore.getState().addAppointment
              add({
                date: ev.date,
                title: ev.title,
                description: ev.description || '',
                topicId: ev.topicId,
                summaryId: ev.summaryId,
                time: ev.time,
              })
            }
            void decideNotificationTopLevel(pending.id, 'accepted')
          },
          onDeny: () => {
            void decideNotificationTopLevel(pending.id, 'denied')
          },
          onClose: () => {
            void decideNotificationTopLevel(pending.id, 'denied')
          },
        })
        return
      }
      useOverlay.getState().setNotificationOverlay({
        id: pending.id,
        title: pending.title,
        body: pending.body,
        requireDecision: !!pending.requireDecision,
        acceptLabel: pending.acceptLabel,
        denyLabel: pending.denyLabel,
      })
    }
  }, [])

  // Attach Firebase auth listener once on mount
  useEffect(() => {
    initFirebaseAuthListener()
    waitForAuthReady().then(() => setAuthReady(true))
  }, [])

  // We avoid resetting navigation on mount. Instead, MainStack sets the
  // correct initialRouteName based on the persisted auth state, preventing
  // the login screen from flashing when the user is already authenticated.

  // Track previous route name to avoid redundant header updates that could cascade renders
  const prevRouteNameRef = React.useRef<RouteName | ''>('')

  useEffect(() => {
    // When authenticated and nav ready, start collaborative listeners and do an initial refresh
    if (rehydrated && authReady && user?.id) {
      const uid = user.id
      const stop = startCollabSyncForUser(uid)
      triggerInitialCollaborativeSync().catch(() => {})
      // Register device for push notifications (fire and forget)
      registerForPushNotificationsAsync(uid).catch(() => {})
      // Listen to user notifications in real-time and show overlay when pending
      const handler = buildNotificationHandler(uid)
      const handlerTop = buildTopLevelNotificationHandler(uid)
      const unSubNotif = listenUserNotifications(uid, handler)
      const unSubTop = listenUserNotificationsTopLevel(uid, handlerTop)
      // Calendar realtime sync: events owned by me or accepted by me
      const unSubCal = listenCalendarForUser(uid, (chg) => {
        if (chg.type === 'removed') {
          useCalendarStore.getState().removeAppointment(chg.event.id)
        } else {
          useCalendarStore.getState().addOrUpdate(chg.event)
        }
      })

      // Refresh when app comes to foreground
      const sub = AppState.addEventListener('change', (state) => {
        if (state === 'active')
          triggerInitialCollaborativeSync().catch(() => {})
      })

      return () => {
        try {
          stop()
        } catch {}
        try {
          sub.remove()
        } catch {}
        try {
          unSubNotif()
        } catch {}
        try {
          unSubTop()
        } catch {}
        try {
          unSubCal()
        } catch {}
      }
    }
  }, [
    rehydrated,
    authReady,
    user?.id,
    buildNotificationHandler,
    buildTopLevelNotificationHandler,
  ])

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
        onReady={() => {
          const route = navigationRef.getCurrentRoute()
          const name = (route?.name ?? '') as RouteName
          if (prevRouteNameRef.current !== name) {
            useThemeStore.getState().setHeaderConfig(name)
            prevRouteNameRef.current = name
          }
        }}
        onStateChange={() => {
          const route = navigationRef.getCurrentRoute()
          const name = (route?.name ?? '') as RouteName
          if (prevRouteNameRef.current !== name) {
            useThemeStore.getState().setHeaderConfig(name)
            prevRouteNameRef.current = name
          }
        }}
      >
        <Drawer.Navigator
          screenOptions={{
            headerShown: false,
            swipeEnabled: false,
            drawerType: 'front',
            // make drawer cover full screen
            drawerStyle: {
              width: '100%',
              backgroundColor: 'transparent',
              zIndex: 9999,
              elevation: 9999,
            },
            // overlay color between drawer and app (optional)
            overlayColor: 'rgba(0,0,0,0.6)',
          }}
          drawerContent={DrawerContent}
          initialRouteName={DRAWER_APP}
        >
          <Drawer.Screen name={DRAWER_APP} component={MainStack} />
        </Drawer.Navigator>
      </NavigationContainer>
      <ShareOverlay />
      <RankingOverlay />
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
      <NotificationOverlay />
      <SuccessOverlay />
    </>
  )
}
