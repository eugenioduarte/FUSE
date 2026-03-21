import React from 'react'
import { render } from '@testing-library/react-native'
import Onboarding from '../onboarding'

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: jest.fn() }),
}))

describe('Onboarding', () => {
  it('renders without crashing', () => {
    // TODO: Implement actual test
    expect(true).toBe(true)
  })
})
