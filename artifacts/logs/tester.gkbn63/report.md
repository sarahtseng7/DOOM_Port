FINDINGS

`tests/verify.sh` exited 0 (tooling, selftest, clean build, playtest with 0 FAIL, 5/5 fault injections caught). The result is FINDINGS, not PASS, because 4 required behaviors are still UNVERIFIED.

## Source identity
HEAD e500c44 plus uncommitted changes. dirty_diff_sha256 2c74d74f... is identical to the previous tester run (tester.4fEyMa), so this is a re-run of the same source and tests. Command: `RUN_ID=tester.gkbn63 OUT_DIR=artifacts/logs/tester.gkbn63/verify tests/verify.sh` with emsdk 4.0.18 sourced.
Evidence: verify.out, verify/ (identity.txt, build.log, playtest.log, playtest-results.json, faults.log, screens/).

## Work
Read AGENTS.md, READMEs, TESTER.md, and artifacts/reports/. Ran the full suite unchanged, including the 300 s soak. No tests edited or weakened and no product source touched. Playtest: 0 FAIL lines. Fault injection caught drop-keyup (I2 I5 I6 C3 I7), drop-blur (I7), ignore-left (I3 E2a E2b), swap-rb (B4), bad-aspect (S1).

## Unresolved (owner)
1. UNVERIFIED A1 audio correctness (student/human: nobody has listened; instrumented checks only show that sound is generated).
2. UNVERIFIED P1 save persistence (student scope decision).
3. UNVERIFIED G3 door use / level exit (tester). The reason string in tests/playtest.mjs says no sector oracle is exported, which is stale: platform/capstone_bridge.h v5 exports cap_sector_count/floor/ceiling and cap_player_sector. The check is simply not written yet.
4. UNVERIFIED H1 real hidden-tab timing (human: manual protocol in tests/README.md).
Also unverified per reviewer_gameplay: pickups, death, menu freezing the player, Firefox/Safari. WASD and mouse are not mapped (known, unchanged).

## Assumptions
Criteria are those proposed in earlier tester reports. No artifacts/specification.md or acceptance-criteria.md exists, and the criteria are agent-proposed and not student-approved. Headless Chromium only. The suite ran once; no regression versus the previous run. Manual interventions: none. Usage: not available.

## Next action
Tester: add G3 to tests/ using the reviewer_gameplay recipe (steer to (1519,-2490) facing east, press Space, assert ceiling of the door sector > 0, hold ArrowUp, assert x > 1700), update the stale UNVERIFIED reason, and add a menu-freezes-player check. Human: listen to the audio and run H1.
