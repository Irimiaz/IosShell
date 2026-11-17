import { Text, View } from 'react-native';

export function Hello() {
  return (
    <View className="flex-1 items-center justify-center bg-white dark:bg-black">
      <Text className="text-3xl font-bold text-black dark:text-white">
        Hello
      </Text>
    </View>
  );
}
