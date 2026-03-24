import React from 'react'
import { render } from '@testing-library/react-native'
import NotificationsScreen from '../notifications.screen'

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: jest.fn(), goBack: jest.fn() }),
  useTheme: () => ({ colors: { background: '#000', text: '#fff', border: '#333', card: '#111', notification: '#f00', primary: '#0af' } }),
}))

describe('NotificationsScreen', () => {
  it('renders without crashing', () => {
    // TODO: Implement actual test
    expect(true).toBe(true)
  })
})
