import { useState } from 'react';
import { Alert, TextInput, View } from 'react-native';

import {
  nextOccurrence,
  parseTimeOfDay,
  scheduleNotification,
  sendNotificationNow,
} from '../device/notifications';
import { BaseScreen } from '../screens/BaseScreen';
import { ActionButton, Card, Heading, inputClass, Label } from './ui';

export function NotificationsDemo() {
  // The text shown, and the time (HH:mm) for a scheduled one.
  const [title, setTitle] = useState('IosShell');
  const [body, setBody] = useState('Hello from IosShell');
  const [time, setTime] = useState('');

  return (
    <BaseScreen>
      <View className="flex-1 gap-8">
        <Heading>Notifications</Heading>

        <Card
          icon="notifications"
          title="Send now"
          description="Shows a notification on this phone straight away. No phone number is needed."
          action={
            <ActionButton
              title="Send notification"
              onPress={async () => {
                const sent = await sendNotificationNow(title, body);
                if (!sent.ok) {
                  Alert.alert('Not sent', sent.reason);
                }
              }}
            />
          }
        >
          <View className="gap-3">
            <View className="gap-1.5">
              <Label>Title</Label>
              <TextInput
                value={title}
                onChangeText={setTitle}
                placeholder="Notification title"
                placeholderTextColor="#888"
                className={inputClass}
              />
            </View>
            <View className="gap-1.5">
              <Label>Text</Label>
              <TextInput
                value={body}
                onChangeText={setBody}
                multiline
                placeholder="Notification text"
                placeholderTextColor="#888"
                className={`min-h-16 ${inputClass}`}
                textAlignVertical="top"
              />
            </View>
          </View>
        </Card>

        <Card
          icon="time"
          title="Schedule"
          description="Shows the notification at the time you type, as HH:mm (24-hour clock). If that time has already passed today, it is shown tomorrow."
          action={
            <ActionButton
              title="Schedule notification"
              onPress={async () => {
                const parsed = parseTimeOfDay(time);
                if (!parsed) {
                  Alert.alert(
                    'Not scheduled',
                    'Type the time as HH:mm, for example 14:30.',
                  );
                  return;
                }
                const when = nextOccurrence(parsed.hour, parsed.minute);
                const scheduled = await scheduleNotification(title, body, when);
                if (scheduled.ok) {
                  Alert.alert(
                    'Scheduled',
                    `The notification will show at ${when.toLocaleString()}.`,
                  );
                } else {
                  Alert.alert('Not scheduled', scheduled.reason);
                }
              }}
            />
          }
        >
          <View className="gap-1.5">
            <Label>Time (HH:mm)</Label>
            <TextInput
              value={time}
              onChangeText={setTime}
              autoCapitalize="none"
              placeholder="14:30"
              placeholderTextColor="#888"
              keyboardType="numbers-and-punctuation"
              className={inputClass}
            />
          </View>
        </Card>
      </View>
    </BaseScreen>
  );
}
