FINDINGS

`tests/verify.sh` exited 0 on the current build and all 7 injected faults were caught. The result stays FINDINGS because 4 required behaviors are still UNVERIFIED (A1, P1, G3c, H1). I changed no product source and no tests.

## Source identity
- HEAD e500c44 plus uncommitted changes. `git diff HEAD -- . ':!artifacts'` sha256 = 92e25d7245a7dafd… (identity.txt). This matches all prior reports in artifacts/reports/.
- `make clean && make all` rebuilt dist/. doom.wasm prefix is 7afb94fa1ec64b5c, the same as the prior runs (dist-sha256.txt), so the build is reproducible.

## Work
- Read AGENTS.md, loop/prompts/TESTER.md, and the six reports in artifacts/reports/. None names a new reproducible defect, so I added no regression checks.
- Ran `RUN_ID=tester.bj22dE OUT_DIR=artifacts/logs/tester.bj22dE/verify tests/verify.sh` (emsdk sourced). Steps: tooling, selftest, clean build, playtest with the 300 s soak, fault injection.

## Results
- Selftest: 11/11 ok.
- Playtest: `PASS failed=0`, 47 PASS lines. This includes T2 (35.20 tics/s), the soak R1-R4, G3a (door opens) and G3b (walk through, sector sequence 3>4>0).
- Fault injection: 7/7 caught.
  - drop-keyup: I2 I5 I6 C3 I7
  - drop-blur: I7
  - ignore-left: I3 E2a E2b
  - swap-rb: B4
  - bad-aspect: S1
  - drop-use: G3a
  - drop-visibility: E2b
- Remaining check failures: none.

## Evidence (artifacts/logs/tester.bj22dE/)
verify-console.log (full console output, ends `rc=0`) and verify/ (identity.txt, verify-result.json, playtest.log, playtest-results.json, faults.log, per-fault logs, build.log, dist-sha256.txt, selftest.log, screens/).

## Unresolved (owner)
1. G3c level exit: UNVERIFIED. It needs a coder-added level-exit hook, then a tester check. Owner: coder, then tester.
2. A1 (audio by ear) and H1 (real hidden tab): UNVERIFIED. Owner: human, using the protocol in tests/README.md. Headless runs only show non-silent output (A0, A2, A3).
3. P1 save persistence, WASD/mouse, OPL-faithful music, and approval of the criteria: student scope decisions.
4. Not covered: pickups, damage/death, Firefox, Safari, HiDPI. U5 and A0-A3 have no injected fault, and adding one needs a product-side break the tester may not make.
5. Open test-quality items, carried over and not fixed this run. Owner: tester.
   - `faults.sh` lists `swap-rb:B4 B6`, but only B4 fails (seen again here). B6 is a weak check. The expectation overstates its coverage.
   - `faults.sh` lists `drop-use:G3a`. The previous run showed G3b also fails under this fault. It was not listed here because the harness only needs one of the IDs.
   - These are expectation-list corrections only. Each fault is caught either way. I left them alone because editing tests/ would change the tests hash of an otherwise reproducible run.
6. Cosmetic, coder: the static `<title>` "Doom (WASM)" flashes before the engine sets "DOOM Shareware".

## Assumptions
- The criteria are agent-proposed, not student-approved. artifacts/specification.md and acceptance-criteria.md do not exist.
- Headless Chromium only, one macOS machine, run serially. Results apply to wasm hash 7afb94fa1ec64b5c.
- Manual interventions: none. Token usage: not available.
- Writes: this OUTPUT_DIR only, plus regenerated build/ and dist/ from `make clean && make all`.

## Next action
Decide whether to add a level-exit hook (G3c). A human should run the A1 and H1 protocols. The tester should correct the two `faults.sh` expectations in item 5 and re-run.
