FINDINGS

`tests/verify.sh` exited 0. Tooling, selftest, clean build, all 39 required playtest checks (including the 300 s soak) and all 4 fault injections passed. The result is FINDINGS rather than PASS because five required behaviors remain UNVERIFIED and I6 is a known flaky oracle that passed only narrowly.

## Source identity
HEAD e500c44 plus uncommitted changes (verify/identity.txt: dirty_diff_sha256 8a0736f5784ff838..., tests_sha256 fbbe51f2...). emcc 4.0.18. Command: `RUN_ID=tester.aZlP2G OUT_DIR=artifacts/logs/tester.aZlP2G/verify tests/verify.sh`. Exit 0 (verify/verify-result.json).

## Evidence (artifacts/logs/tester.aZlP2G/)
verify.out, verify/ (identity.txt, build.log, selftest.log, playtest.log, playtest-results.json, faults.log, verify-result.json, dist-sha256.txt, screens/). I read artifacts/reports/ (tester, reviewer_gameplay, reviewer_site; the coder reports were not needed). I changed no files except this report and the evidence directory. No tests were weakened.

- Passed: load and console errors, boot frame, colors and channel order, rAF liveness, menu to E1M1, turn left and right, forward movement and its stop on release, blur, pagehide and hidden-tab key release, fire with ammo decrement, automap, Esc menu, 35 tics/s (measured 35.22), soak (300 s, no errors, no stalls, max longtask 0 ms).
- Fault injection: drop-keyup, drop-blur, ignore-left and swap-rb were each caught by the intended checks.
- Previous failure: I6.backward-returns failed in tester.Q0YUP2 (ratio 0.79 vs 0.7 limit). It passed here with start-vs-back=0.368 and start-vs-fwd=0.532, a ratio of 0.69. That is only just under the 0.7 limit. Same build family, same checks, different outcome across runs.

## Unresolved (owner)
1. I6 is flaky (tester). It compares pixel diffs, and results across runs span 0.60-0.79 against a 0.7 limit, so verify.sh can go nonzero or zero without any product change. The reviewer_gameplay report measured backward movement through `_cap_player_x/y` (105 units, opposite direction). A position-based I6 would be a stronger oracle. I did not make that change in this run because I did not want to alter a check mid-verification. I'd record it as a test correction with reasons when it is made.
2. UNVERIFIED (listed in every playtest result):
   - A1 audio correctness (student scope; no human has listened; an active AudioContext would not prove correct sound or music).
   - P1 save persistence (student scope).
   - G3 door use and level exit (tester; no oracle).
   - I9 input-module identity (coder must export a diagnostic such as cap_input_delivered).
   - H1 real hidden-tab timing (needs a manual protocol; headless Chromium can't throttle a background tab).
3. Limits: faults are injected browser-side only. Criteria are agent-proposed, not student-approved. Only headless Chromium was tested; Firefox and Safari were not. Pixel-based checks infer outcomes from the screen.

## Assumptions
Doom default keys. No thresholds were changed. I ran the suite once and did not rerun I6 in isolation. Manual interventions: none. Usage: not available.
