import { Alert, DevSettings, View } from 'react-native';

import { BaseScreen } from '../screens/BaseScreen';
import { ActionButton, Card, Heading } from './ui';

export function ReloadDemo() {
  const reload = () =>
    Alert.alert(
      'Reload the app?',
      'Anything typed on screen is lost. The app starts again from the first screen.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reload',
          style: 'destructive',
          onPress: () => DevSettings.reload(),
        },
      ],
    );

  return (
    <BaseScreen>
      <View className="flex-1 gap-8">
        <Heading>Reload</Heading>

        <Card
          icon="refresh"
          title="Reload the app"
          description="Reloads the JavaScript and starts the app again from its first screen. Anything in memory is lost. In development it is the same as shaking the phone and choosing Reload."
          action={<ActionButton title="Reload now" onPress={reload} />}
        />
      </View>
    </BaseScreen>
  );
}
