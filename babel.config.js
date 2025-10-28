// babel.config.js
module.exports = function (api) {
  api.cache(true)
  const isTest =
    process.env.BABEL_ENV === 'test' ||
    process.env.NODE_ENV === 'test' ||
    !!process.env.JEST_WORKER_ID

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
    ].filter(Boolean),
  }
}
