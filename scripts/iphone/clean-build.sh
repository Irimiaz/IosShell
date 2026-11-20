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

source scripts/iphone/lib/ui.sh
source scripts/iphone/lib/install-steps.sh

clear_caches() {
  # Metro (the JavaScript bundler) and its file map.
  rm -rf "${TMPDIR:-/tmp}"metro-* "${TMPDIR:-/tmp}"haste-map-* \
    "${TMPDIR:-/tmp}"react-native-packager-cache-* 2>/dev/null || true
  rm -rf node_modules/.cache
  # Watchman, if it is installed.
  if command -v watchman >/dev/null 2>&1; then
    watchman watch-del-all >/dev/null 2>&1 || true
  fi
}

title "Clean build, install without opening"
begin_steps $(( INSTALL_STEPS + 3 ))

task "Clearing caches" "" clear_caches
# ios/ is generated and gitignored, so it is safe to delete.
task "Deleting ios/" "" rm -rf ios
task "Regenerating ios/" "" bash scripts/iphone/regenerate.sh

install_steps "${1:-}"

done_banner "Installed. Run 'npm start' and open the app on the iPhone."
