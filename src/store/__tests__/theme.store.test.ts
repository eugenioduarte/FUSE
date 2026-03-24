import { generateLevelSteps, useThemeStore } from '../theme.store'

const initialState = useThemeStore.getState()

beforeEach(() => {
  useThemeStore.setState({ ...initialState })
})

describe('useThemeStore', () => {
  describe('setHeaderConfig', () => {
    it('sets header to visible for a regular screen', () => {
      useThemeStore.getState().setHeaderConfig('DashboardScreen')
      const { headerConfig } = useThemeStore.getState()
      expect(headerConfig.type).toBe('DashboardScreen')
      expect(headerConfig.visible).toBe(true)
    })

    it('sets header to not visible for auth screens', () => {
      for (const screen of [
        'LoginScreen',
        'RegisterScreen',
        'RecoveryScreen',
      ] as const) {
        useThemeStore.getState().setHeaderConfig(screen)
        expect(useThemeStore.getState().headerConfig.visible).toBe(false)
      }
    })

    it('sets header to not visible for challenge run screens', () => {
      useThemeStore.getState().setHeaderConfig('ChallengeRunQuizScreen')
      expect(useThemeStore.getState().headerConfig.visible).toBe(false)
    })
  })

  describe('setBackgroundColor', () => {
    it('updates backgroundColor', () => {
      useThemeStore.getState().setBackgroundColor('#FF0000')
      expect(useThemeStore.getState().backgroundColor).toBe('#FF0000')
    })
  })

  describe('setLevelTenColor', () => {
    it('updates levelTenColor and regenerates colorLevelUp', () => {
      useThemeStore.getState().setLevelTenColor('#123456')
      expect(useThemeStore.getState().levelTenColor).toBe('#123456')
      expect(useThemeStore.getState().colorLevelUp).toEqual(
        generateLevelSteps('#123456'),
      )
    })
  })
})

describe('generateLevelSteps', () => {
  it('returns a ColorLevels object with background_color', () => {
    const result = generateLevelSteps('#00CED1')
    expect(result).toHaveProperty('background_color')
    expect(typeof result.background_color).toBe('string')
  })

  it('always returns the same static colors regardless of input', () => {
    const a = generateLevelSteps('#FF0000')
    const b = generateLevelSteps('#00FF00')
    expect(a.background_color).toBe(b.background_color)
  })
})
