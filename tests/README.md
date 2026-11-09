# Verification

Keep verification code here, including browser checks, fixtures, and tests
for the loop itself. You design the checks; no test suite is provided.

See [the acceptance criteria and evidence requirements](../README.md#evaluate-the-system-you-built).
Document how to run your checks and what each one establishes.

Save test results, logs, screenshots, and recordings in `artifacts/`.
Keep acceptance checks outside the coder's write permissions using your
sandbox/tool configuration; a folder name alone does not enforce access.

## Suite (tester-owned; criteria are AGENT-PROPOSED, not student-approved)

Run: `source ~/Developer/emsdk/emsdk_env.sh && tests/verify.sh` (RUN_ID, SOAK_SECONDS, QUICK=1 optional).
Evidence goes to `artifacts/runs/$RUN_ID/tester/verify-*/` (identity.txt, logs, screenshots, playtest-results.json).
Exit 0 only when tooling, build, selftest and every required playtest check pass; `QUICK=1` never exits 0.

| File | Establishes |
| --- | --- |
| `verify.sh` | tooling check, source identity, selftest, `make clean && make all`, playtest |
| `selftest.mjs` | pixel helpers FAIL on black, channel-swapped, transparent, static, wrongly shifted frames (no build needed) |
| `playtest.mjs` | Chromium: load/console errors, boot frame, colors, rAF liveness, menu -> E1M1, turn/move/fire/release, blur, automap, Esc menu, soak |
| `lib/frames.mjs` | region diff / color stats / horizontal-shift estimation on canvas screenshots |

Limits: outcomes are inferred from pixels (no engine state hook); audio, persistence, door/level-exit and the
35 tics/s rate are listed as UNVERIFIED in every result. Ammo/status regions assume the stock 320x200 layout.
Test deps: `npm ci` in `tests/` (network needed once; Playwright 1.49.1, pngjs 7.0.0).

## Rev 3 additions (tester)
- `I6` is now position-based (`cap_player_x/y`; limit 0.7 unchanged) — TEST CORRECTION: the pixel oracle flaked (0.60-0.79). New: `G1b` (E1M1, health 100 via engine state), `I4b` (forward moves player >=32 units), `I9` (`cap_input_impl==1`, delivered>0, dropped==0), `S1` (canvas stays 16:10 and fits 4 viewports); fault `bad-aspect` must fail S1.
- Still UNVERIFIED: A1 audio by ear, P1, G3 (no door/sector export), H1.

### H1 manual protocol (real hidden tab; headless cannot do this)
1. `python3 -m http.server 8000 --bind 127.0.0.1 --directory dist`; open http://127.0.0.1:8000 in headed Chrome, start E1M1.
2. In the console run `a=Module._cap_tic_count(); t=Date.now()`, switch to another tab for 60 s, return.
3. Run `(Module._cap_tic_count()-a)/((Date.now()-t)/1000)`. Pass: game did not run >2x real time (<=70 tics/s catch-up burst) and no keys remain stuck (player stands still, `Module._cap_player_x()` stable across 2 s).
4. Record browser version, result, and screenshot under artifacts/. Not automated; do not report PASS without doing it.

## Rev 4 additions (tester)
- `U5.menu-freezes-player`: after coasting, opening the Esc menu leaves engine position/angle unchanged for 1.5 s (precondition: player was moving). TEST CORRECTION: first draft also demanded a frozen `gametic`; Doom keeps counting it in the menu, so only player state is asserted.
- `A0` (AudioContext `running` after gestures), `A2` (SFX played, 0 bad SFX, music started, 0 music errors), `A3` (peak > 0.01). `A3` is asserted only if `AudioContext.currentTime` advances ~2 s per 2 s; a stalled clock (seen in headless runs by reviewer_gameplay) is reported UNVERIFIED, never PASS. These show non-silent output, not correct sound: `A1` (by ear) stays UNVERIFIED.
- `G3a.door-opens-on-use`: fresh game, steers to the E1M1 sector-4 door with engine position/angle and presses Use; PASS only if sector 4 starts closed (floor==ceiling) and its ceiling rises. Fault `drop-use` (Use never delivered) must fail it. `G3b` (walking through, level exit) remains UNVERIFIED.
- Not covered by a fault: U5 and A0-A3 have no injected fault (would need a product-side break, which the tester may not make).

## Rev 5 additions (tester)
- `G3b.walk-through-door` (replaces the UNVERIFIED G3b placeholder): after G3a opens E1M1 sector 4, the player holds Up and `cap_player_sector()` is polled every ~20 ms. PASS only if the player is seen in sector 4 and then in a sector that is neither 4 nor the start sector (observed sequence `3>4>0`, 3/3 runs). It needs G3a's opened door, so the `drop-use` fault fails it too.
- TEST CORRECTION (first draft): polled every 100 ms and failed (sequence `3,0,7,8,51,52`, never saw sector 4). The player had walked through; the thin door sector was stepped over between polls. Fix was a finer poll, not a lower bar. Failing evidence: `verify-attempt1*` in the run's OUTPUT_DIR.
- `G3c.level-exit` is the remaining UNVERIFIED item from G3 (no route or oracle for finishing E1M1). Still UNVERIFIED: A1 (by ear), P1, H1, pickups, damage/death, Firefox, Safari, HiDPI.

## Rev 6 additions (tester)
- Fault `drop-visibility` (only `visibilitychange` is swallowed; `blur`/`pagehide` still work) must fail `E2b.hidden-releases-keys`. Closes the earlier gap where only `blur` had fault injection. Added to `faults.sh` (now 7 cases). No criteria changed or lowered.
- Still UNVERIFIED: A1 (by ear), P1, G3c (level exit: no route or engine hook), H1, pickups, damage/death, Firefox, Safari, HiDPI.
