#!/usr/bin/env bash
# Builds a Release app and packages it as an UNSIGNED .ipa file to send to someone else.
#
# The JavaScript is bundled inside the app, so it does not need `npm start`
# or the Mac once installed. The .ipa is not signed with any Apple ID; the
# person installing it signs it with their own Apple ID (e.g. with Sideloadly).
#
# Usage:
#   scripts/iphone/package-ipa.sh
#
# Output: dist/IosShell-unsigned.ipa

set -euo pipefail

cd "$(dirname "$0")/../.."

source scripts/iphone/lib/ui.sh

# The app name in app.json is also the Xcode scheme and project name.
SCHEME="$(node -p "require('./app.json').expo.name")"
WORKSPACE="ios/$SCHEME.xcworkspace"
DERIVED_DATA="ios/build-release"
APP_PATH="$DERIVED_DATA/Build/Products/Release-iphoneos/$SCHEME.app"
OUT_DIR="dist"
IPA_PATH="$OUT_DIR/$SCHEME-unsigned.ipa"

build_release() {
  xcodebuild \
    -workspace "$WORKSPACE" \
    -scheme "$SCHEME" \
    -configuration Release \
    -sdk iphoneos \
    -derivedDataPath "$DERIVED_DATA" \
    CODE_SIGNING_ALLOWED=NO \
    CODE_SIGNING_REQUIRED=NO \
    CODE_SIGN_IDENTITY="" \
    build
}

# Copies the .app into a Payload folder and zips it. Runs in a subshell so the
# working directory is restored afterwards.
package() {
  local stage
  stage="$(mktemp -d)"
  mkdir -p "$stage/Payload"
  cp -R "$APP_PATH" "$stage/Payload/"
  # Strip any signature leftovers so the installer re-signs cleanly.
  rm -rf "$stage/Payload/$SCHEME.app/_CodeSignature"
  mkdir -p "$OUT_DIR"
  rm -f "$IPA_PATH"
  (cd "$stage" && zip -qr "$OLDPWD/$IPA_PATH" Payload)
  rm -rf "$stage"
}

title "Make a file to send to someone else (unsigned Release .ipa)"
begin_steps 4

task "Preparing the native project" "" bash scripts/iphone/lib/ensure-native.sh
task "Recording build info" "" node scripts/iphone/lib/write-build-info.mjs Release
task "Building Release" "^(CompileC|CompileSwift|SwiftCompile|Ld) " build_release

# A successful build must leave the .app behind.
if [[ ! -d "$APP_PATH" ]]; then
  echo "Build finished but $APP_PATH was not found." >&2
  exit 1
fi
task "Packaging the .ipa" "" package

done_banner "Done: $PWD/$IPA_PATH"
echo "Send this file to the other person. They install it with Sideloadly (see docs/IPHONE.md, Send the app to someone else)."
