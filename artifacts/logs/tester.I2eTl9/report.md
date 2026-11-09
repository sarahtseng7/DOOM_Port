FINDINGS

`tests/verify.sh` exited 0 (rc=0): no check failed and all 6 injected faults were caught. Four required behaviors are still UNVERIFIED (A1, P1, G3c, H1), so the result is FINDINGS, not PASS. I did not modify product source or tests.

## Work
- Read AGENTS.md, the TESTER prompt, tests/README.md and the prior artifacts/reports/tester.md. No specification.md or acceptance-criteria.md exists. No new reproducible failure was open, so I added no regression checks.
- Attempt 1 (`verify-attempt1-killed.out`) was killed by the 10-minute background limit. It had reached playtest PASS and 5 of 6 faults, with no rc written. That is not a result. I reran in full with a 30-minute limit.
- Attempt 2 (`verify.out`, ends `rc=0`): tooling, selftest, clean build, playtest (300 s soak), fault injection.
- Playtest: failed=0, 4 UNVERIFIED. Faults 6/6 caught: drop-keyup (I2 I5 I6 C3 I7), drop-blur (I7), ignore-left (I3 E2a E2b), swap-rb (B4), bad-aspect (S1), drop-use (G3a).

## Evidence
- artifacts/logs/tester.I2eTl9/verify.out and verify-attempt1-killed.out
- Per-check logs and identity: under artifacts/runs/tester.I2eTl9/tester/ (per tests/README.md)
- Source: HEAD e500c44 plus uncommitted changes. `git diff | shasum -a 256` (tracked files only) = abd25326f8b638767595d1cd24989644dd24b84cf1d2aa0f2b31073794a82808. The prior report's hash used the verify.sh identity method, so the two are not comparable. See identity.txt for the comparable value.

## Unresolved (owner)
1. A1 audio correctness by ear: UNVERIFIED (human).
2. P1 save persistence: UNVERIFIED (student scope decision).
3. G3c level exit: UNVERIFIED (tester scripted route, or a coder level-exit hook). Not built this run.
4. H1 real hidden-tab timing: UNVERIFIED (human; protocol in tests/README.md).
5. Not covered: pickups, damage/death, Firefox, Safari, HiDPI.
6. I did not recheck reviewer_gameplay's reported failure in review.mjs (A.menu-sfx-and-music-heard). It is not part of verify.sh.

## Assumptions
- Criteria are agent-proposed, not student-approved.
- Headless Chromium only. No manual interventions.
- I did not re-read the individual per-check PASS lines beyond the summary greps for FAIL, UNVERIFIED and fault results.
- I wrote only under artifacts/logs/tester.I2eTl9/. verify.sh itself writes under artifacts/runs/ and build/dist.

## Next action
Human: run A1 (headed listen) and the H1 protocol. Tester: scripted E1M1 route for G3c. Student: decide P1 scope and approve or amend the criteria.
