# Build and Install on a Physical iPhone

This guide explains how to generate the native iOS project, build the app, and install it on an iPhone connected to a Mac with a cable.

## Requirements

- A Mac with macOS and **Xcode** installed from the App Store. Open it once and accept the license.
- Xcode Command Line Tools: `xcode-select --install`
- Node.js LTS (18 or newer) and npm
- CocoaPods, installed automatically by `expo prebuild` if missing. You can also install it with `brew install cocoapods`.
- An Apple ID added in Xcode: **Xcode → Settings → Accounts → +**. A free Apple ID is enough for personal device installs.
- An iPhone running a supported iOS version, connected with a USB or USB-C cable.

## One-time setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. On the iPhone, enable **Developer Mode**: **Settings → Privacy & Security → Developer Mode → On**. The phone restarts, then asks you to confirm.

3. Connect the iPhone with the cable, unlock it, and tap **Trust** when asked "Trust This Computer?". Enter the passcode.

4. Check that Xcode sees the device:

   ```bash
   xcrun xctrace list devices
   ```

   The iPhone should be listed under "Devices". If it is not, see the errors section below.

5. Keychain access for code signing (first build only): when `codesign` asks to use the "Apple Development" key, enter your Mac login password and click **Always Allow**. See the errors section if the prompts keep appearing.

## Commands

| Command | What it does |
| --- | --- |
| `npm start` | Starts the Metro dev server for an app that is already installed |
| `npm run prebuild` | Generates the native `ios/` folder from `app.json`/`app.config.ts` (runs `expo prebuild --platform ios`) |
| `npm run ios:device` | Builds the app and installs it on the connected iPhone (runs `expo run:ios --device`) |
| `npm run ios` | Builds and runs on the iOS Simulator or the selected device (runs `expo run:ios`) |
| `npm run ios:tunnel` | Starts the dev server through a tunnel, for when the phone and Mac are on different networks |
| `npm run typecheck` | Runs TypeScript checks |
| `npm run lint` | Runs ESLint |

## Build steps

1. Generate the native project (only needed the first time, and again after changing `app.json`, `app.config.ts`, plugins, bundle identifier, or native packages):

   ```bash
   npm run prebuild
   ```

   To regenerate from scratch, deleting the existing `ios/` folder first:

   ```bash
   npm run prebuild -- --clean
   ```

2. Build and install on the iPhone:

   ```bash
   npm run ios:device
   ```

   If more than one device is connected, the command asks you to choose one.

3. The first launch of the app may be blocked. On the iPhone go to **Settings → General → VPN & Device Management**, tap your Apple ID under "Developer App", then tap **Trust**. Open the app again.

4. After the app is installed, run `npm start` to load JavaScript changes with fast refresh. The app connects to the Metro server on your Mac over Wi-Fi. The cable is not needed for JS changes, only for reinstalling native changes.

## Notes

- The `ios/` folder is generated and listed in `.gitignore`. Don't edit it by hand. Change `app.json` or `app.config.ts` and run `npm run prebuild` again.
- The bundle identifier comes from `app.json` (`ios.bundleIdentifier`). With a free Apple ID, each bundle identifier must be unique to your account, and the provisioning profile expires after 7 days. Rebuild with `npm run ios:device` to renew it.
- Native changes (new native packages, plugin changes, `app.json` changes) require a rebuild with `npm run ios:device`. JavaScript changes do not.

## Errors and fixes

### Device and connection

**`No devices found` or the iPhone is missing from `xcrun xctrace list devices`**
- Unlock the iPhone and keep it unlocked during the build.
- Use a data-capable cable. Try another cable or USB port.
- Tap **Trust** on the iPhone and enter the passcode if prompted. Unplug and replug.
- Confirm Developer Mode is on (Settings → Privacy & Security → Developer Mode).
- Restart Xcode, then run the command again.

**`Developer Mode disabled` or `Developer Mode is required`**
- Enable it on the iPhone (Settings → Privacy & Security → Developer Mode), restart the phone, confirm, then rebuild.

