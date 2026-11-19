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
// Diameter of the core that appears once the swipe is far enough.
const CORE_SIZE = 84;
// Size of the area the ripples spread across.
const RIPPLE_AREA = CORE_SIZE * 2.8;
// Size of the icon inside the core.
const ICON_SIZE = 36;
// Accent colours. Warm, so they stand out on the red screen.
const ACCENT = '#FFD54F';
const ICON_COLOR = '#4E2A04';
// Pulling past this fraction of the screen width goes back on release.
const COMMIT_FRACTION = 0.3;

type Side = 'left' | 'right';

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

// Ripples that spread out of one screen edge while you pull. The screen stays
// still. Once the swipe is far enough the ripples fade, and a warm core blooms
// in their place with a back icon, so the user knows letting go will go back.
function EdgeRipples({
  side,
  pull,
  width,
}: {
  side: Side;
  pull: Animated.Value;
  width: number;
}) {
  const commit = width * COMMIT_FRACTION;
  // Direction into the screen: right for the left edge, left for the right.
  const inward = side === 'left' ? 1 : -1;

  // The whole group starts just outside the edge and moves in as you pull.
  const slide = pull.interpolate({
    inputRange: [0, commit],
    // At full pull the core's centre sits on the edge, so only its inner half shows.
    outputRange: [0, inward * CORE_SIZE * 0.5],
    extrapolate: 'clamp',
  });
  const grow = pull.interpolate({
    inputRange: [0, commit * 0.85, commit],
    outputRange: [0.7, 1, 1.05],
    extrapolate: 'clamp',
  });
  const opacity = pull.interpolate({
    inputRange: [0, 8],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });
  // Ripples fade out as the swipe reaches the commit point.
  const ripplesVisible = pull.interpolate({
    inputRange: [commit * 0.7, commit],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });
  // 0 → 1 at the commit point; the warm core and icon bloom in.
  const armed = pull.interpolate({
    inputRange: [commit * 0.8, commit],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });
  const coreScale = armed.interpolate({
    inputRange: [0, 1],
    outputRange: [0.4, 1],
  });

  // Each ripple is a ring that spreads wider than the one before it.
  const ripples = [0, 1, 2].map((index) => {
    const size = CORE_SIZE * (1 + index * 0.55);
    const ringScale = pull.interpolate({
      inputRange: [0, commit],
      outputRange: [0.6 + index * 0.08, 1 + index * 0.18],
      extrapolate: 'clamp',
    });
    return { size, ringScale, index };
  });

  // The container is centred on the group. Its centre starts half a core
  // outside the screen edge, so it is hidden at rest.
  const container = RIPPLE_AREA;
  const containerEdge = -(CORE_SIZE + container) / 2;
  // Centres a layer of the given size inside the container.
  const centred = (size: number) => ({
    position: 'absolute' as const,
    width: size,
    height: size,
    borderRadius: size / 2,
    left: (container - size) / 2,
    top: (container - size) / 2,
  });
  // The icon sits in the visible, inward part of the core.
  const iconLeft = container / 2 + inward * CORE_SIZE * 0.2 - ICON_SIZE / 2;
  const iconTop = container / 2 - ICON_SIZE / 2;

  return (
    <Animated.View
      pointerEvents="none"
      className="absolute"
      style={{
        width: container,
        height: container,
        top: '50%',
        marginTop: -container / 2,
        [side]: containerEdge,
        opacity,
        transform: [{ translateX: slide }, { scale: grow }],
      }}
    >
      {ripples.map(({ size, ringScale, index }) => (
        <Animated.View
          key={index}
          style={[
            styles.ring,
            centred(size),
            {
              opacity: ripplesVisible.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 0.85 - index * 0.2],
              }),
              transform: [{ scale: ringScale }],
            },
          ]}
        />
      ))}
      {/* The warm core, which blooms in once armed. */}
      <Animated.View
        style={[
          styles.core,
          centred(CORE_SIZE),
          { opacity: armed, transform: [{ scale: coreScale }] },
        ]}
      />
      {/* The back icon, which appears with the core. */}
      <Animated.View
        pointerEvents="none"
        style={{
          position: 'absolute',
          left: iconLeft,
          top: iconTop,
          width: ICON_SIZE,
          height: ICON_SIZE,
          alignItems: 'center',
          justifyContent: 'center',
          opacity: armed,
          // The left edge's arrow is mirrored, so it points the way the finger moves.
          transform: [
            { scaleX: side === 'left' ? -1 : 1 },
            { scale: coreScale },
          ],
        }}
      >
        <Ionicons name="arrow-back" size={ICON_SIZE} color={ICON_COLOR} />
      </Animated.View>
    </Animated.View>
  );
}

// Swipe back from either screen edge, only when the stack can go back. The
// screen stays still; ripples spread out of the edge while you pull, and a warm
// core with an icon blooms once the swipe is far enough. Release past the
// threshold to go back; otherwise the ripples sink back into the edge.
export function BackSwipe({ children }: { children: ReactNode }) {
  const { width } = useWindowDimensions();
  const { back, canGoBack } = useNavigator();
  // How far each edge has been pulled, in points. 0 = at rest.
  const [pull] = useState(() => ({
    left: new Animated.Value(0),
    right: new Animated.Value(0),
  }));

  const relax = (value: Animated.Value) => {
    Animated.spring(value, {
      toValue: 0,
      useNativeDriver: true,
      bounciness: 4,
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
          // The ripples swell, then the screen changes. The value is reset right
          // after, so the new screen starts without them.
          Animated.timing(value, {
            toValue: width * COMMIT_FRACTION * 1.2,
            duration: 120,
            useNativeDriver: true,
          }).start(({ finished }) => {
            if (finished) {
              back();
              value.setValue(0);
            }
          });
        } else {
          relax(value);
        }
      },
      onPanResponderTerminate: () => relax(value),
    }).panHandlers;
  };

  return (
    <View className="flex-1">
      {children}

      <EdgeRipples side="left" pull={pull.left} width={width} />
      <EdgeRipples side="right" pull={pull.right} width={width} />

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
  ring: {
    position: 'absolute',
    borderWidth: 2.5,
    borderColor: 'rgba(255, 255, 255, 0.9)',
  },
  core: {
    position: 'absolute',
    backgroundColor: ACCENT,
    shadowColor: '#000000',
    shadowOpacity: 0.2,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
});
