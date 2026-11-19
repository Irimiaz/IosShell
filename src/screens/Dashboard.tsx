import { Pressable, Text, View } from 'react-native';

import { useNavigator } from '../navigation/hooks';
import { BaseScreen } from './BaseScreen';

// Opens the details screen, to test going back.
export function Dashboard() {
  const { toScreen } = useNavigator();

  return (
    <BaseScreen>
      <View className="flex-1 items-center justify-center gap-6">
        <Text className="text-2xl font-bold text-black dark:text-white">
          Dashboard
        </Text>
        <Pressable
          accessibilityRole="button"
          onPress={() => toScreen('dashboard.details')}
          className="rounded-full bg-black px-6 py-3"
        >
          <Text className="font-semibold text-white">Open details</Text>
        </Pressable>
      </View>
    </BaseScreen>
  );
}
