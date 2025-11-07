import { lightenHex } from '@/utils/colorUtils'
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
  /** base color for the highest level (level_ten) */
  levelTenColor: string
  setLevelTenColor: (color: string) => void
  /** generated colors for level_one .. level_ten */
  colorLevelUp: { [key: string]: string }
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
      // Finished screen should also hide the global header
      'ChallengeFinishedScoreScreen',
    ]
    const visible = !authScreens.includes(type) && !runScreens.includes(type)
    set({ headerConfig: { title, type, visible } })
  },
  backgroundColor: Colors.light.backgroundSecondary,
  setBackgroundColor: (color: string) => set({ backgroundColor: color }),
  levelTenColor: '#00CED1',
  setLevelTenColor: (color: string) =>
    set((state) => ({
      levelTenColor: color,
      colorLevelUp: generateLevelSteps(color),
    })),
  colorLevelUp: generateLevelSteps('#00CED1'),
}))

function generateLevelSteps(baseColor: string) {
  const keys = [
    'level_one',
    'level_two',
    'level_three',
    'level_four',
    'level_five',
  ]
  const result: { [key: string]: string } = {}

  // level_five será o mais escuro (a cor base)
  // os níveis anteriores serão progressivamente mais claros
  for (let i = 0; i < keys.length; i++) {
    const t = i / (keys.length - 1)
    // t = 0 → mais claro | t = 1 → cor base
    // o expoente 1.5 gera contraste mais perceptível
    const percent = Math.pow(1 - t, 1.5)
    result[keys[i]] = lightenHex(baseColor, percent)
  }

  return result
}
