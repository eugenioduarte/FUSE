import React from 'react'
import { render } from '@testing-library/react-native'
import FastWayOverlay from '../fast-way-overlay'

jest.mock('@react-navigation/native', () => ({
  useTheme: () => ({ colors: { background: '#000', text: '#fff', border: '#333', card: '#111', notification: '#f00', primary: '#0af' } }),
}))

describe('FastWayOverlay', () => {
  it('renders without crashing', () => {
    // TODO: Implement actual test
    expect(true).toBe(true)
  })
})
