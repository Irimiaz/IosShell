#!/usr/bin/env bash
# Builds the app and installs it on the connected iPhone, WITHOUT opening it.
# Afterwards, run `npm start` and open the app on the phone, or use run.sh
# (menu option 3) to start the dev server and open it for you.
#
# Usage:
#   scripts/iphone/install.sh            use the only connected iPhone
#   scripts/iphone/install.sh <UDID>     pick a specific iPhone

set -euo pipefail

cd "$(dirname "$0")/../.."

source scripts/iphone/lib/ui.sh
source scripts/iphone/lib/install-steps.sh

title "Install without opening"
begin_steps "$INSTALL_STEPS"
install_steps "${1:-}"

done_banner "Installed. Run 'npm start' and open the app on the iPhone."
