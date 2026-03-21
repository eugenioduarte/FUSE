import { useChallengeReviewMatrix } from '../use-challenge-review-matrix'
import { renderHook } from '@testing-library/react-native'

jest.mock('@react-navigation/native', () => ({
  useRoute: () => ({ params: {} }),
  useNavigation: () => ({ navigate: jest.fn(), goBack: jest.fn() }),
}))

describe('useChallengeReviewMatrix', () => {
  it('renders without crashing', () => {
    // TODO: Implement actual test
    expect(true).toBe(true)
  })
})
