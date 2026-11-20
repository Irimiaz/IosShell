# IosShell

An Expo starter for iPhone apps. It comes with navigation, a demo of the device features, and a menu that installs the app on your phone.

## Start a new app

1. Create your repo with GitHub's **Use this template** button, then clone it. Or clone this repo with `git clone`.
2. Install the dependencies: `npm install`
3. Set up the app: `npm run setup`. It asks a few questions (name, bundle ID, team, username, time zone, demo) and writes `.env` and `app.json`. Answer **yes** to keep the demo, so you can test it.
4. Open the menu: `npm run iphone`. Choose **2** to install the app on your iPhone and open it, then test the demo.
5. When you are done testing, open the menu again and choose **9** to remove the demo.
6. Commit and push your changes.

The first time you use an iPhone, read the [iPhone guide](docs/IPHONE.md). It covers the one-time setup, the values in `.env`, and error messages.

## Commands

Only four. Everything for the phone is in the menu.

| Command          | What it does                                                           |
| ---------------- | ---------------------------------------------------------------------- |
| `npm run iphone` | Opens the iPhone menu. Each choice has a short explanation. Start here |
| `npm run setup`  | Asks the setup questions again: app name, bundle ID, team and username |
| `npm start`      | Starts the dev server only                                             |
| `npm run check`  | Checks the code: TypeScript and the linter. Does not need a phone      |

The menu:

| Choice | What it does                                                                                                   |
| ------ | -------------------------------------------------------------------------------------------------------------- |
| 1      | Start the dev server. Keep it running while you use the app on the phone                                       |
| 2      | Install and open the app on the phone. Use it first, and after changing `.env`, `app.json` or a native package |
| 3      | Install the app without opening it                                                                             |
| 4      | Make a `.ipa` file to send to someone else                                                                     |
| 5      | Start the dev server through a tunnel, when the phone and Mac are on different networks                        |
| 6      | Check the code                                                                                                 |
| 7      | Rebuild the iOS project from scratch, when the build fails in a strange way                                    |
| 8      | Ask the setup questions again                                                                                  |
| 9      | Remove the demo screens. Asks you to confirm first. The libraries stay                                         |

## Project layout

- `src/screens/`: your screens. `Dashboard` is the start screen, `Info` shows build details.
- `src/demo/`: a demo of each device feature. Remove it with menu option 9, or during `npm run setup`.
- `src/device/`, `src/security/`: the feature code the demo uses. Keep these.
- `src/navigation/registry.ts`: where screens and tabs are registered.
- `.env`: your private values (bundle ID, team, username). Gitignored.
- `scripts/iphone/`: the scripts behind the menu. `menu.mjs` is the menu. Each script has a comment at the top saying what it does.
- `docs/IPHONE.md`: the iPhone guide.
