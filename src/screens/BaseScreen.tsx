import type { ReactNode } from 'react';
import { useEffect, useRef, useState } from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
  ScrollView,
  type ScrollViewInstance,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
// Internal React Native module: finds the text input that has focus.
// If a React Native upgrade breaks this import, check this file first.
import TextInputState from 'react-native/Libraries/Components/TextInput/TextInputState';

// Space kept between a focused field and the top of the keyboard.
const FIELD_MARGIN = 16;

// Wrapper for every screen. It only takes children; the layout is the same
// for all screens and is changed here.
//
// - Scrolls only when the content is taller than the screen.
// - Keyboard avoiding is on, and tapping empty space closes the keyboard.
//   When the keyboard opens, the screen scrolls only if the focused field is hidden.
// - Content is kept clear of the notch, status bar and home indicator.
// - Background is white and fills the whole screen.
// - Pull to refresh is off by default. With `pullToRefresh`, pulling down runs
//   `onRefresh`, which should re-run the screen's requests. The spinner stops
//   when `onRefresh` finishes (or fails).
export function BaseScreen({
  children,
  pullToRefresh = false,
  onRefresh,
}: {
  children: ReactNode;
  pullToRefresh?: boolean;
  onRefresh?: () => void | Promise<void>;
}) {
  const insets = useSafeAreaInsets();
  const [refreshing, setRefreshing] = useState(false);
  const scrollRef = useRef<ScrollViewInstance>(null);
  const scrollOffset = useRef(0);

  async function refresh() {
    setRefreshing(true);
    try {
      await onRefresh?.();
    } finally {
      setRefreshing(false);
    }
  }

  // When the keyboard opens, scroll only if the focused field is under it.
  useEffect(() => {
    const subscription = Keyboard.addListener('keyboardDidShow', (event) => {
      const field = TextInputState.currentlyFocusedInput();
      if (!field) return;
      const keyboardTop = event.endCoordinates.screenY;
      field.measureInWindow((_x, y, _width, height) => {
        const overlap = y + height + FIELD_MARGIN - keyboardTop;
        if (overlap > 0) {
          scrollRef.current?.scrollTo({
            y: scrollOffset.current + overlap,
            animated: true,
          });
        }
      });
    });
    return () => subscription.remove();
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          ref={scrollRef}
          onScroll={(event) => {
            scrollOffset.current = event.nativeEvent.contentOffset.y;
          }}
          scrollEventThrottle={16}
          style={{ flex: 1, backgroundColor: '#FFFFFF' }}
          // Safe-area padding only. The spacing for content is set on the
          // inner View below, so the two don't override each other.
          contentContainerStyle={[
            { flexGrow: 1 },
            {
              paddingTop: insets.top,
              paddingBottom: insets.bottom,
              paddingLeft: insets.left,
              paddingRight: insets.right,
            },
          ]}
          // No overscroll: the content stops at its top and bottom limits.
          // Pull to refresh needs the bounce on iOS, so it is turned on only then.
          bounces={pullToRefresh}
          // Hide the scroll bar; the content still scrolls.
          showsVerticalScrollIndicator={false}
          // Without bounce, a scroll view whose content fits doesn't move.
          alwaysBounceVertical={pullToRefresh}
          refreshControl={
            pullToRefresh ? (
              <RefreshControl
                refreshing={refreshing}
                onRefresh={refresh}
                tintColor="#171717"
              />
            ) : undefined
          }
          // Automatic inset would double the padding above.
          contentInsetAdjustmentBehavior="never"
          // Taps on buttons still work; a tap on empty space closes the keyboard.
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        >
          <View style={{ flexGrow: 1 }} className="px-4 py-4">
            {children}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
