import useChallengeMatrix from '../use-challenge-matrix'

jest.mock('@/hooks/use-track-topic-session', () => ({
  __esModule: true,
  default: jest.fn(),
}))
jest.mock('@/services/repositories/challenges.repository', () => ({
  challengesRepository: { list: jest.fn().mockResolvedValue([]) },
}))
jest.mock('@/services/repositories/summaries.repository', () => ({
  summariesRepository: { getById: jest.fn().mockResolvedValue(null) },
}))
jest.mock('@/store/auth.store', () => ({
  useAuthStore: jest.fn().mockReturnValue(undefined),
}))
jest.mock('@/store/overlay.store', () => ({
  useOverlay: jest.fn().mockReturnValue({
    setLoadingOverlay: jest.fn(),
    setErrorOverlay: jest.fn(),
  }),
}))
jest.mock('@/services/prompts', () => ({
  MATRIX_SYSTEM: '',
  matrixUserPrompt: jest.fn().mockReturnValue(''),
}))

describe('useChallengeMatrix', () => {
  it('should be a function', () => {
    expect(typeof useChallengeMatrix).toBe('function')
  })
})
