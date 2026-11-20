#!/usr/bin/env bash
# Builds the app, installs it on the connected iPhone and opens it.
# It also starts the dev server for you, so the app loads your code changes.
# Use it the first time, and after changing .env, app.json or native packages.
#
# Usage:
#   scripts/iphone/run.sh     (or: npm run iphone, then choose 2)

set -euo pipefail

cd "$(dirname "$0")/../.."

bash scripts/iphone/lib/ensure-native.sh
npx expo run:ios --device
