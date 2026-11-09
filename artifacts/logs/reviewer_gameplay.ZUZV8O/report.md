FINDINGS

Movement, turning, stopping, fire, Esc-menu pause, focus-loss release, tic rate and non-silent audio were observed working on the current dist/. This is FINDINGS rather than PASS because audibility, a real hidden tab, door use, level exit and OPL music fidelity remain unverified. I found no new product defect.

## Source identity
HEAD e500c44 plus uncommitted changes. I did not rebuild or edit any source. dist/ files are dated Nov 2 20:58. dist/doom.wasm sha256 prefix a4c6846627bdcb21, the same as in earlier reports. Server: `python3 -m http.server 8127 --bind 127.0.0.1 --directory dist`, started by me and stopped (port confirmed free).

## Prior findings read
artifacts/reports/ (all six) and the earlier reviewer_gameplay.* reports. No specification.md or acceptance-criteria.md exists. Nothing in prior reports is contradicted.

## Work and evidence (this dir)
Ad-hoc Playwright, headless Chromium 800x600, no autoplay flag. The scripts are copies of reviewer_gameplay.ldSVVs with the port changed to 8127. They are not protected checks.
- review.mjs -> review.log, review/screens/
  - AudioContext `suspended` before a gesture, `running` after one Enter, peak 0.22. Level music switches in (musicStarted 3, peak 0.50).
  - 35.0 tics/s.
  - Forward 500 ms, then coasting diffs 0.508, 0.341, 0.201, 0.129, then 0 for 2 s: normal Doom momentum, then a full stop.
  - Period strafe (0.535) and Shift+Up run (0.718) move the view.
  - Fire: ammo region changes (0.14), SFX 4->5; held Ctrl 5->9 (autofire).
  - Held ArrowRight + `blur`: turn stops (0.000). Tic rate after the simulated tab switch is 35.0/s.
  - Final: 11 SFX requested/11 played/0 bad, 0 music errors, 0 page/console errors.
- escpause.mjs -> escpause.log. With the Esc menu open and ArrowUp held, view diff is 0.0000 over 1.5 s and 0.0000 after release. After closing the menu, forward motion resumes (0.735).
- vol.mjs -> vol.log. Music volume 0 gives peak 0 with SFX still played (26/26); restoring gives peak 0.37.
- back2.mjs -> back2.log. Three trials, each from a fresh page. Idle: 0 0 0 0. After ArrowDown 500 ms: 0.184, then 0 for 2.75 s. Input delivered 8->10, dropped 0. Backward moves and then stops fully, and the result is identical across the trials, so I saw no flakiness on this build. The screenshots from these trials were deleted to save space; the log is the evidence.

## Failed checks kept (check flaws, not product defects)
- FAIL A.menu-sfx-and-music-heard: the engine plays no SFX for the title Enter (sfxPlayed=0); music is heard (peak 0.22).
- FAIL P.menu-pauses-game: `_cap_tic_count` keeps counting while paused (34/s). The pixel diff in escpause.log shows the world is frozen. The script's check is the wrong oracle. Explained in earlier reports.

## Unresolved (owner)
1. UNVERIFIED (tester/student): no human has heard the audio. Analyser peak proves non-silent output only. Music is a GM-family oscillator approximation, not OPL (coder_input_audio/student).
2. UNVERIFIED (tester; timing owner coder_render_timing): a real hidden tab. Headless reports `document.hidden=false`, so throttling, background audio and key release on hide were not exercised. Blur was simulated by a dispatched event.
3. UNVERIFIED (tester): door use (Space gave SFX delta 0 at spawn, no door nearby), pick-ups, damage/death, level exit. Needs a scripted route or position export.
4. UNVERIFIED: other E1 songs, music/SFX balance, Safari/Firefox, headed browser, HiDPI.
5. Scope (student): WASD and mouse are not mapped; Doom default keys only. Criteria are agent-proposed, not student-approved.
6. Tester: I6.backward-returns is marginal in the tester's oracle (0.60-0.79 against a 0.7 limit). My three backward trials were identical and show no product fault, which points to oracle sensitivity rather than the game (tester-owned).

## Assumptions
- Doom default key bindings are the requirement.
- Region screenshot diffs stand in for motion and pause; a 0.0000 diff in an unobstructed region means a frozen world.
- Stopping allows about 1 s of friction; the pass bar was <2% diff in the last samples.
- No source, test or loop files edited. Manual interventions: none. Usage: not available.
