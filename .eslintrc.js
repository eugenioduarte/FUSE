module.exports = {
  root: true,

  // 🔍 Usa o parser TypeScript
  parser: '@typescript-eslint/parser',

  // 🔌 Plugins utilizados
  plugins: ['@typescript-eslint', 'prettier'],

  // 📦 Extensões base
  extends: [
    'expo', // base do Expo/React Native
    'plugin:@typescript-eslint/recommended', // boas práticas TS
    'plugin:prettier/recommended', // integração Prettier + ESLint
  ],

  // ⚙️ Regras globais
  rules: {
    // 🔧 Prettier sempre obrigatório
    'prettier/prettier': 'error',

    // 🚫 segurança e limpeza
    'no-console': 'error',
    'no-alert': 'error',
    'no-debugger': 'error',
    'no-unused-vars': 'error',

    // 🚫 bloqueia uso de `any`
    '@typescript-eslint/no-explicit-any': 'error',

    // ✅ força comentários com marcador (TODO, INFO)
    'spaced-comment': ['error', 'always', { markers: ['TODO', 'INFO'] }],

    // 🧠 qualidade de código
    'max-lines': ['error', 400],
    'max-depth': ['error', 4],
    'max-nested-callbacks': ['error', 3],
  },

  // 🎯 Regras específicas para arquivos TS/TSX
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

  // 🌎 Configurações adicionais
  settings: {
    react: {
      version: 'detect',
    },
  },
}
