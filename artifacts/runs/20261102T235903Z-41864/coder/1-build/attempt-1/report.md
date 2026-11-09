# Coder build report — attempt-1
Run 20261102T235903Z-41864, role coder, task 1-build. Source commit e500c44 plus uncommitted
working-tree changes (loop/, tests/ are not mine). Student inputs absent; fallback spec/contract/criteria used
(AGENT-PROPOSED, no approval claimed).

## Changes (all coder-owned paths)
- `Makefile` (new): `make clean all` -> `dist/{index.html,doom.js,doom.wasm,doom.data}`. Emscripten 4.0.18,
  `-O2 -sASYNCIFY`, WAD packaged via `--preload-file assets/doom1.wad@/doom1.wad`. Objects in `build/`.
- `platform/doomgeneric_wasm.c`: DG_* adapters -> cap_*; `main()` runs `doomgeneric_Create(-iwad /doom1.wad)`,
  then loops `doomgeneric_Tick(); emscripten_sleep(0)`. Exports cap_frame/ready/framebuffer_ptr/bridge_version, and new `cap_tic_count()`.
- `platform/cap_fallback.c` (new): WEAK default cap_* (canvas render with BGR0->opaque RGBA, clock, ASYNCIFY sleep, key queue) so the
  port works before specialist modules exist; strong definitions in other platform/*.c override them.
- `platform/engine_stubs.c` (new): `drone`, `net_client_connected` (net code absent from tree; link failed without them).
- `platform/capstone_bridge.h`: added `cap_tic_count()` (contract change, version number NOT bumped; update interface-contract.md later).
- `web/index.html`: loads doom.js, keyboard -> Doom key mapping (Ctrl fire, Space use, Alt strafe, ...), blur/visibility release.

## Evidence (this dir)
- `build.log` — clean build, rc=0. `dist-sha256.txt` — doom.wasm a8a5b0e4..., doom.data 1d7d43be...
- `playtest-quick.log`, `playtest-quick/` — tests/playtest.mjs with QUICK=1 (15s soak; partial by design, exits nonzero).
  Result: 23 PASS (incl. B0-B6, T1 60 rAF/s, menu, E1M1, turn, fire, automap), 2 FAIL (I5, I7), 4 UNVERIFIED (A1, P1, G3, T2).
- Debug (not saved as script): measured `cap_tic_count` rate = 34.95 tics/s over 3s in Chromium (supports T2; the test has no hook yet).

## Unresolved findings
1. I5/I7 FAIL (also I6 failed in an earlier run, passed in the last). Investigation: after key release the view keeps changing for
   ~1.2-1.5s (per-300ms frame diff 0.55,0.47,0.35,0.09,0.001) — Doom momentum/friction at a verified 35 tics/s, and keyup is delivered
   (turning stops immediately, I2 passes). I judge the test settle times (900ms/700ms) too short, not a port bug. NOT confirmed by
   tester; I did not edit tests/. Tester should lengthen settle or poll until stable.
2. Audio, persistence, mouse, non-Chromium: still UNDECIDED (student). Faithful play cannot be called complete.
3. Full 300s soak not run by me; only the 15s quick soak.
4. render_timing / input_audio specialist modules do not exist; weak fallbacks are in use. ASYNCIFY chosen for sleeps; specialists may change.
5. Role isolation is by instruction only (manifest says so). emcc was found at ~/Developer/emsdk (sourced), not on default PATH.
6. Previous-run API-key issue unchanged (runner matter).

## Next action
Tester: re-evaluate I5/I7 settle timing, run full `tests/verify.sh`. Coder: bump CAP_BRIDGE_VERSION/contract for cap_tic_count when specialists land.
Usage: not available. Manual interventions: none.
