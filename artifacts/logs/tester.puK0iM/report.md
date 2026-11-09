FINDINGS

`tests/verify.sh` exited 0 (tooling, selftest, clean build, playtest with 0 FAIL, 5/5 fault injections caught). The result is FINDINGS, not PASS, because 4 required behaviors are still UNVERIFIED.

## Source identity
HEAD e500c44 plus uncommitted changes. dirty_diff_sha256 2c74d74f... and the tests are unchanged from the previous run (tester.gkbn63), so this is a re-run of the same source and tests. Command: `RUN_ID=tester.puK0iM OUT_DIR=artifacts/logs/tester.puK0iM/verify bash tests/verify.sh` with emcc 4.0.18 (~/Developer/emsdk) on PATH.
Evidence: verify.out, verify/ (identity.txt, build.log, playtest.log, playtest-results.json, faults.log, screens/).

## Work
Read AGENTS.md, TESTER.md, and artifacts/reports/tester.md. Ran the full suite unchanged, including the 300 s soak. No tests edited or weakened and no product source touched. Playtest: 0 FAIL lines (T2 34.97 tics/s, I5 settled 2092 ms, soak 300 s with no errors or long stalls). Fault injection caught drop-keyup (I2 I5 I6 C3 I7), drop-blur (I7), ignore-left (I3 E2a E2b), swap-rb (B4), bad-aspect (S1).

## Unresolved (owner)
1. UNVERIFIED A1 audio correctness (student/human: nobody has listened; instrumented checks only show that sound is generated).
2. UNVERIFIED P1 save persistence (student scope decision).
3. UNVERIFIED G3 door use / level exit (tester). The reason string in tests/playtest.mjs ("no sector oracle exported") is stale, since capstone_bridge.h exports sector data per the previous report. The check is not written yet. I did not add it in this run, because the task was to run and report.
4. UNVERIFIED H1 real hidden-tab timing (human: manual protocol in tests/README.md).
Also unverified per reviewer_gameplay: pickups, death, menu freezing the player, Firefox/Safari. WASD and mouse are not mapped (known, unchanged).

## Assumptions
Criteria are those proposed in earlier tester reports. No artifacts/specification.md or acceptance-criteria.md was checked again this run, and the criteria remain agent-proposed, not student-approved. Headless Chromium only. The suite ran once; no regression versus the previous run. Manual interventions: none.

## Next action
Tester: add G3 (steer to the door, press Space, assert the door sector ceiling rises, then walk through) and a menu-freezes-player check; fix the stale UNVERIFIED reason. Human: listen to the audio and run H1.
