FINDINGS

`tests/verify.sh` exited 0 (verify/verify-result.json): tooling, selftest, clean build, playtest (42 PASS lines, 0 FAIL) and 5/5 fault injections caught. The result is FINDINGS, not PASS, because 4 required behaviors remain UNVERIFIED. No regression versus artifacts/reports/tester.md.

## Source identity
HEAD e500c44 plus uncommitted changes, dirty_diff_sha256 2c74d74f... (same as the previous run). emcc 4.0.18. Details: verify/identity.txt.
Command: `RUN_ID=tester.8DASDy OUT_DIR=artifacts/logs/tester.8DASDy/verify bash tests/verify.sh` with emsdk sourced. It took about 14 minutes, longer than the 10-minute foreground limit, so it ran in the background.

## Evidence (this directory)
verify.out, verify/ (identity.txt, build.log, selftest.log, playtest.log, playtest-results.json, faults.log, per-fault logs, browser-console.log, dist-sha256.txt, screens/).
- T2 34.97 tics/s. The 300 s soak had no errors, rAF 60.1/s, and 23 changed sample frames.
- Fault injection caught: drop-keyup (I2 I5 I6 C3 I7), drop-blur (I7), ignore-left (I3 E2a E2b), swap-rb (B4), bad-aspect (S1).

## Unresolved (owner)
1. UNVERIFIED A1 audio correctness (student/human): nobody has listened. The prior reviewer saw the headless audio clock stall (peak 0), so no machine-level audio evidence exists.
2. UNVERIFIED P1 save persistence (student scope decision).
3. UNVERIFIED G3 door use / level exit (tester, needs a coder sector/line export or a position-based walk-through).
4. UNVERIFIED H1 real hidden-tab timing (human; manual protocol in tests/README.md).
Also unverified: pickups, death, Firefox, Safari, HiDPI. WASD and mouse are not mapped (known). There is no menu-freezes-player check and no audio-clock-advances guard yet.

## Assumptions
- Criteria are agent-proposed, not student-approved; artifacts/specification.md and acceptance-criteria.md do not exist.
- Headless Chromium only. I edited no tests and no product source, and weakened nothing.
- I read artifacts/reports/tester.md and the tails of reviewer_gameplay.md, and did not re-read the other reports. I used the reviewer's audio-clock finding for item 1.
- Manual interventions: none.

## Next action
Tester: add G3, a menu-freezes-player check, and an audio-clock-advances guard. Human: listen to the audio and run H1.
