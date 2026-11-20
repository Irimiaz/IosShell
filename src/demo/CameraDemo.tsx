import { useState } from 'react';
import { Alert, Image, View } from 'react-native';

import {
  downloadFile,
  openCamera,
  pickPhotoFromGallery,
  saveToPhotos,
} from '../device/photos';
import { BaseScreen } from '../screens/BaseScreen';
import { ActionButton, Card, Heading } from './ui';

// Used by the download button when no photo has been added yet.
const SAMPLE_PHOTO_URL = 'https://picsum.photos/800/600';

export function CameraDemo() {
  const [photoUri, setPhotoUri] = useState<string | undefined>();

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
      <View className="flex-1 gap-8">
        <Heading>Camera & photos</Heading>

        <Card
          icon="camera"
          title="Camera"
          description="Opens the phone's camera app. The photo you take becomes the current photo."
          action={
            <ActionButton
              title="Open camera"
              onPress={async () => handle(await openCamera())}
            />
          }
        />

        <Card
          icon="images"
          title="Gallery"
          description="Adds an image to the screen from your photo gallery."
          action={
            <ActionButton
              title="Add image from gallery"
              onPress={async () => handle(await pickPhotoFromGallery())}
            />
          }
        >
          {photoUri && (
            <Image
              source={{ uri: photoUri }}
              className="h-56 w-full rounded-xl"
              resizeMode="cover"
            />
          )}
        </Card>

        <Card
          icon="download"
          title="Save to Photos"
          description="Saves the current photo to your Photos app. If there is no photo yet, a sample photo is downloaded and saved."
          action={
            <ActionButton
              title="Save photo"
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
        />
      </View>
    </BaseScreen>
  );
}
