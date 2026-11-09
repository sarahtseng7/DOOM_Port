FINDINGS

Re-observed movement, fire, menus, focus loss and audio on the rebuilt dist/ (render_timing scaling fix shipped), and closed the Esc-menu pause gap. FINDINGS (not PASS) because audibility, a real hidden tab, door use, level exit and OPL music fidelity are still unverified.

## Source identity
HEAD e500c44 + uncommitted changes. I did not rebuild. dist/ was rebuilt by coder at 20:06; dist/doom.wasm sha256 prefix a4c6846627bdcb21 (unchanged), and dist/render_timing.js is byte-identical to web/render_timing.js (cmp) and has the fractional-fit fix. Server: `python3 -m http.server 8124 --bind 127.0.0.1 --directory dist`, started and stopped by me (port confirmed free).

## Prior findings read
artifacts/reports/ (all six) and the earlier full reviewer_gameplay report at artifacts/logs/reviewer_gameplay.dAPDqY/report.md (the current reports/reviewer_gameplay.md is the incremental Pause run). No specification.md or acceptance-criteria.md exists.

## Work and evidence (this dir)
Ad-hoc Playwright, headless Chromium, 800x600, no autoplay flag; not protected checks.
- review.mjs (prior script, port changed) -> run1.log, run1/. Same results as the earlier run on the new dist:
  - AudioContext `suspended` before a gesture (0 notes), `running` after one Enter, peak 0.23. Level music switches in (musicStarted 3, peak 0.47).
  - 35.0 tics/s. Forward 500 ms then coasting view diffs 0.495, 0.352, 0.198, 0.107, then 0 for 2 s: normal Doom momentum, then stops.
  - Period strafe (diff 0.50) and Shift+Up run (0.69) move the view. Held ArrowRight + `blur`: turn stops (diff 0.000).
  - Fire: ammo region changes (0.14), SFX 4->5; held Ctrl SFX 5->9 (autofire). Final: 11 SFX requested/11 played/0 bad, 0 music errors, 0 page/console errors.
  - Resume after a foreground switch: 35.0 tics/s.
- escpause.mjs -> esc.log, esc/screens/. Reached E1M1 (Enter x4). Held ArrowUp, then pressed Esc: the menu opened (01-menu-a.png). With the menu open and the key held, the left view region changed by 0.0000 over 1.5 s, and 0.0000 for another 1 s after release. After Esc closed the menu, forward motion resumed (diff 0.71). So the Esc menu pauses the world, as Doom does. This closes the earlier "Esc-menu pause" gap.
- vol.mjs was copied but not rerun; the earlier volume result stands (same wasm and audio_web.js hash is not re-checked by me).

## Failed/invalid attempts kept
- review.mjs FAIL `A.menu-sfx-and-music-heard` (no SFX after the first title Enter) and FAIL `P.menu-pauses-game` (`_cap_tic_count` keeps counting): both are check flaws, already explained in the earlier report (the engine plays no sound for the title Enter; gametic advances while paused). Not product defects. The pause behaviour is shown by pixels in esc.log instead.
- esc-invalid-demo/ and esc-invalid-demo.log: my first escpause run pressed Enter 3 times, not 4, so it observed attract-mode demo playback, not E1M1; its diffs (0.57, 0.76) are meaningless. A second attempt also repeated it because BSD `sed -i` failed. The valid run is esc/ and esc.log.

## Unresolved (owner)
1. UNVERIFIED, tester/student: no human has heard the audio. The analyser peak proves non-silent output only. Music is a GM-family oscillator approximation, not OPL (coder_input_audio/student).
2. UNVERIFIED, tester: a real hidden/background tab. Headless reports `document.hidden=false`, so throttling, background audio and key release on hide were not exercised (H1; coder_render_timing).
3. UNVERIFIED, tester: door use (Space found no door at spawn, SFX delta 0), pick-ups, damage/death, level exit. Needs a scripted route or a position export.
4. UNVERIFIED: other E1 songs, music/SFX balance, Safari/Firefox, headed browser, HiDPI (backing store 640x400).
5. Scope (student): WASD and mouse are not mapped, Doom default keys only. Criteria are agent-proposed.

## Assumptions
- Doom default key bindings are the requirement.
- Screenshot diffs of regions stand in for player motion and pause; a 0.0000 diff in an unobstructed region is taken as a frozen world.
- Stops after release allows about 1 s of friction; the pass bar was <2% diff in the last three 250 ms samples.
- No source, test or loop files were edited. Manual interventions: none.
