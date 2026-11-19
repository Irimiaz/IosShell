import { useState } from 'react';
import { PanResponder, View } from 'react-native';

import { navigationRef } from './navigationRef';

// Width of the touch strip on each edge. Kept at 16pt so it doesn't cover the
// floating menu button or the bottom bar's padding.
const EDGE_WIDTH = 16;
// How far the finger must travel to trigger the back action.
const SWIPE_DISTANCE = 50;

function canGoBackNow() {
  return navigationRef.isReady() && navigationRef.canGoBack();
}

// A strip along one screen edge that goes back on an iOS-style swipe inward
// from that edge. It only takes the gesture when the stack can go back, so
// on the first screen the swipe does nothing.
export function EdgeBackGesture({ side }: { side: 'left' | 'right' }) {
  const [responder] = useState(() =>
    PanResponder.create({
      // Left edge: swipe right. Right edge: swipe left. Mostly horizontal only.
      onMoveShouldSetPanResponder: (_, g) => {
        const inward = side === 'left' ? g.dx > 10 : g.dx < -10;
        return inward && Math.abs(g.dy) < Math.abs(g.dx) && canGoBackNow();
      },
      onPanResponderRelease: (_, g) => {
        const far =
          side === 'left' ? g.dx > SWIPE_DISTANCE : g.dx < -SWIPE_DISTANCE;
        if (far && canGoBackNow()) navigationRef.goBack();
      },
    }),
  );

  return (
    <View
      {...responder.panHandlers}
      pointerEvents="box-only"
      className={`absolute bottom-0 top-0 ${side === 'left' ? 'left-0' : 'right-0'}`}
      style={{ width: EDGE_WIDTH }}
    />
  );
}
