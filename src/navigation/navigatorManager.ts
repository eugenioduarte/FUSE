import { DrawerActions } from '@react-navigation/native'
import { ROUTES } from '../constants/routes'
import { navigationRef } from './navigationRef'

export type RootStackParamList = {
  LoginScreen: undefined
  DashboardScreen: undefined
  RegisterScreen: undefined
  RecoveryScreen: undefined
  TopicScreen: undefined
  CalendarScreen: undefined
  CalendarAddScreen: undefined
  CalendarDetailsScreen: undefined
  ChallengeScreen: undefined
  ChallengeAddScreen: undefined
  ChallengeAddFlashCardScreen: undefined
  ChallengeAddHangmanScreen: undefined
  ChallengeAddMatrixScreen: undefined
  ChallengeAddQuizScreen: undefined
  ChallengeAddTextAnswerScreen: undefined
  TopicDetailsScreen: undefined
  SummaryScreen: undefined
  SummaryAudioScreen: undefined
  ProfileScreen: undefined
  ConnectionsScreen: undefined
  PaymentScreen: undefined
  NotificationsScreen: undefined
  WhiteboardScreen: undefined
}

export const navigatorManager = {
  // Drawer controls
  openMenu: () => {
    if (navigationRef.isReady())
      navigationRef.dispatch(DrawerActions.openDrawer())
  },
  closeMenu: () => {
    if (navigationRef.isReady())
      navigationRef.dispatch(DrawerActions.closeDrawer())
  },
  toggleMenu: () => {
    if (navigationRef.isReady())
      navigationRef.dispatch(DrawerActions.toggleDrawer())
  },
  goToLoginScreen: () => {
    if (navigationRef.isReady()) {
      navigationRef.navigate(ROUTES.LoginScreen)
    }
  },

  goToDashboard: () => {
    if (navigationRef.isReady()) {
      navigationRef.navigate(ROUTES.DashboardScreen)
    }
  },

  goToRegister: () => {
    if (navigationRef.isReady()) {
      navigationRef.navigate(ROUTES.RegisterScreen)
    }
  },

  goToRecovery: () => {
    if (navigationRef.isReady()) {
      navigationRef.navigate(ROUTES.RecoveryScreen)
    }
  },

  goToTopic: () => {
    if (navigationRef.isReady()) {
      navigationRef.navigate(ROUTES.TopicScreen)
    }
  },

  // Calendar
  goToCalendar: () => {
    if (navigationRef.isReady()) navigationRef.navigate(ROUTES.CalendarScreen)
  },
  goToCalendarAdd: () => {
    if (navigationRef.isReady())
      navigationRef.navigate(ROUTES.CalendarAddScreen)
  },
  goToCalendarDetails: () => {
    if (navigationRef.isReady())
      navigationRef.navigate(ROUTES.CalendarDetailsScreen)
  },

  // Challenge
  goToChallenge: () => {
    if (navigationRef.isReady()) navigationRef.navigate(ROUTES.ChallengeScreen)
  },
  goToChallengeAdd: () => {
    if (navigationRef.isReady())
      navigationRef.navigate(ROUTES.ChallengeAddScreen)
  },
  goToChallengeAddFlashCard: () => {
    if (navigationRef.isReady())
      navigationRef.navigate(ROUTES.ChallengeAddFlashCardScreen)
  },
  goToChallengeAddHangman: () => {
    if (navigationRef.isReady())
      navigationRef.navigate(ROUTES.ChallengeAddHangmanScreen)
  },
  goToChallengeAddMatrix: () => {
    if (navigationRef.isReady())
      navigationRef.navigate(ROUTES.ChallengeAddMatrixScreen)
  },
  goToChallengeAddQuiz: () => {
    if (navigationRef.isReady())
      navigationRef.navigate(ROUTES.ChallengeAddQuizScreen)
  },
  goToChallengeAddTextAnswer: () => {
    if (navigationRef.isReady())
      navigationRef.navigate(ROUTES.ChallengeAddTextAnswerScreen)
  },

  // Topic details and summary
  goToTopicDetails: () => {
    if (navigationRef.isReady())
      navigationRef.navigate(ROUTES.TopicDetailsScreen)
  },
  goToSummary: () => {
    if (navigationRef.isReady()) navigationRef.navigate(ROUTES.SummaryScreen)
  },
  goToSummaryAudio: () => {
    if (navigationRef.isReady())
      navigationRef.navigate(ROUTES.SummaryAudioScreen)
  },

  // Menu
  goToProfile: () => {
    if (navigationRef.isReady()) navigationRef.navigate(ROUTES.ProfileScreen)
  },
  goToConnections: () => {
    if (navigationRef.isReady())
      navigationRef.navigate(ROUTES.ConnectionsScreen)
  },
  goToPayment: () => {
    if (navigationRef.isReady()) navigationRef.navigate(ROUTES.PaymentScreen)
  },
  goToNotifications: () => {
    if (navigationRef.isReady())
      navigationRef.navigate(ROUTES.NotificationsScreen)
  },

  // Whiteboard
  goToWhiteboard: () => {
    if (navigationRef.isReady()) navigationRef.navigate(ROUTES.WhiteboardScreen)
  },

  goBack: () => {
    if (navigationRef.isReady()) {
      navigationRef.goBack()
    }
  },
}
