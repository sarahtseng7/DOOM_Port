FINDINGS

`tests/verify.sh` finished with rc=0: tooling, clean build, selftest, playtest (failed=0) and all 7 injected faults caught. The result is still FINDINGS because 4 required behaviors remain UNVERIFIED (A1, P1, G3c, H1). I changed no product source and no tests.

## Source identity
- HEAD e500c44 plus uncommitted changes. `git diff HEAD -- . ':!artifacts' | shasum -a 256` = 441e441a…9b5d9c (srchash.txt). It is the same hash as the previous tester run (tester.NRC192), so the source did not change.

## Run
- Command: `RUN_ID=tester.FciNnh SOAK_SECONDS=60 tests/verify.sh`, run in the background with emsdk sourced. The soak was 60 s.
- Playtest: failed=0. E2b PASS (later-diff 0.0000), T2 34.98 tics/s, G3a PASS (sector 4 ceiling 0->14), G3b PASS (sector sequence 3>4>0).
- Fault injection (all caught): drop-keyup (I2 I5 I6 C3 I7), drop-blur (I7), ignore-left (I3 E2a E2b), swap-rb (B4), bad-aspect (S1), drop-use (G3a), drop-visibility (E2b).

## Evidence
- artifacts/logs/tester.FciNnh/verify-console.log (full output, final `rc=0`), srchash.txt
- artifacts/runs/tester.FciNnh/tester/verify-181940Z/

## Unresolved (owner)
1. G3c level exit is UNVERIFIED in tests/. Needs a coder-added level-exit hook or a scripted route, then a tester check. The earlier reviewer_gameplay probe `exit_pickup` showed the exit switch reaching E1M2, but it is not in verify.sh. Owners: tester, coder.
2. A1 (audio correct by ear) and H1 (real hidden tab) are UNVERIFIED. Owner: human, using the protocol in tests/README.md. The A0/A2/A3 checks show only non-silent output.
3. P1 save persistence is UNVERIFIED, and the acceptance criteria are not approved. Owner: student scope decisions.
4. Not covered: Firefox, Safari, HiDPI, pickups, damage/death in verify.sh.
5. E2b flaked once in an earlier run (tester.2eMWge). It passed in the last two runs and the cause is not established. Owner: tester, using the repeat stress check.
6. The expected-ID notes in faults.sh (swap-rb, drop-use) are slightly inexact; harmless. Owner: tester.

## Assumptions
- Criteria are agent-proposed, not student-approved. I did not re-read artifacts/specification.md or acceptance-criteria.md for changes.
- Headless Chromium only, one macOS machine, run serially. Results apply to the source hash above.
- Manual interventions: none. Token usage: not available.
- Writes: this OUTPUT_DIR and artifacts/runs/tester.FciNnh/ only.

## Next action
Human: run H1 and A1 manual checks. Tester/coder: add a G3c level-exit check. Tester: tidy the faults.sh expectations.
