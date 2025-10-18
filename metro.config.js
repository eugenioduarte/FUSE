const { getDefaultConfig } = require('expo/metro-config')

const config = getDefaultConfig(__dirname)

config.transformer.babelTransformerPath = require.resolve(
  'react-native-svg-transformer',
)

// Ensure the transformer knows where to register assets.
// Prevents "missing-asset-registry-path" errors for images required from node_modules.
config.transformer.assetRegistryPath =
  'react-native/Libraries/Image/AssetRegistry'

config.resolver.assetExts = config.resolver.assetExts.filter(
  (ext) => ext !== 'svg',
)
config.resolver.sourceExts.push('svg')

module.exports = config
