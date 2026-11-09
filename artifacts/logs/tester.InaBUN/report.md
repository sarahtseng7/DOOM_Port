FINDINGS

`tests/verify.sh` exited 0 (verify/verify-result.json): tooling, selftest, clean build, playtest (41 PASS, 0 FAIL) and 5/5 fault injections caught. The result is FINDINGS, not PASS, because 4 required behaviors remain UNVERIFIED. No regression versus tester.BNf9ts.

## Source identity
HEAD e500c44 plus uncommitted changes, dirty_diff_sha256 2c74d74f... (identical to the previous tester run, so no product or test changes since). Details in verify/identity.txt.
Command: `RUN_ID=tester.InaBUN OUT_DIR=artifacts/logs/tester.InaBUN/verify bash tests/verify.sh`, run in the background with emsdk sourced.

## Evidence (this directory)
verify.out, verify/ (identity.txt, build.log, selftest.log, playtest.log, playtest-results.json, faults.log, per-fault logs, browser-console.log, dist-sha256.txt, screens/).
- Examples: T2 34.97 tics/s, S1 16:10 on 4 viewports, I9 delivered 46 / dropped 0, 300 s soak with no errors, rAF 60.1/s, longtask 0 ms.
- Fault injection caught: drop-keyup (I2 I5 I6 C3 I7), drop-blur (I7), ignore-left (I3 E2a E2b), swap-rb (B4), bad-aspect (S1).

## Unresolved (owner)
1. UNVERIFIED A1 audio correctness (student/human): nobody has listened; the headless audio clock is flaky, so a pass would not prove correct sound.
2. UNVERIFIED P1 save persistence (student scope decision).
3. UNVERIFIED G3 door use / level exit (tester): the check is not written. The reason string in tests/playtest.mjs ("no sector oracle exported") is stale, since the bridge exports sector data.
4. UNVERIFIED H1 real hidden-tab timing (human; manual protocol in tests/README.md).
Also unverified: pickups, death, menu freezing the player, Firefox, Safari, HiDPI. WASD and mouse are not mapped (known).

## Assumptions
- Criteria are agent-proposed, not student-approved. artifacts/specification.md and acceptance-criteria.md were not checked this run; the previous report said they don't exist.
- Headless Chromium only. No tests edited or weakened and no product source touched. I did not read the reviewer reports in detail; I relied on tester.md for prior findings.
- My first command's `head` of reviewer reports produced no output because it was backgrounded. Nothing else went wrong. A wait loop I started was killed by me after it matched its own shell; this did not affect the verify run.

## Next action
Tester: write G3 (steer to door, Space, assert sector ceiling rises, walk through), a menu-freezes-player check, an audio-clock guard, and fix the stale reason string. Human: listen to the audio and run H1.
