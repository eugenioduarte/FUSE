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
  CalendarAddScreen: { date?: string } | undefined
  CalendarDetailsScreen: undefined
  ChallengeScreen: undefined
  ChallengeAddScreen: { summaryId?: string } | undefined
  ChallengeAddHangmanScreen: { summaryId?: string } | undefined
  ChallengeAddMatrixScreen: { summaryId?: string } | undefined
  ChallengeAddQuizScreen: { summaryId?: string } | undefined
  ChallengeAddTextAnswerScreen: { summaryId?: string } | undefined
  ChallengesListScreen: { summaryId?: string } | undefined
  ChallengeRunQuizScreen: { challengeId: string } | undefined
  ChallengeReviewQuizScreen: { challengeId: string } | undefined
  ChallengeRunHangmanScreen: { challengeId: string } | undefined
  ChallengeReviewHangmanScreen: { challengeId: string } | undefined
  ChallengeRunMatrixScreen: { challengeId: string } | undefined
  ChallengeReviewMatrixScreen: { challengeId: string } | undefined
  ChallengeRunTextAnswerScreen: { challengeId: string } | undefined
  ChallengeReviewTextAnswerScreen: { challengeId: string } | undefined
  TopicDetailsScreen: { topicId: string }
  SummaryDetailsScreen: {
    summaryId: string
    summary?: import('../types/domain').Summary
  }
  TopicAddScreen: undefined
  SummaryScreen: { topicId?: string; seedPrompt?: string } | undefined
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
  goToCalendarAdd: (params?: { date?: string }) => {
    if (navigationRef.isReady())
      navigationRef.navigate(ROUTES.CalendarAddScreen, params)
  },
  goToCalendarDetails: () => {
    if (navigationRef.isReady())
      navigationRef.navigate(ROUTES.CalendarDetailsScreen)
  },

  // Challenge
  goToChallenge: () => {
    if (navigationRef.isReady()) navigationRef.navigate(ROUTES.ChallengeScreen)
  },
  goToChallengeAdd: (params?: { summaryId?: string }) => {
    if (navigationRef.isReady())
      navigationRef.navigate(ROUTES.ChallengeAddScreen, params)
  },
  goToChallengeAddHangman: (params?: { summaryId?: string }) => {
    if (navigationRef.isReady())
      navigationRef.navigate(ROUTES.ChallengeAddHangmanScreen, params as any)
  },
  goToChallengeAddMatrix: (params?: { summaryId?: string }) => {
    if (navigationRef.isReady())
      navigationRef.navigate(ROUTES.ChallengeAddMatrixScreen, params as any)
  },
  goToChallengeAddQuiz: (params?: { summaryId?: string }) => {
    if (navigationRef.isReady())
      navigationRef.navigate(ROUTES.ChallengeAddQuizScreen, params as any)
  },
  goToChallengeAddTextAnswer: (params?: { summaryId?: string }) => {
    if (navigationRef.isReady())
      navigationRef.navigate(ROUTES.ChallengeAddTextAnswerScreen, params as any)
  },
  goToChallengesList: (params?: { summaryId?: string }) => {
    if (navigationRef.isReady())
      navigationRef.navigate(ROUTES.ChallengesListScreen, params as any)
  },
  goToChallengeRunQuiz: (params: { challengeId: string }) => {
    if (navigationRef.isReady())
      navigationRef.navigate(ROUTES.ChallengeRunQuizScreen, params as any)
  },
  goToChallengeRunHangman: (params: { challengeId: string }) => {
    if (navigationRef.isReady())
      navigationRef.navigate(ROUTES.ChallengeRunHangmanScreen, params as any)
  },
  goToChallengeRunMatrix: (params: { challengeId: string }) => {
    if (navigationRef.isReady())
      navigationRef.navigate(ROUTES.ChallengeRunMatrixScreen, params as any)
  },
  goToChallengeRunTextAnswer: (params: { challengeId: string }) => {
    if (navigationRef.isReady())
      navigationRef.navigate(ROUTES.ChallengeRunTextAnswerScreen, params as any)
  },
  goToChallengeReviewQuiz: (params: { challengeId: string }) => {
    if (navigationRef.isReady())
      navigationRef.navigate(ROUTES.ChallengeReviewQuizScreen, params as any)
  },
  goToChallengeReviewHangman: (params: { challengeId: string }) => {
    if (navigationRef.isReady())
      navigationRef.navigate(ROUTES.ChallengeReviewHangmanScreen, params as any)
  },
  goToChallengeReviewMatrix: (params: { challengeId: string }) => {
    if (navigationRef.isReady())
      navigationRef.navigate(ROUTES.ChallengeReviewMatrixScreen, params as any)
  },
  goToChallengeReviewTextAnswer: (params: { challengeId: string }) => {
    if (navigationRef.isReady())
      navigationRef.navigate(
        ROUTES.ChallengeReviewTextAnswerScreen,
        params as any,
      )
  },

  // Topic details and summary
  goToTopicDetails: (topicId: string) => {
    if (navigationRef.isReady())
      navigationRef.navigate(ROUTES.TopicDetailsScreen, { topicId })
  },
  goToSummaryDetails: (
    summaryId: string,
    summary?: import('../types/domain').Summary,
  ) => {
    if (navigationRef.isReady())
      navigationRef.navigate(ROUTES.SummaryDetailsScreen, {
        summaryId,
        summary,
      })
  },
  goToTopicAdd: () => {
    if (navigationRef.isReady()) navigationRef.navigate(ROUTES.TopicAddScreen)
  },
  goToSummary: (params?: { topicId?: string; seedPrompt?: string }) => {
    if (navigationRef.isReady())
      navigationRef.navigate(ROUTES.SummaryScreen, params)
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
