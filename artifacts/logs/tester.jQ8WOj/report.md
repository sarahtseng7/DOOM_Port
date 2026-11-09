FINDINGS

`tests/verify.sh` exited 0 (verify/verify-result.json): tooling, selftest, clean build, playtest (41 PASS, 0 FAIL) and 5/5 fault injections caught. The result is FINDINGS, not PASS, because 4 required behaviors remain UNVERIFIED. No regression versus the previous tester run.

## Source identity
HEAD e500c44 plus uncommitted changes, dirty_diff_sha256 2c74d74f... (same as previous reports, so no product or test changes since). Details in verify/identity.txt.
Command: `RUN_ID=tester.jQ8WOj OUT_DIR=artifacts/logs/tester.jQ8WOj/verify bash tests/verify.sh` with emsdk sourced.

## Evidence (this directory)
verify.out, verify/ (identity.txt, build.log, selftest.log, playtest.log, playtest-results.json, faults.log, per-fault logs, browser-console.log, dist-sha256.txt, screens/).
- T2 34.98 tics/s; 300 s soak with no errors, rAF 60.1/s, longtask 0 ms, 22 changed sample frames.
- Fault injection caught: drop-keyup (I2 I5 I6 C3 I7), drop-blur (I7), ignore-left (I3 E2a E2b), swap-rb (B4), bad-aspect (S1).

## Unresolved (owner)
1. UNVERIFIED A1 audio correctness (student/human): nobody has listened; reviewer_gameplay saw the headless audio clock stall (currentTime +0.000 s in 2 s), so counters/peaks are not proof of sound.
2. UNVERIFIED P1 save persistence (student scope decision).
3. UNVERIFIED G3 door use / level exit (tester, not done this run: I only ran the suite and did not edit tests). The reason string in tests/playtest.mjs ("no door/sector oracle exported") may be stale; verify whether the bridge exports sector data.
4. UNVERIFIED H1 real hidden-tab timing (human; manual protocol in tests/README.md).
Also unverified: pickups, death, Firefox, Safari, HiDPI. WASD and mouse are not mapped (known). Menu-freezes-player: reviewer_gameplay passed it by frame diff once; the suite has no such check.

## Assumptions
- Criteria are agent-proposed, not student-approved; artifacts/specification.md and acceptance-criteria.md do not exist.
- Headless Chromium only. No tests edited or weakened; no product source touched.
- Read reports in artifacts/reports/ (tester, reviewer_gameplay, reviewer_site; the coder reports only by name).
- Manual interventions: none.

## Next action
Tester: add G3 (steer to door, Space, assert door opens, walk through), a menu-freezes-player check, an audio-clock-advances guard, and fix the stale G3 reason string. Human: listen to audio and run H1.
