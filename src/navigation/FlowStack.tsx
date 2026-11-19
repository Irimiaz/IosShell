import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { defaultFlow, initialScreenOf, screenList } from './registry';

// The screen stack shared by every layout. Layouts render it inside their own
// chrome (drawer menu, bottom bar, ...).
const Stack = createNativeStackNavigator();

export function FlowStack() {
  return (
    <Stack.Navigator
      initialRouteName={initialScreenOf(defaultFlow)}
      // Screens switch instantly, with no animation. The native swipe-back is off: EdgeSwipe
      // handles both edges and only acts when the stack can go back.
      screenOptions={{
        headerShown: false,
        animation: 'none',
        gestureEnabled: false,
      }}
    >
      {screenList.map(({ name, component: Component }) => (
        <Stack.Screen key={name} name={name}>
          {({ route }) => <Component data={route.params} />}
        </Stack.Screen>
      ))}
    </Stack.Navigator>
  );
}
