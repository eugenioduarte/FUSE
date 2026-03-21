import { useFastWayOverlayLogic } from '../use-fast-way-overlay-logic'
import { renderHook } from '@testing-library/react-native'

jest.mock('@/store/useBottomTabStore', () => ({
  useBottomTabStore: () => ({ setActiveTab: jest.fn() }),
}))
jest.mock('@/store/useOverlay', () => ({
  useOverlay: () => ({ fastWayOverlay: false, setFastWayOverlay: jest.fn() }),
}))
jest.mock('@/store/useFastwayStore', () => ({
  useFastwayStore: () => ({}),
}))
jest.mock('@/navigation/navigationRef', () => ({ navigationRef: { current: null, isReady: jest.fn(() => false), getCurrentRoute: jest.fn(() => null) } }))
jest.mock('@/navigation/navigatorManager', () => ({ navigatorManager: { navigate: jest.fn() } }))
jest.mock('@/services/repositories/challenges.repository', () => ({
  challengesRepository: { list: jest.fn().mockResolvedValue([]), getAll: jest.fn().mockResolvedValue([]) },
}))
jest.mock('@/services/repositories/summaries.repository', () => ({
  summariesRepository: { list: jest.fn().mockResolvedValue([]), getAll: jest.fn().mockResolvedValue([]) },
}))
jest.mock('@/services/repositories/topics.repository', () => ({
  topicsRepository: { list: jest.fn().mockResolvedValue([]), seedIfEmpty: jest.fn().mockResolvedValue(undefined), getAll: jest.fn().mockResolvedValue([]) },
}))

describe('useFastWayOverlayLogic', () => {
  it('returns topics and summaries state', () => {
    const { result } = renderHook(() => useFastWayOverlayLogic())
    expect(Array.isArray(result.current.topics)).toBe(true)
  })
})
