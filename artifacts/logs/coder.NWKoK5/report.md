FINDINGS

Added read-only player-state exports (bridge v4) so the tester can replace the flaky pixel-diff I6 oracle with a position check, and rebuilt cleanly. `tests/verify.sh` was not run, so this is FINDINGS rather than PASS.

## Source identity
HEAD e500c44 plus uncommitted changes. emcc 4.0.18. Built into this OUTPUT_DIR with `make BUILD=$O/build DIST=$O/dist` (make.log, exit 0, no warnings). Repo `dist/` is NOT rebuilt and is stale relative to these edits; `tests/verify.sh` does its own clean build.

## Prior findings read
All six files in artifacts/reports/. Actionable in my scope:
- tester: I6.backward-returns is flaky (ratio 0.60-0.79 vs 0.7) because no player-position export exists.
- tester: I9 needs a coder diagnostic. `_cap_input_impl`, `_cap_input_delivered_count` and `_cap_input_dropped_count` were already exported in bridge v3, so only the tester's wiring is missing.

## Changes
- platform/doomgeneric_wasm.c: new `cap_player_valid/x/y/angle/health` and `cap_level_id` (read-only, from `players[consoleplayer].mo`, valid only in GS_LEVEL).
- platform/capstone_bridge.h: `CAP_BRIDGE_VERSION` 3 -> 4, declarations.
- Makefile: added the six functions to EXPORTED_FUNCTIONS.
- BUILD.md: one line documenting them.

## Evidence (this dir)
pos.mjs (my script, not a protected check; headless Chromium) -> pos.json, no page errors:
- Title screen: valid=0, health -1, level 0, bridge version 4.
- After starting a new game: valid=1, E1M1 (level 101), health 100, position (1056, -3616).
- After ArrowUp 1.1 s: y -3241 (moved +375). After ArrowDown 1.1 s: y -3566, i.e. 50 map units from start, so backward movement works. This is one run, not a statistical check.

## Unresolved (owner)
1. tester: switch I6 to `Module._cap_player_y/x` (e.g. back-distance-to-start < forward-distance), and wire I9 to `_cap_input_impl` / `_cap_input_delivered_count`. Tests are not mine to edit.
2. tester: run `tests/verify.sh` on this revision. The wasm hash changed from a4c6846627bdcb21.
3. Carried over, unchanged: no human has listened to audio; music is not OPL; Safari/Firefox/physical HiDPI/real hidden tab unverified; G3 door/level exit has no oracle; WASD/mouse not mapped.

## Assumptions
- Doom default keys; no specification or acceptance criteria exist; the bridge is agent-proposed, not student-approved.
- Exports are read-only diagnostics and do not alter engine behavior.
- Manual interventions: none. Usage: not available.
