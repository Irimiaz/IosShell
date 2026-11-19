import { createNavigationContainerRef } from '@react-navigation/native';

// A ref to the app's NavigationContainer. Layouts sit above the screen stack,
// so they can't use useNavigation(); they reach navigation through this ref.
// It is attached in App.tsx.
export const navigationRef = createNavigationContainerRef();
