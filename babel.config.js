// babel.config.js
module.exports = function babelConfig(api) {
  api.cache(true)
  const isTest =
    process.env.BABEL_ENV === 'test' ||
    process.env.NODE_ENV === 'test' ||
    !!process.env.JEST_WORKER_ID
  const isProduction = process.env.NODE_ENV === 'production'

  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          root: ['./src'],
          alias: {
            '@': './src',
          },
        },
      ],
      !isTest && 'react-native-reanimated/plugin',
      isProduction && ['transform-remove-console', { exclude: ['error'] }],
    ].filter(Boolean),
  }
}
