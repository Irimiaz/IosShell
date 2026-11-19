import { Pressable, Text, View } from 'react-native';

import { useNavigator } from '../navigation/hooks';
import { BaseScreen } from './BaseScreen';

// Second screen of the dashboard flow, for testing back. Go back with the
// Back button, or swipe from the right edge.
export function DashboardDetails() {
  const { back } = useNavigator();

  return (
    <BaseScreen>
      <View className="flex-1 items-center justify-center gap-6">
        <Text className="text-2xl font-bold text-black dark:text-white">
          Details
        </Text>
        <Text className="px-6 text-center text-base text-black dark:text-white">
          Press Back, or swipe from the right edge, to return to the dashboard.
        </Text>
        <Pressable
          accessibilityRole="button"
          onPress={back}
          className="rounded-full bg-black px-6 py-3"
        >
          <Text className="font-semibold text-white">Back</Text>
        </Pressable>
      </View>
    </BaseScreen>
  );
}
