import { renderHook } from '@testing-library/react-native'
import { useFastWayOverlayLogic } from '../fast-way-overlay.hook'

jest.mock('@/store/bottom-tab.store', () => ({
  useBottomTabStore: () => ({ setActiveTab: jest.fn() }),
}))
jest.mock('@/store/overlay.store', () => ({
  useOverlay: () => ({ fastWayOverlay: false, setFastWayOverlay: jest.fn() }),
}))
jest.mock('@/store/fastway.store', () => ({
  useFastwayStore: () => ({}),
}))
jest.mock('@/navigation/navigationRef', () => ({
  navigationRef: {
    current: null,
    isReady: jest.fn(() => false),
    getCurrentRoute: jest.fn(() => null),
  },
}))
jest.mock('@/navigation/navigatorManager', () => ({
  navigatorManager: { navigate: jest.fn() },
}))
jest.mock('@/services/repositories/challenges.repository', () => ({
  challengesRepository: {
    list: jest.fn().mockResolvedValue([]),
    getAll: jest.fn().mockResolvedValue([]),
  },
}))
jest.mock('@/services/repositories/summaries.repository', () => ({
  summariesRepository: {
    list: jest.fn().mockResolvedValue([]),
    getAll: jest.fn().mockResolvedValue([]),
  },
}))
jest.mock('@/services/repositories/topics.repository', () => ({
  topicsRepository: {
    list: jest.fn().mockResolvedValue([]),
    seedIfEmpty: jest.fn().mockResolvedValue(undefined),
    getAll: jest.fn().mockResolvedValue([]),
  },
}))

describe('useFastWayOverlayLogic', () => {
  it('returns topics and summaries state', () => {
    const { result } = renderHook(() => useFastWayOverlayLogic())
    expect(Array.isArray(result.current.topics)).toBe(true)
  })
})
