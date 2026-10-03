// Resolves the package to its TypeScript source one directory up, so edits to src/ reload in the example.
const {getDefaultConfig} = require('expo/metro-config');
const path = require('path');

const root = path.resolve(__dirname, '..');
const config = getDefaultConfig(__dirname);

config.watchFolders = [root];
config.resolver.nodeModulesPaths = [path.resolve(__dirname, 'node_modules')];
config.resolver.blockList = [
  ...Array.from(config.resolver.blockList ?? []),
  new RegExp(`${path.resolve(root, 'node_modules')}/.*`),
];
config.resolver.resolveRequest = (context, moduleName, platform) => {
  const entry = {'@garrettmacmac/react-native-duo': 'index', '@garrettmacmac/react-native-duo/layout': 'layout', '@garrettmacmac/react-native-duo/testing': 'testing'}[moduleName];
  if (entry) return {type: 'sourceFile', filePath: path.resolve(root, 'src', `${entry}.ts`)};
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
