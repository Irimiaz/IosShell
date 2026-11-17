import { useNavigation } from '@react-navigation/native';

import {
  type FlowName,
  type InitialScreen,
  initialScreenOf,
  type ScreenName,
  type ScreenParams,
} from './registry';

// Arguments for opening a screen: data is optional only if the screen accepts none.
type ScreenArgs<S extends ScreenName> = undefined extends ScreenParams[S]
  ? [data?: ScreenParams[S]]
  : [data: ScreenParams[S]];

type FlowArgs<F extends FlowName> = ScreenArgs<InitialScreen<F>>;

// The subset of the navigation object these hooks use.
type StackNavigation = {
  navigate: (name: string, params?: unknown) => void;
  reset: (state: unknown) => void;
  goBack: () => void;
  canGoBack: () => boolean;
};

export function useNavigator() {
  const navigation = useNavigation() as unknown as StackNavigation;

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
