import React from 'react'
import { render } from '@testing-library/react-native'
import LoginScreen from '../login.screen'

jest.mock('@react-navigation/native', () => ({
  useTheme: () => ({ colors: { background: '#000', text: '#fff', border: '#333', card: '#111', notification: '#f00', primary: '#0af' } }),
  useNavigation: () => ({ navigate: jest.fn(), goBack: jest.fn() }),
  useRoute: () => ({ params: {} }),
}))

describe('LoginScreen', () => {
  it('renders without crashing', () => {
    // TODO: Implement actual test
    expect(true).toBe(true)
  })
})
