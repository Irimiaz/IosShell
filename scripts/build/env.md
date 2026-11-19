# Values in `.env`

`.env` sits in the project root. It is gitignored, so the values stay on your Mac. [`.env.example`](../../.env.example) lists every variable with a placeholder.

| Variable | Required | What it is | Used for |
| --- | --- | --- | --- |
| `IOS_BUNDLE_ID` | yes for iOS builds | The app's bundle identifier | `PRODUCT_BUNDLE_IDENTIFIER` in `ios/` |
| `APPLE_TEAM_ID` | no | The team ID of the Apple ID that signs the app | `DEVELOPMENT_TEAM` in `ios/` |
| `ANDROID_PACKAGE` | no | The Android application ID | `android.package` in the Expo config (Android builds only) |
| `username` | yes | Any name. The app refuses to start without it | `Constants.expoConfig.extra.username` in the app |

After you change a value, run `npm run ios:device`. It regenerates `ios/` when `.env` changed.

## IOS_BUNDLE_ID

You choose this value. Apple does not hand it out, and nothing has to be looked up.

- Use the form `com.<something-unique>.IosShell`, for example `com.janedoe.IosShell`.
- It must be unique across all Apple developer accounts. If a build fails with "Bundle identifier is not available", pick another value.
- Use a different value for each Apple ID that installs the app on a phone.

## APPLE_TEAM_ID

Leave it empty to let Xcode choose the team. Set it when you want the signing team fixed, for example when you have several Apple IDs in Xcode.

The team ID is written as `OU=` in the certificate that Xcode creates for each Apple ID. Your Mac must have that certificate first:

1. Add the Apple ID in **Xcode → Settings → Accounts → +**.
2. Create the certificate. If you have not signed anything with that Apple ID yet, run `npm run prebuild`, open `ios/IosShell.xcworkspace` in Xcode, select the **IosShell** target → **Signing & Capabilities**, and choose the team. Xcode creates the certificate.
3. Print the team IDs of your Apple Development certificates:

   ```bash
   security find-certificate -a -c "Apple Development" -p | awk 'BEGIN{c=""} /BEGIN CERTIFICATE/{c=""} {c=c $0 "\n"} /END CERTIFICATE/{printf "%s", c | "openssl x509 -noout -subject"; close("openssl x509 -noout -subject")}'
   ```

   Each output line ends with `OU=<team id>`. The `CN=` part shows the Apple ID the certificate belongs to. Copy the `OU=` value for the Apple ID you want.

   Example output (your values will differ): `subject=... CN=Apple Development: <your Apple ID> (...), OU=Z23JXMNT76, O=<your name>, C=US`. Here `Z23JXMNT76` is the team ID.

If the command prints nothing, step 2 has not run yet.

Paid Apple Developer accounts also show the team ID at **developer.apple.com → Account → Membership details**. Free accounts do not show it there, so use the command above.

## ANDROID_PACKAGE

Only needed for Android builds. Same rules as `IOS_BUNDLE_ID`: any unique reverse-domain name, for example `com.janedoe.IosShell`.

## username

Any text you like. There is nothing to look up, and it does not have to match anything at Apple. It is read at startup in `src/config/env.ts`, and the app stops with "Missing environment variable: username" if it is empty.

## Check the values reached the Xcode project

```bash
npm run prebuild
grep -h "PRODUCT_BUNDLE_IDENTIFIER\|DEVELOPMENT_TEAM" ios/IosShell.xcodeproj/project.pbxproj | sort -u
```

You should see your `IOS_BUNDLE_ID` and `APPLE_TEAM_ID`. If the values are missing, check `.env` for typos, and for a leftover shell variable with the same name (a shell variable overrides `.env`).
