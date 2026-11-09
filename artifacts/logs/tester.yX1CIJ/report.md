FINDINGS

`tests/verify.sh` exited 0 on the rerun (clean build, selftest, playtest `failed=0`, 6/6 injected faults caught). Four required behaviors remain UNVERIFIED (A1, P1, G3c, H1), so the result is FINDINGS, not PASS. No product source or tests were changed.

## Work
- Read AGENTS.md, loop/prompts/TESTER.md and the previous reports in artifacts/reports/.
- Run 1 (RUN_ID=tester.yX1CIJ) was killed by the 10-minute background limit during fault injection, with 5/6 faults reported. It is not counted as a result; it is kept as artifacts/logs/tester.yX1CIJ/verify.killed-run1.out.
- Run 2 (RUN_ID=tester.yX1CIJ.r2) ran to completion with `rc=0`.
- Faults caught 6/6: drop-keyup (I2 I5 I6 C3 I7), drop-blur (I7), ignore-left (I3 E2a E2b), swap-rb (B4), bad-aspect (S1), drop-use (G3a).
- Zero FAIL lines in playtest.

## Evidence
- artifacts/logs/tester.yX1CIJ/verify.out (ends `rc=0`), verify.killed-run1.out
- Per-check logs: artifacts/runs/tester.yX1CIJ.r2/
- Source: HEAD e500c44 plus uncommitted changes; `git diff HEAD -- . ':!artifacts' | shasum -a 256` = 320b73c4c8ae..., unchanged between my two runs. It differs from the previous tester report's abd25326f8b6, so the source changed since then.

## Unresolved (owner)
1. A1 audio correctness by ear: UNVERIFIED (human).
2. P1 save persistence: UNVERIFIED (student scope decision).
3. G3c level exit: UNVERIFIED (tester: script an E1M1 route, or coder: add a level-exit hook).
4. H1 real hidden-tab timing: UNVERIFIED (human; protocol in tests/README.md).
5. Not covered: pickups, damage/death, Firefox, Safari, HiDPI.
6. The `visibilitychange` path has no fault injection (only `blur` does).
7. A full verify.sh run takes longer than 10 minutes. Run it with a timeout of at least 30 minutes.

## Assumptions
- Criteria are agent-proposed, not student-approved; no artifacts/specification.md or acceptance-criteria.md exists.
- Headless Chromium only. I read the summary lines of verify.out, not every per-check log.
- Prior reports list no new reproducible failures, so I added no regression checks.
- Manual interventions: none. Token usage: not available.
- Writes: this OUTPUT_DIR, plus what verify.sh writes under artifacts/runs/, build/ and dist/.

## Next action
Human: A1 listening test and H1 protocol. Tester: script the E1M1 route for G3c. Student: decide P1 scope and approve or amend the criteria.
