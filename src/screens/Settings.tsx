import { Text, TextInput, View } from 'react-native';

import { BaseScreen } from './BaseScreen';

// Keyboard test. The inputs sit at the bottom of the screen, right above the
// bottom bar, so they show whether the keyboard pushes them up correctly.
export function Settings() {
  return (
    <BaseScreen>
      <View className="flex-1">
        <Text className="text-2xl font-bold text-black dark:text-white">
          Settings
        </Text>
        <Text className="mt-2 text-base text-black dark:text-white">
          Keyboard test: tap a field below and check it stays visible above the
          keyboard, and that the bottom buttons stay under it.
        </Text>

        <View className="flex-1" />

        <View className="gap-3">
          <TextInput
            placeholder="First field"
            placeholderTextColor="#666666"
            returnKeyType="next"
            className="rounded-lg border border-neutral-500 bg-white px-3 py-3 text-base text-black"
          />
          <TextInput
            placeholder="Second field"
            placeholderTextColor="#666666"
            returnKeyType="next"
            className="rounded-lg border border-neutral-500 bg-white px-3 py-3 text-base text-black"
          />
          <TextInput
            placeholder="Last field (bottom of screen)"
            placeholderTextColor="#666666"
            returnKeyType="done"
            className="rounded-lg border border-neutral-500 bg-white px-3 py-3 text-base text-black"
          />
        </View>
      </View>
    </BaseScreen>
  );
}
