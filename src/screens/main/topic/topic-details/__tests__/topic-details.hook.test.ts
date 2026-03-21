import useSummaryProgressArcs from '../hooks/use-summary-progress-arcs'
import { renderHook } from '@testing-library/react-native'

jest.mock('@/hooks/use-theme', () => ({
  useTheme: () => ({ colors: { primary: '#000' }, spacings: { md: 16 }, typography: {}, border: {} }),
}))

describe('useSummaryProgressArcs', () => {
  it('returns empty items when given no data', () => {
    const { result } = renderHook(() => useSummaryProgressArcs([]))
    expect(Array.isArray(result.current.items)).toBe(true)
    expect(result.current.items.length).toBe(0)
  })

  it('computes arc items for each data entry', () => {
    const data = [{ title: 'Topic A', value: 50, color: '#f00' }]
    const { result } = renderHook(() => useSummaryProgressArcs(data))
    expect(result.current.items.length).toBe(1)
    expect(result.current.items[0]).toHaveProperty('trackPath')
    expect(result.current.items[0]).toHaveProperty('progPath')
  })

  it('returns size and stroke values', () => {
    const { result } = renderHook(() => useSummaryProgressArcs([]))
    expect(typeof result.current.size).toBe('number')
    expect(typeof result.current.stroke).toBe('number')
  })
})
