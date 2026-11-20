import { View } from 'react-native';

import { BaseScreen } from '../screens/BaseScreen';
import { useNavigator } from '../navigation/hooks';
import type { ScreenName } from '../navigation/registry';
import { ActionButton, Card, Heading, type IconName } from './ui';

// The demos. Each one is a screen in the demo flow.
const demos: {
  screen: ScreenName;
  icon: IconName;
  title: string;
  description: string;
}[] = [
  {
    screen: 'demo.security',
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
];

// The first screen of the demo flow: a list of every demo.
export function DemoMenu() {
  const { toScreen } = useNavigator();

  return (
    <BaseScreen>
      <View className="flex-1 gap-4">
        <Heading>Demo</Heading>
        {demos.map((demo) => (
          <Card
            key={demo.screen}
            icon={demo.icon}
            title={demo.title}
            description={demo.description}
            action={
              <ActionButton
                title="Open"
                onPress={() => toScreen(demo.screen)}
              />
            }
          />
        ))}
      </View>
    </BaseScreen>
  );
}
