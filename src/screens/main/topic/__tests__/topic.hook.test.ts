import useTopicScreen from '../hooks/use-topic-screen'
import { renderHook } from '@testing-library/react-native'

jest.mock('@/hooks/use-theme', () => ({
  useTheme: () => ({ colors: { primary: '#000' }, spacings: { md: 16 }, typography: {}, border: {} }),
}))
jest.mock('@/services/repositories/topics.repository', () => ({
  topicsRepository: { seedIfEmpty: jest.fn().mockResolvedValue(undefined), list: jest.fn().mockResolvedValue([]), getAll: jest.fn().mockResolvedValue([]) },
}))
jest.mock('@/services/usage/usageTracker', () => ({
  getDailyTotals: jest.fn().mockResolvedValue({}),
}))

describe('useTopicScreen', () => {
  it('returns topics and loading state', () => {
    const { result } = renderHook(() => useTopicScreen())
    expect(Array.isArray(result.current.topics)).toBe(true)
    expect(typeof result.current.loading).toBe('boolean')
  })
})
