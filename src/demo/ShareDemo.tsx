import { useState } from 'react';
import { Alert, TextInput, View } from 'react-native';

import { copyText, shareContent } from '../device/text';
import { BaseScreen } from '../screens/BaseScreen';
import { ActionButton, Card, Heading, inputClass } from './ui';

export function ShareDemo() {
  const [text, setText] = useState('Hello from IosShell');

  return (
    <BaseScreen>
      <View className="flex-1 gap-8">
        <Heading>Copy & share</Heading>

        <Card
          icon="copy"
          title="Copy"
          description="Copies the text below to the clipboard, so you can paste it in another app."
          action={
            <ActionButton
              title="Copy text"
              onPress={async () => {
                const copied = await copyText(text);
                Alert.alert(
                  copied ? 'Copied' : 'Not copied',
                  copied
                    ? 'The text is on the clipboard.'
                    : 'The text could not be copied.',
                );
              }}
            />
          }
        >
          <TextInput
            value={text}
            onChangeText={setText}
            multiline
            placeholder="Type something to copy"
            placeholderTextColor="#888"
            className={`min-h-16 ${inputClass}`}
            textAlignVertical="top"
          />
        </Card>

        <Card
          icon="share-social"
          title="Share"
          description="Opens the share sheet with the text below."
          action={
            <ActionButton
              title="Share text"
              onPress={async () => {
                const shared = await shareContent(text);
                if (!shared) {
                  Alert.alert(
                    'Not shared',
                    'Sharing is not available on this phone.',
                  );
                }
              }}
            />
          }
        />
      </View>
    </BaseScreen>
  );
}
