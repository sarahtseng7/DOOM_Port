FINDINGS

`tests/verify.sh` exited 0: tooling, selftest, clean build, playtest (0 FAIL) and 5/5 fault injections caught. The result is FINDINGS, not PASS, because 4 required behaviors are still UNVERIFIED. No regression versus tester.puK0iM.

## Source identity
HEAD e500c44 plus uncommitted changes, dirty_diff_sha256 2c74d74f... (same as the previous tester, coder and reviewer runs). Tests and product source are unchanged. emcc from ~/Developer/emsdk.
Command: `RUN_ID=tester.BNf9ts OUT_DIR=artifacts/logs/tester.BNf9ts/verify bash tests/verify.sh`.

## Work and evidence (this directory)
- verify.out, verify/ (identity.txt, build.log, playtest.log, playtest-results.json, faults.log, screens/).
- Playtest: 0 FAIL. Examples: T2 34.98 tics/s, S1 16:10 fit on 4 viewports, soak 300 s with no errors, no long stalls (longtask 0 ms), rAF 60/s.
- Fault injection caught: drop-keyup (I2 I5 I6 C3 I7), drop-blur (I7), ignore-left (I3 E2a E2b), swap-rb (B4), bad-aspect (S1).
- Failed first attempt, preserved: verify-partial-killed/ and verify-partial-killed.out. The first run was stopped by the harness's default 10-minute background limit, not by a test failure. It had reached fault injection with 0 playtest FAIL. I reran from scratch with a longer limit.

## Unresolved (owner)
1. UNVERIFIED A1 audio correctness (student/human). Nobody has listened. Per reviewer_gameplay, the headless audio clock stalls intermittently, so instrumented peak/note checks are flaky. I did not check whether verify.sh asserts on peak; it needs a currentTime-advancing guard.
2. UNVERIFIED P1 save persistence (student scope decision).
3. UNVERIFIED G3 door use / level exit (tester). The reason string in tests/playtest.mjs ("no sector oracle exported") is stale, since the bridge exports sector data. The check is still not written. I did not add it, because this task was to run and report.
4. UNVERIFIED H1 real hidden-tab timing (human; manual protocol in tests/README.md).
Also unverified: pickups, death, menu freezing the player (reviewer_gameplay saw it manually), Firefox, Safari, HiDPI. WASD and mouse are not mapped (known).

## Assumptions
Criteria are agent-proposed, not student-approved. artifacts/specification.md and acceptance-criteria.md do not exist. Headless Chromium only. No tests edited or weakened and no product source touched. Manual interventions: none.

## Next action
Tester: add G3 (steer to the door, Space, assert the sector ceiling rises, walk through), a menu-freezes-player check, an audio-clock guard, and fix the stale reason string. Human: listen to the audio and run H1.
