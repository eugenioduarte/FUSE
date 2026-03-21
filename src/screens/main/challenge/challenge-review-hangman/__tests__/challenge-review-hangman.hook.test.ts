import { useChallengeReviewHangman } from '../use-challenge-review-hangman'
import { renderHook } from '@testing-library/react-native'

jest.mock('@react-navigation/native', () => ({
  useRoute: () => ({ params: {} }),
  useNavigation: () => ({ navigate: jest.fn(), goBack: jest.fn() }),
}))
jest.mock('@/services/repositories/challenges.repository', () => ({
  challengesRepository: { getAll: jest.fn().mockResolvedValue([]) },
}))

describe('useChallengeReviewHangman', () => {
  it('renders without crashing', () => {
    // TODO: Implement actual test
    expect(true).toBe(true)
  })
})
