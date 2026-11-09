FINDINGS

The full `tests/verify.sh` passed (exit 0) on the current build, with all 7 injected faults caught. The result stays FINDINGS because 4 required behaviors are still UNVERIFIED (A1, P1, G3c, H1). No product source or test was changed this run.

## Source identity
- HEAD e500c44 plus uncommitted changes. `git diff HEAD -- . ':!artifacts'` sha256 = 92e25d7245a7dafd95654fdf4a5be51c69e9877cb1b2faeea0b516e33a94a67f (same as the prior reviewer, coder and tester reports).
- tests_sha256 8e4ae407bc62…, wad_sha256 1d7d43be…, emcc 4.0.18.
- `make clean && make all` rebuilt dist/. The new doom.wasm prefix is 7afb94fa1ec64b5c, identical to the earlier runs, so the build is reproducible and the earlier reviewer evidence applies to this binary.

## Work
- Read AGENTS.md, loop/prompts/TESTER.md, tests/README.md, verify.sh, and the six reports in artifacts/reports/. No report names a new reproducible defect, so I added no regression checks.
- Ran `RUN_ID=tester.fIhcMO OUT_DIR=<this dir>/verify tests/verify.sh` with emsdk sourced. Steps: tooling, selftest (11/11 ok), clean build, playtest with a 300 s soak, fault injection.

## Results
- Playtest: `PASS failed=0`. 46 checks passed, including the load, boot-frame, colour, input, blur/hidden/pagehide, audio (A0, A2, A3), 35 tics/s (34.97), soak (R1-R4), G3a (door opens) and G3b (walk through door) checks.
- Fault injection: 7/7 caught.
  - drop-keyup: I2 I5 I6 C3 I7
  - drop-blur: I7
  - ignore-left: I3 E2a E2b
  - swap-rb: B4
  - bad-aspect: S1
  - drop-use: G3a
  - drop-visibility: E2b
- Closes the open item from the previous tester report: the full suite with `drop-visibility` has now run once.
- Remaining failures: none.

## Evidence (artifacts/logs/tester.fIhcMO/)
- verify-console.log, verify/identity.txt, verify/verify-result.json (`exit: 0`)
- verify/playtest.log, verify/playtest-results.json, verify/screens/, verify/browser-console.log
- verify/build.log, verify/dist-sha256.txt
- verify/faults.log and one `<fault>.log` and directory per fault

## Unresolved (owner)
1. G3c level exit: UNVERIFIED. It needs a coder-added level-exit engine hook, then a tester check. Owner: coder, then tester.
2. A1 (audio by ear) and H1 (real hidden tab): UNVERIFIED. Owner: human, using the protocol in tests/README.md. Headless runs can only show non-silent output (A3).
3. P1 save persistence, WASD/mouse, OPL-faithful music, and approval of the criteria: student scope decisions.
4. Not covered: pickups, damage/death, Firefox, Safari, HiDPI.
5. U5 and A0-A3 have no injected fault. Adding one needs a product-side break, which the tester may not make.
6. Discrepancy: `faults.sh` lists `swap-rb:B4 B6`, but only B4 failed. The fault is still counted as caught. If B6 was meant to fail too, that is a weak or redundant expectation. Owner: tester, to review.
7. README says `drop-use` also fails G3b. This run's faults.log shows only G3a failing. Owner: tester, to correct the docs or the expectation.
8. The cosmetic static `<title>` flash noted by the coder is unchanged.

## Assumptions
- The criteria are agent-proposed, not student-approved. No artifacts/specification.md or acceptance-criteria.md exists.
- Headless Chromium only, run serially on one macOS machine. Results apply to wasm hash 7afb94fa1ec64b5c.
- Manual interventions: none. Token usage: not available.
- Writes: this OUTPUT_DIR only. `make clean && make all` regenerated build/ and dist/ as the script requires.

## Next action
Decide whether to add a level-exit hook (G3c). A human should run the A1 and H1 protocols. The tester should resolve items 6 and 7.
