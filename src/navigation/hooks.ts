import { useEffect, useState } from 'react';
import type { NavigationState } from '@react-navigation/native';

import { navigationRef } from './navigationRef';
import {
  type FlowName,
  type InitialScreen,
  initialScreenOf,
  type ScreenName,
  type ScreenParams,
} from './registry';

// The name of the route currently shown, e.g. 'dashboard.main'.
function readCurrentRoute(): string | undefined {
  if (!navigationRef.isReady()) return undefined;
  const state = navigationRef.getRootState() as NavigationState | undefined;
  return state?.routes[state.index]?.name;
}

// The flow that owns the currently visible screen, e.g. 'dashboard' for
// 'dashboard.main'. Updates whenever the navigation state changes.
export function useCurrentFlow(): FlowName | undefined {
  const [routeName, setRouteName] = useState(readCurrentRoute);

  // The initial value is read when the hook first renders; later changes come from the listener.
  useEffect(() => {
    return navigationRef.addListener('state', () => {
      setRouteName(readCurrentRoute());
    });
  }, []);

  return routeName ? (routeName.split('.')[0] as FlowName) : undefined;
}

// Arguments for opening a screen: data is optional only if the screen accepts none.
type ScreenArgs<S extends ScreenName> = undefined extends ScreenParams[S]
  ? [data?: ScreenParams[S]]
  : [data: ScreenParams[S]];

type FlowArgs<F extends FlowName> = ScreenArgs<
  Extract<InitialScreen<F>, ScreenName>
>;

// The subset of the navigation object these hooks use.
type StackNavigation = {
  navigate: (name: string, params?: unknown) => void;
  reset: (state: unknown) => void;
  goBack: () => void;
  canGoBack: () => boolean;
};

// Navigation actions. They work from anywhere in the app, including layouts
// that sit outside the screen stack.
export function useNavigator() {
  const navigation = navigationRef as unknown as StackNavigation;

  return {
    // Open a screen inside any flow, passing data to it.
    toScreen: <S extends ScreenName>(screen: S, ...[data]: ScreenArgs<S>) => {
      navigation.navigate(screen, data);
    },

    // Enter a flow: replaces the stack and opens that flow's initial screen.
    toFlow: <F extends FlowName>(flow: F, ...[data]: FlowArgs<F>) => {
      navigation.reset({
        index: 0,
        routes: [{ name: initialScreenOf(flow), params: data }],
      });
    },

    back: () => {
      navigation.goBack();
    },

    canGoBack: () => navigation.canGoBack(),
  };
}
