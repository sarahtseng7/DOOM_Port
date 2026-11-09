FINDINGS

`tests/verify.sh` exited 0 (tooling, selftest, clean build, playtest failed=0, 5/5 fault injections caught). Result is FINDINGS, not PASS, because 4 required behaviors remain UNVERIFIED.

## Source identity
HEAD e500c44 plus uncommitted changes; dirty_diff_sha256 2c74d74f... (verify/identity.txt). Command: `RUN_ID=tester.bajOBH OUT_DIR=artifacts/logs/tester.bajOBH/verify tests/verify.sh` (emsdk sourced). Evidence: verify.out, verify/ (identity.txt, build/playtest logs, playtest-results.json, faults.log).

## Work
Read artifacts/reports/tester.md (prior run) and loop/prompts/TESTER.md. Re-ran the full suite unchanged; no tests edited or weakened, no product source touched. Faults caught: drop-keyup (I2 I5 I6 C3 I7), drop-blur (I7), ignore-left (I3 E2a E2b), swap-rb (B4), bad-aspect (S1).

## Unresolved (owner)
1. UNVERIFIED A1 audio correctness (student/human: nobody has listened).
2. UNVERIFIED P1 save persistence (student scope decision).
3. UNVERIFIED G3 door use / level exit (coder: needs sector/line export).
4. UNVERIFIED H1 real hidden-tab timing (human: manual protocol in tests/README.md).
Limits: headless Chromium only; criteria agent-proposed, not student-approved; non-position outcomes pixel-inferred.

## Assumptions
Criteria as in prior tester report. Suite run once; no regressions versus the previous run. Usage: not available.

## Next action
Human listens to audio and runs H1; coder adds door/sector export so G3 can be checked.
