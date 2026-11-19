import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { LogBox } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { navigationRef } from './navigation/navigationRef';
import { RootNavigator } from './navigation/RootNavigator';
import { DeviceSecurityGate } from './security/DeviceSecurityGate';

//! DO NOT REMOVE THIS LINE. It is needed to hide the warning overlays that cover the bottom of the screen on a cold launch. The warnings still print in the console (Metro terminal / DevTools).
LogBox.ignoreAllLogs(true);

export default function App() {
  return (
    <SafeAreaProvider>
      {/* Nothing in the app is shown unless the phone has a screen lock. */}
      <DeviceSecurityGate>
        <NavigationContainer ref={navigationRef}>
          <RootNavigator />
          <StatusBar style="auto" />
        </NavigationContainer>
      </DeviceSecurityGate>
    </SafeAreaProvider>
  );
}
