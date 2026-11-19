#!/usr/bin/env bash
# Regenerates ios/ from app.json, app.config.ts and .env, then records the config fingerprint.

set -euo pipefail
cd "$(dirname "$0")/../.."

npx expo prebuild --platform ios --clean

bash scripts/build/ios-config-stamp.sh > ios/.prebuild-stamp
echo "ios/ regenerated from .env, app.json and app.config.ts."
