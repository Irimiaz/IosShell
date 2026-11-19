import type { ReactNode } from 'react';
import { useCallback, useEffect, useState } from 'react';
import { AppState, Pressable, Text, View } from 'react-native';

import { hasDeviceSecurity } from './deviceSecurity';

type Status = 'checking' | 'secured' | 'unsecured';

// Wraps the whole app. The children are shown only when the phone has a screen
// lock set up. The check runs on start and again each time the app comes back
// to the foreground, so removing the lock while the app is open also blocks it.
export function DeviceSecurityGate({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<Status>('checking');

  // Reads the device state and stores the result. Only the async result sets state.
  const check = useCallback(() => {
    hasDeviceSecurity().then((secured) =>
      setStatus(secured ? 'secured' : 'unsecured'),
    );
  }, []);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') check();
    });
    // Also check once on start.
    check();
    return () => subscription.remove();
  }, [check]);

  if (status === 'secured') return children;

  if (status === 'checking') {
    return <View style={{ flex: 1, backgroundColor: '#F5F5DC' }} />;
  }

  return (
    <View
      className="flex-1 items-center justify-center gap-4 bg-neutral-100 px-6"
      accessibilityRole="alert"
    >
      <Text className="text-center text-xl font-semibold text-neutral-900">
        Screen lock required
      </Text>
      <Text className="text-center text-base text-neutral-700">
        Set up Face ID, Touch ID, a fingerprint or a PIN in your phone’s
        settings to use this app.
      </Text>
      <Pressable
        onPress={() => {
          setStatus('checking');
          check();
        }}
        accessibilityRole="button"
        className="rounded-lg bg-neutral-900 px-5 py-3"
      >
        <Text className="font-medium text-white">Check again</Text>
      </Pressable>
    </View>
  );
}
