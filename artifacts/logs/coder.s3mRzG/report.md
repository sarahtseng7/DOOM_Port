FINDINGS

Added the bridge v5 sector exports the tester needs for a door check (G3). Clean rebuild succeeds and the exports work in headless Chromium. FINDINGS rather than PASS because I did not run `tests/verify.sh`, so the full regression suite has not been re-run on the new wasm.

## Source identity
HEAD e500c44 plus uncommitted changes (`git diff HEAD` sha256 prefix 2c74d74fd2c699f9). emcc 4.0.18. New dist/doom.wasm sha256 prefix 7afb94fa1ec64b5c (was 6c93cbf125bd366a in all prior reports). artifacts/specification.md and acceptance-criteria.md do not exist.

## Prior findings read
artifacts/reports/{coder,coder_input_audio,coder_render_timing,reviewer_gameplay,reviewer_site,tester}.md. The only open item aimed at coder files is the tester's/reviewer's UNVERIFIED G3 (door use / level exit: no sector oracle).

## Work
- platform/doomgeneric_wasm.c: added read-only `cap_sector_count()`, `cap_sector_floor(i)`, `cap_sector_ceiling(i)`, `cap_player_sector()` (map units, fixed>>16; 0 / -1 when no level or index out of range). Added `#include "r_state.h"`.
- platform/capstone_bridge.h: declared them, CAP_BRIDGE_VERSION 4 -> 5.
- Makefile: four new names in EXPORTED_FUNCTIONS. BUILD.md: one line documenting v5.
- No engine, specialist, tests/ or loop/ files touched.

## Evidence (artifacts/logs/coder.s3mRzG/)
- `make` (incremental, emsdk 4.0.18 sourced) linked without errors.
- check_v5.mjs / check_v5.out (my own script, not a protected check): in headless Chromium, no page errors; bridge version 5; level 101 (E1M1); 85 sectors; player in sector 38, floor 0, ceiling 72; out-of-range index returns 0.
- Console errors: none captured by the script.

## Unresolved (owner)
1. tester: rerun `tests/verify.sh` on wasm 7afb94fa1ec64b5c (new hash) and add G3 using `cap_sector_ceiling` (a door opens when its ceiling rises) plus `cap_player_sector`. The tester must find a door sector and position empirically; I did not identify one.
2. UNVERIFIED, human: audio by ear; hidden-tab H1 protocol.
3. Known limits (unchanged): oscillator-synth music, no WASD/mouse mapping, first SFX before a gesture dropped, no Firefox/Safari.

## Assumptions
Sector heights exposed as integer map units to match existing position exports. The bridge version bump is agent-proposed, not student-approved. Manual interventions: none. Usage: not available.

## Next action
Tester reruns verify.sh on the new hash and adds a sector-based door scenario.
