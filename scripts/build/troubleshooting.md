# Troubleshooting

Errors you may see, grouped by area. For the variables in `.env`, see [env.md](env.md).

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
- Make sure the bundle identifier is unique. If Xcode says it is already in use, change `IOS_BUNDLE_ID` in `.env` and run `npm run ios:device` again.

**`Failed to register bundle identifier` or `Bundle identifier is not available`**
- Another Apple developer account already uses that identifier. Set `IOS_BUNDLE_ID` in `.env` to something unique, e.g. `com.yourname.IosShell`, then run `npm run ios:device` (it regenerates `ios/` automatically).

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
- Run `npm install`, then `npx expo start --clear`. If you added a native package, run `npm run prebuild` and rebuild.

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
- `app.config.ts` reads `username` from `.env` and exposes it as `Constants.expoConfig.extra.username`. Restart `npm start` after editing `.env`. Values used at native build time (`IOS_BUNDLE_ID`, `APPLE_TEAM_ID`) need `npm run ios:device` or `npm run ios:ipa`.

**Changes to `.env`, `app.json` or `app.config.ts` have no effect**
- Run `npm run prebuild`, then `npm run ios:device`. Both regenerate `ios/` from the current values.
