// The single place where flows and screens are registered.
//
// - `initial` names the flow that opens when the app starts.
// - A flow is a group of screens. Entering a flow opens its own `initial` screen.
// - A screen's route name is `<flow>.<screen>`, e.g. `dashboard.main`.
// - To add a screen: write the component (its `data` prop type is the screen's
//   data type), then add it under a flow below.
// - To remove the demo: delete src/demo/, then delete the `demo` flow and its
//   entry in `navFlows` below.

import type { ComponentType } from 'react';

import {
  CameraDemo,
  CreateQrDemo,
  DemoMenu,
  NotificationsDemo,
  ScanDemo,
  SecurityDemo,
  ShareDemo,
} from '../demo';
import { Build } from '../screens/Build';
import { Dashboard } from '../screens/Dashboard';
import type { ScreenProps } from '../types/screen';

export const flows = {
  initial: 'dashboard',

  dashboard: {
    initial: 'main',
    screens: {
      main: Dashboard,
    },
  },
  demo: {
    initial: 'main',
    screens: {
      main: DemoMenu,
      security: SecurityDemo,
      notifications: NotificationsDemo,
      camera: CameraDemo,
      share: ShareDemo,
      scan: ScanDemo,
      createQr: CreateQrDemo,
    },
  },
  build: {
    initial: 'main',
    screens: {
      main: Build,
    },
  },
} as const;

type Flows = typeof flows;

export type FlowName = Exclude<keyof Flows, 'initial'>;

// The flows shown in the navigation layouts (drawer menu and bottom bar).
export const navFlows: { flow: FlowName; label: string }[] = [
  { flow: 'dashboard', label: 'Dashboard' },
  { flow: 'demo', label: 'Demo' },
  { flow: 'build', label: 'Info' },
];

export type ScreenName = {
  [F in FlowName]: `${F}.${keyof Flows[F]['screens'] & string}`;
}[FlowName];

// Mapped per key, so each flow pairs with its own initial screen.
export type InitialScreen<F extends FlowName> = {
  [K in F]: `${K}.${Flows[K]['initial'] & string}`;
}[F];

// The component registered for a route name like 'dashboard.main'.
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
