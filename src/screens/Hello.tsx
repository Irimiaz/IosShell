import { Text, View } from 'react-native';

import { BaseScreen } from './BaseScreen';

export function Hello() {
  return (
    <BaseScreen>
      <View className="flex-1 items-center justify-center">
        <Text className="text-2xl font-bold text-black dark:text-white">
          Hello
        </Text>
      </View>
    </BaseScreen>
  );
}
