import type { ConfigContext, ExpoConfig } from 'expo/config';

// Expo loads .env into process.env before evaluating this file, so values
// set there can be read here. Nothing about the app identity is in app.json.
//
//   IOS_BUNDLE_ID    bundle identifier of the iOS app (required). See scripts/build/env.md
//   APPLE_TEAM_ID    signing team ID of the Apple ID (optional; Xcode picks one if empty)
//   ANDROID_PACKAGE  Android application ID (optional)
//   username         passed to the app as Constants.expoConfig.extra.username
export default ({ config }: ConfigContext): ExpoConfig => {
  const bundleIdentifier = process.env.IOS_BUNDLE_ID;
  if (!bundleIdentifier) {
    throw new Error('Missing IOS_BUNDLE_ID. Set it in .env (see scripts/build/env.md).');
  }

  const appleTeamId = process.env.APPLE_TEAM_ID || undefined;
  const androidPackage = process.env.ANDROID_PACKAGE || undefined;

  return {
    ...(config as ExpoConfig),
    ios: {
      bundleIdentifier,
      ...(appleTeamId ? { appleTeamId } : {}),
    },
    ...(androidPackage ? { android: { package: androidPackage } } : {}),
    extra: {
      username: process.env.username,
    },
  };
};
