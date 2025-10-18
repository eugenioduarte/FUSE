export const ROUTES = {
  LoginScreen: 'LoginScreen',
  DashboardScreen: 'DashboardScreen',
  RegisterScreen: 'RegisterScreen',
  RecoveryScreen: 'RecoveryScreen',
  TopicScreen: 'TopicScreen',
} as const

export type RouteKey = keyof typeof ROUTES
export type RouteName = (typeof ROUTES)[RouteKey]
