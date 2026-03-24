import React from 'react'
import { render } from '@testing-library/react-native'
import ChallengeRunTextAnswerScreen from '../challenge-run-text-answer.screen'

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: jest.fn(), goBack: jest.fn() }),
  useRoute: () => ({ params: {} }),
  useTheme: () => ({ colors: { background: '#000', text: '#fff', border: '#333', card: '#111', notification: '#f00', primary: '#0af' } }),
}))

describe('ChallengeRunTextAnswerScreen', () => {
  it('renders without crashing', () => {
    // TODO: Implement actual test
    expect(true).toBe(true)
  })
})
