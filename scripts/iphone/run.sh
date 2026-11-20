#!/usr/bin/env bash
# Builds the app, installs it on the connected iPhone, starts the dev server
# and opens the app. The build and install are the same steps as install.sh
# (menu option 2). Use install.sh when you do not want the app opened yet.
#
# Usage:
#   scripts/iphone/run.sh            use the only connected iPhone
#   scripts/iphone/run.sh <UDID>     pick a specific iPhone

set -euo pipefail

cd "$(dirname "$0")/../.."

PORT=8081

source scripts/iphone/lib/ui.sh
source scripts/iphone/lib/install-steps.sh

title "Install and open"
begin_steps $(( INSTALL_STEPS + 2 ))
install_steps "${1:-}"

# The bundle ID comes from the app that was just built.
BUNDLE_ID="$(/usr/libexec/PlistBuddy -c "Print :CFBundleIdentifier" "$APP_PATH/Info.plist")"

# Dev server: runs in the background until this script ends (Ctrl+C).
begin_step "Starting the dev server"
mkdir -p "$LOG_DIR"
SERVER_LOG="$LOG_DIR/dev-server.log"
npx expo start --port "$PORT" --non-interactive >"$SERVER_LOG" 2>&1 &
SERVER_PID=$!
trap 'kill "$SERVER_PID" 2>/dev/null || true' EXIT

ready=0
for _ in $(seq 1 120); do
  if curl -fs "http://localhost:$PORT/status" 2>/dev/null | grep -q "packager-status:running"; then
    ready=1
    break
  fi
  if ! kill -0 "$SERVER_PID" 2>/dev/null; then
    end_fail "$SERVER_LOG" 1
  fi
  if [[ -t 1 ]]; then
    _draw_line "…" "$(( SECONDS - STEP_START ))s" 0
  fi
  sleep 1
done
if (( ready == 0 )); then
  end_fail "$SERVER_LOG" 1
fi
end_ok "port $PORT"

# Open the app on the iPhone, now that the dev server is ready.
task "Opening the app on the iPhone" "" \
  xcrun devicectl device process launch --device "$UDID" --terminate-existing "$BUNDLE_ID"

done_banner "The app is open on the iPhone. The dev server is running here; press Ctrl+C to stop it."
wait "$SERVER_PID"
