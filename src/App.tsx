import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { navigationRef } from './navigation/navigationRef';
import { RootNavigator } from './navigation/RootNavigator';
import { DeviceSecurityGate } from './security/DeviceSecurityGate';

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
