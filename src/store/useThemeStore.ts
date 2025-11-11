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
    'level_six',
    'level_seven',
    'level_eight',
    'level_nine',
    'level_ten',
  ]

  const colors = [
    '#000000', // level_one - preto
    '#004547', // level_two
    '#008A8D', // level_three
    '#00B7BB', // level_four
    '#00CED1', // level_five - base
    '#33D9DB', // level_six
    '#66E3E5', // level_seven
    '#99EEEE', // level_eight
    '#CCF8F8', // level_nine
    '#FFFFFF', // level_ten - branco
  ]

  const result: { [key: string]: string } = {}

  for (let i = 0; i < keys.length; i++) {
    result[keys[i]] = colors[i]
  }

  return result
}
