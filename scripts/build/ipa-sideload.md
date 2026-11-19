# Install an unsigned .ipa with Sideloadly

Build one file and let someone else install it with their own Apple ID. They do not need Xcode, and you do not need to be there after the build. The app bundles its JavaScript, so it does not need `npm start`.

## 1. Build the .ipa (on your Mac)

```bash
npm run ios:ipa
```

This builds a Release app and writes `dist/IosShell-unsigned.ipa`. The file is not signed with your Apple ID. Send it to the other person as it is (AirDrop, Drive, etc.).

## 2. Install on their iPhone

1. Install **Sideloadly** on a Mac or Windows PC (free, https://sideloadly.io). They need it once. You can do this step for them.
2. Connect the iPhone with a cable, unlock it, and tap **Trust**.
3. Turn on **Developer Mode**: Settings → Privacy & Security → Developer Mode → On. The phone restarts.
4. In Sideloadly, drag `IosShell-unsigned.ipa` into the window, enter **their** Apple ID, and click **Start**. Enter their Apple ID password and any two-factor code when asked.
5. On the iPhone: Settings → General → VPN & Device Management → their Apple ID → **Trust**. Open IosShell.

## Things to know

- **Free Apple ID:** the app expires after 7 days. Click **Start** in Sideloadly again to renew. Sideloadly's optional AltStore/AltServer can refresh it over Wi-Fi.
- **Bundle identifier:** Sideloadly signs the app with their Apple ID and may ask to change the bundle identifier if the default is taken. Accept the suggested change.
- **Personal values are baked in:** `username` from `.env` is inside the `.ipa`. Check `.env` before you send the file to someone else.
- **Rebuild after changes:** any change to the app (JavaScript or native) needs `npm run ios:ipa` again and a new install on each phone.
- **Your own phone is unaffected:** `npm run ios:device` and `npm start` still work as before.
