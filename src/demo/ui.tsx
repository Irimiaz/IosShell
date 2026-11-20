import type { ComponentProps, ReactNode } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Shared look of the demo screens. Delete this folder together with the demo.

// The style of every text box on the demo screens.
export const inputClass =
  'rounded-xl border border-neutral-300 bg-white px-3 py-3 text-base text-neutral-900';

export type IconName = ComponentProps<typeof Ionicons>['name'];

// The title at the top of a screen.
export function Heading({ children }: { children: ReactNode }) {
  return (
    <Text className="text-center text-2xl font-bold text-neutral-900">
      {children}
    </Text>
  );
}

// A titled set of cards.
export function Group({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <View className="gap-3">
      <Text className="px-1 text-xs font-semibold uppercase tracking-widest text-neutral-500">
        {title}
      </Text>
      {children}
    </View>
  );
}

// One feature: an icon and title, a line explaining it, its button, and any extra content.
export function Card({
  icon,
  title,
  description,
  action,
  children,
}: {
  icon: IconName;
  title: string;
  description: string;
  action?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <View className="gap-3 rounded-2xl bg-neutral-100 p-4">
      <View className="flex-row items-center gap-2">
        <Ionicons name={icon} size={20} color="#171717" />
        <Text className="text-lg font-bold text-neutral-900">{title}</Text>
      </View>
      <Text className="text-sm leading-5 text-neutral-600">{description}</Text>
      {action}
      {children}
    </View>
  );
}

// The main button style. `outline` is a quieter version for toggles.
export function ActionButton({
  title,
  onPress,
  variant = 'solid',
}: {
  title: string;
  onPress: () => void;
  variant?: 'solid' | 'outline';
}) {
  const solid = variant === 'solid';
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      className={`items-center rounded-xl py-3 active:opacity-80 ${solid ? 'bg-neutral-900' : 'border border-neutral-300 bg-white'}`}
    >
      <Text
        className={`text-base font-semibold ${solid ? 'text-white' : 'text-neutral-900'}`}
      >
        {title}
      </Text>
    </Pressable>
  );
}

export function Label({ children }: { children: ReactNode }) {
  return <Text className="text-sm text-neutral-600">{children}</Text>;
}

// A label and its value, one under the other.
export function Row({ label, value }: { label: string; value: string }) {
  return (
    <View className="gap-0.5">
      <Text className="text-xs text-neutral-500">{label}</Text>
      <Text selectable className="text-base text-neutral-900">
        {value}
      </Text>
    </View>
  );
}
