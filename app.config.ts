import type { ConfigContext, ExpoConfig } from 'expo/config';
import { withXcodeProject, type ConfigPlugin } from 'expo/config-plugins';

// Expo loads .env into process.env before evaluating this file, so values
// set there can be read here. Nothing about the app identity is in app.json.
//
//   IOS_BUNDLE_ID    bundle identifier of the iOS app (required). See docs/IPHONE.md#values-in-env
//   APPLE_TEAM_ID    signing team ID of the Apple ID (optional; Xcode picks one if empty)
//   username         passed to the app as Constants.expoConfig.extra.username

// Sets CODE_SIGN_STYLE = Automatic on the app target, so Xcode manages the
// signing certificate and profile itself instead of defaulting to manual.
const withAutomaticSigning: ConfigPlugin = (config) =>
  withXcodeProject(config, (cfg) => {
    const project = cfg.modResults;
    const configListId =
      project.getFirstTarget().firstTarget.buildConfigurationList;
    const configurationList = project.pbxXCConfigurationList()[configListId];
    for (const { value } of configurationList.buildConfigurations) {
      project.pbxXCBuildConfigurationSection()[
        value
      ].buildSettings.CODE_SIGN_STYLE = 'Automatic';
    }
    return cfg;
  });

export default ({ config }: ConfigContext): ExpoConfig => {
  const bundleIdentifier = process.env.IOS_BUNDLE_ID;
  if (!bundleIdentifier) {
    throw new Error(
      'Missing IOS_BUNDLE_ID. Set it in .env (see docs/IPHONE.md#values-in-env).',
    );
  }

  const appleTeamId = process.env.APPLE_TEAM_ID || undefined;

  return {
    ...(config as ExpoConfig),
    // Expo accepts plugin functions in this array at runtime, but its ExpoConfig
    // type only lists names, so the cast is needed.
    plugins: [
      ...((config as ExpoConfig).plugins ?? []),
      withAutomaticSigning,
    ] as ExpoConfig['plugins'],
    ios: {
      bundleIdentifier,
      ...(appleTeamId ? { appleTeamId } : {}),
      // Without these keys iOS never asks for Local Network access, so the
      // installed app cannot reach the Metro dev server on the Mac.
      infoPlist: {
        NSLocalNetworkUsageDescription:
          'Loads the app code from the development server on your Mac.',
        NSBonjourServices: ['_http._tcp'],
      },
    },
    extra: {
      username: process.env.username,
    },
  };
};
