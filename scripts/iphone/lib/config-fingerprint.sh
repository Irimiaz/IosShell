#!/usr/bin/env bash
# Prints a fingerprint of every input that changes the generated ios/ project:
# IOS_BUNDLE_ID and APPLE_TEAM_ID from .env, plus app.json and app.config.ts.
# regenerate.sh stores this in ios/.prebuild-stamp; if it differs, ios/ is rebuilt.

set -euo pipefail
cd "$(dirname "$0")/../../.."

# Same precedence as Expo: a variable already set in the shell wins over .env.
read_env() {
  if [[ -n "${!1:-}" ]]; then echo "${!1}"; return 0; fi
  [[ -f .env ]] || return 0
  grep -E "^$1=" .env | tail -1 | cut -d= -f2- | tr -d "\"'" || true
}

{
  echo "IOS_BUNDLE_ID=$(read_env IOS_BUNDLE_ID)"
  echo "APPLE_TEAM_ID=$(read_env APPLE_TEAM_ID)"
  cat app.json app.config.ts
} | shasum -a 256 | cut -d' ' -f1
