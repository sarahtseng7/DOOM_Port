FINDINGS

Movement, momentum, turning/strafe, run, fire, menu freeze, focus loss and tic rate all behaved correctly in headless Chromium. This time the audio clock advanced and audio was non-silent (peak 0.43). Nobody has listened to it, so audio correctness is still unverified.

## Source identity
HEAD e500c44 plus uncommitted changes. `git diff HEAD` sha256 prefix fe88782d1c55d299 (it was 2c74d74fd2c699f9 in the previous review, so the source changed). dist/doom.wasm prefix 7afb94fa1ec64b5c (same as before). I did not rebuild; I tested the existing dist/ (files dated Nov 3 11:37). artifacts/specification.md and acceptance-criteria.md do not exist.

## Prior findings read
AGENTS.md, README.md, tests/README.md, my role prompt, artifacts/reports/reviewer_gameplay.md and tester.md. Open items carried in: audio by ear, real hidden tab, walking through a door.

## Work and evidence (this directory)
review.mjs is an unmodified copy of the T486PX script except for the port (8152 -> 8163). Output is in review.log. Headless Chromium, no autoplay flag, 800x600, python http.server on 8163 (I started and stopped it). Exit 0, page errors: none.
- PASS tic rate 35.0/s, and 35.0/s again after returning to the page.
- PASS forward hold then release coasts and stops: per-250 ms frame diffs 0.495, 0.357, 0.184, 0.094, then 0 for 8 intervals (normal Doom momentum).
- PASS strafe with "." (0.503). PASS Shift-run (0.661).
- PASS fire: ammo region changes (0.140), SFX 4 to 5. PASS held fire repeats (5 to 9).
- PASS Esc menu freezes the view (diff 0.000 over 1.5 s). Frame diff only; it does not prove player position is unchanged (tester U5 checks that).
- PASS blur stops an in-progress turn (diff 0.000).
- PASS audio context suspended before the gesture, running after. PASS level music switched (musicStarted 3). PASS audio clock advanced 2.005 s per 2.003 s wall.
- Final counters: 11 SFX requested and played, sfxBad 0, musicErrors 0, notesScheduled 1106, maxPeak 0.432.
- FAIL A.menu-sfx-and-music-heard: sfxPlayed 0 right after the first Enter on the title screen, although musicStarted 2 and maxPeak 0.23. I think the script expectation is wrong (no SFX is due that early), not the product, but I did not confirm it. Later menu and fire SFX played.
- "Use" produced no SFX (no door in reach at the start). Door opening is covered by tester G3a, which I did not rerun.

## Unresolved (owner)
1. UNVERIFIED, human: audio by ear (sound effects and music). Peak only shows non-silence.
2. UNVERIFIED, human: real hidden tab. The probe reported hidden:false, so headless cannot test it (protocol H1 in tests/README.md).
3. UNVERIFIED, tester: walking through an opened door, level exit, pickups, damage, death, Firefox, Safari, HiDPI.
4. Known limits, owner coder_input_audio: WASD and mouse unmapped; linked-sound pitch ignored; first SFX before a gesture dropped.
5. Student decision: music is an oscillator synth, not GENMIDI/OPL.
6. Timing/display: no fault seen; only the tic rate was checked (coder_render_timing owns the rest).

## Assumptions
- Doom default keys (arrows, Ctrl fire, Space use, Esc menu, Shift run, "." strafe) are the control requirement. Criteria are agent-proposed, not student-approved.
- Headless Chromium, one run; a coast of about 1 s counts as normal momentum.
- Manual interventions: none. Usage: not available. I wrote only in this directory.

## Next action
Human: run headed with working audio, listen, and test a real hidden tab. Tester: add the walk-through-door check. Whoever owns review.mjs: fix or drop the early menu-SFX expectation.
