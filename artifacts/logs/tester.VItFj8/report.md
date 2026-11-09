FINDINGS

The full playtest passed this run (failed=0, 300 s soak). The result is still FINDINGS because 4 required behaviors are UNVERIFIED (A1, P1, G3c, H1) and the one-command `tests/verify.sh` did not finish. I changed no product source and no tests.

## Source identity
- HEAD e500c44 plus uncommitted changes. `git diff HEAD -- . ':!artifacts' | shasum -a 256` = 441e441a…9b5d9c (saved in srchash.txt). This is the same hash as the previous tester run (tester.2eMWge), so the source did not change between the two runs.

## Results
- Clean build, selftest and playtest: PASS. Build and selftest ran inside verify.sh.
- Playtest: failed=0, with 4 UNVERIFIED items. Checks that passed include E2a, E2b (later-diff 0.0000), I1-I9, T2 (35.21 tics/s), A0/A2/A3 (non-silent only), G3a, G3b, R1-R4, S1.
- E2b, which failed in the previous run, passed here. Across both runs it has failed 1 time in 6 full or short runs. The cause is still unknown, so this is not closed: it is either a flaky test or an intermittent product bug. I did not relax the threshold.
- verify.sh was killed by my 590 s tool timeout during the fault-injection step, so it exited rc=124. The playtest had already passed. The soak plus the fault runs take longer than one tool call, so I ran the faults separately.
- Fault injection, run separately (SOAK_SECONDS=5):
  - Caught: drop-keyup (I2 I5 I6 C3 I7), drop-blur (I7), ignore-left (I3 E2a E2b), swap-rb (B4), bad-aspect (S1).
  - Caught: drop-visibility (E2b, settled=false, later-diff 0.83), drop-use (G3a and G3b).
  - The first drop-use run was killed by my own 250 s timeout (X.harness-exception), so it was inconclusive. The rerun with a 500 s limit was clean.
  - All 7 faults were caught, but not in one `faults.sh` invocation, because the script also hit my timeout after 5 cases. No `faults.sh` run has completed end-to-end this session.

## Evidence (artifacts/logs/tester.VItFj8/)
verify-console.log, srchash.txt, faults-console.log (first 5 faults), faults/*.log and faults/*/ (drop-use2 is the valid drop-use run). The playtest evidence directory is under artifacts/runs/tester.VItFj8/tester/.

## Unresolved (owner)
1. E2b flake or intermittent bug (see above). Owner: tester to add a repeat-N stress mode for E2b; coder to review the visibility-hidden handling in web/input_audio.js if repeats still fail.
2. G3c level exit is UNVERIFIED. It needs a coder-added level-exit hook or a scripted route, then a tester check.
3. A1 (audio by ear) and H1 (real hidden tab) are UNVERIFIED. Owner: human, using the protocol in tests/README.md.
4. P1 save persistence and approval of the acceptance criteria are student scope decisions.
5. Prior-report items checked: the swap-rb expected ID B6 and the drop-use expected ID G3a are still overstated or incomplete in the faults.sh table (swap-rb only fails B4, drop-use also fails G3b). They are harmless, because the check only needs one expected ID to fail. Owner: tester.
6. verify.sh as one command now exceeds the 10-minute tool limit. Run it in the background, or lower SOAK_SECONDS for the fault runs.

## Assumptions
- Criteria are agent-proposed, not student-approved. I did not re-read artifacts/specification.md or acceptance-criteria.md for changes.
- Headless Chromium only, one macOS machine, run serially. Results apply to the source hash above.
- Manual interventions: none.

## Next action
Tester: add an E2b repeat mode and run it, then run the full verify.sh in the background, outside the tool time limit. Human: do the H1 and A1 manual checks.
