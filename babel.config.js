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
          root: ['./'],
          alias: {
            '@': './src',
          },
        },
      ],
      // Keep Reanimated LAST per its docs; omit Worklets here to avoid duplicate injection
      // Reanimated v4 includes Worklets transform internally.
      !isTest && 'react-native-reanimated/plugin',
    ].filter(Boolean),
    env: {
      test: {
        // Use Metro RN preset in tests to avoid expo preset auto-including reanimated/worklets
        presets: [['module:metro-react-native-babel-preset']],
        plugins: [],
      },
    },
  }
}
