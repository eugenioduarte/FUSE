import useChallengeAdd from '../challenge-add.hook'
import { renderHook } from '@testing-library/react-native'

jest.mock('@/navigation/navigatorManager', () => ({ navigatorManager: { navigate: jest.fn() } }))
jest.mock('@/services/repositories/challenges.repository', () => ({
  challengesRepository: { getAll: jest.fn().mockResolvedValue([]) },
}))
jest.mock('@/services/repositories/summaries.repository', () => ({
  summariesRepository: { getAll: jest.fn().mockResolvedValue([]) },
}))
jest.mock('@/services/repositories/topics.repository', () => ({
  topicsRepository: { getAll: jest.fn().mockResolvedValue([]) },
}))
jest.mock('@/store/overlay.store', () => ({
  useOverlay: () => ({ setLoadingOverlay: jest.fn(), setErrorOverlay: jest.fn() }),
}))

describe('useChallengeAdd', () => {
  it('returns handlers and initial state', () => {
    const { result } = renderHook(() => useChallengeAdd())
    expect(typeof result.current.handleStartQuiz).toBe('function')
    expect(typeof result.current.handleStartHangman).toBe('function')
    expect(typeof result.current.handleStartMatrix).toBe('function')
    expect(typeof result.current.handleStartText).toBe('function')
  })
})
