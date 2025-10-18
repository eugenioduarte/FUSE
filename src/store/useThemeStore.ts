import { create } from 'zustand'
import { RouteName, ROUTES } from '../constants/routes'

interface HeaderConfig {
  title: string
  type: RouteName
  visible: boolean
}

interface ThemeState {
  headerConfig: HeaderConfig
  setHeaderConfig: (type: RouteName) => void
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
    const visible = !authScreens.includes(type)
    set({ headerConfig: { title, type, visible } })
  },
}))
