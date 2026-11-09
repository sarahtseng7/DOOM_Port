FINDINGS

`tests/verify.sh` exited 0 on the current build, and all 7 injected faults were caught. The result stays FINDINGS because 4 required behaviors are still UNVERIFIED (A1, P1, G3c, H1). I changed no product source and no tests.

## Source identity
- HEAD e500c44 plus uncommitted changes. `git diff HEAD -- . ':!artifacts'` sha256 = 92e25d7245a7dafd… This matches every prior report in artifacts/reports/.
- emcc 4.0.18. `make clean && make all` rebuilt dist/, and the new doom.wasm prefix is 7afb94fa1ec64b5c, the same as before. The build is reproducible, so earlier reviewer evidence still applies to this binary.

## Work
- Read AGENTS.md, loop/prompts/TESTER.md, and the six reports in artifacts/reports/. None names a new reproducible defect, so I added no regression checks.
- Ran `RUN_ID=tester.clYVda OUT_DIR=artifacts/logs/tester.clYVda/verify tests/verify.sh` with emsdk sourced. Steps: tooling, selftest, clean build, playtest with the 300 s soak, fault injection.

## Results
- Playtest: `PASS failed=0`, 47 PASS lines in playtest.log.
  - Includes 34.97 tics/s (T2), the soak (R1-R4), G3a (door opens) and G3b (walks through the door, sector sequence 3>4>0).
- Fault injection: 7/7 caught.
  - drop-keyup: I2 I5 I6 C3 I7
  - drop-blur: I7
  - ignore-left: I3 E2a E2b
  - swap-rb: B4
  - bad-aspect: S1
  - drop-use: G3a, and also G3b (see below)
  - drop-visibility: E2b
- Remaining failures: none.

## Evidence (artifacts/logs/tester.clYVda/verify/)
identity.txt, verify-result.json (exit 0), playtest.log, playtest-results.json, faults.log, one `<fault>.log` and directory per fault, build.log, dist-sha256.txt, selftest.log, browser-console.log, screens/. Console output is in ../verify-console.log.

## Unresolved (owner)
1. G3c level exit: UNVERIFIED. It needs a coder-added level-exit hook, then a tester check. Owner: coder, then tester.
2. A1 (audio by ear) and H1 (real hidden tab): UNVERIFIED. Owner: human, using the protocol in tests/README.md. Headless runs only show non-silent output.
3. P1 save persistence, WASD/mouse, OPL-faithful music, and approval of the criteria: student scope decisions.
4. Not covered: pickups, damage/death, Firefox, Safari, HiDPI. U5 and A0-A3 have no injected fault, and adding one needs a product-side break the tester may not make.
5. Resolves two items left open by the previous tester report (tests/ not edited):
   - **swap-rb and B6.** The `swap-rb` fault only fails B4. B6 (`E1M1 view not blue-biased`) PASSES under the swap, so B6 does not detect an R/B swap. `faults.sh` lists `swap-rb:B4 B6`, which overstates its coverage. B6 is a weak check, and B4 carries the detection. Owner: tester, to drop B6 from that expectation or strengthen B6 in a later change.
   - **drop-use and G3b.** `drop-use` does fail G3b too (door-opened=false). The README is correct. `faults.sh` lists only G3a, which is a subset of what fails. Owner: tester, to add G3b to the expectation.
6. The cosmetic static `<title>` flash noted by the coder is unchanged. Owner: coder.

## Assumptions
- The criteria are agent-proposed, not student-approved. artifacts/specification.md and acceptance-criteria.md do not exist.
- Headless Chromium only, one macOS machine, run serially. Results apply to wasm hash 7afb94fa1ec64b5c.
- Manual interventions: none. Token usage: not available.
- Writes: this OUTPUT_DIR only, plus regenerated build/ and dist/ from `make clean && make all`.

## Next action
Decide whether to add a level-exit hook (G3c). A human should run the A1 and H1 protocols. The tester should correct the `faults.sh` expectations in item 5 and re-run.
