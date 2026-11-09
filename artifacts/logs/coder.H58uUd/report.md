FINDINGS

Integration check on bridge v5: all specialist outputs are consistent with the tree, and the full `tests/verify.sh` suite now passes on the v5 wasm. FINDINGS rather than PASS because the same 4 required behaviours remain UNVERIFIED (below). I made no source edits.

## Source identity
HEAD e500c44 plus uncommitted changes; `git diff HEAD` sha256 prefix 2c74d74fd2c699f9 (matches coder, coder_input_audio and coder_render_timing reports). emcc 4.0.18. dist/doom.wasm sha256 prefix 7afb94fa1ec64b5c. web/{index.html,input_audio.js,audio_web.js,render_timing.js} are cmp-identical to dist/. `make -n` before the run: nothing to do. artifacts/specification.md and acceptance-criteria.md do not exist.

## Prior findings read
All six files in artifacts/reports/. No role reports an open defect in a coder-owned file. The only item aimed at me (sector oracle for G3) was done in the previous coder run.

## Work
- Cross-checked report source hashes against the tree (above); they agree.
- Ran `RUN_ID=coder.H58uUd OUT_DIR=artifacts/logs/coder.H58uUd/verify tests/verify.sh` (emsdk 4.0.18 sourced). I did not edit tests/.

## Evidence (artifacts/logs/coder.H58uUd/)
verify.out (exit 0), verify/ (build.log, playtest.log, playtest-results.json, faults.log, identity.txt, screens/):
- Selftest, clean build, and playtest: `PASS failed=0 unverified=4` (includes the 300 s soak).
- Fault injection: 5/5 caught: drop-keyup (I2 I5 I6 C3 I7), drop-blur (I7), ignore-left (I3 E2a E2b), swap-rb (B4), bad-aspect (S1).

## Unresolved (owner)
1. UNVERIFIED G3 door use / level exit (tester): the v5 exports (`cap_sector_ceiling`, `cap_player_sector`) exist, but verify.sh still reports "no door/sector oracle exported". The tester has to write the scenario; the suite does not use the exports yet.
2. UNVERIFIED A1 audio by ear (student/human). Music is an oscillator synth, not GENMIDI/OPL (student decision).
3. UNVERIFIED H1 real hidden-tab timing (human, protocol in tests/README.md).
4. UNVERIFIED P1 save persistence (student scope).
5. Known limits: headless Chromium only; no Firefox/Safari/physical HiDPI; no WASD/mouse mapping; first SFX before a gesture dropped; criteria are agent-proposed, not student-approved; faults injected browser-side only.

## Assumptions
- Doom default keys are the control requirement. Suite run once. Bridge v5 is agent-proposed. Manual interventions: none. Usage: not available.

## Next action
Tester adds a sector-based door scenario to tests/playtest.mjs using the v5 exports; human listens to audio and runs H1.
