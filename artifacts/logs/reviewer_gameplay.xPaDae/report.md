FINDINGS

reviewer_gameplay xPaDae, 2026-11-04 ~16:00 UTC. No defect found in movement, playability or the audio pipeline, so nothing is assigned to a coder.
- New this run: G3c (normal level exit) is now observed. I pressed the real E1M1 exit switch, and the game went to the intermission and then to E1M2. Item pickup is also observed.
- All 8 inherited probes pass again on the same build.

The result stays FINDINGS only because A1 (audio by ear) and H1 (a real hidden tab) still need a human, plus other browsers.

## Source identity (source-identity.txt, dist-hashes.txt)
- HEAD e500c44 plus uncommitted changes. The diff hash is 441e441ad5dfcd52…, the same as the tester, coder and reviewer_site uU7oaT reports.
- dist/ hashes are byte-identical to reviewer_gameplay.XkfiAZ: doom.wasm 7afb94fa…, doom.js 0090630e…, doom.data 1d7d43be…, index.html 43a15c63…, plus the 3 helper JS files.
- `find platform web Makefile -newer dist/doom.wasm` is empty. I did not rebuild.
- artifacts/specification.md and artifacts/acceptance-criteria.md are absent.

## Work
- Read AGENTS.md, the READMEs, my role prompt and all 6 reports in artifacts/reports/. reviewer_site uU7oaT is PASS for startup on this build, so I did not repeat that review.
- Server: `python3 -m http.server 8199 --bind 127.0.0.1 --directory dist`, PID 77622 (server.pid).
  - server.log shows 99 requests, all 200.
  - I killed only that PID. curl then returned 000 (server-stopped.txt).
- Inherited probes: copied from XkfiAZ, byte-identical (probes-provenance.txt). All exited 0 (probe-rcs.txt).
- New probes:
  - wad_e1m1.py does a read-only parse of assets/doom1.wad → wad-e1m1.json. The exit switch is linedef 330 (special 11) at x=2912, y −4800…−4736, and a health bonus sits at (1312,−3520).
  - exit_pickup.mjs runs the exit and pickup checks.
  - cheat_repeat.mjs was a diagnostic (see Probe errors below).

## Results
### New: exit_pickup.mjs, 8 PASS / 0 FAIL (exit_pickup.stdout.log, exit-pickup.json, screens/ep-*.png)
**Pickup**
- `pickup-health-bonus`: I walked onto the bonus with clipping on. Health went 100→101, and SFX played rose 3→4 (the pickup sound).

**Exit**
- Travel to the exit room used noclip. Clipping was turned back on before pressing Use.
- `reached-exit-switch` at (2956,−4774), facing 179°. ep-02 (viewed) shows the switch centred.
- `exit-switch-sfx`: Use played 1 SFX.
- `intermission-shown`:
  - `cap_player_valid` became 0 (gamestate ≠ GS_LEVEL).
  - The frame changed by 69%.
  - Intermission music started (+1).
  - ep-04 (viewed) shows "HANGAR FINISHED" with stats tallying.
  - ep-run3-05 (viewed) shows the final stats: kills 0%, items 2%, secret 0%, time :36, par :30. Items 2% agrees with the bonus I picked up.
- `next-level-e1m2`: after Use presses to advance, level 102 is valid. Health 101 carried over, and music changed again (total +2).
  - ep-05 (viewed) shows the E1M2 start area in correct colours.
- `movement-in-e1m2`: moved 149 units.
- 0 page errors.

### Inherited probes: all pass, matching XkfiAZ
| Probe | Result |
| --- | --- |
| review_state | 32 PASS / 0 FAIL / 2 NOTE (the same NOTEs as before: Use at a wall plays "oof"; music continues in the menu, as in vanilla). SFX requested 22 = played 22, sfxBad 0, musicErrors 0, maxPeak 0.50, ctx running |
| coast_pertic | 0 multi-tic gaps; stopped 42 tics after release; peak 8 u/tic (vanilla momentum) |
| pause_check | 6 PASS (pause and menu freeze the world; no coast or stuck movement after the menu closes) |
| visibility_release / blur_open | pass=true / pass=true |
| cheats_weapons | 12 PASS (all weapons fire with SFX and ammo use; IDCLEV; music restarts) |
| damage_death | 10 PASS |
| e2b_repeat | 10/10: angle change 0 over 52–53 hidden tics, held keys 0 after hide |

### Probe errors corrected (kept as failing evidence, not product faults)
1. **run1** (exit_pickup.run1.mjs, *.run1-idclip-bug.*): I typed IDCLIP, which is Doom II-only. Shareware's noclip cheat is IDSPISPOPD (third_party/doomgeneric/st_stuff.c:392-393).
   - The player got stuck on a pillar (ep-02 at that time).
   - cheat_repeat.mjs / cr-*.png confirmed that no "NO CLIPPING" message ever appeared.
2. **run2** (*.run2-out-of-use-range.*): I stood at x=3005, which is 93 units from the switch line. Use range is 64, so the press did nothing. I moved the stand point to x≈2950.
3. **run3** (*.run3-enter-not-accelerate.*, ep-run3-*.png): I advanced the intermission with Enter. Vanilla `WI_checkForAccelerate` advances only on BT_ATTACK/BT_USE (wi_stuff.c ~1491). I switched to Use.
   - The original intermission check also passed vacuously in run1. It was hardened before run2.

## Unresolved (owner)
1. UNVERIFIED, human: A1, SFX and music correctness by ear. The counters and peaks prove only non-silent playback.
2. UNVERIFIED, human: H1, a real hidden or minimized tab. Playwright only overrides `document.hidden`.
3. Tester: carried over from earlier reports.
   - E2b uses a pixel diff that animated sector lighting can fool. Switch it to `_cap_player_angle`.
   - G3c can now be automated without a new coder hook, using `_cap_player_valid`/`_cap_level_id` and the route in exit_pickup.mjs.
   - Fix the faults.sh expectations.
   - Rerun `tests/verify.sh` on 441e441a.
4. UNVERIFIED, tester/human: Firefox, Safari, HiDPI. Only one exit (E1M1→E1M2) was exercised, not the episode end.
5. Student decisions: the music is an oscillator synth, not OPL-faithful; WASD and mouse are not mapped; volume is not persisted.
6. No new defects for coder_input_audio, coder_render_timing or coder.

## Assumptions
- The required controls are Doom's default keys. Correct momentum means a vanilla friction stop about 40–45 tics after release.
- Engine state outranks pixel diffs. The supplied engine source is the vanilla reference.
- Using noclip to travel does not weaken G3c. The exit path under test (use-line special 11 → G_ExitLevel → intermission → G_WorldDone → next map) ran with clipping on. The route the player walks through the level was not tested.
- All criteria are agent-proposed, not student-approved. Headless Chromium only.
- Manual interventions: none. Token usage: not available.
- Writes: this OUTPUT_DIR only. No source, test, build, loop or artifacts/browser edits, and no result.json.

## Next action
- **Tester:** adopt the engine-state checks for E2b and G3c, then run `tests/verify.sh`.
- **Human:** run A1 and H1.
- **If the dist hashes change:** rerun `node <probe>.mjs <OUT> <PORT>` for the 9 probes here.
