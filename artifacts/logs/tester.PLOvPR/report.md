FINDINGS

I added one missing fault-injection check (`drop-visibility`). I did not rerun the full `tests/verify.sh`, and several required behaviors are still UNVERIFIED. No existing check was changed or weakened. No product source was touched.

## Work
- Read AGENTS.md, loop/prompts/TESTER.md, tests/README.md, verify.sh, faults.sh, playtest.mjs, and all six reports in artifacts/reports/. No report names a new reproducible defect, so I added no defect regression checks.
- Gap taken from the previous tester report (item 6): `visibilitychange` had no fault injection, only `blur` did.
- Added fault `drop-visibility` to tests/playtest.mjs (swallows only `visibilitychange`) and to tests/faults.sh (now 7 cases). It must fail `E2b.hidden-releases-keys`. Documented as Rev 6 in tests/README.md.

## Evidence (artifacts/logs/tester.PLOvPR/ev/)
- fault.log: `FAULT=drop-visibility` gives `FAIL E2b.hidden-releases-keys` (precondition-turning=true, settled=false), rc=1. The fault is caught.
- control.log: no fault, same dist, `playtest: PASS failed=0`, rc=0 (SOAK_SECONDS=5). So E2b fails because of the fault, not flakiness.
- Both ran in parallel against the existing dist/ (no rebuild); playtest-results.json, screens and console logs are in fault/ and control/.
- identity.txt: HEAD e500c44, dirty-diff hash and dist/doom.wasm hash. The dirty-diff hash differs from the earlier 320b73c4c8ae5476 only because I edited tests/.

## Not done / unresolved (owner)
1. Full `tests/verify.sh` (clean build, 5-minute soak, all 7 faults) was NOT rerun with the edited tests. Owner: tester or student, with a timeout of at least 30 minutes. Only the one new fault and one short-soak control were run.
2. G3c level exit: UNVERIFIED. It needs a scripted E1M1 route or a coder-added level-exit engine hook. I did not script a route without an oracle, which would be a weak check. Owner: coder (hook) then tester.
3. A1 audio by ear and H1 real hidden tab: UNVERIFIED, human (protocol in tests/README.md).
4. P1 save persistence, WASD/mouse, OPL-faithful music: student scope decisions.
5. Not covered: pickups, damage/death, Firefox, Safari, HiDPI.
6. U5 and A0-A3 still have no injected fault (needs a product-side break, which I may not make).

## Assumptions
- No artifacts/specification.md or acceptance-criteria.md exists. I kept the existing agent-proposed criteria (artifacts/runs/*/tester/prepare/attempt-1/proposed-criteria.md); they are not student-approved.
- A passing control while running two Chromium instances in parallel is taken as no interference; I did not repeat it serially.
- Headless Chromium only. Manual interventions: none. Token usage: not available.
- Writes: this OUTPUT_DIR, tests/playtest.mjs, tests/faults.sh, tests/README.md.

## Next action
Run `RUN_ID=<id> tests/verify.sh` with emsdk 4.0.18 sourced and a 30-minute timeout, to confirm 7/7 faults caught on the full suite. Then script G3c once a level-exit hook exists.
