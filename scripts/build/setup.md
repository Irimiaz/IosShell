# Mac and iPhone setup

One-time setup before the first build. Do this once per Mac, and once per iPhone.

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
