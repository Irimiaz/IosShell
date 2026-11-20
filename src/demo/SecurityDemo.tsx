import * as LocalAuthentication from 'expo-local-authentication';
import { useEffect, useState } from 'react';
import { Alert, View } from 'react-native';

import { BaseScreen } from '../screens/BaseScreen';
import { requireBiometry } from '../security/deviceSecurity';
import { ActionButton, Card, Heading, Row } from './ui';

// The lock the phone has, in words.
function lockName(level: LocalAuthentication.SecurityLevel): string {
  if (level === LocalAuthentication.SecurityLevel.BIOMETRIC) {
    return 'Face ID or Touch ID';
  }
  if (level === LocalAuthentication.SecurityLevel.SECRET) {
    return 'PIN or passcode';
  }
  return 'None. Set one in Settings to use this app.';
}

export function SecurityDemo() {
  const [lock, setLock] = useState('checking…');

  useEffect(() => {
    LocalAuthentication.getEnrolledLevelAsync()
      .then((level) => setLock(lockName(level)))
      .catch(() => setLock('unknown'));
  }, []);

  return (
    <BaseScreen>
      <View className="flex-1 gap-8">
        <Heading>Security</Heading>

        <Card
          icon="lock-closed"
          title="Screen lock"
          description="The lock this phone uses. The app will not open without one."
        >
          <Row label="Lock" value={lock} />
        </Card>

        <Card
          icon="finger-print"
          title="Biometry"
          description="Checks biometry (Face ID or Touch ID) before running the action. If biometry is not set up, it asks for the phone's PIN or passcode."
          action={
            <ActionButton
              title="Run secured action"
              onPress={() =>
                requireBiometry(
                  () => Alert.alert('Done', 'Face ID / Touch ID confirmed.'),
                  (reason) =>
                    Alert.alert(
                      'Not confirmed',
                      `Authentication failed: ${reason}`,
                    ),
                )
              }
            />
          }
        />
      </View>
    </BaseScreen>
  );
}
