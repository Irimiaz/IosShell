import { getDefaultConfig } from 'expo/metro-config';
import { withNativeWind } from 'nativewind/metro';

const config = getDefaultConfig(__dirname);

// Two type mismatches come from the installed packages, not from this file:
// Expo and NativeWind resolve different copies of Metro's types, and NativeWind
// declares `getCSSForPlatform` as required although `input` alone works.
export default withNativeWind(
  config as unknown as Parameters<typeof withNativeWind>[0],
  { input: './src/global.css' } as Parameters<typeof withNativeWind>[1],
);
