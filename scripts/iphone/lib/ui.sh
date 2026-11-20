#!/usr/bin/env bash
# Shared look for the iPhone build scripts: a progress bar with step numbers,
# a spinner with elapsed time, and one log file per step. Source it; do not run it.
#
#   source scripts/iphone/lib/ui.sh
#   begin_steps 3                                  # how many steps there are
#   task "Preparing" "" bash some-script.sh        # one command = one step
#   begin_step "Finding the iPhone"; ...; end_ok   # a step with your own code
#   done_banner "Finished."
#
# Output of each step goes to .expo/build-logs/<step>.log (gitignored). When a
# step fails, its last lines are shown and the script stops.
# The spinner and bar are drawn only in a terminal; logs are plain text.

LOG_DIR=".expo/build-logs"
STEP_TOTAL=0
STEP_NO=0
STEP_LABEL=""
STEP_START=0
SPIN_TICK=0

if [[ -t 1 ]]; then
  C_GREEN=$'\033[32m'
  C_RED=$'\033[31m'
  C_DIM=$'\033[2m'
  C_BOLD=$'\033[1m'
  C_OFF=$'\033[0m'
else
  C_GREEN=""
  C_RED=""
  C_DIM=""
  C_BOLD=""
  C_OFF=""
fi

# bar <done> <total>: a 20-character progress bar.
bar() {
  local done_n="$1" total="$2" width=20 filled=0 i out=""
  if (( total > 0 )); then filled=$(( done_n * width / total )); fi
  for (( i = 0; i < width; i++ )); do
    if (( i < filled )); then out+="█"; else out+="░"; fi
  done
  printf '%s' "$out"
}

# Title of a script, above its steps.
title() {
  printf '\n%s%s%s\n' "$C_BOLD" "$1" "$C_OFF"
}

begin_steps() {
  STEP_TOTAL="$1"
  STEP_NO=0
}

# Redraws the current step line. Arguments: symbol, text, 1 if the step is done.
_draw_line() {
  local done_n=$(( STEP_NO - 1 ))
  if (( $3 )); then done_n=$STEP_NO; fi
  printf '\r\033[2K%s %s/%s  %s  %s %s' \
    "$(bar "$done_n" "$STEP_TOTAL")" "$STEP_NO" "$STEP_TOTAL" "$STEP_LABEL" "$1" "$2"
}

begin_step() {
  STEP_NO=$(( STEP_NO + 1 ))
  STEP_LABEL="$1"
  STEP_START=$SECONDS
  if [[ ! -t 1 ]]; then
    printf '[%s/%s] %s...\n' "$STEP_NO" "$STEP_TOTAL" "$STEP_LABEL"
  fi
}

# Shows a spinner with elapsed time and, if a pattern is given, how many log
# lines match it (for example compile steps). Returns when the process ends.
_spin_wait() {
  local pid="$1" log="$2" pattern="$3" frames='|/-\' ch count
  while kill -0 "$pid" 2>/dev/null; do
    SPIN_TICK=$(( (SPIN_TICK + 1) % 4 ))
    ch="${frames:SPIN_TICK:1}"
    count=""
    if [[ -n "$pattern" && -f "$log" ]]; then
      count=" · $(grep -cE "$pattern" "$log" || true) steps"
    fi
    _draw_line "$C_DIM$ch$C_OFF" "$(( SECONDS - STEP_START ))s$count" 0
    sleep 0.2
  done
}

end_ok() {
  local detail="${1:-}" text="done in $(( SECONDS - STEP_START ))s"
  if [[ -n "$detail" ]]; then text="$text · $detail"; fi
  if [[ -t 1 ]]; then
    _draw_line "${C_GREEN}✓${C_OFF}" "$text" 1
    printf '\n'
  else
    printf '  %s\n' "$text"
  fi
}

# Stops the script, after showing the end of the failed step's log.
end_fail() {
  local log="$1" rc="$2"
  if [[ -t 1 ]]; then
    _draw_line "${C_RED}✗${C_OFF}" "failed after $(( SECONDS - STEP_START ))s" 0
    printf '\n'
  else
    printf '  failed after %ss\n' "$(( SECONDS - STEP_START ))"
  fi
  printf '\n%sLast lines of the log:%s\n' "$C_BOLD" "$C_OFF"
  tail -n 30 "$log" 2>/dev/null | sed 's/^/  /'
  printf '\n%sFull log:%s %s\n' "$C_DIM" "$C_OFF" "$log"
  exit "$rc"
}

# task <label> <count pattern or ""> <command> [args...]
# Runs the command as one step, with a spinner. The pattern counts matching
# lines in the log while it runs, e.g. "^CompileC " for compile steps.
task() {
  local label="$1" pattern="$2" log pid rc=0
  shift 2
  mkdir -p "$LOG_DIR"
  log="$LOG_DIR/$(printf '%s' "$label" | tr 'A-Z ' 'a-z-' | tr -cd 'a-z0-9-').log"

  begin_step "$label"
  "$@" <&0 >"$log" 2>&1 &
  pid=$!
  trap 'kill "$pid" 2>/dev/null; exit 130' INT TERM
  if [[ -t 1 ]]; then _spin_wait "$pid" "$log" "$pattern"; fi
  wait "$pid" || rc=$?
  trap - INT TERM

  if (( rc == 0 )); then
    end_ok
  else
    end_fail "$log" "$rc"
  fi
}

done_banner() {
  printf '\n%s%s%s\n' "$C_GREEN" "$1" "$C_OFF"
}
