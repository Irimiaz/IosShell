#!/usr/bin/env bash
# The build-and-install steps used by install.sh (menu option 2) and run.sh
# (option 3). Source it after ui.sh, then call install_steps.
#
# Which iPhone is used: the one given as an argument, or the only iPhone that
# is connected by cable or reachable over Wi-Fi (see pick-device.sh). The Apple
# ID is not used to choose the device; it is used for signing (see docs/IPHONE.md).

INSTALL_STEPS=5

# install_steps [UDID]
# Sets UDID and APP_PATH for the caller.
install_steps() {
  local device_arg="${1:-}" scheme workspace

  # The app name in app.json is also the Xcode scheme and project name.
  scheme="$(node -p "require('./app.json').expo.name")"
  workspace="ios/$scheme.xcworkspace"
  APP_PATH="ios/build/Build/Products/Debug-iphoneos/$scheme.app"

  task "Preparing the native project" "" bash scripts/iphone/lib/ensure-native.sh
  task "Recording build info" "" node scripts/iphone/lib/write-build-info.mjs Debug

  begin_step "Finding the iPhone"
  source scripts/iphone/lib/pick-device.sh "$device_arg"
  end_ok "$UDID"

  # -allowProvisioningUpdates lets Xcode create the signing profile for the
  # iPhone. Without it, automatic signing fails. This is the difference from
  # `npx expo run:ios`.
  task "Building the app" \
    "^(CompileC|CompileSwift|SwiftCompile|Ld|CodeSign) " \
    xcodebuild \
      -workspace "$workspace" \
      -scheme "$scheme" \
      -configuration Debug \
      -destination "id=$UDID" \
      -derivedDataPath ios/build \
      -allowProvisioningUpdates \
      build

  task "Installing on the iPhone" "" \
    xcrun devicectl device install app --device "$UDID" "$APP_PATH"
}
