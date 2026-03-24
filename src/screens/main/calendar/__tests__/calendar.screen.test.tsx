import React from 'react'
import { render } from '@testing-library/react-native'
import CalendarScreen from '../calendar.screen'

jest.mock('@react-navigation/native', () => ({
  useTheme: () => ({ colors: { background: '#000', text: '#fff', border: '#333', card: '#111', notification: '#f00', primary: '#0af' } }),
  useNavigation: () => ({ navigate: jest.fn(), goBack: jest.fn() }),
}))
jest.mock('@/store/theme.store', () => ({
  useThemeStore: () => ({ background_color: '#fff' }),
}))

describe('CalendarScreen', () => {
  it('renders without crashing', () => {
    // TODO: Implement actual test
    expect(true).toBe(true)
  })
})
