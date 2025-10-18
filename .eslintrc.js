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

    // 🚫 segurança e limpeza
    'no-console': 'error',
    'no-alert': 'error',
    'no-debugger': 'error',
    'no-unused-vars': 'error',

    // 🚫 bloqueia any
    '@typescript-eslint/no-explicit-any': 'error',

    // ✅ força comentários padronizados
    'spaced-comment': ['error', 'always', { markers: ['TODO', 'INFO'] }],

    // 🧠 qualidade de código
    'max-lines': ['error', 400],
    'max-depth': ['error', 4],
    'max-nested-callbacks': ['error', 3],
  },
}
