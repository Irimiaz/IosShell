import { Alert, Button, Text, View } from 'react-native';

import { requireBiometry } from '../security/deviceSecurity';
import { BaseScreen } from './BaseScreen';

export function Settings() {
  return (
    <BaseScreen>
      <View className="flex-1 items-center justify-center gap-6">
        <Button
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
        <Text className="text-2xl font-bold text-black dark:text-white">
          Settings
        </Text>
      </View>
    </BaseScreen>
  );
}
