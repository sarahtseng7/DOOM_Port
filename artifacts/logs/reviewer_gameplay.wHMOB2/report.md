FINDINGS

Re-ran movement, fire, Esc-menu pause, focus loss, tic rate and audio checks on the current dist/ (assets updated 20:21-20:24). Behaviour matches the earlier reports and no new defects. FINDINGS (not PASS) because audibility, a real hidden tab, door use, level exit and OPL music fidelity are still unverified.

## Source identity
HEAD e500c44 plus uncommitted changes. I did not rebuild. dist/doom.wasm sha256 prefix a4c6846627bdcb21 (unchanged). dist/render_timing.js is byte-identical to web/render_timing.js. dist/audio_web.js, input_audio.js and index.html were modified at 20:24, after the last gameplay report (20:10), so this run re-covers them. Server: `python3 -m http.server 8125 --bind 127.0.0.1 --directory dist`, started and stopped by me (port confirmed free).

## Prior findings read
artifacts/reports/ (all six), the earlier gameplay reports under artifacts/logs/reviewer_gameplay.*. No specification.md or acceptance-criteria.md exists.

## Work and evidence (this dir)
Ad-hoc Playwright, headless Chromium 800x600, no autoplay flag; scripts copied from reviewer_gameplay.Rw1fcA with the port changed. Not protected checks.
- review.mjs -> run1.log, run1/
  - AudioContext `suspended` before a gesture, `running` after one Enter, peak 0.23. Level music switches in (musicStarted 3, peak 0.44).
  - 35.0 tics/s. Forward 500 ms, then coasting diffs 0.508, 0.341, 0.201, 0.129, then 0 for 2 s: normal Doom momentum, then a full stop.
  - Period strafe (0.535) and Shift+Up run (0.718) move the view. Held ArrowRight + `blur`: turn stops (0.000).
  - Fire: ammo region changes (0.14), SFX 4->5; held Ctrl 5->9 (autofire). Final: 11 SFX requested/11 played/0 bad, 0 music errors, 0 page/console errors.
  - Resume after foreground switch: 35.0 tics/s.
- escpause.mjs -> esc.log, esc/. With the Esc menu open and ArrowUp held, view diff 0.0000 over 1.5 s and 0.0000 after release. After closing the menu, forward motion resumes (0.714). The menu pauses the world.
- vol.mjs -> vol.log. Music volume 0 gives peak 0 with SFX still playing; restoring gives peak 0.37.

## Failed checks kept (check flaws, not product defects)
- FAIL A.menu-sfx-and-music-heard: no SFX for the title Enter (engine plays none; music is heard, peak 0.23).
- FAIL P.menu-pauses-game: `_cap_tic_count` keeps counting while paused (35/s); the pixel diff in esc.log shows the world is frozen.
  Both were explained in earlier reports; not re-litigated.

## Unresolved (owner)
1. UNVERIFIED (tester/student): no human has heard the audio. Analyser peak proves non-silent output only. Music is a GM-family oscillator approximation, not OPL (coder_input_audio/student).
2. UNVERIFIED (tester; timing owner coder_render_timing): a real hidden tab. Headless reports `document.hidden=false`, so throttling, background audio and key release on hide were not exercised.
3. UNVERIFIED (tester): door use (Space gave SFX delta 0 at spawn), pick-ups, damage/death, level exit. Needs a scripted route or position export.
4. UNVERIFIED: other E1 songs, music/SFX balance, Safari/Firefox, headed browser, HiDPI.
5. Scope (student): WASD and mouse are not mapped; Doom default keys only. Criteria are agent-proposed.
6. Tester reported check I6.backward-returns as marginal/flaky (ratio 0.79 vs 0.7 limit once). I did not test backward movement separately; it is a tester-owned oracle issue.

## Assumptions
- Doom default key bindings are the requirement.
- Region screenshot diffs stand in for motion and pause; a 0.0000 diff in an unobstructed region means a frozen world.
- Stopping allows about 1 s of friction; the pass bar was <2% diff in the last samples.
- No source, test or loop files edited. Manual interventions: none. Usage: not available.
