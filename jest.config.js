module.exports = {
  preset: 'jest-expo',
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
  },

  collectCoverage: true,
  collectCoverageFrom: ['src/**/*.{js,jsx,ts,tsx}'],
  coverageThreshold: {
    global: {
      // Thresholds aligned to real coverage baseline (2026-03-25: ~20%).
      // Ratchet up by ~5% per sprint toward the 70% goal.
      // Real values at last measurement: statements 20.41%, branches 12.82%, functions 21.92%, lines 20.65%
      branches: 12,
      functions: 21,
      lines: 20,
      statements: 20,
    },
  },
}
