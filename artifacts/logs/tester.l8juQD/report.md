FINDINGS

`tests/verify.sh` exited 0 (rc=0): no check failed, and all 6 injected faults were caught. Four required behaviors are still UNVERIFIED (A1, P1, G3c, H1), so the result is FINDINGS, not PASS. I changed no product source or tests.

## Work
- Read AGENTS.md, TESTER.md, tests/README.md and the prior artifacts/reports/tester.md. No specification.md or acceptance-criteria.md exists.
- Attempt 1 (`verify-attempt1-timeout.out`): my own 580 s limit stopped it mid fault-injection (rc=124). By then it had reached playtest PASS and fault 1 of 6. That is not a result.
- Attempt 2 (`verify.out`, RUN_ID=tester.l8juQD2, ends `rc=0`): tooling, selftest, clean build, playtest (300 s soak), fault injection.
- Playtest: failed=0, 4 UNVERIFIED.
- Faults caught 6/6: drop-keyup (I2 I5 I6 C3 I7), drop-blur (I7), ignore-left (I3 E2a E2b), swap-rb (B4), bad-aspect (S1), drop-use (G3a).

## Evidence
- artifacts/logs/tester.l8juQD/verify.out and verify-attempt1-timeout.out
- Per-check logs and identity: artifacts/runs/tester.l8juQD2/tester/
- Source: HEAD e500c44 plus uncommitted changes. `git diff | shasum -a 256` (tracked files only) = abd25326f8b638767595d1cd24989644dd24b84cf1d2aa0f2b31073794a82808. This is the same value as the prior run, so the tracked source was unchanged.

## Unresolved (owner)
1. A1 audio correctness by ear: UNVERIFIED (human). A0, A2 and A3 pass but only show a running AudioContext, no errors and a non-silent peak.
2. P1 save persistence: UNVERIFIED (student scope decision).
3. G3c level exit: UNVERIFIED (tester scripted E1M1 route, or a coder level-exit hook). Not built this run.
4. H1 real hidden-tab timing: UNVERIFIED (human; protocol in tests/README.md).
5. Not covered: pickups, damage/death, Firefox, Safari, HiDPI.
6. Reviewer_gameplay's reported review.mjs failure (A.menu-sfx-and-music-heard) was not rechecked. It is not part of verify.sh.

## Assumptions
- Criteria are agent-proposed, not student-approved.
- Headless Chromium only, no manual steps.
- I read only the summary lines (FAIL, UNVERIFIED, fault results) and the tail of attempt 1, not every per-check log.
- I wrote only under artifacts/logs/tester.l8juQD/. verify.sh also writes under artifacts/runs/, build/ and dist/.

## Next action
Human: run the A1 listen test (headed) and the H1 protocol. Tester: script the E1M1 route for G3c. Student: decide P1 scope and approve or amend the criteria.
