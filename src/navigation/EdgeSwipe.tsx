import { PanResponder, View } from 'react-native';

// How far the finger must travel for a swipe to count.
const SWIPE_DISTANCE = 50;
// How far it must move before the swipe is picked up (so taps still work).
const START_DISTANCE = 10;

type Direction = 'left' | 'right';

// Gesture handlers for a swipe in `direction`. Attach them to a View with
// {...swipeHandlers(...)}. `canStart` is checked when a swipe begins and again
// on release; `onSwipe` runs when the swipe is long enough.
export function swipeHandlers({
  direction,
  canStart,
  onSwipe,
}: {
  direction: Direction;
  canStart: () => boolean;
  onSwipe: () => void;
}) {
  // Positive when the finger moves in the swipe direction.
  const along = (dx: number) => (direction === 'right' ? dx : -dx);

  return PanResponder.create({
    onMoveShouldSetPanResponder: (_, g) =>
      along(g.dx) > START_DISTANCE &&
      Math.abs(g.dy) < Math.abs(g.dx) &&
      canStart(),
    onPanResponderRelease: (_, g) => {
      if (along(g.dx) > SWIPE_DISTANCE && canStart()) onSwipe();
    },
  }).panHandlers;
}

const EDGE_WIDTH = 16;

// A thin strip along one screen edge. A swipe inward from that edge calls
// onSwipe when canStart() is true. The strip is narrow so it doesn't cover
// the buttons at the edge.
export function EdgeSwipe({
  side,
  canStart,
  onSwipe,
}: {
  side: 'left' | 'right';
  canStart: () => boolean;
  onSwipe: () => void;
}) {
  // A swipe from the left edge moves right; from the right edge, left.
  const handlers = swipeHandlers({
    direction: side === 'left' ? 'right' : 'left',
    canStart,
    onSwipe,
  });

  return (
    <View
      {...handlers}
      pointerEvents="box-only"
      className={`absolute bottom-0 top-0 ${side === 'left' ? 'left-0' : 'right-0'}`}
      style={{ width: EDGE_WIDTH }}
    />
  );
}
