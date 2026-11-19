import { Directory, File, Paths } from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';
import * as MediaLibrary from 'expo-media-library';

// Result of a photo action. On success `uri` is the local file of the photo.
export type PhotoResult =
  { ok: true; uri: string } | { ok: false; reason: string };

// Opens the phone's native camera app and returns the photo taken. Cancelling is not an error.
export async function openCamera(): Promise<PhotoResult> {
  const permission = await ImagePicker.requestCameraPermissionsAsync();
  if (!permission.granted) {
    return {
      ok: false,
      reason: 'Camera access is off. Allow it in the phone’s settings.',
    };
  }
  const result = await ImagePicker.launchCameraAsync({ quality: 0.8 });
  return fromPickerResult(result);
}

// Opens the photo gallery and returns the picked image.
export async function pickPhotoFromGallery(): Promise<PhotoResult> {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) {
    return {
      ok: false,
      reason: 'Photo library access is off. Allow it in the phone’s settings.',
    };
  }
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    quality: 0.8,
  });
  return fromPickerResult(result);
}

// Downloads a file from a URL into the app's storage and returns its local uri.
export async function downloadFile(url: string): Promise<PhotoResult> {
  try {
    const file = await File.downloadFileAsync(url, new Directory(Paths.cache));
    return { ok: true, uri: file.uri };
  } catch {
    return {
      ok: false,
      reason: 'The download failed. Check your internet connection.',
    };
  }
}

// Saves a local image to the phone's Photos app.
export async function saveToPhotos(uri: string): Promise<PhotoResult> {
  const permission = await MediaLibrary.requestPermissionsAsync(true);
  if (!permission.granted) {
    return {
      ok: false,
      reason: 'Photos access is off. Allow it in the phone’s settings.',
    };
  }
  try {
    await MediaLibrary.Asset.create(uri);
    return { ok: true, uri };
  } catch {
    return { ok: false, reason: 'The photo could not be saved.' };
  }
}

function fromPickerResult(result: ImagePicker.ImagePickerResult): PhotoResult {
  if (result.canceled || result.assets.length === 0) {
    return { ok: false, reason: 'No photo was chosen.' };
  }
  return { ok: true, uri: result.assets[0].uri };
}
