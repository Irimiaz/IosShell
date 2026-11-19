import * as Clipboard from 'expo-clipboard';
import * as Sharing from 'expo-sharing';
import { Share } from 'react-native';

// Copies text to the clipboard. Returns true when it worked.
export async function copyText(text: string): Promise<boolean> {
  return Clipboard.setStringAsync(text);
}

// Opens the system share sheet. A photo is shared as a file when one is given,
// otherwise the text is shared. Returns false when the sheet could not open.
export async function shareContent(
  text: string,
  photoUri?: string,
): Promise<boolean> {
  if (photoUri) {
    if (!(await Sharing.isAvailableAsync())) return false;
    await Sharing.shareAsync(photoUri, { mimeType: 'image/jpeg' });
    return true;
  }
  const result = await Share.share({ message: text });
  return result.action !== Share.dismissedAction;
}
