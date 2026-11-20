#!/usr/bin/env bash
# Sets UDID to the iPhone to use. Source this file; do not run it.
#   source scripts/iphone/lib/pick-device.sh "${1:-}"
# With an argument, that UDID is used. Without one, the only reachable iPhone
# is used. Exits with a message when there is none or more than one.

_list_udids() {
  xcrun devicectl list devices 2>/dev/null \
    | grep -E "physical" \
    | grep -E "available|connected" \
    | grep -oE "[0-9A-Fa-f]{8}-[0-9A-Fa-f]{16}|[0-9A-Fa-f]{8}-[0-9A-Fa-f]{4}-[0-9A-Fa-f]{4}-[0-9A-Fa-f]{4}-[0-9A-Fa-f]{12}" \
    || true
}

if [[ -n "${1:-}" ]]; then
  UDID="$1"
else
  DEVICE_IDS="$(_list_udids)"
  if [[ -z "$DEVICE_IDS" ]]; then
    echo "No reachable iPhone found. Unlock it, keep the cable connected, and check 'xcrun devicectl list devices'." >&2
    exit 1
  elif [[ $(echo "$DEVICE_IDS" | wc -l) -gt 1 ]]; then
    echo "More than one iPhone is connected. Pass the UDID you want:" >&2
    echo "$DEVICE_IDS" | sed 's/^/  /' >&2
    exit 1
  else
    UDID="$DEVICE_IDS"
  fi
fi
