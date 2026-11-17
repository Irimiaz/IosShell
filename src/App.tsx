import { StatusBar } from 'expo-status-bar';
import { Text, View } from 'react-native';
import { env } from './config/env';
export default function App() {
  return (
    <View className="flex-1 items-center justify-center bg-red-500 dark:bg-black">
      <Text className="text-lg text-black dark:text-white">
        Open src/App.tsx to start working on your app! {env.username}
      </Text>
      <StatusBar style="auto" />
    </View>
  );
}