**`The developer app cannot be checked for trust` or the app won't open ("Untrusted Developer")**
- Settings → General → VPN & Device Management → tap your Apple ID → **Trust**.

**`Could not launch` or `The device is locked`**
- Unlock the iPhone and rerun `npm run ios:device`.

### Code signing

**`No signing certificate "iOS Development" found` or `No profiles for 'com.…' were found`**
- Open `ios/` in Xcode (`open ios/IosShell.xcworkspace`), select the **IosShell** target → **Signing & Capabilities**, check **Automatically manage signing**, and choose your Team (your Apple ID). Xcode creates the certificate and profile.
- Make sure the bundle identifier is unique. If Xcode says it is already in use, change `ios.bundleIdentifier` in `app.json`, run `npm run prebuild -- --clean`, then rebuild.

**`Failed to register bundle identifier` or `Bundle identifier is not available`**
- Another Apple developer account already uses that identifier. Change `ios.bundleIdentifier` in `app.json` to something unique, e.g. `com.yourname.IosShell`, then run `npm run prebuild -- --clean` and rebuild.

**`A valid provisioning profile for this executable was not found` or the app expired after 7 days**
- Free Apple ID profiles last 7 days. Run `npm run ios:device` again to renew.

**`codesign wants to access key "Apple Development: …" in your keychain` (repeated popups)**
- Enter your Mac login password and click **Always Allow**. Do not click Deny, or the build fails.
- If the popups keep coming, allow `codesign` to use the key permanently:

  ```bash
  security set-key-partition-list -S apple-tool:,apple:,codesign: -s ~/Library/Keychains/login.keychain-db
  ```

  Enter your Mac password when asked.
- If the login keychain is locked, unlock it in Keychain Access (File → Unlock Keychain, or lock/unlock via the padlock).

**`errSecInternalComponent` during signing**
- Same keychain fix as above. Also run `security unlock-keychain ~/Library/Keychains/login.keychain-db` and enter your password.

### Xcode and tooling

**`xcode-select: error: tool 'xcodebuild' requires Xcode, but active developer directory ... is a command line tools instance`**
- Run `sudo xcode-select -s /Applications/Xcode.app/Contents/Developer`.

**`Unable to find a destination` or `xcodebuild: error: ... iOS X.Y is not installed`**
- Open Xcode → Settings → Platforms and download the iOS version needed. Or pick a device that runs an installed version.

**`CocoaPods not installed` or `pod install failed`**
- Install CocoaPods: `brew install cocoapods`, or `sudo gem install cocoapods`.
- Then run `cd ios && pod install --repo-update && cd ..`, and rebuild.
- If the error mentions an outdated Ruby, use Homebrew Ruby or `brew install cocoapods`.

**`Command PhaseScriptExecution failed` or Hermes/Metro bundle errors**
- Clear caches and rebuild:

  ```bash
  npx expo start --clear
  rm -rf ios/build
  npm run ios:device
  ```

**`Unable to resolve module ...`**
- Run `npm install`, then `npx expo start --clear`. If you added a native package, run `npm run prebuild -- --clean` and rebuild.

**Build fails after updating packages**
- Delete the native folder and regenerate it:

  ```bash
  rm -rf ios
  npm run prebuild
  npm run ios:device
  ```

- If `node_modules` seems broken: `rm -rf node_modules && npm install`.

### Metro and networking

**The app loads but shows "Unable to connect to Metro" or a blank screen**
- Run `npm start` on the Mac and keep it running.
- Phone and Mac must be on the same Wi-Fi network. Otherwise use `npm run ios:tunnel`.
- Check that no firewall blocks port 8081.

**`Port 8081 is already in use`**
- Stop the old process: `lsof -ti :8081 | xargs kill`, then run `npm start` again.

### Config and environment

**Environment variables are `undefined` in the app**
- `app.config.ts` reads values from `.env` without the `EXPO_PUBLIC_` prefix. Restart `npm start` after editing `.env`. The app must be rebuilt with `npm run ios:device` if the values are used at native build time.

**Changes to `app.json` have no effect**
- Run `npm run prebuild` again. Then rebuild with `npm run ios:device`.
