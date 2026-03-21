import useDashboard from '../hooks/use-dashboard'
import { renderHook } from '@testing-library/react-native'

jest.mock('@/store', () => ({
  useAuthStore: (selector: any) => selector({ user: { id: 'user-1' } }),
}))
jest.mock('@/navigation/navigatorManager', () => ({ navigatorManager: { goToLoginScreen: jest.fn() } }))
jest.mock('@/services/repositories/summaries.repository', () => ({
  summariesRepository: { getAll: jest.fn().mockResolvedValue([]) },
}))
jest.mock('@/services/repositories/topics.repository', () => ({
  topicsRepository: { list: jest.fn().mockResolvedValue([]), onChange: jest.fn(() => jest.fn()), getAll: jest.fn().mockResolvedValue([]) },
}))
jest.mock('@react-navigation/native', () => ({
  useFocusEffect: jest.fn(),
}))

describe('useDashboard', () => {
  it('returns items array and loading state', () => {
    const { result } = renderHook(() => useDashboard())
    expect(Array.isArray(result.current.items)).toBe(true)
    expect(typeof result.current.loading).toBe('boolean')
  })
})
