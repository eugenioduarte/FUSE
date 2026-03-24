export const ROUTES = {
  LoginScreen: 'LoginScreen',
  OnboardingScreen: 'OnboardingScreen',
  DashboardScreen: 'DashboardScreen',
  RegisterScreen: 'RegisterScreen',
  RecoveryScreen: 'RecoveryScreen',
  TopicScreen: 'TopicScreen',
  // Main - Calendar
  CalendarScreen: 'CalendarScreen',
  CalendarAddScreen: 'CalendarAddScreen',
  CalendarDetailsScreen: 'CalendarDetailsScreen',
  CalendarEditScreen: 'CalendarEditScreen',
  // Main - Challenge
  ChallengeAddScreen: 'ChallengeAddScreen',
  ChallengesListScreen: 'ChallengesListScreen',
  ChallengeRunQuizScreen: 'ChallengeRunQuizScreen',
  ChallengeRunHangmanScreen: 'ChallengeRunHangmanScreen',
  ChallengeReviewHangmanScreen: 'ChallengeReviewHangmanScreen',
  ChallengeRunMatrixScreen: 'ChallengeRunMatrixScreen',
  ChallengeReviewMatrixScreen: 'ChallengeReviewMatrixScreen',
  ChallengeReviewQuizScreen: 'ChallengeReviewQuizScreen',
  ChallengeRunTextAnswerScreen: 'ChallengeRunTextAnswerScreen',
  ChallengeReviewTextAnswerScreen: 'ChallengeReviewTextAnswerScreen',
  ChallengeFinishedScoreScreen: 'ChallengeFinishedScoreScreen',
  // Main - Topic
  TopicDetailsScreen: 'TopicDetailsScreen',
  SummaryDetailsScreen: 'SummaryDetailsScreen',
  TopicAddScreen: 'TopicAddScreen',

  SummaryScreen: 'SummaryScreen',

  // Topic - Chat
  TopicChatScreen: 'TopicChatScreen',
  // Main - Menu
  ProfileScreen: 'ProfileScreen',
  ConnectionsScreen: 'ConnectionsScreen',
  PaymentScreen: 'PaymentScreen',
  NotificationsScreen: 'NotificationsScreen',
} as const

export type RouteKey = keyof typeof ROUTES
export type RouteName = (typeof ROUTES)[RouteKey]
