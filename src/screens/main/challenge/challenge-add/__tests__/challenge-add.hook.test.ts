import useChallengeAdd from '../challenge-add.hook'
import { renderHook } from '@testing-library/react-native'

// ai.service.ts now imports firebase/functions + auth.service; mock those to avoid
// transitive ESM issues (expo-constants) in the Jest environment.
jest.mock('firebase/app', () => ({ getApp: jest.fn(() => ({})) }))
jest.mock('firebase/functions', () => ({
  getFunctions: jest.fn(() => ({})),
  httpsCallable: jest.fn(() => jest.fn()),
}))
jest.mock('@/services/firebase/auth.service', () => ({
  getFirebaseAuth: () => ({ currentUser: null }),
}))

jest.mock('@/navigation/navigator-manager', () => ({ navigatorManager: { navigate: jest.fn() } }))
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
