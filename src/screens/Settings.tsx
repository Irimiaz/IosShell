import { type ReactNode, useState } from 'react';
import { Alert, Button, Image, Text, TextInput, View } from 'react-native';

import {
  downloadFile,
  openCamera,
  pickPhotoFromGallery,
  saveToPhotos,
} from '../device/photos';
import { scanQrCode } from '../device/scanner';
import { copyText, shareContent } from '../device/text';
import { requireBiometry } from '../security/deviceSecurity';
import { BaseScreen } from './BaseScreen';

// Used by the download button when no photo has been added yet.
const SAMPLE_PHOTO_URL = 'https://picsum.photos/800/600';

export function Settings() {
  const [photoUri, setPhotoUri] = useState<string | undefined>();
  const [text, setText] = useState('Hello from IosShell');

  // Shows the outcome of a photo action, or its reason when it failed.
  const handle = (
    result: { ok: true; uri: string } | { ok: false; reason: string },
  ) => {
    if (result.ok) {
      setPhotoUri(result.uri);
    } else {
      Alert.alert('Not done', result.reason);
    }
  };

  return (
    <BaseScreen>
      <View className="flex-1 gap-6">
        {/* Biometry */}
        <Section
          button={
            <Button
              title="Run secured action"
              onPress={() =>
                requireBiometry(
                  () => Alert.alert('Done', 'Face ID / Touch ID confirmed.'),
                  (reason) =>
                    Alert.alert(
                      'Not confirmed',
                      `Authentication failed: ${reason}`,
                    ),
                )
              }
            />
          }
          description="Checks biometry (Face ID or Touch ID) before running the action. If biometry is not set up, it asks for the phone's PIN or passcode."
        />

        {/* Camera */}
        <Section
          button={
            <Button
              title="Open camera"
              onPress={async () => handle(await openCamera())}
            />
          }
          description="Opens the phone's camera app. The photo you take becomes the current photo."
        />

        {/* Add image */}
        <Section
          button={
            <View className="gap-3">
              <Button
                title="Add image from gallery"
                onPress={async () => handle(await pickPhotoFromGallery())}
              />
            </View>
          }
          description="Adds an image to the screen. Use the camera app to take a new one, or pick one from the photo gallery."
        >
          {photoUri && (
            <Image
              source={{ uri: photoUri }}
              className="h-56 w-full rounded-xl"
              resizeMode="cover"
            />
          )}
        </Section>

        {/* Scan QR code */}
        <Section
          button={
            <Button
              title="Scan QR code"
              onPress={() =>
                scanQrCode((result) => {
                  if (result.ok) {
                    setText(result.data);
                    Alert.alert('QR code scanned', result.data);
                  } else {
                    Alert.alert('Not scanned', result.reason);
                  }
                })
              }
            />
          }
          description="Opens the scanner. The code's content is put in the text box below, where you can copy or share it."
        />

        {/* Download */}
        <Section
          button={
            <Button
              title="Download photo"
              onPress={async () => {
                const downloaded = photoUri
                  ? { ok: true as const, uri: photoUri }
                  : await downloadFile(SAMPLE_PHOTO_URL);
                if (!downloaded.ok) return handle(downloaded);
                const saved = await saveToPhotos(downloaded.uri);
                if (saved.ok) {
                  Alert.alert('Saved', 'The photo is in your Photos app.');
                } else {
                  Alert.alert('Not saved', saved.reason);
                }
              }}
            />
          }
          description="Saves the current photo to your Photos app. If there is no photo yet, a sample photo is downloaded and saved."
        />

        {/* Copy */}
        <Section
          button={
            <Button
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
          description="Copies the text below to the clipboard, so you can paste it in another app."
        >
          <TextInput
            value={text}
            onChangeText={setText}
            multiline
            placeholder="Type something to copy"
            placeholderTextColor="#888"
            className="rounded-xl border border-black/20 bg-white p-3 text-black dark:border-white/30"
          />
        </Section>

        {/* Share */}
        <Section
          button={
            <Button
              title="Share"
              onPress={async () => {
                const shared = await shareContent(text, photoUri);
                if (!shared) {
                  Alert.alert(
                    'Not shared',
                    'Sharing is not available on this phone.',
                  );
                }
              }}
            />
          }
          description="Opens the share sheet. Shares the current photo if there is one, otherwise the text above."
        />

        {/* <Text className="text-center text-2xl font-bold text-black dark:text-white">
          Settings
        </Text> */}
      </View>
    </BaseScreen>
  );
}

// One feature: its button, then a line explaining what it does, then any extra content.
function Section({
  button,
  description,
  children,
}: {
  button: ReactNode;
  description: string;
  children?: ReactNode;
}) {
  return (
    <View className="gap-3">
      {button}
      <Text className="text-base text-white">{description}</Text>
      {children}
    </View>
  );
}
