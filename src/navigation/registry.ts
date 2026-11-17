// The single place where flows and screens are registered.
//
// - `initial` names the flow that opens when the app starts.
// - A flow is a group of screens. Entering a flow opens its own `initial` screen.
// - A screen's route name is `<flow>.<screen>`, e.g. `dashboard.details`.
// - To add a screen: write the component (its `data` prop type is the screen's
//   data type), then add it under a flow below.

import type { ComponentType } from 'react';

import type { ScreenProps } from '../types/screen';
import { Hello } from '../screens/Hello';

export const flows = {
  initial: 'home',
  home: {
    initial: 'hello',
    screens: {
      hello: Hello,
    },
  },
} as const;

type Flows = typeof flows;

export type FlowName = Exclude<keyof Flows, 'initial'>;

export type ScreenName = {
  [F in FlowName]: `${F}.${keyof Flows[F]['screens'] & string}`;
}[FlowName];

export type InitialScreen<F extends FlowName> =
  `${F}.${Flows[F]['initial'] & string}`;

// The component registered for a route name like 'dashboard.details'.
type ComponentOf<N extends string> = N extends `${infer F}.${infer S}`
  ? F extends FlowName
    ? S extends keyof Flows[F]['screens']
      ? Flows[F]['screens'][S]
      : never
    : never
  : never;

// The data type of a screen, read from its component's `data` prop.
type DataOf<C> = C extends (props: ScreenProps<infer D>) => unknown ? D : never;

// The data each screen expects. Derived from the components, so it is always
// in sync with the screens and never needs to be written by hand.
export type ScreenParams = {
  [N in ScreenName]: DataOf<ComponentOf<N>>;
};

// The flow opened when the app starts.
export const defaultFlow: FlowName = flows.initial;

export function initialScreenOf<F extends FlowName>(flow: F): InitialScreen<F> {
  return `${flow}.${flows[flow].initial}` as InitialScreen<F>;
}

const flowNames = Object.keys(flows).filter(
  (key): key is FlowName => key !== 'initial',
);

// Flat list of every screen, used to register them with the navigator.
export const screenList = flowNames.flatMap((flow) =>
  Object.entries(flows[flow].screens).map(([screen, component]) => ({
    name: `${flow}.${screen}`,
    // Each screen has its own data type; the navigator passes `data` generically.
    component: component as unknown as ComponentType<
      ScreenProps<object | undefined>
    >,
  })),
);
