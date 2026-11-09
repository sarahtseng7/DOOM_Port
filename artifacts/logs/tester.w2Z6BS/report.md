FINDINGS

`tests/verify.sh` exited 0 (tooling, selftest, clean build, playtest failed=0 incl. 300 s soak, 4/4 fault injections caught). Result is FINDINGS, not PASS, because 5 required behaviors remain UNVERIFIED.

## Source identity
HEAD e500c44 plus uncommitted changes; see verify/identity.txt. Command: `RUN_ID=tester.w2Z6BS OUT_DIR=artifacts/logs/tester.w2Z6BS/verify tests/verify.sh` (emsdk env sourced). Exit 0.

## Evidence (artifacts/logs/tester.w2Z6BS/)
verify.out, verify/ (identity.txt, build.log, selftest.log, playtest.log, playtest-results.json, faults.log, verify-result.json, dist-sha256.txt, screens/).
- Passed: load, rendering, controls, key release on blur/pagehide/hidden, fire/ammo, automap, menu, 34.96 tics/s, soak (no errors, no long stalls).
- Faults caught: drop-keyup (I2 I5 I6 C3 I7), drop-blur (I7), ignore-left (I3 E2a E2b), swap-rb (B4).

## Unresolved (owner)
1. UNVERIFIED A1 audio correctness (student scope; nobody has listened).
2. UNVERIFIED P1 save persistence (student scope).
3. UNVERIFIED G3 door use / level exit (tester: no oracle; coder: a sector/line export would help).
4. UNVERIFIED I9 input-module identity (coder: export e.g. cap_input_delivered).
5. UNVERIFIED H1 real hidden-tab timing (headless Chromium can't throttle; needs manual protocol).
6. I6 pixel oracle was flaky in prior runs (0.60-0.79 vs 0.7 limit); it passed this run. Tester should make it position-based. Not changed here.
7. Limits: faults injected browser-side only; criteria agent-proposed, not student-approved; headless Chromium only; outcomes pixel-inferred.

## Assumptions
Doom default keys. No spec/acceptance-criteria files exist. Suite run once. No product source or tests changed. Manual interventions: none. Usage: not available.
