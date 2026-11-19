import * as LocalAuthentication from 'expo-local-authentication';
import { Alert } from 'react-native';

// True when the phone has a screen lock set up (Face ID, Touch ID, fingerprint,
// or a PIN / passcode / pattern). It only reads what is enrolled; it does not prompt.
export async function hasDeviceSecurity(): Promise<boolean> {
  try {
    const level = await LocalAuthentication.getEnrolledLevelAsync();
    return level !== LocalAuthentication.SecurityLevel.NONE;
  } catch {
    // If the check itself fails, treat the device as unsecured.
    return false;
  }
}

// Asks the user to confirm before running anything. It uses Face ID / Touch ID
// when the phone has them set up. When they are not set up, the phone's PIN or
// passcode is asked for instead.
//
//   requireBiometry(
//     () => deleteEverything(),           // confirmed
//     (reason) => console.log(reason),    // cancelled, failed or no lock set up
//   );
//
// The failure callback gets the error code from the system (e.g. 'user_cancel').
export async function requireBiometry<T>(
  onSuccess: () => T | Promise<T>,
  onFailure: (reason: string) => void | Promise<void>,
): Promise<T | undefined> {
  const result = await LocalAuthentication.authenticateAsync({
    promptMessage: 'Confirm it’s you',
    cancelLabel: 'Cancel',
    // Allow the PIN/passcode when biometry is not set up.
    disableDeviceFallback: false,
  });

  if (!result.success) {
    await onFailure(result.error);
    return undefined;
  }
  return onSuccess();
}

// Same as requireBiometry, but first requires a screen lock to be set up. If
// there is none, it shows an alert and calls onFailure with 'no_lock'.
export async function requireDeviceSecurity<T>(
  onSuccess: () => T | Promise<T>,
  onFailure: (reason: string) => void | Promise<void>,
): Promise<T | undefined> {
  if (!(await hasDeviceSecurity())) {
    Alert.alert(
      'Screen lock required',
      'Set up Face ID, Touch ID, a fingerprint or a PIN in your phone’s settings to continue.',
    );
    await onFailure('no_lock');
    return undefined;
  }
  return requireBiometry(onSuccess, onFailure);
}
