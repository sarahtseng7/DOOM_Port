FINDINGS

`tests/verify.sh` exited 0 (tooling, selftest, clean build, playtest failed=0, 5/5 fault injections caught). Result is FINDINGS, not PASS, because 4 required behaviors remain UNVERIFIED.

## Source identity
HEAD e500c44 plus uncommitted changes; dirty_diff_sha256 2c74d74f... (verify/identity.txt, same as prior run). Command: `RUN_ID=tester.4fEyMa OUT_DIR=artifacts/logs/tester.4fEyMa/verify tests/verify.sh` with emsdk sourced. Evidence: verify.out, verify/ (identity.txt, build.log, playtest.log, playtest-results.json, faults.log, screens/).

## Work
Read artifacts/reports/ (esp. tester.md, reviewer_gameplay.md) and TESTER.md. Re-ran the full suite unchanged (about 10+ min incl. 300 s soak). No tests edited or weakened; no product source touched. 0 FAIL lines. T2 34.97 tics/s, S1 and I9 pass, soak R1-R4 pass. Faults caught: drop-keyup (I2 I5 I6 C3 I7), drop-blur (I7), ignore-left (I3 E2a E2b), swap-rb (B4), bad-aspect (S1).

## Unresolved (owner)
1. UNVERIFIED A1 audio correctness (student/human: nobody has listened).
2. UNVERIFIED P1 save persistence (student scope decision).
3. UNVERIFIED G3 door use / level exit (coder: sector/line export exists in reviewer_gameplay's recipe, but verify.sh does not yet check it; tester follow-up below).
4. UNVERIFIED H1 real hidden-tab timing (human: manual protocol in tests/README.md).
Limits: headless Chromium only; criteria agent-proposed, not student-approved; non-position outcomes pixel-inferred.

## Assumptions
Criteria as in prior tester report. Suite run once; no regression versus the previous run. reviewer_gameplay's door walk-through (cap_sector_ceiling) was not re-run here and is not part of verify.sh. Usage: not available.

## Next action
Tester: add a G3 check to tests/ from the reviewer_gameplay recipe (steer to (1519,-2490) facing east, Space, assert cap_sector_ceiling(4)>0, hold ArrowUp, assert x>1700). Human: listen to audio and run H1.
