FINDINGS

`tests/verify.sh` exited 0 (verify.out, last line `exit=0`): tooling, selftest, `make clean && make all`, playtest (failed=0, 300 s soak) and 6/6 fault injections caught. FINDINGS, not PASS, because 4 required behaviors remain UNVERIFIED (A1, P1, G3c, H1). Product source was not touched. No existing check was removed or weakened.

## Work this run
- Read AGENTS.md, README.md, my role prompt, tests/README.md and artifacts/reports/*. The reviewers and the prior tester report contained no reproducible failure to convert to a regression check. Their open items were all UNVERIFIED. The one concrete gap I could close was G3b.
- Added `G3b.walk-through-door` to tests/playtest.mjs. It replaces the UNVERIFIED G3b placeholder; level exit is split out as UNVERIFIED `G3c.level-exit`. After G3a opens E1M1 sector 4, the player holds Up and `cap_player_sector()` is polled about every 20 ms. PASS requires being seen in sector 4 and then in a sector that is neither 4 nor the start sector. Three probe runs and the final run all passed with sequence `3>4>0` (g3b-probe/, verify/playtest.log).
- Added a "Rev 5" section to tests/README.md covering G3b, the test correction below and the remaining UNVERIFIED items.

## Test correction (not a lowered bar)
The first G3b draft polled every 100 ms and FAILED (sequence `3,0,7,8,51,52`, never saw sector 4). The player had walked through the door. The thin door sector was stepped over between polls at run speed. I fixed the sampling rate and left the criterion unchanged. Failing evidence is kept in `verify-attempt1/` and `verify-attempt1.out`.

## Results (final run, verify/)
- G3a PASS (sector 4 ceiling 0->14, 39 steps). G3b PASS.
- Faults caught: drop-keyup (I2 I5 I6 C3 I7), drop-blur (I7), ignore-left (I3 E2a E2b), swap-rb (B4), bad-aspect (S1), drop-use (G3a). The drop-use log shows G3b also FAILs, because the door never opens (verify/drop-use.log). faults.sh only reports the expected IDs.
- Other verify.out lines were not re-reviewed beyond the summary; earlier-run values (T2 about 35 tics/s, audio non-silent) repeated.

## Source identity
HEAD e500c44 plus uncommitted changes. This run's `dirty_diff_sha256` is c9b3c829ca2c5a6735e26393a138ceec201decfc08065ea424d0a25eb8e2430f; it differs from the earlier prefix fe88782d1c55d299 only because tests/ itself changed (product source was not edited; I did not diff the platform/web files to confirm). tests_sha256 b93cbc85...; WAD and dist hashes are in verify/identity.txt and verify/dist-sha256.txt. emcc comes from ~/Developer/emsdk.

## Evidence (this directory)
verify.out, verify/ (identity.txt, build.log, selftest.log, playtest.log, playtest-results.json, faults.log, per-fault logs, screens/ including g3b-final.png), g3b-probe/, verify-attempt1* (failed G3b draft), verify-attempt2-killed* (run killed by the harness 10-minute background limit during the last fault; no verdict, rerun with a longer timeout).

## Unresolved (owner)
1. UNVERIFIED A1 audio correctness (human): nobody has listened; A0/A2/A3 show only a non-silent, running context.
2. UNVERIFIED P1 save persistence (student scope decision).
3. UNVERIFIED G3c level exit (tester: needs a scripted E1M1 route or a coder level-exit hook).
4. UNVERIFIED H1 real hidden-tab timing (human, protocol in tests/README.md).
Also uncovered: pickups, damage/death, Firefox, Safari, HiDPI. WASD and mouse unmapped (coder_input_audio). U5, A0-A3 and G3b have no independent injected fault (G3b only fails via drop-use). The G3a/G3b steering is greedy and step counts vary from 25 to 77 across runs (limit 200), so it could flake on a slower machine.

## Assumptions
- Criteria are agent-proposed, not student-approved. artifacts/specification.md and acceptance-criteria.md do not exist, and I may not write under artifacts/ outside this directory; the proposed criteria are the check IDs documented in tests/README.md.
- Headless Chromium only. Sector 4 / door coordinates come from the reviewer's WAD cross-check.
- Manual interventions: none.

## Next action
Human: listen to audio, run H1. Tester: G3c route or hook. Student: decide P1 scope and approve or replace the proposed criteria.
