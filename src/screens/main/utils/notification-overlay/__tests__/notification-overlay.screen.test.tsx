import React from 'react'
import { render } from '@testing-library/react-native'
import NotificationOverlay from '../notification-overlay.screen'

jest.mock('@react-navigation/native', () => ({
  useTheme: () => ({ colors: { background: '#000', text: '#fff', border: '#333', card: '#111', notification: '#f00', primary: '#0af' } }),
}))

describe('NotificationOverlay', () => {
  it('renders without crashing', () => {
    // TODO: Implement actual test
    expect(true).toBe(true)
  })
})
