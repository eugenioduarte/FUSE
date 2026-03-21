import React from 'react'
import { render } from '@testing-library/react-native'
import DashboardScreen from '../dashboard-screen'

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: jest.fn(), goBack: jest.fn() }),
  useTheme: () => ({ colors: { background: '#000', text: '#fff', border: '#333', card: '#111', notification: '#f00', primary: '#0af' } }),
}))
jest.mock('@/store/useThemeStore', () => ({
  useThemeStore: (selector: any) => selector({ colorLevelUp: { background_color: '#fff' } }),
}))
jest.mock('@/store/useUpdateBackgroundColor', () => ({
  useUpdateBackgroundColor: jest.fn(),
}))

describe('DashboardScreen', () => {
  it('renders without crashing', () => {
    // TODO: Implement actual test
    expect(true).toBe(true)
  })
})
