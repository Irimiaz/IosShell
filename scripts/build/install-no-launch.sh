#!/usr/bin/env bash
# Build the Debug app and install it on the connected iPhone, WITHOUT launching it.
# Afterwards, start the dev server with `npm start` and open the app on the phone.
#
# Usage:
#   scripts/build/install-no-launch.sh            use the only connected iPhone
#   scripts/build/install-no-launch.sh <UDID>     pick a specific iPhone

set -euo pipefail

cd "$(dirname "$0")/../.."

SCHEME="IosShell"
WORKSPACE="ios/IosShell.xcworkspace"
DERIVED_DATA="ios/build"
APP_PATH="$DERIVED_DATA/Build/Products/Debug-iphoneos/$SCHEME.app"

bash scripts/build/ensure-prebuild.sh

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
