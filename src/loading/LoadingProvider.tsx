import type { ReactNode } from 'react';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { ActivityIndicator, Animated, StyleSheet, View } from 'react-native';

// Fade time for the overlay, in milliseconds.
const FADE_MS = 200;
// Grey, see-through layer over the whole screen.
const OVERLAY_COLOR = 'rgba(115, 115, 115, 0.5)';
// How much bigger the system spinner is drawn than its default size.
const SPINNER_SCALE = 1.2;

// The system spinner, dark and enlarged, drawn straight on the grey overlay.
function Spinner() {
  return (
    <View style={{ transform: [{ scale: SPINNER_SCALE }] }}>
      <ActivityIndicator size="large" color="#171717" />
    </View>
  );
}

export type LoadingApi = {
  // Turn the loading overlay on. Every show() needs a matching hide().
  show: () => void;
  // Turn the overlay off once no show() is still waiting for its hide().
  hide: () => void;
  // Show the overlay while `task` runs, then hide it (even if the task fails).
  // Returns the task's result.
  withLoading: <T>(task: Promise<T> | (() => Promise<T>)) => Promise<T>;
};

const LoadingContext = createContext<LoadingApi | null>(null);

// Wraps the whole app, above the navigation, so the overlay covers every screen,
// the top bar and the bottom bar. Calls are counted, so overlapping loads keep
// the overlay up until the last one finishes.
export function LoadingProvider({ children }: { children: ReactNode }) {
  const pending = useRef(0);
  const [busy, setBusy] = useState(false);
  const [opacity] = useState(() => new Animated.Value(0));
  // The card grows slightly as the overlay fades in.
  const [cardScale] = useState(() =>
    opacity.interpolate({ inputRange: [0, 1], outputRange: [0.9, 1] }),
  );

  const show = useCallback(() => {
    pending.current += 1;
    setBusy(true);
  }, []);

  const hide = useCallback(() => {
    pending.current = Math.max(0, pending.current - 1);
    if (pending.current === 0) setBusy(false);
  }, []);

  const withLoading = useCallback(
    async <T,>(task: Promise<T> | (() => Promise<T>)): Promise<T> => {
      show();
      try {
        return await (typeof task === 'function' ? task() : task);
      } finally {
        hide();
      }
    },
    [show, hide],
  );

  const api = useMemo<LoadingApi>(
    () => ({ show, hide, withLoading }),
    [show, hide, withLoading],
  );

  // Fade the overlay in or out.
  useEffect(() => {
    Animated.timing(opacity, {
      toValue: busy ? 1 : 0,
      duration: FADE_MS,
      useNativeDriver: true,
    }).start();
  }, [busy, opacity]);

  return (
    <LoadingContext.Provider value={api}>
      <View style={styles.fill}>
        {children}

        {/* Covers the whole screen. It takes touches only while loading, so the
            screen underneath can't be used until the load finishes. */}
        <Animated.View
          pointerEvents={busy ? 'auto' : 'none'}
          accessibilityLabel="Loading"
          accessibilityLiveRegion="polite"
          style={[styles.overlay, { opacity }]}
        >
          <Animated.View
            style={[
              styles.card,
              {
                transform: [{ scale: cardScale }],
              },
            ]}
          >
            <Spinner />
          </Animated.View>
        </Animated.View>
      </View>
    </LoadingContext.Provider>
  );
}

// Use from any screen or component:
//   const { show, hide, withLoading } = useLoading();
//   await withLoading(fetchSomething());
export function useLoading(): LoadingApi {
  const api = useContext(LoadingContext);
  if (!api) {
    throw new Error('useLoading must be used inside <LoadingProvider>.');
  }
  return api;
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: OVERLAY_COLOR,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
