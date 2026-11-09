FINDINGS

`tests/verify.sh` exited 0 (verify.out, last line `exit=0`): tooling, selftest, clean `make clean && make all`, playtest (0 FAIL) and 6/6 fault injections caught. FINDINGS, not PASS, because 4 required behaviors remain UNVERIFIED. No product source or tests were edited this run, and nothing was weakened.

## Source identity
HEAD e500c44 plus uncommitted changes; `git diff HEAD` sha256 prefix fe88782d1c55d299 (same as prior reports). Full identity (tests hash, WAD hash, emcc 4.0.18) is in verify/identity.txt; dist hashes in verify/dist-sha256.txt. Command: `RUN_ID=tester.98BZhM OUT_DIR=<abs>/verify bash tests/verify.sh` with emsdk sourced.

## Results
- Playtest: failed=0. Examples: G1b (E1M1, health 100), I6 (start-to-fwd 401 vs start-to-back 85 units), T2 35.21 tics/s, R2/R3/R4 soak clean (rAF 60/s, no long tasks, 24 changed frames), G3a door opens (sector 4 ceiling 0->16 in 93 steps).
- Faults caught: drop-keyup (I2 I5 I6 C3 I7), drop-blur (I7), ignore-left (I3 E2a E2b), swap-rb (B4), bad-aspect (S1), drop-use (G3a).
- Prior reports read (artifacts/reports/*): no reproducible failure to convert into a new regression check; every open item there is an UNVERIFIED item below.

## Evidence (this directory)
verify.out, verify/ (identity.txt, build.log, selftest.log, playtest.log, playtest-results.json, faults.log, per-fault logs, browser-console.log, screens/).

## Unresolved (owner)
1. UNVERIFIED A1 audio correctness (human): nobody has listened. A0/A2/A3 only show a non-silent context.
2. UNVERIFIED P1 save persistence (student scope decision).
3. UNVERIFIED G3b walk through the door / level exit (tester, needs a scripted route or a coder level-exit hook).
4. UNVERIFIED H1 real hidden-tab timing (human; protocol in tests/README.md).
Also unverified or uncovered: pickups, damage/death, Firefox, Safari, HiDPI. WASD and mouse unmapped (coder_input_audio). U5 and A0-A3 have no injected fault. G3a steering is greedy, so it may flake on a slow machine (93 of 100 steps used this run, versus 46 and 69 earlier, which is close to the limit).

## Assumptions
- Criteria are agent-proposed, not student-approved; artifacts/specification.md and acceptance-criteria.md do not exist.
- Headless Chromium only. Door/sector 4 data comes from the reviewer's WAD cross-check.
- Manual interventions: none.

## Next action
Human: listen to audio, run H1. Tester: G3b, and consider raising the G3a step limit if it flakes (93/100 used). Student: decide P1 scope and approve or replace the proposed criteria.
