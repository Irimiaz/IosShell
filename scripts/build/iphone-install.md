# Build and install on an iPhone

Build with your Apple ID and install on your own iPhone with a cable. The steps for a second Apple ID are in Case B below.

## Build and install without launching

Use this when you want the app on the phone now and start the dev server later:

1. Stop `npm start` if it is running. Regenerating `ios/` fails while the dev server is watching the project.
2. Install:

   ```bash
   npm run build
   ```

3. When you want to use the app, start the dev server and open IosShell on the phone:

   ```bash
   npm start
   ```

The Debug build loads its JavaScript from `npm start`, so the app only works while the dev server runs and the phone is on the same Wi-Fi (see [dev-server.md](dev-server.md)).

If two iPhones are connected, pass the UDID: `bash scripts/build/install-no-launch.sh <UDID>`. The UDID is listed by `xcrun devicectl list devices`.

## Build steps

1. Generate the native project. Run this after changing `.env`, `app.json`, `app.config.ts`, plugins, or native packages. It always regenerates `ios/` from scratch:

   ```bash
   npm run prebuild
   ```

   You do not have to run this by hand before `ios:device`: that command checks whether the config changed and runs prebuild when needed.

2. Build and install on the iPhone:

   ```bash
   npm run ios:device
   ```

   If more than one device is connected, the command asks you to choose one.

3. The first launch of the app may be blocked. On the iPhone go to **Settings → General → VPN & Device Management**, tap your Apple ID under "Developer App", then tap **Trust**. Open the app again.

4. After the app is installed, run `npm start` to load JavaScript changes with fast refresh. The app connects to the Metro server on your Mac over Wi-Fi. The cable is not needed for JS changes, only for reinstalling native changes.

## Install on another iPhone

There are two cases. Pick the one that matches the other phone's Apple ID.

### Case A: second iPhone, same Apple ID

No code changes are needed.

1. Connect the second iPhone to the Mac with a cable. Complete the steps in **One-time setup** on that phone: Developer Mode, **Trust**, and passcode.
2. Check that Xcode sees it:

   ```bash
   xcrun xctrace list devices
   ```

3. Run the build and install. If two iPhones are connected, the command asks which one to use:

   ```bash
   npm run ios:device
   ```

   Xcode registers the new device with your Apple ID and creates a provisioning profile that includes it. This can take a minute on the first run.

4. On the second iPhone, trust the developer app: **Settings → General → VPN & Device Management → your Apple ID → Trust**. Open the app.

### Case B: the other iPhone uses a different Apple ID

The bundle identifier and signing team must belong to that Apple ID. Set them in `.env` and build again. The full steps, and how to find each value, are in [env.md](env.md).

Short version:

1. Add the other Apple ID under **Xcode → Settings → Accounts**.
2. In `.env`, set `IOS_BUNDLE_ID` and `APPLE_TEAM_ID` for that Apple ID.
3. Connect the other iPhone, complete its one-time setup ([setup.md](setup.md)), then run `npm run ios:device`.
4. Trust the app on that phone as in Case A, step 4.

To switch back to your own Apple ID, change `.env` back. The next `npm run ios:device` regenerates the project on its own.

Both phones can have the app at the same time only if each has its own bundle identifier. Free Apple ID limits still apply: the profile expires after 7 days on each phone.

## How the app runs on the iPhone

The app on the iPhone is a **development build**, not an App Store or TestFlight build. It has two parts:

- **The native app** (the icon on the home screen). It is compiled and signed on the Mac and installed with `npm run ios:device`. It stays on the phone until you delete it or the provisioning profile expires.
- **The JavaScript** (your screens and logic). It is loaded from the Metro dev server running on the Mac. The app only works while `npm start` is running and the phone can reach the Mac.

The bundle identifier and signing team are set in `.env`:

| Setting | Variable in `.env` | Current value | Written to |
| --- | --- | --- | --- |
| Bundle identifier | `IOS_BUNDLE_ID` | `com.marianirimia27.IosShell` | `PRODUCT_BUNDLE_IDENTIFIER` in `ios/` |
| Signing team | `APPLE_TEAM_ID` | `Z23JXMNT76` | `DEVELOPMENT_TEAM` in `ios/` |
| App name | — | IosShell | `app.json` (`name`) |
| Dev server port | — | 8081 | Metro default |

Because the signing team is tied to one Apple ID, a build signed by that team can only be installed on iPhones registered to it.

## Notes

- The `ios/` folder is generated and listed in `.gitignore`. Don't edit it by hand. Change `.env`, `app.json` or `app.config.ts` and the next `npm run ios:device` or `npm run prebuild` picks it up.
- A variable already set in the shell (for example `IOS_BUNDLE_ID=... npm run ios:device`) overrides `.env`.
- The bundle identifier comes from `IOS_BUNDLE_ID`. With a free Apple ID, each bundle identifier must be unique to your account, and the provisioning profile expires after 7 days. Rebuild with `npm run ios:device` to renew it.
- Native changes (new native packages, plugin changes, `app.json` changes) require a rebuild with `npm run ios:device`. JavaScript changes do not.
