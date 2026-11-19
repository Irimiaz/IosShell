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

import { swipeHandlers } from '../EdgeSwipe';
import { useCurrentFlow, useNavigator } from '../hooks';
import { navFlows } from '../registry';

const ANIMATION_MS = 250;

// Hamburger button: three bars drawn with views, so no icon font is needed.
function MenuIcon() {
  return (
    <View className="w-[22px] gap-[5px]">
      <View className="h-[2.5px] rounded-sm bg-black" />
      <View className="h-[2.5px] rounded-sm bg-black" />
      <View className="h-[2.5px] rounded-sm bg-black" />
    </View>
  );
}

// A floating hamburger over the screen background (no top bar), plus a
// sliding menu from the left that lists the flows.
// `children` is the content under it, e.g. the screens.
export function DrawerLayout({ children }: { children: ReactNode }) {
  const insets = useSafeAreaInsets();
  const { width: windowWidth } = useWindowDimensions();
  const { toFlow } = useNavigator();
  const currentFlow = useCurrentFlow();
  const [open, setOpen] = useState(false);

  const menuWidth = Math.min(windowWidth * 0.75, 320);
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
    outputRange: [0, 0.4],
  });

  const openFlow = (flow: (typeof navFlows)[number]['flow']) => {
    setOpen(false);
    toFlow(flow);
  };

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
      {/* Top bar above the screen, with the menu button on the left. */}
      <View
        className="flex-row items-center bg-red-400 px-6"
        style={{ paddingTop: insets.top }}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Open menu"
          hitSlop={10}
          onPress={() => setOpen(true)}
          className="h-11 w-11 items-center justify-center"
        >
          <MenuIcon />
        </Pressable>
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

      {/* The sliding menu. Width, position and safe-area padding are dynamic. */}
      <Animated.View
        pointerEvents={open ? 'auto' : 'none'}
        className="absolute bottom-0 left-0 top-0 bg-white px-4"
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
            paddingTop: insets.top + 16,
            paddingBottom: insets.bottom + 16,
            transform: [{ translateX: menuTranslateX }],
          },
        ]}
      >
        <Text className="mb-3 text-sm text-neutral-500">Flows</Text>
        {navFlows.map(({ flow, label }) => {
          const active = flow === currentFlow;
          return (
            <Pressable
              key={flow}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              onPress={() => openFlow(flow)}
              className={`mb-1.5 rounded-[10px] px-3 py-3.5 ${active ? 'bg-black' : 'bg-transparent'}`}
            >
              <Text
                className={`text-base ${active ? 'font-bold text-white' : 'text-black'}`}
              >
                {label}
              </Text>
            </Pressable>
          );
        })}
      </Animated.View>
    </View>
  );
}

// Shadows have no simple Tailwind equivalent on both platforms, so they stay here.
const styles = StyleSheet.create({
  menuShadow: {
    shadowColor: '#000000',
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: { width: 2, height: 0 },
    elevation: 8,
  },
});
