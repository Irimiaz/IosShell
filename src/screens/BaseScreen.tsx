import type { ReactNode } from 'react';
import { useEffect, useRef } from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  type ScrollViewInstance,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Wrapper for every screen. It only takes children; the layout is the same
// for all screens and is changed here.
//
// - Scrolls only when the content is taller than the screen.
// - Keyboard avoiding is on, and tapping empty space closes the keyboard.
// - Content is kept clear of the notch, status bar and home indicator.
// - Background is beige (#F5F5DC) and fills the whole screen.
export function BaseScreen({ children }: { children: ReactNode }) {
  const insets = useSafeAreaInsets();
  const midRed = '#E53935';
  const darkRed = '#B71C1C';
  const scrollRef = useRef<ScrollViewInstance>(null);

  // When the keyboard opens, scroll to the end so content behind it can be reached.
  useEffect(() => {
    const subscription = Keyboard.addListener('keyboardDidShow', () => {
      scrollRef.current?.scrollToEnd({ animated: true });
    });
    return () => subscription.remove();
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: midRed }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          ref={scrollRef}
          style={{ flex: 1, backgroundColor: darkRed }}
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
          bounces={false}
          // Hide the scroll bar; the content still scrolls.
          showsVerticalScrollIndicator={false}
          // Without bounce, a scroll view whose content fits doesn't move.
          alwaysBounceVertical={false}
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
