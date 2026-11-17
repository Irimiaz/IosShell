import type { ConfigContext, ExpoConfig } from 'expo/config';

// Expo loads .env into process.env before evaluating this file, so values
// set there (without the EXPO_PUBLIC_ prefix) can be passed to the app here.
export default ({ config }: ConfigContext): ExpoConfig => ({
  ...(config as ExpoConfig),
  extra: {
    username: process.env.username,
  },
});
