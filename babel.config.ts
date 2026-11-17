import type { TransformOptions } from '@babel/core';

export default function (api: {
  cache: (forever: boolean) => void;
}): TransformOptions {
  api.cache(true);
  return {
    presets: [['babel-preset-expo', { jsxImportSource: 'nativewind' }]],
    plugins: ['react-native-worklets/plugin'],
  };
}
