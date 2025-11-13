import { create } from 'zustand'
import { RouteName, ROUTES } from '../constants/routes'
import { Colors } from '../constants/theme'

/* -------------------------------------------------------------------------- */
/* 🧩 TYPES EXPORTADOS                                                        */
/* -------------------------------------------------------------------------- */

/** Define os 10 níveis de cor gerados automaticamente */
export type ColorLevels = {
  level_one: string
  level_two: string
  level_three: string
  level_four: string
  level_five: string
  level_six: string
  level_seven: string
  level_eight: string
  level_nine: string
  level_ten: string
}

/** Configuração do header global da aplicação */
export interface HeaderConfig {
  title: string
  type: RouteName
  visible: boolean
}

/** Estrutura da store de tema */
export interface ThemeState {
  headerConfig: HeaderConfig
  setHeaderConfig: (type: RouteName) => void

  backgroundColor: string
  setBackgroundColor: (color: string) => void

  /** Cor base do nível mais alto (level_ten) */
  levelTenColor: string
  setLevelTenColor: (color: string) => void

  /** Conjunto de cores geradas automaticamente */
  colorLevelUp: ColorLevels
}

/* -------------------------------------------------------------------------- */
/* 🧠 STORE ZUSTAND                                                           */
/* -------------------------------------------------------------------------- */

export const useThemeStore = create<ThemeState>((set) => ({
  headerConfig: { title: '', type: '' as RouteName, visible: true },

  setHeaderConfig: (type) => {
    const title = ROUTES[type] || ''
    const authScreens: RouteName[] = [
      'LoginScreen',
      'RegisterScreen',
      'RecoveryScreen',
    ]
    const runScreens: RouteName[] = [
      'ChallengeRunQuizScreen',
      'ChallengeRunHangmanScreen',
      'ChallengeRunMatrixScreen',
      'ChallengeRunTextAnswerScreen',
      'ChallengeFinishedScoreScreen',
      'ProfileScreen',
    ]
    const visible = !authScreens.includes(type) && !runScreens.includes(type)
    set({ headerConfig: { title, type, visible } })
  },

  backgroundColor: Colors.light.backgroundSecondary,
  setBackgroundColor: (color: string) => set({ backgroundColor: color }),

  levelTenColor: '#00CED1',
  setLevelTenColor: (color: string) =>
    set(() => ({
      levelTenColor: color,
      colorLevelUp: generateLevelSteps(color),
    })),

  colorLevelUp: generateLevelSteps('#00CED1'),
}))

/* -------------------------------------------------------------------------- */
/* 🎨 FUNÇÃO GERADORA DE CORES                                                */
/* -------------------------------------------------------------------------- */

export function generateLevelSteps(baseColor: string): ColorLevels {
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
  ] as const

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
  ] as const

  const result = {} as ColorLevels
  keys.forEach((key, i) => {
    result[key] = colors[i]
  })

  return result
}
