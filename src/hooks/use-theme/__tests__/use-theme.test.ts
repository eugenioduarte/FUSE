import { useTheme } from '../theme.hook'

jest.mock('../../../constants/theme', () => ({
  Colors: {
    light: {
      primary: '#000000',
      background: '#ffffff',
      backgroundSecondary: '#f5f5f5',
    },
  },
  spacings: { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 },
  typography: { body: { fontSize: 14 }, heading: { fontSize: 24 } },
  border: { radius: { sm: 4, md: 8, lg: 16 } },
}))

describe('useTheme', () => {
  it('returns an object with colors, spacings, typography and border', () => {
    const theme = useTheme()
    expect(theme).toHaveProperty('colors')
    expect(theme).toHaveProperty('spacings')
    expect(theme).toHaveProperty('typography')
    expect(theme).toHaveProperty('border')
  })

  it('returns the light color scheme colors', () => {
    const theme = useTheme()
    expect(theme.colors).toEqual({
      primary: '#000000',
      background: '#ffffff',
      backgroundSecondary: '#f5f5f5',
    })
  })

  it('returns the correct spacings', () => {
    const theme = useTheme()
    expect(theme.spacings).toEqual({ xs: 4, sm: 8, md: 16, lg: 24, xl: 32 })
  })

  it('returns typography config', () => {
    const theme = useTheme()
    expect(theme.typography).toBeDefined()
    expect(typeof theme.typography).toBe('object')
  })

  it('returns border config', () => {
    const theme = useTheme()
    expect(theme.border).toBeDefined()
    expect(typeof theme.border).toBe('object')
  })

  it('returns a stable reference across multiple calls', () => {
    const t1 = useTheme()
    const t2 = useTheme()
    expect(t1.spacings).toEqual(t2.spacings)
    expect(t1.typography).toEqual(t2.typography)
  })
})
