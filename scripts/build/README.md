# iOS build

Everything for building and installing the iOS app on a physical iPhone. Start with [setup.md](setup.md) the first time.

## Guides

| Guide | Read it when |
| --- | --- |
| [setup.md](setup.md) | First time on this Mac or on a new iPhone: requirements, Developer Mode, Trust |
| [env.md](env.md) | You need to fill in `IOS_BUNDLE_ID`, `APPLE_TEAM_ID` or `username` in `.env` |
| [iphone-install.md](iphone-install.md) | Building and installing on your iPhone, or on a second phone with a different Apple ID |
| [dev-server.md](dev-server.md) | JavaScript changes, Metro, phone not connecting to the Mac |
| [ipa-sideload.md](ipa-sideload.md) | Giving the app to someone else with their own Apple ID, through a `.ipa` file |
| [troubleshooting.md](troubleshooting.md) | An error message from Xcode, codesign, Metro or `.env` |

## Commands

Run these from the project root.

| Command | What it does |
| --- | --- |
| `npm run ios:device` | Regenerates `ios/` if `.env`, `app.json` or `app.config.ts` changed, then builds and installs on the connected iPhone |
| `npm run prebuild` | Always regenerates `ios/` from scratch (`scripts/build/prebuild.sh`) |
| `npm run ios:ipa` | Builds a self-contained Release app and writes `dist/IosShell-unsigned.ipa` |
| `npm start` | Starts the Metro dev server for an app that is already installed |
| `npm run ios:tunnel` | Starts the dev server through a tunnel, when phone and Mac are on different networks |
| `npm run ios` | Builds and runs on the iOS Simulator or the selected device (`expo run:ios`) |
| `npm run typecheck` | TypeScript check |
| `npm run lint` | ESLint |

## Scripts in this folder

| Script | Purpose |
| --- | --- |
| `prebuild.sh` | Runs `expo prebuild --clean` and records a fingerprint of the config |
| `ios-config-stamp.sh` | Prints the fingerprint of `IOS_BUNDLE_ID`, `APPLE_TEAM_ID`, `app.json` and `app.config.ts` |
| `ensure-prebuild.sh` | Runs `prebuild.sh` only when the fingerprint changed. Used by `ios:device` and `ios:ipa` |
| `build-unsigned-ipa.sh` | Release build without signing, packaged as `dist/IosShell-unsigned.ipa` |

`.env` and `.env.example` stay in the project root, because Expo reads `.env` from there.
