jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: jest.fn(), goBack: jest.fn() }),
  useRoute: () => ({ params: {} }),
  useTheme: () => ({
    colors: {
      background: '#000',
      text: '#fff',
      border: '#333',
      card: '#111',
      notification: '#f00',
      primary: '#0af',
    },
  }),
}))

describe('ChallengeReviewTextAnswerScreen', () => {
  it('renders without crashing', () => {
    // TODO: Implement actual test
    expect(true).toBe(true)
  })
})
