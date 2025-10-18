module.exports = {
  preset: 'react-native',
  testMatch: ['**/?(*.)+(test).[jt]s?(x)'],

  setupFiles: ['<rootDir>/jest.setupEarly.js'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],

  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest',
  },

  transformIgnorePatterns: [
    'node_modules/(?!(jest-)?react-native' +
      '|@react-native' +
      '|@react-navigation' +
      '|@react-native-community' +
      '|expo($|/.*)' +
      '|expo-modules-core' +
      '|expo-localization' +
      '|@expo(nent)?/.*' +
      '|@unimodules/.*' +
      '|unimodules' +
      '|sentry-expo' +
      '|native-base)',
  ],

  testEnvironment: 'jsdom',

  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    '^expo($|/.*)': '<rootDir>/__mocks__/expoMock.js',
  },

  collectCoverage: true,
  collectCoverageFrom: ['src/**/*.{js,jsx,ts,tsx}'],
  coverageThreshold: {
    global: {
      branches: 10,
      functions: 10,
      lines: 10,
      statements: 10,
    },
  },
}
