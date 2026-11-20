import type { ComponentProps, ReactNode } from 'react';
import { Pressable, Text, View } from 'react-native';
import {
  SafeAreaInsetsContext,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { useCurrentFlow, useNavigator } from '../hooks';
import { navFlows } from '../registry';

type IconName = ComponentProps<typeof Ionicons>['name'];

// Icon for each tab: a filled one when selected, an outline one otherwise.
const icons: Partial<
  Record<
    (typeof navFlows)[number]['flow'],
    { active: IconName; inactive: IconName }
  >
> = {
  dashboard: { active: 'grid', inactive: 'grid-outline' },
  demo: { active: 'flask', inactive: 'flask-outline' },
  build: { active: 'hammer', inactive: 'hammer-outline' },
};

const ACTIVE_COLOR = '#000000';
const INACTIVE_COLOR = '#737373';
// How far the bar sits lower, taken from the space below it (the home-indicator area).
const BAR_LOWER = 8;

// A classic tab bar at the bottom: a solid bar with icons and labels, and the
// content above it. The bar is not moved by the keyboard, so the keyboard
// covers it; the screens' keyboard avoiding view lifts their content above it.
// `children` is the content above the bar, e.g. the screens.
export function BottomNavLayout({ children }: { children: ReactNode }) {
  const insets = useSafeAreaInsets();
  const { toFlow } = useNavigator();
  const currentFlow = useCurrentFlow();

  return (
    <View className="flex-1">
      <View className="flex-1">
        {/* The bar is below this view, so screens don't add a bottom inset. */}
        <SafeAreaInsetsContext.Provider value={{ ...insets, bottom: 0 }}>
          {children}
        </SafeAreaInsetsContext.Provider>
      </View>

      {/* The bottom inset (home indicator area) depends on the device, so it is set in style. */}
      <View
        className="flex-row border-t border-neutral-300 bg-white"
        style={{ paddingBottom: Math.max(insets.bottom - BAR_LOWER, 0) }}
      >
        {navFlows.map(({ flow, label }) => {
          const active = flow === currentFlow;
          return (
            <Pressable
              key={flow}
              accessibilityRole="tab"
              accessibilityState={{ selected: active }}
              onPress={() => toFlow(flow)}
              className="flex-1 items-center justify-center gap-0.5 pb-1 pt-2"
            >
              <Ionicons
                name={
                  active
                    ? (icons[flow]?.active ?? 'ellipse')
                    : (icons[flow]?.inactive ?? 'ellipse-outline')
                }
                size={24}
                color={active ? ACTIVE_COLOR : INACTIVE_COLOR}
              />
              <Text
                className={`text-[10px] ${active ? 'font-semibold text-black' : 'text-neutral-500'}`}
              >
                {label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
