#!/usr/bin/env bash
# Cold start: clears every cache, recreates ios/ from scratch, then builds and
# installs the app on the connected iPhone WITHOUT opening it.
# Slower than install.sh, but fixes builds that fail for no clear reason.
#
# Usage:
#   scripts/iphone/clean-build.sh            use the only connected iPhone
#   scripts/iphone/clean-build.sh <UDID>     pick a specific iPhone

set -euo pipefail

cd "$(dirname "$0")/../.."

echo "== Clearing caches =="
# Metro (the JavaScript bundler) and its file map.
rm -rf "${TMPDIR:-/tmp}"metro-* "${TMPDIR:-/tmp}"haste-map-* "${TMPDIR:-/tmp}"react-native-packager-cache-* 2>/dev/null || true
rm -rf node_modules/.cache
# Watchman, if it is installed.
if command -v watchman >/dev/null 2>&1; then
  watchman watch-del-all >/dev/null 2>&1 || true
fi

echo "== Deleting ios/ (it is generated and gitignored) =="
rm -rf ios

echo "== Regenerating ios/ =="
bash scripts/iphone/regenerate.sh

echo "== Building and installing without opening =="
bash scripts/iphone/install.sh "$@"
