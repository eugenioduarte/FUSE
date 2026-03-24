import { renderHook } from '@testing-library/react-native'
import { useUpdateBackgroundColor } from '../update-background-color.hook'

// --- Mocks ---
const mockSetState = jest.fn()

jest.mock('@/store/theme.store', () => ({
  useThemeStore: {
    setState: (...args: any[]) => mockSetState(...args),
  },
}))

jest.mock('@/hooks/use-theme', () => ({
  useTheme: jest.fn(() => ({
    colors: {
      backgroundSecondary: '#eeeeee',
    },
  })),
}))

describe('useUpdateBackgroundColor', () => {
  beforeEach(() => jest.clearAllMocks())

  it('sets the provided color in the theme store', () => {
    renderHook(() => useUpdateBackgroundColor('#ff0000'))
    expect(mockSetState).toHaveBeenCalledWith({
      colorLevelUp: { background_color: '#ff0000' },
    })
  })

  it('falls back to backgroundSecondary when no color is provided', () => {
    renderHook(() => useUpdateBackgroundColor())
    expect(mockSetState).toHaveBeenCalledWith({
      colorLevelUp: { background_color: '#eeeeee' },
    })
  })

  it('falls back to backgroundSecondary when color is undefined', () => {
    renderHook(() => useUpdateBackgroundColor(undefined))
    expect(mockSetState).toHaveBeenCalledWith({
      colorLevelUp: { background_color: '#eeeeee' },
    })
  })

  it('re-applies when color prop changes', () => {
    const { rerender } = renderHook(
      ({ color }: { color?: string }) => useUpdateBackgroundColor(color),
      { initialProps: { color: '#aabbcc' } },
    )
    expect(mockSetState).toHaveBeenLastCalledWith({
      colorLevelUp: { background_color: '#aabbcc' },
    })

    rerender({ color: '#112233' })
    expect(mockSetState).toHaveBeenLastCalledWith({
      colorLevelUp: { background_color: '#112233' },
    })
  })
})
