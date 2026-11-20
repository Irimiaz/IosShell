import Constants from 'expo-constants';
import { useEffect, useState } from 'react';
import {
  AppState,
  PixelRatio,
  Platform,
  useColorScheme,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BaseScreen } from '../screens/BaseScreen';
import { Card, Group, Heading, Row } from './ui';

// Live values from the phone. Put the app in the background and come back to
// watch the app state change.
export function DeviceDemo() {
  const [appState, setAppState] = useState<string>(
    AppState.currentState ?? 'active',
  );
  const colorScheme = useColorScheme();
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    const subscription = AppState.addEventListener('change', setAppState);
    return () => subscription.remove();
  }, []);

  return (
    <BaseScreen>
      <View className="flex-1 gap-8">
        <Heading>Device</Heading>

        <Group title="Phone">
          <Card
            icon="phone-portrait"
            title="Device"
            description="What the phone reports about itself."
          >
            <Row
              label="Device name"
              value={Constants.deviceName ?? 'unknown'}
            />
            <Row
              label="Platform"
              value={`${Platform.OS} ${String(Platform.Version)}`}
            />
            <Row
              label="Screen size"
              value={`${Math.round(width)} × ${Math.round(height)} pt`}
            />
            <Row label="Pixel density" value={`${PixelRatio.get()}×`} />
            <Row
              label="Text size setting"
              value={`${PixelRatio.getFontScale().toFixed(2)}×`}
            />
            <Row label="Colour scheme" value={colorScheme ?? 'unknown'} />
          </Card>
        </Group>

        <Group title="App">
          <Card
            icon="information-circle"
            title="App"
            description="State and details of this app."
          >
            <Row label="App state" value={appState} />
            <Row
              label="Version"
              value={Constants.expoConfig?.version ?? 'unknown'}
            />
            <Row
              label="Safe area (top, bottom)"
              value={`${Math.round(insets.top)} pt, ${Math.round(insets.bottom)} pt`}
            />
          </Card>
        </Group>
      </View>
    </BaseScreen>
  );
}
