#!/usr/bin/env bash
# Fault-injection runs (tester-owned): each FAULT must make playtest.mjs exit 1 with one of the expected
# check IDs FAILing. Proves the checks catch these faults; says nothing about faults not listed.
# Usage: tests/faults.sh  (needs dist/ built). Env: OUT_DIR (evidence root), SOAK_SECONDS (default 5).
set -u
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"; cd "$ROOT"
BASE="${OUT_DIR:-artifacts/runs/manual-$(date -u +%Y%m%dT%H%M%SZ)/tester/faults}"; mkdir -p "$BASE"
BASE="$(cd "$BASE" && pwd)"
declare -a CASES=("drop-keyup:I2 I5 I6 C3 I7" "drop-blur:I7" "ignore-left:I3 E2a E2b" "swap-rb:B4" "bad-aspect:S1" "drop-use:G3a G3b G3c" "drop-visibility:E2b")
rc=0
for c in "${CASES[@]}"; do
  f="${c%%:*}"; ids="${c#*:}"
  FAULT="$f" OUT_DIR="$BASE/$f" SOAK_SECONDS="${SOAK_SECONDS:-5}" node tests/playtest.mjs >"$BASE/$f.log" 2>&1; code=$?
  hit=""; for id in $ids; do grep -q "^FAIL *$id" "$BASE/$f.log" && hit="$hit $id"; done
  if [ "$code" -eq 1 ] && [ -n "$hit" ]; then echo "caught  FAULT=$f (failed:$hit)"
  else echo "MISSED  FAULT=$f exit=$code expected one of: $ids (see $BASE/$f.log)"; rc=1; fi
done
exit $rc
