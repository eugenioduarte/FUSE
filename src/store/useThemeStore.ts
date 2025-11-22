import { create } from 'zustand'
import { RouteName, ROUTES } from '../constants/routes'
import { Colors } from '../constants/theme'

/* -------------------------------------------------------------------------- */
/* 🧩 TYPES EXPORTADOS                                                        */
/* -------------------------------------------------------------------------- */

/** Define os 10 níveis de cor gerados automaticamente */
export type ColorLevels = {
  background_color: string
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
  const keys = ['background_color'] as const

  const colors = [
    '#EA3D5C', // background_color - preto
  ] as const

  const result = {} as ColorLevels
  keys.forEach((key, i) => {
    result[key] = colors[i]
  })

  return result
}
