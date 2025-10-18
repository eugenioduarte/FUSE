const { defineConfig } = require('eslint/config')
const expoConfig = require('eslint-config-expo/flat')

module.exports = defineConfig([
  {
    ignores: ['dist', 'node_modules', 'build', 'coverage', '.expo'],
  },
  expoConfig,
  {
    files: ['src/**/*.{ts,tsx}'],
    rules: {
      'react/no-unknown-property': ['error', { ignore: ['testID'] }],
      '@typescript-eslint/no-require-imports': 'off',
    },
  },
])
