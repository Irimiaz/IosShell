import { Children, type ReactNode } from 'react';
import * as Haptics from 'expo-haptics';
import { Vibration, View } from 'react-native';

import { BaseScreen } from '../screens/BaseScreen';
import { ActionButton, Card, Group, Heading } from './ui';

// Haptics need a real iPhone. The Simulator does nothing.
export function HapticsDemo() {
  return (
    <BaseScreen>
      <View className="flex-1 gap-8">
        <Heading>Haptics & vibration</Heading>

        <Group title="Haptics">
          <Card
            icon="pulse"
            title="Impact"
            description="A tap of light, medium or heavy strength."
          >
            <ButtonRow>
              <ActionButton
                title="Light"
                onPress={() =>
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                }
              />
              <ActionButton
                title="Medium"
                onPress={() =>
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
                }
              />
              <ActionButton
                title="Heavy"
                onPress={() =>
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy)
                }
              />
            </ButtonRow>
          </Card>

          <Card
            icon="checkmark-done"
            title="Notification"
            description="The pattern for a result: success, a warning or an error."
          >
            <ButtonRow>
              <ActionButton
                title="Success"
                onPress={() =>
                  Haptics.notificationAsync(
                    Haptics.NotificationFeedbackType.Success,
                  )
                }
              />
              <ActionButton
                title="Warning"
                onPress={() =>
                  Haptics.notificationAsync(
                    Haptics.NotificationFeedbackType.Warning,
                  )
                }
              />
              <ActionButton
                title="Error"
                onPress={() =>
                  Haptics.notificationAsync(
                    Haptics.NotificationFeedbackType.Error,
                  )
                }
              />
            </ButtonRow>
          </Card>

          <Card
            icon="options"
            title="Selection"
            description="A small tick, for example when a value changes in a picker."
            action={
              <ActionButton
                title="Tick"
                onPress={() => Haptics.selectionAsync()}
              />
            }
          />
        </Group>

        <Group title="Vibration">
          <Card
            icon="phone-portrait"
            title="Vibrate"
            description="A longer buzz of about 0.4 seconds. iPhones buzz once for each call."
            action={
              <ActionButton
                title="Vibrate"
                onPress={() => Vibration.vibrate(400)}
              />
            }
          />
        </Group>
      </View>
    </BaseScreen>
  );
}

// Lays buttons out side by side, each taking the same width.
function ButtonRow({ children }: { children: ReactNode }) {
  return (
    <View className="flex-row gap-2">
      {Children.map(children, (child) => (
        <View className="flex-1">{child}</View>
      ))}
    </View>
  );
}
