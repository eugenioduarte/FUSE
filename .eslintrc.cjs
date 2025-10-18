module.exports = {
  root: true,
  extends: ['universe/native', 'plugin:prettier/recommended'],
  rules: {
    'prettier/prettier': 'error',
    'react/no-unknown-property': ['error', { ignore: ['testID'] }],
  },
}
