import { Alert, Linking, View } from 'react-native';

import { BaseScreen } from '../screens/BaseScreen';
import { ActionButton, Card, Group, Heading } from './ui';

// Opens a link in the app that handles it. Shows an alert when nothing does.
async function open(url: string) {
  try {
    await Linking.openURL(url);
  } catch {
    Alert.alert('Not opened', `Nothing on this phone can open ${url}.`);
  }
}

export function LinksDemo() {
  return (
    <BaseScreen>
      <View className="flex-1 gap-8">
        <Heading>Links & settings</Heading>

        <Group title="Open links">
          <Card
            icon="globe"
            title="Web page"
            description="Opens a web page in Safari."
            action={
              <ActionButton
                title="Open example.com"
                onPress={() => open('https://example.com')}
              />
            }
          />

          <Card
            icon="mail"
            title="Email"
            description="Opens a new email in the Mail app."
            action={
              <ActionButton
                title="Write an email"
                onPress={() => open('mailto:hello@example.com')}
              />
            }
          />

          <Card
            icon="call"
            title="Phone"
            description="Opens the phone app with a number. Use a real number to call it; this one is an example."
            action={
              <ActionButton
                title="Call an example number"
                onPress={() => open('tel:+10000000000')}
              />
            }
          />
        </Group>

        <Group title="Settings">
          <Card
            icon="settings"
            title="App settings"
            description="Opens this app's page in the iPhone Settings, where you can change its permissions."
            action={
              <ActionButton
                title="Open Settings"
                onPress={() => Linking.openSettings()}
              />
            }
          />
        </Group>
      </View>
    </BaseScreen>
  );
}
