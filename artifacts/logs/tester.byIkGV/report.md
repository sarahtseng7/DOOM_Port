FINDINGS

`tests/verify.sh` exited 0 on the rerun: clean build, selftest and playtest had 0 failures, and all 6 injected faults were caught. Four required behaviors are still UNVERIFIED (A1, P1, G3c, H1), so the result is FINDINGS, not PASS. I changed no product source or tests.

## Work
- Read AGENTS.md, loop/prompts/TESTER.md, tests/README.md and artifacts/reports/ (tester, reviewer_gameplay, reviewer_site).
- Attempt 1 (RUN_ID=tester.byIkGV) was killed by the 10-minute background limit after 5 of 6 faults, with no rc. Its log is kept as verify.attempt1-killed.out and is not counted as a result.
- Attempt 2 (RUN_ID=tester.byIkGV2) ran to completion: `playtest: PASS failed=0`, 4 UNVERIFIED, `rc=0`.
- Faults caught 6/6: drop-keyup (I2 I5 I6 C3 I7), drop-blur (I7), ignore-left (I3 E2a E2b), swap-rb (B4), bad-aspect (S1), drop-use (G3a).

## Evidence
- artifacts/logs/tester.byIkGV/verify.out (attempt 2, ends `rc=0`) and verify.attempt1-killed.out
- Per-check logs: artifacts/runs/tester.byIkGV/ and artifacts/runs/tester.byIkGV2/
- Source: HEAD e500c44 plus uncommitted changes. `git diff HEAD -- . ':!artifacts' | shasum -a 256` = abd25326f8b6..., the same as the previous tester run.

## Unresolved (owner)
1. A1 audio correctness by ear: UNVERIFIED (human).
2. P1 save persistence: UNVERIFIED (student scope decision).
3. G3c level exit: UNVERIFIED (tester scripted E1M1 route, or a coder level-exit hook).
4. H1 real hidden-tab timing: UNVERIFIED (human; protocol in tests/README.md).
5. Not covered: pickups, damage/death, Firefox, Safari, HiDPI. reviewer_gameplay's review.mjs is not part of verify.sh.
6. Reviewer suggestion not adopted: a protected check for the `visibilitychange` path (only `blur` is fault-injected).

## Assumptions
- Criteria are agent-proposed, not student-approved; no artifacts/specification.md or acceptance-criteria.md exists.
- Headless Chromium only, no manual steps. I read the summary lines, not every per-check log.
- Prior reports' findings had no new reproducible failures, so I added no regression checks.
- Writes: this OUTPUT_DIR, plus what verify.sh writes under artifacts/runs/, build/ and dist/.

## Next action
Human: A1 listen test and H1 protocol. Tester: script the E1M1 route for G3c. Student: decide P1 scope and approve or amend the criteria.
