import Constants from 'expo-constants';
import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import {
  Animated,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import {
  SafeAreaInsetsContext,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { swipeHandlers } from '../EdgeSwipe';
import { useCurrentFlow, useNavigator } from '../hooks';
import { navFlows } from '../registry';

const ANIMATION_MS = 250;
// Height of the top bar, below the status bar.
const TOP_BAR_HEIGHT = 48;

type FlowName = (typeof navFlows)[number]['flow'];

// Hamburger button: three bars drawn with views, so no icon font is needed.
function MenuIcon() {
  return (
    <View className="w-[22px] gap-[5px]">
      <View className="h-[2.5px] rounded-sm bg-neutral-900" />
      <View className="h-[2.5px] rounded-sm bg-neutral-900" />
      <View className="h-[2.5px] rounded-sm bg-neutral-900" />
    </View>
  );
}

// A top bar with the menu button and the name of the current screen, plus a
// sliding sidebar from the left that lists the flows.
// `children` is the content under the bar, e.g. the screens.
export function DrawerLayout({ children }: { children: ReactNode }) {
  const insets = useSafeAreaInsets();
  const { width: windowWidth } = useWindowDimensions();
  const { toFlow } = useNavigator();
  const currentFlow = useCurrentFlow();
  const [open, setOpen] = useState(false);

  const menuWidth = Math.min(windowWidth * 0.78, 330);
  // 0 = menu closed, 1 = menu open.
  const [progress] = useState(() => new Animated.Value(0));

  useEffect(() => {
    Animated.timing(progress, {
      toValue: open ? 1 : 0,
      duration: ANIMATION_MS,
      useNativeDriver: true,
    }).start();
  }, [open, progress]);

  const menuTranslateX = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [-menuWidth, 0],
  });
  const overlayOpacity = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.35],
  });

  const openFlow = (flow: FlowName) => {
    setOpen(false);
    toFlow(flow);
  };

  const currentLabel =
    navFlows.find((item) => item.flow === currentFlow)?.label ?? '';
  const appName = Constants.expoConfig?.name ?? 'App';
  const version = Constants.expoConfig?.version;

  // Swipe right anywhere on the screen to open the menu, when it is closed.
  // It captures the swipe first, so it also works over the content's buttons.
  const openHandlers = swipeHandlers({
    direction: 'right',
    canStart: () => !open,
    onSwipe: () => setOpen(true),
    capture: true,
  });

  return (
    <View className="flex-1" {...openHandlers}>
      {/* Top bar: menu button on the left, the current screen's name in the middle. */}
      <View
        className="border-b border-neutral-200 bg-white"
        style={{ paddingTop: insets.top }}
      >
        <View
          className="flex-row items-center px-3"
          style={{ height: TOP_BAR_HEIGHT }}
        >
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Open menu"
            hitSlop={10}
            onPress={() => setOpen(true)}
            className="h-10 w-10 items-center justify-center rounded-full active:bg-neutral-100"
          >
            <MenuIcon />
          </Pressable>
          <Text
            className="flex-1 text-center text-base font-semibold text-neutral-900"
            numberOfLines={1}
          >
            {currentLabel}
          </Text>
          {/* Same width as the menu button, so the title stays centred. */}
          <View className="h-10 w-10" />
        </View>
      </View>

      {/* Screens below the bar. The bar already handles the top inset. */}
      <View className="flex-1">
        <SafeAreaInsetsContext.Provider value={{ ...insets, top: 0 }}>
          {children}
        </SafeAreaInsetsContext.Provider>
      </View>

      {/* Dimmed background; tapping it closes the menu. */}
      <Animated.View
        pointerEvents={open ? 'auto' : 'none'}
        className="absolute inset-0 bg-black"
        style={{ opacity: overlayOpacity }}
      >
        <Pressable
          accessibilityLabel="Close menu"
          className="absolute inset-0"
          onPress={() => setOpen(false)}
        />
      </Animated.View>

      {/* The sliding sidebar. Width, position and safe-area padding are dynamic. */}
      <Animated.View
        pointerEvents={open ? 'auto' : 'none'}
        className="absolute bottom-0 left-0 top-0 bg-white"
        // Swipe left on the open menu to close it.
        {...swipeHandlers({
          direction: 'left',
          canStart: () => open,
          onSwipe: () => setOpen(false),
        })}
        style={[
          styles.menuShadow,
          {
            width: menuWidth,
            paddingTop: insets.top,
            paddingBottom: insets.bottom,
            transform: [{ translateX: menuTranslateX }],
          },
        ]}
      >
        {/* Header: the app's name, from app.json. */}
        <View className="gap-3 border-b border-neutral-200 px-6 pb-6 pt-6">
          <View className="h-12 w-12 items-center justify-center rounded-2xl bg-neutral-900">
            <Ionicons name="apps" size={24} color="#FFFFFF" />
          </View>
          <View>
            <Text className="text-xl font-bold text-neutral-900">
              {appName}
            </Text>
            <Text className="text-sm text-neutral-500">Menu</Text>
          </View>
        </View>

        {/* The flows. The current one is highlighted. */}
        <View className="flex-1 px-3 pt-4">
          {navFlows.map(({ flow, label, icon }) => {
            const active = flow === currentFlow;
            return (
              <Pressable
                key={flow}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
                onPress={() => openFlow(flow)}
                className={`mb-1 flex-row items-center gap-3 rounded-xl px-3 py-3.5 ${active ? 'bg-neutral-900' : 'active:bg-neutral-100'}`}
              >
                <Ionicons
                  name={active ? icon.active : icon.inactive}
                  size={22}
                  color={active ? '#FFFFFF' : '#404040'}
                />
                <Text
                  className={`flex-1 text-base ${active ? 'font-semibold text-white' : 'text-neutral-800'}`}
                >
                  {label}
                </Text>
                {!active && (
                  <Ionicons name="chevron-forward" size={16} color="#A3A3A3" />
                )}
              </Pressable>
            );
          })}
        </View>

        {/* Footer: the version from app.json. */}
        <View className="px-6 pb-4 pt-2">
          <Text className="text-xs text-neutral-400">
            Version {version ?? 'unknown'}
          </Text>
        </View>
      </Animated.View>
    </View>
  );
}

// Shadows have no simple Tailwind equivalent on both platforms, so they stay here.
const styles = StyleSheet.create({
  menuShadow: {
    shadowColor: '#000000',
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 4, height: 0 },
    elevation: 8,
  },
});
