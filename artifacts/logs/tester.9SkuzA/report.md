FINDINGS

Not PASS: the full `tests/verify.sh` run exited 1 because check I6.backward-returns failed. Four playtest-only reruns passed I6, but all of them were close to the threshold. I judge I6 to be a flaky or marginal check, not a confirmed product regression. I did not change it.

## Source identity
HEAD e500c440656622db5ab3f8fb7df73d8b5998eeb3 plus uncommitted changes (verify/identity.txt: dirty_diff_sha256 72688451..., tests_sha256 734bd61e...). dist/doom.wasm sha256 prefix a4c6846627bdcb21, the same as prior runs. Clean `make clean && make all` with emsdk 4.0.18. I edited no product source or tests.

## Prior findings read
artifacts/reports/ (tester, reviewer_gameplay, reviewer_site, coder*). The previous tester run had verify.sh exit 0 on the same wasm hash, and I6 passed there.

## Results (evidence: verify.out, verify/)
- `tests/verify.sh` (OUT_DIR absolute, SOAK_SECONDS=300): **exit=1**. Tooling, selftest and clean build were OK. Playtest: failed=1, unverified=5. Because the playtest failed, verify.sh skipped fault injection (faults.sh), so fault detection was not exercised in this run.
- **FAIL I6.backward-returns**: start-vs-back=0.394, start-vs-fwd=0.496. The check requires back < 0.7 * fwd (0.347), and the observed ratio was 0.79. Screens: verify/screens/ (011-move-start through 026+).
- All other checks passed, including I4/I5, I7/I7a, turn checks, T2 (34.96 tics/s) and the 300 s soak (R1 no errors, R2 60.0 rAF/s, R3 max longtask 0 ms, R4 23 frames differed).
- Flakiness probe (`SOAK_SECONDS=5 node tests/playtest.mjs`, 4 reruns on the same dist; logs rerun1-4.log): I6 passed all 4 times. The back/fwd ratios were 0.60, 0.67, 0.67 and 0.69, against the 0.7 limit. That is a thin margin, and the failing run's ratio of 0.79 is not far above it.

## Unresolved (owner)
1. I6 is timing-sensitive (tester). It compares view pixel diffs after a fixed 1.1 s backward hold. Position depends on momentum and on how far the earlier forward move went, so the ratio varies run to run. Product intent (backward moves toward the start) is not clearly broken. I will not loosen the threshold without a decision. A more robust oracle would be a position export, a longer backward hold, or checking only the direction of the change. Needs a tester change with a documented reason, or student sign-off. Until then verify.sh is non-deterministic and cannot give a stable exit 0.
2. Fault injection was not run in this verify.sh pass. It passed 4/4 in the previous tester run on the same wasm, but there is no fresh evidence for this revision.
3. Still UNVERIFIED (as before): A1 audio correctness (student scope), P1 save persistence (student), G3 door use and level exit (no oracle), I9 input-module identity (needs a coder diagnostic export), H1 hidden-tab timing (needs a manual protocol).
4. Faults are browser-side only, and the criteria are agent-proposed, not student-approved.

## Assumptions
Doom default keys; headless Chromium via Playwright; no thresholds changed. The rerun probe was playtest-only with a 5 s soak, so it is not a substitute for a full verify.sh pass. Manual interventions: none. Usage: not available.
