export const ROUTES = {
  LoginScreen: 'LoginScreen',
  DashboardScreen: 'DashboardScreen',
  RegisterScreen: 'RegisterScreen',
  RecoveryScreen: 'RecoveryScreen',
  TopicScreen: 'TopicScreen',
  // Main - Calendar
  CalendarScreen: 'CalendarScreen',
  CalendarAddScreen: 'CalendarAddScreen',
  CalendarDetailsScreen: 'CalendarDetailsScreen',
  // Main - Challenge
  ChallengeScreen: 'ChallengeScreen',
  ChallengeAddScreen: 'ChallengeAddScreen',
  ChallengeAddFlashCardScreen: 'ChallengeAddFlashCardScreen',
  ChallengeAddHangmanScreen: 'ChallengeAddHangmanScreen',
  ChallengeAddMatrixScreen: 'ChallengeAddMatrixScreen',
  ChallengeAddQuizScreen: 'ChallengeAddQuizScreen',
  ChallengeAddTextAnswerScreen: 'ChallengeAddTextAnswerScreen',
  ChallengesListScreen: 'ChallengesListScreen',
  ChallengeRunQuizScreen: 'ChallengeRunQuizScreen',
  // Main - Topic
  TopicDetailsScreen: 'TopicDetailsScreen',
  SummaryDetailsScreen: 'SummaryDetailsScreen',
  TopicAddScreen: 'TopicAddScreen',
  SummaryScreen: 'SummaryScreen',
  SummaryAudioScreen: 'SummaryAudioScreen',
  // Main - Menu
  ProfileScreen: 'ProfileScreen',
  ConnectionsScreen: 'ConnectionsScreen',
  PaymentScreen: 'PaymentScreen',
  NotificationsScreen: 'NotificationsScreen',
  // Main - Whiteboard
  WhiteboardScreen: 'WhiteboardScreen',
  // Tabs/Other
  SummaryListTab: 'SummaryListTab',
} as const

export type RouteKey = keyof typeof ROUTES
export type RouteName = (typeof ROUTES)[RouteKey]
