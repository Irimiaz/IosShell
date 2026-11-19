#!/usr/bin/env bash
# Runs prebuild only when .env, app.json or app.config.ts changed since the last prebuild.
# Used by `npm run ios:device` so changing IOS_BUNDLE_ID or APPLE_TEAM_ID in .env just works.

set -euo pipefail
cd "$(dirname "$0")/../.."

CURRENT="$(bash scripts/build/ios-config-stamp.sh)"
STORED="$(cat ios/.prebuild-stamp 2>/dev/null || true)"

if [[ ! -d ios/IosShell.xcworkspace || "$CURRENT" != "$STORED" ]]; then
  echo "Native config changed or ios/ missing. Running prebuild..."
  bash scripts/build/prebuild.sh
fi
