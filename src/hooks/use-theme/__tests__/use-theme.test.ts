import { useTheme } from '../use-theme'

jest.mock('../../../constants/theme', () => ({
  Colors: {
    light: {
      primary: '#000000',
      background: '#ffffff',
    },
  },
  spacings: { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 },
  typography: { body: { fontSize: 14 } },
  border: { radius: { sm: 4, md: 8 } },
}))

describe('useTheme', () => {
  it('returns a theme object with colors, spacings, typography and border', () => {
    const theme = useTheme()
    expect(theme).toHaveProperty('colors')
    expect(theme).toHaveProperty('spacings')
    expect(theme).toHaveProperty('typography')
    expect(theme).toHaveProperty('border')
  })

  it('returns light color scheme colors', () => {
    const theme = useTheme()
    expect(theme.colors).toEqual({ primary: '#000000', background: '#ffffff' })
  })
})
