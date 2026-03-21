import { useLoginAnimation } from '../use-login-animation'
import { renderHook } from '@testing-library/react-native'

const mockTheme = {
  spacings: { small: 8, large: 24 },
} as any

describe('useLoginAnimation', () => {
  it('returns animation values and keyboardOpen state', () => {
    const { result } = renderHook(() => useLoginAnimation(mockTheme))
    expect(result.current).toHaveProperty('translateY')
    expect(result.current).toHaveProperty('animatedTitleSize')
    expect(result.current).toHaveProperty('animatedTitleMargin')
    expect(result.current.keyboardOpen).toBe(false)
  })
})
