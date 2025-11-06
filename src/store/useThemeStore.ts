import { create } from 'zustand'
import { RouteName, ROUTES } from '../constants/routes'
import { Colors } from '../constants/theme'

interface HeaderConfig {
  title: string
  type: RouteName
  visible: boolean
}

interface ThemeState {
  headerConfig: HeaderConfig
  setHeaderConfig: (type: RouteName) => void
  backgroundColor: string
  setBackgroundColor: (color: string) => void
}

export const useThemeStore = create<ThemeState>((set) => ({
  headerConfig: { title: '', type: '' as RouteName, visible: true },

  setHeaderConfig: (type) => {
    const title = ROUTES[type] || ''
    const authScreens: RouteName[] = [
      'LoginScreen',
      'RegisterScreen',
      'RecoveryScreen',
    ]
    // Hide header for auth screens and challenge run screens where we render a custom X close
    const runScreens: RouteName[] = [
      'ChallengeRunQuizScreen',
      'ChallengeRunHangmanScreen',
      'ChallengeRunMatrixScreen',
      'ChallengeRunTextAnswerScreen',
    ]
    const visible = !authScreens.includes(type) && !runScreens.includes(type)
    set({ headerConfig: { title, type, visible } })
  },
  backgroundColor: Colors.light.backgroundSecondary,
  setBackgroundColor: (color: string) => set({ backgroundColor: color }),
}))
