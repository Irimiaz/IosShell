import type { ComponentProps, ReactNode } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Shared look of the demo screens. Delete this folder together with the demo.

// The style of every text box on the demo screens.
export const inputClass = 'rounded-xl bg-white px-3 py-3 text-base text-black';

export type IconName = ComponentProps<typeof Ionicons>['name'];

// The title at the top of a screen.
export function Heading({ children }: { children: ReactNode }) {
  return (
    <Text className="text-center text-2xl font-bold text-white">
      {children}
    </Text>
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
  action: ReactNode;
  children?: ReactNode;
}) {
  return (
    <View className="gap-3 rounded-2xl bg-white/10 p-4">
      <View className="flex-row items-center gap-2">
        <Ionicons name={icon} size={20} color="#FFFFFF" />
        <Text className="text-lg font-bold text-white">{title}</Text>
      </View>
      <Text className="text-sm leading-5 text-white/80">{description}</Text>
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
      className={`items-center rounded-xl py-3 active:opacity-80 ${solid ? 'bg-white' : 'bg-white/20'}`}
    >
      <Text
        className={`text-base font-semibold ${solid ? 'text-black' : 'text-white'}`}
      >
        {title}
      </Text>
    </Pressable>
  );
}

export function Label({ children }: { children: ReactNode }) {
  return <Text className="text-sm text-white/80">{children}</Text>;
}
