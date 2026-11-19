import { Text, View } from 'react-native';

import { BaseScreen } from './BaseScreen';

// Long list with gaps between items, for testing the scroll.
const ITEMS = Array.from({ length: 40 }, (_, index) => index + 1);

export function Profile() {
  return (
    <BaseScreen>
      <View className="gap-3">
        <Text className="mb-2 text-2xl font-bold text-black dark:text-white">
          Profile
        </Text>
        {ITEMS.map((item) => (
          <View key={item} className="rounded-lg bg-white px-4 py-4">
            <Text className="text-base text-black">Item {item}</Text>
          </View>
        ))}
      </View>
    </BaseScreen>
  );
}
