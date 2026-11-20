import { Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { BaseScreen } from '../screens/BaseScreen';
import { useNavigator } from '../navigation/hooks';
import type { ScreenName } from '../navigation/registry';
import { Group, Heading, type IconName } from './ui';

type DemoItem = {
  screen: ScreenName;
  icon: IconName;
  title: string;
  description: string;
  // True when the demo needs a real iPhone and does not work in the Simulator.
  needsPhone?: boolean;
};

// The demos, grouped. Each one is a screen in the demo flow.
const sections: { title: string; items: DemoItem[] }[] = [
  {
    title: 'Phone',
    items: [
      {
        screen: 'demo.device',
        icon: 'phone-portrait',
        title: 'Device',
        description: 'Screen size, device name, app state, colour scheme.',
      },
      {
        screen: 'demo.reload',
        icon: 'refresh',
        title: 'Reload',
        description: 'Start the app again from its first screen.',
      },
      {
        screen: 'demo.links',
        icon: 'globe',
        title: 'Links & settings',
        description: 'Open web pages, email, phone and the app settings.',
      },
    ],
  },
  {
    title: 'Input & feedback',
    items: [
      {
        screen: 'demo.keyboard',
        icon: 'keypad',
        title: 'Keyboard',
        description: 'Keyboard types, return key, password fields.',
      },
      {
        screen: 'demo.haptics',
        needsPhone: true,
        icon: 'pulse',
        title: 'Haptics & vibration',
        description: 'Taps and buzzes for feedback.',
      },
      {
        screen: 'demo.alerts',
        icon: 'chatbubble-ellipses',
        title: 'Alerts & loading',
        description: 'Messages, spinners and pull to refresh.',
      },
    ],
  },
  {
    title: 'Features',
    items: [
      {
        screen: 'demo.security',
        needsPhone: true,
        icon: 'finger-print',
        title: 'Security',
        description: 'Face ID, Touch ID or PIN before an action.',
      },
      {
        screen: 'demo.notifications',
        icon: 'notifications',
        title: 'Notifications',
        description: 'Send one now or schedule it for a time of day.',
      },
      {
        screen: 'demo.camera',
        needsPhone: true,
        icon: 'camera',
        title: 'Camera & photos',
        description: 'Take or pick a photo, and save it to your Photos app.',
      },
      {
        screen: 'demo.share',
        icon: 'share-social',
        title: 'Copy & share',
        description: 'Copy text to the clipboard or open the share sheet.',
      },
      {
        screen: 'demo.scan',
        needsPhone: true,
        icon: 'scan',
        title: 'Scan QR code',
        description: 'Scan codes. Document codes become a PDF.',
      },
      {
        screen: 'demo.createQr',
        icon: 'qr-code',
        title: 'Create QR code',
        description: 'Make a QR code from text, links or documents.',
      },
    ],
  },
];

// The first screen of the demo flow: every demo, in sections.
export function DemoMenu() {
  const { toScreen } = useNavigator();

  return (
    <BaseScreen>
      <View className="flex-1 gap-8">
        <Heading>Demo</Heading>
        {sections.map((section) => (
          <Group key={section.title} title={section.title}>
            <View className="overflow-hidden rounded-2xl bg-neutral-100">
              {section.items.map((item, index) => (
                <Pressable
                  key={item.screen}
                  accessibilityRole="button"
                  accessibilityLabel={item.title}
                  onPress={() => toScreen(item.screen)}
                  className={`flex-row items-center gap-3 px-4 py-3.5 active:bg-neutral-200 ${index > 0 ? 'border-t border-neutral-200' : ''}`}
                >
                  <View className="h-10 w-10 items-center justify-center rounded-xl bg-white">
                    <Ionicons name={item.icon} size={20} color="#171717" />
                  </View>
                  <View className="flex-1">
                    <View className="flex-row items-center gap-2">
                      <Text className="text-base font-semibold text-neutral-900">
                        {item.title}
                      </Text>
                      {item.needsPhone && (
                        <Text className="rounded-md bg-neutral-200 px-1.5 py-0.5 text-[10px] font-semibold text-neutral-600">
                          Needs iPhone
                        </Text>
                      )}
                    </View>
                    <Text className="text-xs text-neutral-500">
                      {item.description}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color="#A3A3A3" />
                </Pressable>
              ))}
            </View>
          </Group>
        ))}
      </View>
    </BaseScreen>
  );
}
