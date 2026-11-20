#!/usr/bin/env bash
# Rebuilds ios/ only when .env, app.json or app.config.ts changed since the last time.
# Used by run.sh, install.sh and package-ipa.sh, so changing IOS_BUNDLE_ID or APPLE_TEAM_ID in .env just works.

set -euo pipefail
cd "$(dirname "$0")/../../.."

APP_NAME="$(node -p "require('./app.json').expo.name")"
CURRENT="$(bash scripts/iphone/lib/config-fingerprint.sh)"
STORED="$(cat ios/.prebuild-stamp 2>/dev/null || true)"

if [[ ! -d "ios/$APP_NAME.xcworkspace" || "$CURRENT" != "$STORED" ]]; then
  echo "Native config changed or ios/ missing. Running prebuild..."
  bash scripts/iphone/regenerate.sh
fi
