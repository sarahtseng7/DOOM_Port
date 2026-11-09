FINDINGS

The one-command `tests/verify.sh` finished with rc=0: tooling, clean build, selftest, playtest (failed=0) and all 7 injected faults caught. The result is still FINDINGS because 4 required behaviors remain UNVERIFIED (A1, P1, G3c, H1). I changed no product source and no tests.

## Source identity
- HEAD e500c44 plus uncommitted changes. `git diff HEAD -- . ':!artifacts' | shasum -a 256` = 441e441a…9b5d9c (srchash.txt). Same hash as the previous tester runs, so the source did not change.

## Run
- Command: `RUN_ID=tester.NRC192 SOAK_SECONDS=60 tests/verify.sh`, run in the background so it was not cut off by the tool time limit. This closes the earlier unresolved item that no complete verify.sh run had finished.
- The soak was 60 s, not the 300 s of the prior run.
- Playtest: failed=0. Included E2b PASS (later-diff 0.0000), T2 34.97 tics/s, G3a and G3b PASS (sector sequence 3>4>0).
- Fault injection, all caught in a single faults.sh run: drop-keyup (I2 I5 I6 C3 I7), drop-blur (I7), ignore-left (I3 E2a E2b), swap-rb (B4), bad-aspect (S1), drop-use (G3a), drop-visibility (E2b).

## Evidence
- artifacts/logs/tester.NRC192/verify-console.log (full output, final `rc=0`), srchash.txt
- artifacts/runs/tester.NRC192/tester/verify-171706Z/ (identity.txt, logs, screenshots, playtest-results.json)

## Unresolved (owner)
1. G3c level exit UNVERIFIED. Needs a coder-added level-exit hook or a scripted route, then a tester check. Owners: coder, tester.
2. A1 (audio correct by ear) and H1 (real hidden tab) UNVERIFIED. Owner: human, using the protocol in tests/README.md. A0/A2/A3 show only non-silent output.
3. P1 save persistence UNVERIFIED, and approval of the acceptance criteria. Owner: student scope decisions.
4. Not covered: Firefox, Safari, HiDPI, pickups, damage/death.
5. E2b flaked once in earlier runs (tester.2eMWge); it passed here. The cause is not established. Owner: tester, using the existing repeat stress check (e2b_repeat passed 10/10 in a prior reviewer run on this hash).
6. drop-use in this run failed only G3a, not G3b. The faults.sh expected-ID table notes (swap-rb B6, drop-use G3a+G3b) are inexact but harmless. Owner: tester.

## Assumptions
- Criteria are agent-proposed, not student-approved. I did not re-read artifacts/specification.md or acceptance-criteria.md for changes.
- Headless Chromium only, one macOS machine, run serially. Results apply to the source hash above.
- Manual interventions: none. Token usage: not available.
- Writes: this OUTPUT_DIR and artifacts/runs/tester.NRC192/ only.

## Next action
Human: run H1 and A1 manual checks. Coder/tester: provide and check a G3c level-exit route. Tester: tidy the faults.sh expectations.
