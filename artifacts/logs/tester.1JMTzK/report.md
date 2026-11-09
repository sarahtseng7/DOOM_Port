FINDINGS

`tests/verify.sh` exited 0 (rc=0) on the current build, and all 7 injected faults were caught. The result stays FINDINGS because 4 required behaviors are still UNVERIFIED (A1, P1, G3c, H1). I changed no product source and no tests.

## Source identity
- HEAD e500c44 plus uncommitted changes. `git diff HEAD -- . ':!artifacts' | shasum -a 256` = 92e25d7245a7dafd…, the same as every report in artifacts/reports/ (verify/identity.txt).
- `make clean && make all` rebuilt dist/ (verify/build.log, dist-sha256.txt).

## Work
- Read AGENTS.md, loop/prompts/TESTER.md, tests/README.md and the reports in artifacts/reports/. None names a new reproducible defect, so I added no regression checks.
- Ran `RUN_ID=tester.1JMTzK OUT_DIR=artifacts/logs/tester.1JMTzK/verify tests/verify.sh` with emsdk sourced. Steps: tooling, selftest, clean build, playtest with the soak, fault injection.

## Results
- Selftest: ok.
- Playtest: `PASS failed=0`, 47 PASS lines. Examples: T2 34.97 tics/s, A3 peak 0.435 with audio clock advancing (2.01 s per 2 s), G3a door opens, G3b sector sequence 3>4>0.
- Fault injection: 7/7 caught.
  - drop-keyup: I2 I5 I6 C3 I7
  - drop-blur: I7
  - ignore-left: I3 E2a E2b
  - swap-rb: B4
  - bad-aspect: S1
  - drop-use: G3a
  - drop-visibility: E2b
- Remaining check failures: none.

## Evidence (artifacts/logs/tester.1JMTzK/)
verify-console.log (ends `rc=0`) and verify/ (identity.txt, playtest.log, playtest-results.json, faults.log, per-fault logs, build.log, dist-sha256.txt, browser-console.log, screens/).

## Unresolved (owner)
1. G3c level exit: UNVERIFIED. Needs a coder-added level-exit hook or scripted route, then a tester check. Owner: coder, then tester.
2. A1 (audio by ear) and H1 (real hidden tab): UNVERIFIED. Owner: human, using the protocol in tests/README.md. Headless runs only show non-silent output.
3. P1 save persistence and approval of the criteria: student scope decisions.
4. Not covered: pickups, Firefox, Safari, HiDPI. U5 and A0-A3 have no injected fault, since that needs a product-side break the tester may not make.
5. Test-quality items, not fixed. Owner: tester.
   - `faults.sh` expects `swap-rb:B4 B6`, but only B4 fails, so the expectation overstates coverage.
   - `faults.sh` expects `drop-use:G3a`, and G3b also depends on G3a's door. This run listed only G3a.
   - I left both alone so the tests hash stays comparable with earlier runs.
6. Cosmetic, owner coder: the static `<title>` "Doom (WASM)" in web/index.html shows briefly before the engine title.

## Assumptions
- The criteria are agent-proposed, not student-approved. artifacts/specification.md and acceptance-criteria.md do not exist.
- Headless Chromium only, one macOS machine, run serially. Results apply to the build from the source hash above.
- Manual interventions: none. Token usage: not available.
- Writes: this OUTPUT_DIR, plus regenerated build/ and dist/.

## Next action
Decide on a level-exit hook (G3c). A human should run the A1 and H1 protocols. The tester should correct the two `faults.sh` expectations and re-run.
