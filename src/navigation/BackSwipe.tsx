import type { ReactNode } from 'react';
import { useState } from 'react';
import {
  Animated,
  PanResponder,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useNavigator } from './hooks';

// Width of the touch strip on each edge.
const EDGE_WIDTH = 24;
// Size of the arrow bubble that appears at the edge.
const BUBBLE_SIZE = 40;
// Pulling past this fraction of the screen width goes back on release.
const COMMIT_FRACTION = 0.3;

type Side = 'left' | 'right';

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

// The arrow bubble for one edge. It slides in and grows as the swipe gets
// further, so the user can see that releasing will go back.
function EdgeBubble({
  side,
  pull,
  width,
}: {
  side: Side;
  pull: Animated.Value;
  width: number;
}) {
  const commit = width * COMMIT_FRACTION;
  const slideOut = side === 'left' ? -BUBBLE_SIZE : BUBBLE_SIZE;
  const slideIn = side === 'left' ? 12 : -12;

  const translateX = pull.interpolate({
    inputRange: [0, commit],
    outputRange: [slideOut, slideIn],
    extrapolate: 'clamp',
  });
  const scale = pull.interpolate({
    inputRange: [0, commit],
    outputRange: [0.6, 1],
    extrapolate: 'clamp',
  });
  const opacity = pull.interpolate({
    inputRange: [0, 12],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  return (
    <Animated.View
      pointerEvents="none"
      className="absolute items-center justify-center rounded-full bg-white"
      style={[
        styles.bubble,
        {
          width: BUBBLE_SIZE,
          height: BUBBLE_SIZE,
          top: '45%',
          [side]: 0,
          opacity,
          transform: [{ translateX }, { scale }],
        },
      ]}
    >
      <Ionicons name="chevron-back" size={22} color="#000000" />
    </Animated.View>
  );
}

// Swipe back from either screen edge, only when the stack can go back. The
// content follows the finger and an arrow bubble appears at the edge. Release
// past the threshold to go back; otherwise the content springs back.
//
// Wrap only the screen content, so the tab bar and menu button stay in place.
export function BackSwipe({ children }: { children: ReactNode }) {
  const { width } = useWindowDimensions();
  const { back, canGoBack } = useNavigator();
  // How far each edge has been pulled, in points. 0 = at rest.
  const [pull] = useState(() => ({
    left: new Animated.Value(0),
    right: new Animated.Value(0),
  }));

  const springBack = (value: Animated.Value) => {
    Animated.spring(value, {
      toValue: 0,
      useNativeDriver: true,
      bounciness: 6,
    }).start();
  };

  // Gesture for one edge. The left edge is pulled right, the right edge left.
  const edgeHandlers = (side: Side) => {
    const value = pull[side];
    const sign = side === 'left' ? 1 : -1;
    const travel = (dx: number) => clamp(sign * dx, 0, width);

    return PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) =>
        canGoBack() && sign * g.dx > 10 && Math.abs(g.dy) < Math.abs(g.dx),
      onPanResponderMove: (_, g) => {
        value.setValue(Math.min(travel(g.dx), width * 0.5));
      },
      onPanResponderRelease: (_, g) => {
        if (travel(g.dx) > width * COMMIT_FRACTION && canGoBack()) {
          // Slide the content out, then go back. The screen change happens
          // while the content is off-screen, so the new screen starts at rest.
          Animated.timing(value, {
            toValue: width,
            duration: 150,
            useNativeDriver: true,
          }).start(({ finished }) => {
            if (finished) {
              back();
              value.setValue(0);
            }
          });
        } else {
          springBack(value);
        }
      },
      onPanResponderTerminate: () => springBack(value),
    }).panHandlers;
  };

  const contentTransform = {
    left: pull.left,
    right: pull.right.interpolate({
      inputRange: [0, width],
      outputRange: [0, -width],
    }),
  };

  return (
    <View className="flex-1 overflow-hidden">
      <Animated.View
        className="flex-1"
        style={{ transform: [{ translateX: contentTransform.left }] }}
      >
        <Animated.View
          className="flex-1"
          style={{ transform: [{ translateX: contentTransform.right }] }}
        >
          {children}
        </Animated.View>
      </Animated.View>

      <EdgeBubble side="left" pull={pull.left} width={width} />
      <EdgeBubble side="right" pull={pull.right} width={width} />

      <View
        {...edgeHandlers('left')}
        pointerEvents="box-only"
        className="absolute bottom-0 left-0 top-0"
        style={{ width: EDGE_WIDTH }}
      />
      <View
        {...edgeHandlers('right')}
        pointerEvents="box-only"
        className="absolute bottom-0 right-0 top-0"
        style={{ width: EDGE_WIDTH }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  bubble: {
    shadowColor: '#000000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
});
