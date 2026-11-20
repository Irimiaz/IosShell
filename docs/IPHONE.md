# iPhone guide

Everything for putting the app on an iPhone: setup, the values in `.env`, installing, the dev server, giving the app to someone else, and fixing errors.

## Which part do I need?

| I want to...                                                  | Go to                                                         |
| ------------------------------------------------------------- | ------------------------------------------------------------- |
| Set up a Mac or iPhone for the first time                     | [One-time setup](#one-time-setup)                             |
| Understand the values in `.env`                               | [Values in .env](#values-in-env)                              |
| Install the app on my iPhone                                  | [Install on your iPhone](#install-on-your-iphone)             |
| Load my JavaScript changes, or the phone cannot reach the Mac | [Run the dev server](#run-the-dev-server)                     |
| Install the app on a second iPhone                            | [Another iPhone](#another-iphone)                             |
| Give the app to someone else                                  | [Send the app to someone else](#send-the-app-to-someone-else) |
| Fix an error message                                          | [Troubleshooting](#troubleshooting)                           |

## How the app runs on the iPhone

The app on the phone is a **development build**, not an App Store or TestFlight build. It has two parts:

- **The native app** (the icon on the home screen). It is compiled and signed on the Mac and installed with `npm run iphone` (option 2 or 3). It stays on the phone until you delete it or its provisioning profile expires.
- **The JavaScript** (your screens and logic). With a development build it is loaded from the Metro dev server on your Mac. The app only works while `npm start` runs and the phone can reach the Mac.

Changes to JavaScript load with fast refresh and need no rebuild. Changes to native things (new packages, `app.json`, plugins, the bundle ID) need `npm run iphone` (option 2) again.

## One-time setup

Do this once per Mac, and once per iPhone.

### Requirements

- A Mac with **Xcode** from the App Store. Open it once and accept the license.
- Command Line Tools: `xcode-select --install`
- Node.js LTS (18 or newer) and npm
- CocoaPods. `expo prebuild` installs it if it is missing, or install it with `brew install cocoapods`.
- An Apple ID added in Xcode: **Xcode → Settings → Accounts → +**. A free Apple ID is enough for installing on your own phone.
- An iPhone on a supported iOS version, connected with a USB or USB-C cable.

### Steps

1. Install the dependencies: `npm install`
2. On the iPhone, turn on **Developer Mode**: **Settings → Privacy & Security → Developer Mode → On**. The phone restarts and asks you to confirm.
3. Connect the iPhone, unlock it, and tap **Trust** when asked "Trust This Computer?". Enter the passcode.
4. Check that Xcode sees the phone: `xcrun xctrace list devices`. The iPhone should be under "Devices". If not, see [Troubleshooting](#device-and-connection).
5. Code signing asks for keychain access on the first build. When `codesign` asks to use the "Apple Development" key, enter your Mac login password and click **Always Allow**.

## Values in .env

`.env` sits in the project root. It is gitignored, so the values stay on your Mac. [`.env.example`](../.env.example) lists every variable.

| Variable        | Required | What it is                                     | Used for                              |
| --------------- | -------- | ---------------------------------------------- | ------------------------------------- |
| `IOS_BUNDLE_ID` | yes      | The app's bundle identifier                    | `PRODUCT_BUNDLE_IDENTIFIER` in `ios/` |
| `APPLE_TEAM_ID` | no       | The team ID of the Apple ID that signs the app | `DEVELOPMENT_TEAM` in `ios/`          |
| `username`      | no       | Any text. Shown on the Info tab                | `Constants.expoConfig.extra.username` |

After you change a value, run `npm run iphone` (option 2). It regenerates `ios/` when `.env` changed. `npm run setup` writes these values for you.

### IOS_BUNDLE_ID

You choose this value. Apple does not hand it out, and nothing has to be looked up.

- Use the form `com.<something-unique>.<app name>`, for example `com.janedoe.MyApp`.
- It must be unique across all Apple developer accounts. If a build fails with "Bundle identifier is not available", pick another value.
- Use a different value for each Apple ID that installs the app on a phone.

### APPLE_TEAM_ID

Leave it empty to let Xcode choose the team. Set it when you have several Apple IDs in Xcode and want a fixed one.

The team ID is written as `OU=` in the certificate that Xcode creates for each Apple ID. Your Mac needs that certificate first:

1. Add the Apple ID in **Xcode → Settings → Accounts → +**.
2. Create the certificate. If you have not signed anything with that Apple ID yet, run `npm run iphone` (option 7), open `ios/<app name>.xcworkspace` in Xcode, select the app target → **Signing & Capabilities**, and choose the team. Xcode creates the certificate.
3. Print the team IDs of your Apple Development certificates:

   ```bash
   security find-certificate -a -c "Apple Development" -p | awk 'BEGIN{c=""} /BEGIN CERTIFICATE/{c=""} {c=c $0 "\n"} /END CERTIFICATE/{printf "%s", c | "openssl x509 -noout -subject"; close("openssl x509 -noout -subject")}'
   ```

   Each line ends with `OU=<team id>`. The `CN=` part shows which Apple ID it belongs to. Copy the `OU=` value for the Apple ID you want.

If the command prints nothing, step 2 has not run yet. Paid Apple Developer accounts also show the team ID at **developer.apple.com → Account → Membership details**.

### username

Any text. Nothing to look up, and it does not have to match anything at Apple. The Info tab shows it. If it is empty, the Info tab shows "not set" and the app still starts.

### Check the values reached the Xcode project

```bash
bash scripts/iphone/regenerate.sh
grep -h "PRODUCT_BUNDLE_IDENTIFIER\|DEVELOPMENT_TEAM" ios/*.xcodeproj/project.pbxproj | sort -u
```

You should see your `IOS_BUNDLE_ID` and `APPLE_TEAM_ID`. If not, check `.env` for typos, and for a shell variable with the same name (a shell variable overrides `.env`).

## Install on your iPhone

### Option 3: install without opening (`npm run iphone`, option 3)

Use this to get the app on the phone now and start the dev server later.

1. Stop `npm start` if it is running. Regenerating `ios/` fails while the dev server watches the project.
2. Install: `npm run iphone` (option 3)
3. Start the dev server and open the app on the phone: `npm start`

If two iPhones are connected, pass the UDID: `bash scripts/iphone/install.sh <UDID>`. List UDIDs with `xcrun devicectl list devices`.

### Option 2: install and open (`npm run iphone`, option 2)

1. Run `npm run iphone` (option 2). It regenerates `ios/` when the config changed, then builds and installs on the connected iPhone. If more than one phone is connected, it asks which one to use.
2. The first launch may be blocked. On the iPhone go to **Settings → General → VPN & Device Management**, tap your Apple ID under "Developer App", then tap **Trust**. Open the app again.
3. Run `npm start` to load JavaScript changes. The cable is needed only to reinstall native changes.

`npm run iphone` (option 7) rebuilds `ios/` from scratch. You rarely need it, because options 2 and 3 rebuild `ios/` on their own when the config changed.

## Run the dev server

The JavaScript loads over the network from the Metro dev server on your Mac.

1. On the Mac, start the server and leave it running: `npm start`
2. Put the iPhone on the **same Wi-Fi** as the Mac. Make sure the Mac's firewall does not block port 8081.
3. Open the app on the iPhone. It loads the JavaScript from the server. Saved changes reload on the phone.
4. If the app shows "Unable to connect to Metro" or a blank screen, check in this order:
   - `npm start` is running, and nothing else uses port 8081.
   - Both devices are on the same Wi-Fi. A guest network or a VPN can block the connection.
   - Use the tunnel when the networks differ or local discovery fails: `npm run iphone` (option 5)

## Another iPhone

### Case A: second iPhone, same Apple ID

No code changes needed.

1. Connect the second iPhone with a cable. Do the [one-time setup](#one-time-setup) on that phone: Developer Mode, Trust and passcode.
2. Check that Xcode sees it: `xcrun xctrace list devices`
3. Run `npm run iphone` (option 2). If two phones are connected, it asks which one. The first run can take a minute while Xcode registers the new device.
4. On that phone, trust the app: **Settings → General → VPN & Device Management → your Apple ID → Trust**. Open the app.

### Case B: the other iPhone uses a different Apple ID

The bundle identifier and signing team must belong to that Apple ID.

1. Add that Apple ID under **Xcode → Settings → Accounts**.
2. In `.env`, set `IOS_BUNDLE_ID` and `APPLE_TEAM_ID` for that Apple ID (see [Values in .env](#values-in-env)).
3. Connect the other iPhone, do its one-time setup, then run `npm run iphone` (option 2).
4. Trust the app on that phone as in Case A, step 4.

To go back to your own Apple ID, change `.env` back. The next `npm run iphone` (option 2) regenerates the project.

Both phones can have the app at once only if each has its own bundle identifier. The free Apple ID limits still apply: the profile expires after 7 days on each phone.

## Send the app to someone else

You build one file, and they install it with their own Apple ID. They do not need Xcode, and the app does not need `npm start`, because the JavaScript is inside the app.

### 1. Build the .ipa (on your Mac)

```bash
bash scripts/iphone/package-ipa.sh
```

This builds a Release app and writes `dist/<app name>-unsigned.ipa`. It is not signed with your Apple ID. Send it as it is (AirDrop, Drive, etc.).

### 2. Install on their iPhone

1. They install **Sideloadly** on a Mac or Windows PC (free, https://sideloadly.io). You can do this step for them.
2. Connect their iPhone with a cable, unlock it, and tap **Trust**.
3. Turn on **Developer Mode**: Settings → Privacy & Security → Developer Mode → On. The phone restarts.
4. In Sideloadly, drag the `.ipa` into the window, enter **their** Apple ID, and click **Start**. Enter their password and any two-factor code.
5. On the iPhone: Settings → General → VPN & Device Management → their Apple ID → **Trust**. Open the app.

### Things to know

- **Free Apple ID:** the app expires after 7 days. Click **Start** in Sideloadly again to renew.
- **Bundle identifier:** Sideloadly may ask to change it if the default is taken. Accept the suggestion.
- **Personal values are inside the file:** `username` from `.env` is in the `.ipa`. Check `.env` first.
- **Rebuild after any change:** run `npm run iphone` (option 4) again and install again on each phone.
- **Your own phone is not affected:** `npm run iphone` (option 2) and `npm start` still work.

## Troubleshooting

Find the part of the error message you see, and follow its steps. Values in `.env` are explained in [Values in .env](#values-in-env).

### Device and connection

**`No devices found`, or the iPhone is missing from `xcrun xctrace list devices`**

- Unlock the iPhone and keep it unlocked during the build.
- Use a data-capable cable. Try another cable or port.
- Tap **Trust** on the iPhone and enter the passcode. Unplug and replug.
- Confirm Developer Mode is on (Settings → Privacy & Security → Developer Mode).
- Restart Xcode, then run the command again.

**`Developer Mode disabled` or `Developer Mode is required`**

- Turn it on (Settings → Privacy & Security → Developer Mode), restart the phone, confirm, then rebuild.

**`The developer app cannot be checked for trust` or "Untrusted Developer"**

- Settings → General → VPN & Device Management → tap your Apple ID → **Trust**.

**`Could not launch` or `The device is locked`**

- Unlock the iPhone and run `npm run iphone` (option 2) again.

### Code signing

**`No signing certificate "iOS Development" found` or `No profiles for '…' were found`**

- Open `ios/<app name>.xcworkspace` in Xcode, select the app target → **Signing & Capabilities**, check **Automatically manage signing**, and choose your Team. Xcode creates the certificate and profile.
- Make sure the bundle identifier is unique. If Xcode says it is in use, change `IOS_BUNDLE_ID` in `.env` and run `npm run iphone` (option 2) again.

**`Failed to register bundle identifier` or `Bundle identifier is not available`**

- Another Apple developer account uses that identifier. Set `IOS_BUNDLE_ID` to something unique, then run `npm run iphone` (option 2) (it regenerates `ios/`).

**`A valid provisioning profile for this executable was not found`, or the app stopped opening after 7 days**

- Free Apple ID profiles last 7 days. Run `npm run iphone` (option 2) to renew.

**`codesign wants to access key "Apple Development: …"` (repeated popups)**

- Enter your Mac login password and click **Always Allow**. Do not click Deny, or the build fails.
- To stop the popups, allow `codesign` to use the key:

  ```bash
  security set-key-partition-list -S apple-tool:,apple:,codesign: -s ~/Library/Keychains/login.keychain-db
  ```

  Enter your Mac password when asked.

- If the login keychain is locked, unlock it in Keychain Access.

**`errSecInternalComponent` during signing**

- Use the keychain fix above, and run `security unlock-keychain ~/Library/Keychains/login.keychain-db`.

### Xcode and tooling

**`xcode-select: error: tool 'xcodebuild' requires Xcode`**

- Run `sudo xcode-select -s /Applications/Xcode.app/Contents/Developer`.

**`Unable to find a destination` or `iOS X.Y is not installed`**

- In Xcode, open Settings → Platforms and download the iOS version needed.

**`CocoaPods not installed` or `pod install failed`**

- Install CocoaPods with `brew install cocoapods` or `sudo gem install cocoapods`.
- Then run `cd ios && pod install --repo-update && cd ..` and rebuild.

**`Command PhaseScriptExecution failed`, or Hermes and Metro bundle errors**

- Clear the caches and rebuild:

  ```bash
  npx expo start --clear
  rm -rf ios/build
  bash scripts/iphone/run.sh
  ```

**`Unable to resolve module …`**

- Run `npm install`, then `npx expo start --clear`. If you added a native package, run `npm run iphone` (option 7) and rebuild.

**The build fails after updating packages**

- Regenerate the native folder: `rm -rf ios && bash scripts/iphone/regenerate.sh && bash scripts/iphone/run.sh`
- If `node_modules` seems broken: `rm -rf node_modules && npm install`

### Metro and networking

**The app loads but shows "Unable to connect to Metro" or a blank screen**

- Run `npm start` on the Mac and keep it running.
- The phone and Mac must be on the same Wi-Fi, or use `npm run iphone` (option 5).
- Check that no firewall blocks port 8081.

**`Port 8081 is already in use`**

- Stop the old process: `lsof -ti :8081 | xargs kill`, then run `npm start` again.

### Config and environment

**Environment variables are `undefined` in the app**

- Restart `npm start` after editing `.env`. Values used at native build time (`IOS_BUNDLE_ID`, `APPLE_TEAM_ID`) need option 2 or 4 of `npm run iphone`.

**Changes to `.env`, `app.json` or `app.config.ts` have no effect**

- Run `npm run iphone` (option 7), then `npm run iphone` (option 2). Both regenerate `ios/` from the current values.

## Notes

- The `ios/` folder is generated and gitignored. Do not edit it by hand. Change `.env`, `app.json` or `app.config.ts` instead.
- A variable already set in the shell (for example `IOS_BUNDLE_ID=... bash scripts/iphone/run.sh`) overrides `.env`.
- With a free Apple ID, each bundle identifier must be unique to your account, and the profile expires after 7 days. Renew it with `npm run iphone` (option 2).
