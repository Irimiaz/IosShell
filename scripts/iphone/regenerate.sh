#!/usr/bin/env bash
# Rebuilds the ios/ folder from scratch from .env, app.json and app.config.ts.
# Run it after changing those files, or when the build breaks in a strange way.

set -euo pipefail
cd "$(dirname "$0")/../.."

npx expo prebuild --platform ios --clean

bash scripts/iphone/lib/config-fingerprint.sh > ios/.prebuild-stamp
echo "ios/ regenerated from .env, app.json and app.config.ts."
