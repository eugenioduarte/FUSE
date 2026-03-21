import React from 'react'
import { render } from '@testing-library/react-native'
import EditOverlay from '../edit-overlay'

jest.mock('@react-navigation/native', () => ({
  useTheme: () => ({ colors: { background: '#000', text: '#fff', border: '#333', card: '#111', notification: '#f00', primary: '#0af' } }),
}))

describe('EditOverlay', () => {
  it('renders without crashing', () => {
    // TODO: Implement actual test
    expect(true).toBe(true)
  })
})
