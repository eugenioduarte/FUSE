/* eslint-env jest */
/* global jest */
import mockAsyncStorage from '@react-native-async-storage/async-storage/jest/async-storage-mock'

require('@testing-library/jest-native/extend-expect')

jest.spyOn(console, 'warn').mockImplementation(() => {})
jest.spyOn(console, 'error').mockImplementation(() => {})

jest.mock('expo-asset', () => ({
  Asset: {
    fromModule: jest.fn(() => ({
      downloadAsync: jest.fn(),
      localUri: 'mock/path',
    })),
  },
}))
jest.mock('@react-native-async-storage/async-storage', () => mockAsyncStorage)

jest.useRealTimers()
