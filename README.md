# IOS template

An Expo starter for iPhone apps. It comes with navigation, a demo of the phone features, and a menu that builds and installs the app on your iPhone.

## Requirements

- A Mac with **Xcode** from the App Store. Open it once and accept the license.
- **Node.js** 18 or newer, with npm.
- An **Apple ID** signed in to Xcode. Open the project with `open ios/<app name>.xcworkspace`, then in **Signing & Capabilities** choose **Team → Add an Account…**. A free Apple ID is enough for your own phone. The [iPhone guide](docs/IPHONE.md#apple_team_id) has the details.
- An **iPhone** on a supported iOS version, connected with a cable for the first install.

## What's included

- **Navigation:** a sidebar that opens from the menu button, and a tab bar at the bottom.
- **Screens:** `Dashboard` as the start screen, and `Info` with the build details.
- **Demo:** each phone feature with buttons to try: security, notifications, camera, copy and share, QR codes, device details, reload, links, keyboard, haptics, and alerts.
- **Menu:** `npm run iphone` builds, installs, runs and packages the app, with a short explanation for each choice.
- **Setup:** `npm run setup` asks a few questions and fills in your app's name, bundle ID and settings.

## Start a new app

1. Create your repo with GitHub's **Use this template** button, then clone it. Or clone this repo with `git clone`.
2. Install the dependencies: `npm install`
3. Set up the app: `npm run setup`. It asks a few questions (name, bundle ID, team, username, demo) and writes `.env` and `app.json`. Answer **yes** to keep the demo, so you can test it.
4. Open the menu: `npm run iphone`. Choose **2** to install the app on your iPhone. Then choose **1** to start the dev server, open the app on the phone, and test the demo.
5. The first time, trust the app on the iPhone. See [Trust the app](#trust-the-app).
6. When you are done testing, open the menu again and choose **9** to remove the demo.
7. Commit and push your changes.

The first time you use an iPhone, read the [iPhone guide](docs/IPHONE.md). It covers the one-time setup, the values in `.env`, and error messages.

## Trust the app

The first time a new app is installed, iOS asks you to trust its developer. Until you do, the app won't open.

On the iPhone, go to **Settings → General → VPN & Device Management**. Under **Developer App**, tap your Apple ID, then tap **Trust**. Open the app again.

## Commands

Only four. Everything for the phone is in the menu.

| Command          | What it does                                                           |
| ---------------- | ---------------------------------------------------------------------- |
| `npm run iphone` | Opens the iPhone menu. Each choice has a short explanation. Start here |
| `npm run setup`  | Asks the setup questions again: app name, bundle ID, team and username |
| `npm start`      | Starts the dev server only                                             |
| `npm run check`  | Checks the code: TypeScript and the linter. Does not need a phone      |

The menu:

| Choice | What it does                                                                                                     |
| ------ | ---------------------------------------------------------------------------------------------------------------- |
| 1      | Start the dev server. Keep it running while you use the app on the phone                                         |
| 2      | Use it first, and after changing `.env`, `app.json` or a native package. Installs without opening. Recommended   |
| 3      | Install and open the app on the phone, and start the dev server. Use it to open the app right away               |
| 4      | Make a `.ipa` file to send to someone else                                                                       |
| 5      | Start the dev server through a tunnel, when the phone and Mac are on different networks                          |
| 6      | Check the code                                                                                                   |
| 7      | Rebuild the iOS project from scratch, when the build fails in a strange way                                      |
| 8      | Ask the setup questions again                                                                                    |
| 9      | Remove the demo screens. Asks you to confirm first. The libraries stay                                           |
| 10     | Clean build: clears all caches, recreates `ios/`, then installs without opening. Slower. Use it when nothing else works |

## Another iPhone

- **Same Apple ID as before:** nothing to change. Pair the new iPhone (a cable the first time, then Wi-Fi works too), do its one-time setup (Developer Mode, Trust), and choose **2**.
- **A different Apple ID:** edit `.env` by hand, rather than running `npm run setup` again (setup also rewrites other files):
  1. Sign in to that Apple ID in Xcode and let it create its certificate.
  2. Get its team ID with the command in the [iPhone guide](docs/IPHONE.md#apple_team_id), and set `APPLE_TEAM_ID` in `.env`.
  3. Keep `IOS_BUNDLE_ID` only if that Apple ID can register it. If a build says the ID is taken, set a new `com.<something>.<app name>`.
  4. Connect the new iPhone, do its one-time setup, and choose **2**. Trust the app on the phone.
- To build for your own phone again, put your values back in `.env` and choose **2**.

Each phone needs a valid signing team. For a phone with another Apple ID, see [Another iPhone](docs/IPHONE.md#another-iphone). To send the app to someone without any of this, use menu choice **4**.

## Something doesn't connect

If the app can't reach the dev server, check these first:

1. **Local Network.** On the iPhone, go to **Settings → Privacy & Security → Local Network** and turn on your app. Without this, iOS blocks the connection.
2. **Same Wi-Fi.** The phone and the Mac must be on the same network, not a guest network.
3. **Dev server running.** Option 1 must be running on the Mac.
4. **Tunnel.** If the network blocks the connection, use option 5.

More in the [iPhone guide](docs/IPHONE.md#metro-and-networking).

## Known limits

- **iPhone only.** The menu and the build scripts are for iPhone. Android is not set up.
- **A Mac is needed** to build, because the build uses Xcode.
- **Free Apple ID:** the installed app expires after 7 days. Run option 2 again to renew it.

## Project layout

- `src/screens/`: your screens. `Dashboard` is the start screen, `Info` shows build details.
- `src/demo/`: a demo of each device feature. Remove it with menu option 9, or during `npm run setup`.
- `src/device/`, `src/security/`: the feature code the demo uses. Keep these.
- `src/navigation/registry.ts`: where screens and tabs are registered.
- `src/config/build-info.json`: the build details shown on the Info screen. Generated by each build and by setup, and gitignored.
- `.env`: your private values (bundle ID, team, username). Gitignored.
- `scripts/init.mjs`: the setup questions, run by `npm run setup`.
- `scripts/demo/`: the code that removes the demo.
- `scripts/iphone/`: the scripts behind the menu. `menu.mjs` is the menu. Each script has a comment at the top saying what it does.
- `docs/IPHONE.md`: the iPhone guide.
