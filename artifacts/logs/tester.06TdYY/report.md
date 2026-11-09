FINDINGS

`tests/verify.sh` exited 0 (verify/verify-result.json): tooling, selftest, clean build, playtest (41 PASS, 0 FAIL) and 5/5 fault injections caught. The result is FINDINGS, not PASS, because 4 required behaviors remain UNVERIFIED. No regression versus the previous report (artifacts/reports/tester.md).

## Source identity
HEAD e500c44 plus uncommitted changes, dirty_diff_sha256 2c74d74f... (same as the previous run). Details: verify/identity.txt.
Command: `RUN_ID=tester.06TdYY OUT_DIR=artifacts/logs/tester.06TdYY/verify bash tests/verify.sh` with emsdk sourced.

## Evidence (this directory)
verify.out, verify/ (identity.txt, build.log, selftest.log, playtest.log, playtest-results.json, faults.log, per-fault logs, browser-console.log, dist-sha256.txt, screens/).
- T2 34.98 tics/s; 300 s soak with no errors, rAF 60/s, longtask 0 ms, 23 changed sample frames.
- Fault injection caught: drop-keyup (I2 I5 I6 C3 I7), drop-blur (I7), ignore-left (I3 E2a E2b), swap-rb (B4), bad-aspect (S1).

## Unresolved (owner)
1. UNVERIFIED A1 audio correctness (student/human): nobody has listened; an active AudioContext or counters do not prove correct sound.
2. UNVERIFIED P1 save persistence (student scope decision).
3. UNVERIFIED G3 door use / level exit (tester): no door/sector oracle exported; needs a coder sector/line export or a position-based walk-through.
4. UNVERIFIED H1 real hidden-tab timing (human; manual protocol in tests/README.md).
Also unverified: pickups, death, Firefox, Safari, HiDPI. WASD and mouse are not mapped (known). No menu-freezes-player check.

## Assumptions
- Criteria are agent-proposed, not student-approved; artifacts/specification.md and acceptance-criteria.md do not exist.
- Headless Chromium only. I edited no tests and no product source, and weakened nothing.
- Prior findings were taken from artifacts/reports/tester.md. I did not re-read the other reports.
- Manual interventions: none.

## Next action
Tester: add G3, a menu-freezes-player check, and an audio-clock-advances guard. Human: listen to the audio and run H1.
