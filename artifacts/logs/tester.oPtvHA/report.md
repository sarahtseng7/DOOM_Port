FINDINGS

`tests/verify.sh` exited 0: tooling, selftest, clean build, all required playtest checks (failed=0, incl. 300 s soak) and all 4 fault injections passed. The result is FINDINGS rather than PASS because 5 required behaviors remain UNVERIFIED and the I6 oracle is flaky.

## Source identity
HEAD e500c44 plus uncommitted changes (verify/identity.txt, dirty_diff_sha256 8a0736f5...). Command: `RUN_ID=tester.oPtvHA OUT_DIR=artifacts/logs/tester.oPtvHA/verify tests/verify.sh` (emsdk env sourced). Exit 0 (verify/verify-result.json).

## Evidence (artifacts/logs/tester.oPtvHA/)
verify.out, verify/ (identity.txt, build.log, selftest.log, playtest.log, playtest-results.json, faults.log, verify-result.json, dist-sha256.txt, screens/).
- Passed: load/console, boot frame, colors, rAF liveness, menu -> E1M1, turn, move/stop on release, blur/pagehide/hidden key release, fire, automap, Esc menu, 34.98 tics/s, soak (no errors, no stalls, max longtask 0 ms).
- Fault injection caught: drop-keyup (I2 I5 I6 C3 I7), drop-blur (I7), ignore-left (I3 E2a E2b), swap-rb (B4).
- I6.backward-returns passed (start-vs-back=0.348, start-vs-fwd=0.584, ratio 0.60). Earlier runs ranged 0.60-0.79 against a 0.7 limit (tester.Q0YUP2 failed at 0.79).

## Unresolved (owner)
1. I6 flaky pixel oracle (tester). Not changed this run: no thresholds altered. Should become position-based using `_cap_player_x/y` exports, as a documented test correction.
2. UNVERIFIED, listed in the results: A1 audio correctness (student scope, nobody has listened); P1 save persistence (student scope); G3 door use and level exit (tester, no oracle); I9 input-module identity (coder must export e.g. cap_input_delivered); H1 real hidden-tab timing (headless Chromium can't throttle; needs manual protocol).
3. Limits: faults injected browser-side only; criteria agent-proposed, not student-approved; headless Chromium only; pixel-inferred outcomes.

## Assumptions
Doom default keys. No spec/acceptance-criteria files exist. Ran the suite once; I6 not rerun in isolation. No product source or tests changed. Manual interventions: none. Usage: not available.
