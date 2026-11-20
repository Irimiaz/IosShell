import { Alert, View } from 'react-native';

import { BaseScreen } from '../screens/BaseScreen';
import { requireBiometry } from '../security/deviceSecurity';
import { ActionButton, Card, Heading } from './ui';

export function SecurityDemo() {
  return (
    <BaseScreen>
      <View className="flex-1 gap-8">
        <Heading>Security</Heading>

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
