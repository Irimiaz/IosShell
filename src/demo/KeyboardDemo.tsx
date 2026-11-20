import { useEffect, useState } from 'react';
import {
  Keyboard,
  type KeyboardTypeOptions,
  TextInput,
  View,
} from 'react-native';

import { BaseScreen } from '../screens/BaseScreen';
import {
  ActionButton,
  Card,
  Group,
  Heading,
  inputClass,
  Label,
  Row,
} from './ui';

// One field per keyboard type, so you can see each keyboard.
const keyboards: {
  label: string;
  keyboardType: KeyboardTypeOptions;
  autoCapitalize: 'none' | 'sentences';
}[] = [
  { label: 'Default', keyboardType: 'default', autoCapitalize: 'sentences' },
  { label: 'Email', keyboardType: 'email-address', autoCapitalize: 'none' },
  { label: 'URL', keyboardType: 'url', autoCapitalize: 'none' },
  { label: 'Number', keyboardType: 'number-pad', autoCapitalize: 'none' },
  { label: 'Decimal', keyboardType: 'decimal-pad', autoCapitalize: 'none' },
  { label: 'Phone', keyboardType: 'phone-pad', autoCapitalize: 'none' },
];

export function KeyboardDemo() {
  const [open, setOpen] = useState(false);
  const [height, setHeight] = useState(0);

  // Listens to the keyboard showing and hiding, and reads its height.
  useEffect(() => {
    const show = Keyboard.addListener('keyboardDidShow', (event) => {
      setOpen(true);
      setHeight(Math.round(event.endCoordinates.height));
    });
    const hide = Keyboard.addListener('keyboardDidHide', () => {
      setOpen(false);
    });
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  return (
    <BaseScreen>
      <View className="flex-1 gap-8">
        <Heading>Keyboard</Heading>

        <Group title="Keyboard state">
          <Card
            icon="keypad"
            title="Live state"
            description="Shows whether the keyboard is open and how tall it is. Tapping empty space also closes it."
            action={
              <ActionButton
                title="Close keyboard"
                onPress={() => Keyboard.dismiss()}
              />
            }
          >
            <Row label="Open" value={open ? 'yes' : 'no'} />
            <Row label="Height" value={open ? `${height} pt` : '—'} />
          </Card>
        </Group>

        <Group title="Keyboard types">
          <Card
            icon="text"
            title="Keyboard types"
            description="Each field opens a different keyboard. The screen moves up so the field you tap stays visible."
          >
            {keyboards.map((item) => (
              <View key={item.label} className="gap-1.5">
                <Label>{item.label}</Label>
                <TextInput
                  keyboardType={item.keyboardType}
                  autoCapitalize={item.autoCapitalize}
                  autoCorrect={false}
                  placeholder={item.label}
                  placeholderTextColor="#888"
                  className={inputClass}
                />
              </View>
            ))}
          </Card>
        </Group>

        <Group title="Return key">
          <Card
            icon="return-down-back"
            title="Return key and secure text"
            description="The return key here says Done and closes the keyboard. The password field hides what you type."
          >
            <View className="gap-1.5">
              <Label>Text</Label>
              <TextInput
                returnKeyType="done"
                onSubmitEditing={() => Keyboard.dismiss()}
                placeholder="Press Done"
                placeholderTextColor="#888"
                className={inputClass}
              />
            </View>
            <View className="gap-1.5">
              <Label>Password</Label>
              <TextInput
                secureTextEntry
                autoCapitalize="none"
                placeholder="Hidden"
                placeholderTextColor="#888"
                className={inputClass}
              />
            </View>
          </Card>
        </Group>
      </View>
    </BaseScreen>
  );
}
