FINDINGS

`tests/verify.sh` exited 0 (verify/verify-result.json): tooling, selftest, clean build, playtest (0 FAIL) and 6/6 fault injections caught. FINDINGS, not PASS, because 4 required behaviors remain UNVERIFIED (below). This run added the checks the previous tester, coder and reviewer reports asked for. No product source was edited and nothing was weakened.

## Source identity
HEAD e500c44 plus uncommitted changes; see verify/identity.txt (dirty diff hash, tests hash, WAD hash, emcc 4.0.18). Clean rebuild by the run itself; dist hashes in verify/dist-sha256.txt.
Command: `RUN_ID=tester.6hWyX9 OUT_DIR=<abs>/verify bash tests/verify.sh` with emsdk sourced; about 15+ min, so run in background.

## Work (tests/ only)
- New `U5.menu-freezes-player`: engine position/angle unchanged for 1.5 s with the Esc menu open, after confirming the player was coasting (22 u/120 ms before). TEST CORRECTION: my first draft also required gametic frozen; the quick run FAILed (52 tics/1.5 s with the player at 0.0 u). Doom keeps counting gametic in the menu, so that was my wrong assumption. Only player state is asserted now. Failing evidence: quick.log.
- New audio guard `A0` (context running after gestures), `A2` (sfxPlayed 9, sfxBad 0, music started 3, music errors 0), `A3` (peak > 0.01, asserted only if AudioContext.currentTime advances; a stalled clock gives UNVERIFIED). This run the clock advanced 2.01 s/2 s and maxPeak was 0.429: non-silent only, not correct sound.
- New `G3a.door-opens-on-use`: fresh game, steers to the E1M1 sector-4 door via cap_player_* and presses Use; sector 4 started closed and its ceiling rose 0 -> 14 in 69 steps. New fault `drop-use` (Use never delivered) fails G3a, so the check catches it. Route taken from reviewer_gameplay.WeHatJ.
- `G3` split: `G3b` (walk through door, level exit) stays UNVERIFIED. tests/README.md has a Rev 4 section; faults.sh has the drop-use case.
- Existing checks unchanged. Final run: all earlier checks PASS (T2 34.97 tics/s, 300 s soak clean), faults caught: drop-keyup, drop-blur, ignore-left, swap-rb, bad-aspect, drop-use.

## Evidence (this directory)
verify.out, verify/ (identity.txt, build.log, selftest.log, playtest.log, playtest-results.json, faults.log, per-fault logs, screens/ incl. g3-final.png), quick.log + quick/ (the failing U5 first draft).

## Unresolved (owner)
1. UNVERIFIED A1 audio correctness (human): nobody has listened. A0/A2/A3 only show a running, non-silent context.
2. UNVERIFIED P1 save persistence (student scope decision).
3. UNVERIFIED G3b walk-through-door / level exit (tester, needs a scripted route or a coder level-exit hook).
4. UNVERIFIED H1 real hidden-tab timing (human; protocol in tests/README.md).
Also unverified: pickups, damage/death, Firefox, Safari, HiDPI. WASD and mouse unmapped (coder_input_audio). U5 and A0-A3 have no injected fault, since that needs a product-side break the tester may not make. G3a steering is greedy, so it could flake on a slow machine (46 and 69 steps used of 100).

## Assumptions
- Criteria are agent-proposed, not student-approved; artifacts/specification.md and acceptance-criteria.md do not exist.
- Headless Chromium only. Door position and sector 4 come from the reviewer's WAD cross-check, not independently verified by me.
- Manual interventions: none.

## Next action
Human: listen to audio, run H1. Tester: G3b. Student: decide P1 scope and approve or replace the proposed criteria.
