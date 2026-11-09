FINDINGS

`tests/verify.sh` exited 0 (rc=0): clean build, selftest and playtest had 0 failures, and all 6 injected faults were caught. Four required behaviors are still UNVERIFIED (A1, P1, G3c, H1), so the result is FINDINGS, not PASS. I changed no product source or tests.

## Work
- Read AGENTS.md, README files, loop/prompts/TESTER.md and the prior artifacts/reports/ (tester, reviewer_gameplay, reviewer_site).
- Ran `RUN_ID=tester.sAC1ys tests/verify.sh` with emsdk 4.0.18: tooling, selftest, `make clean && make all`, playtest (300 s soak), fault injection.
- Playtest: `failed=0`, 4 UNVERIFIED.
- Faults caught 6/6: drop-keyup (I2 I5 I6 C3 I7), drop-blur (I7), ignore-left (I3 E2a E2b), swap-rb (B4), bad-aspect (S1), drop-use (G3a).

## Evidence
- artifacts/logs/tester.sAC1ys/verify.out (ends `rc=0`)
- Per-check logs and identity: artifacts/runs/tester.sAC1ys/tester/
- Source: HEAD e500c44 plus uncommitted changes. `git diff HEAD -- . ':!artifacts' | shasum -a 256` = abd25326f8b638767595d1cd24989644dd24b84cf1d2aa0f2b31073794a82808, the same as the previous tester run. tests_sha256 b93cbc85..., WAD sha256 1d7d43be....

## Unresolved (owner)
1. A1 audio correctness by ear: UNVERIFIED (human). A0, A2 and A3 pass but only show a running AudioContext, no errors and a non-silent peak.
2. P1 save persistence: UNVERIFIED (student scope decision).
3. G3c level exit: UNVERIFIED (tester scripted E1M1 route, or a coder level-exit hook). Not built in this run.
4. H1 real hidden-tab timing: UNVERIFIED (human; protocol in tests/README.md).
5. Not covered: pickups, damage/death, Firefox, Safari, HiDPI.
6. reviewer_gameplay's review.mjs result (A.menu-sfx-and-music-heard) is not part of verify.sh and was not rechecked.

## Assumptions
- Criteria are agent-proposed, not student-approved. No artifacts/specification.md or acceptance-criteria.md exists.
- Headless Chromium only, no manual steps.
- I read the summary lines (FAIL, UNVERIFIED, fault results), not every per-check log.
- I wrote under artifacts/logs/tester.sAC1ys/. verify.sh also writes under artifacts/runs/, build/ and dist/.
- I did not attempt a test change this run, because nothing failed.

## Next action
Human: run the A1 listen test (headed) and the H1 protocol. Tester: script the E1M1 route for G3c. Student: decide P1 scope and approve or amend the criteria.
