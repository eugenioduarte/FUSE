module.exports = {
  root: true,
  extends: [
    'expo',
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
  ],
  plugins: ['@typescript-eslint', 'prettier'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
  },
  rules: {
    // 🔹 Integração com Prettier
    'prettier/prettier': 'error',

    // ❌ Proíbe uso de any
    '@typescript-eslint/no-explicit-any': 'error',

    // ❌ Proíbe console.log, mas permite warn e error
    'no-console': ['error', { allow: ['warn', 'error'] }],

    // ❌ Proíbe debugger
    'no-debugger': 'error',

    // ✅ Exige tipagem explícita de retorno de função
    '@typescript-eslint/explicit-function-return-type': [
      'error',
      {
        allowExpressions: false,
        allowTypedFunctionExpressions: true,
      },
    ],

    // ❌ Proíbe comentários genéricos; só permite TODO e INFO
    'spaced-comment': [
      'error',
      'always',
      {
        markers: ['TODO:', 'INFO:'],
      },
    ],

    // ❌ Proíbe variáveis não usadas (exceto se começarem com "_")
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],

    // ❌ Proíbe código morto e imports não usados
    'no-unused-expressions': 'error',
    'no-useless-return': 'error',
  },
}
