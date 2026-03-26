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
    settings: {
      'import/resolver': {
        alias: {
          map: [['@', './src']],
          extensions: ['.ts', '.tsx', '.js', '.jsx'],
        },
      },
    },
  },
  {
    files: ['src/**/__tests__/**/*.{ts,tsx}', 'src/**/*.test.{ts,tsx}'],
    rules: {
      '@typescript-eslint/no-unused-vars': 'off',
    },
  },
  {
    files: ['functions/**/*.{ts,tsx}'],
    rules: {
      // Firebase functions live in a separate package with its own dependencies.
      // The root lint job does not install that subpackage's node_modules, so
      // import/no-unresolved becomes a false positive in CI.
      'import/no-unresolved': 'off',
    },
  },
])
