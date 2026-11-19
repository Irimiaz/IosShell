import { Platform } from 'react-native';
import { CameraView } from 'expo-camera';
import { requestCameraPermissionsAsync } from 'expo-image-picker';

export type ScanResult =
  { ok: true; data: string } | { ok: false; reason: string };

// Opens the phone's native QR code scanner. The scan is delivered through
// onResult once a code is read; the scanner is closed afterwards.
export async function scanQrCode(onResult: (result: ScanResult) => void) {
  if (!CameraView.isModernBarcodeScannerAvailable) {
    onResult({
      ok: false,
      reason: 'Code scanning is not available on this phone.',
    });
    return;
  }
  const permission = await requestCameraPermissionsAsync();
  if (!permission.granted) {
    onResult({
      ok: false,
      reason: 'Camera access is off. Allow it in the phone’s settings.',
    });
    return;
  }

  const subscription = CameraView.onModernBarcodeScanned((event) => {
    subscription.remove();
    if (Platform.OS === 'ios') void CameraView.dismissScanner();
    onResult({ ok: true, data: event.data });
  });

  await CameraView.launchScanner({ barcodeTypes: ['qr'] });
}
