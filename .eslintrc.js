module.exports = {
  root: true,

  parser: '@typescript-eslint/parser',

  plugins: ['@typescript-eslint', 'prettier'],

  extends: [
    'expo',
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
  ],

  rules: {
    'prettier/prettier': 'error',

    'no-console': 'error',
    'no-alert': 'error',
    'no-debugger': 'error',
    'no-unused-vars': 'error',

    '@typescript-eslint/no-explicit-any': 'error',

    'spaced-comment': ['error', 'always', { markers: ['TODO', 'INFO'] }],

    'max-lines': ['error', 400],
    'max-depth': ['error', 4],
    'max-nested-callbacks': ['error', 3],
  },

  overrides: [
    {
      files: ['*.ts', '*.tsx'],
      parser: '@typescript-eslint/parser',
      plugins: ['@typescript-eslint'],
      extends: ['plugin:@typescript-eslint/recommended'],
      rules: {
        '@typescript-eslint/no-explicit-any': 'error',
        '@typescript-eslint/no-unused-vars': ['error'],
        'no-console': 'error',
      },
    },
  ],

  settings: {
    react: {
      version: 'detect',
    },
  },
}
