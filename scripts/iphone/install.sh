#!/usr/bin/env bash
# Builds the app and installs it on the connected iPhone, WITHOUT opening it.
# Afterwards, run `npm start` and open the app on the phone (or run.sh opens it for you).
#
# Usage:
#   scripts/iphone/install.sh            use the only connected iPhone
#   scripts/iphone/install.sh <UDID>     pick a specific iPhone

set -euo pipefail

cd "$(dirname "$0")/../.."

# The app name in app.json is also the Xcode scheme and project name.
SCHEME="$(node -p "require('./app.json').expo.name")"
WORKSPACE="ios/$SCHEME.xcworkspace"
DERIVED_DATA="ios/build"
APP_PATH="$DERIVED_DATA/Build/Products/Debug-iphoneos/$SCHEME.app"

bash scripts/iphone/lib/ensure-native.sh

# Record this build's details for the Build tab in the app.
node scripts/iphone/lib/write-build-info.mjs Debug

# Physical iPhones that are paired and reachable.
DEVICE_IDS=$(xcrun devicectl list devices 2>/dev/null \
  | grep -E "physical" \
  | grep -E "available|connected" \
  | grep -oE "[0-9A-Fa-f]{8}-[0-9A-Fa-f]{16}|[0-9A-Fa-f]{8}-[0-9A-Fa-f]{4}-[0-9A-Fa-f]{4}-[0-9A-Fa-f]{4}-[0-9A-Fa-f]{12}" \
  || true)

if [[ -n "${1:-}" ]]; then
  UDID="$1"
elif [[ -z "$DEVICE_IDS" ]]; then
  echo "No reachable iPhone found. Unlock it, keep the cable connected, and check 'xcrun devicectl list devices'." >&2
  exit 1
elif [[ $(echo "$DEVICE_IDS" | wc -l) -gt 1 ]]; then
  echo "More than one iPhone is connected. Pass the UDID you want:" >&2
  echo "$DEVICE_IDS" | sed 's/^/  /' >&2
  exit 1
else
  UDID="$DEVICE_IDS"
fi

echo "== Building Debug for $UDID =="
xcodebuild \
  -workspace "$WORKSPACE" \
  -scheme "$SCHEME" \
  -configuration Debug \
  -destination "id=$UDID" \
  -derivedDataPath "$DERIVED_DATA" \
  -allowProvisioningUpdates \
  build

echo "== Installing on $UDID (not launching) =="
xcrun devicectl device install app --device "$UDID" "$APP_PATH"

echo
echo "Installed. Now run 'npm start' and open IosShell on the iPhone."
