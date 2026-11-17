import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { defaultFlow, initialScreenOf, screenList } from './registry';

const Stack = createNativeStackNavigator();

export function RootNavigator() {
  return (
    <Stack.Navigator
      initialRouteName={initialScreenOf(defaultFlow)}
      screenOptions={{ headerShown: false }}
    >
      {screenList.map(({ name, component: Component }) => (
        <Stack.Screen key={name} name={name}>
          {({ route }) => <Component data={route.params} />}
        </Stack.Screen>
      ))}
    </Stack.Navigator>
  );
}
