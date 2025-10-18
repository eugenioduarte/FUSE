import { ROUTES } from '../constants/routes'
import { navigationRef } from './navigationRef'

export type RootStackParamList = {
  LoginScreen: undefined
  DashboardScreen: undefined
  RegisterScreen: undefined
  RecoveryScreen: undefined
  TopicScreen: undefined
}

export const navigatorManager = {
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

  goBack: () => {
    if (navigationRef.isReady()) {
      navigationRef.goBack()
    }
  },
}
