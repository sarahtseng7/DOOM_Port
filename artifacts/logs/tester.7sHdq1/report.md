FINDINGS

`tests/verify.sh` exited 0 (clean build, selftest, playtest `failed=0`, 6/6 injected faults caught). Four required behaviors remain UNVERIFIED (A1, P1, G3c, H1), so the result is FINDINGS, not PASS. No product source or tests were changed.

## Work
- Read AGENTS.md, loop/prompts/TESTER.md, BUILD.md and the previous tester report in artifacts/reports/.
- Ran `RUN_ID=tester.7sHdq1 bash tests/verify.sh` once, in the background, to completion (`rc=0`).
- Faults caught 6/6: drop-keyup (I2 I5 I6 C3 I7), drop-blur (I7), ignore-left (I3 E2a E2b), swap-rb (B4), bad-aspect (S1), drop-use (G3a).
- 300s soak passed (R1-R4); tics 34.98/s; door open and walk-through passed (G3a, G3b); audio context running, 9 sfx and 3 music starts, no errors, non-silent peak 0.424 (A0, A2, A3).

## Evidence
- artifacts/logs/tester.7sHdq1/verify.out (ends `rc=0`)
- Per-check logs and identity.txt: artifacts/runs/tester.7sHdq1/tester/
- Source: HEAD e500c44 plus uncommitted changes; `git diff HEAD -- . ':!artifacts' | shasum -a 256` = abd25326f8b6..., same as the previous tester run.

## Unresolved (owner)
1. A1 audio correctness by ear: UNVERIFIED (human). A0/A2/A3 show only that audio runs and is non-silent.
2. P1 save persistence: UNVERIFIED (student scope decision).
3. G3c level exit: UNVERIFIED (tester: script an E1M1 route, or coder: add a level-exit hook).
4. H1 real hidden-tab timing: UNVERIFIED (human; protocol in tests/README.md).
5. Not covered: pickups, damage/death, Firefox, Safari, HiDPI.
6. `visibilitychange` path has no fault injection (only `blur` does); E2b passes but is not shown to catch its removal.

## Assumptions
- Criteria are agent-proposed, not student-approved; no artifacts/specification.md or acceptance-criteria.md exists.
- Headless Chromium only. I read the summary lines in verify.out, not every per-check log.
- No new reproducible failures in prior reports, so no regression checks were added.
- Writes: this OUTPUT_DIR, plus what verify.sh writes under artifacts/runs/, build/ and dist/.

## Next action
Human: A1 listen test and H1 protocol. Tester: script the E1M1 route for G3c. Student: decide P1 scope and approve or amend the criteria.
