FINDINGS

Movement, momentum, turning, strafe, run, fire, menu freeze, blur and tic rate all behaved correctly in headless Chromium on the existing dist/. The audio clock advanced and the output was non-silent (peak 0.45). Nobody has listened to it, so audio correctness stays unverified.

## Source identity
HEAD e500c44 plus uncommitted changes. `git diff HEAD` sha256 prefix c9b3c829ca2c5a67 and dist/doom.wasm prefix 7afb94fa1ec64b5c, both the same as the tester's and coder's latest reports. `make -n` says nothing to be done, so I did not rebuild. artifacts/specification.md and acceptance-criteria.md do not exist.

## Prior findings read
AGENTS.md, my role prompt, and all six reports in artifacts/reports/. Open items carried in: audio by ear, real hidden tab, level exit, pickups and damage, other browsers, the review-script menu-SFX expectation.

## Work and evidence (this directory)
review.mjs is a copy of the previous review script (reviewer_gameplay.9WUqPT) with the port changed to 8183. Output is in review.log, with screenshots and results JSON in results/ (the script wrote to `undefined/` because I forgot the output argument; I renamed it). Headless Chromium, no autoplay flag. I started python http.server on 8183 and stopped it (port confirmed free). Exit 0, page errors: none.
- PASS tic rate 35.0/s, and 35.0/s after returning to the page.
- PASS forward hold then release coasts and stops: per-250 ms frame diffs 0.495, 0.352, 0.191, 0.12, then 0 for 8 intervals (normal Doom momentum).
- PASS strafe with "." (0.499). PASS Shift-run (0.690).
- PASS fire: ammo region changes (0.140), SFX 4 to 5. PASS held fire repeats (5 to 9).
- PASS Esc menu freezes the view (diff 0.000 over 1.5 s). This is a frame diff only; tester U5 covers the player position. Music kept sounding with the menu open (lastPeak 0.067, 17 voices), which I believe is normal Doom behaviour.
- PASS blur stops an in-progress turn (diff 0.000).
- PASS audio context suspended before the gesture, running after. PASS level music switched (musicStarted 3). PASS audio clock advanced 2.005 s per 2.004 s wall.
- Final counters: 11 SFX requested and played, sfxBad 0, musicErrors 0, notesScheduled 1107, maxPeak 0.452.
- FAIL A.menu-sfx-and-music-heard: sfxPlayed 0 after the first Enter on the title screen, although musicStarted 2 and maxPeak 0.22. Same result as every earlier run. I believe the expectation is wrong (no SFX is due that early), but I did not confirm it.
- "Use" produced no SFX (no door in reach at the start); door opening and walking through are covered by tester G3a/G3b, which I did not rerun.

## Unresolved (owner)
1. UNVERIFIED, human: SFX and music by ear. Peak only shows non-silence.
2. UNVERIFIED, human: real hidden tab. The probe reported hidden:false, so headless cannot background a tab (protocol H1 in tests/README.md).
3. UNVERIFIED, tester: level exit (G3c), pickups, damage, death, Firefox, Safari, HiDPI.
4. Known limits, owner coder_input_audio: WASD and mouse unmapped; linked-sound pitch ignored; first SFX before a gesture dropped.
5. Student decision: music is an oscillator synth, not GENMIDI/OPL.
6. Timing/display: no fault seen; only the tic rate was checked (coder_render_timing owns the rest).
7. Owner: whoever maintains review.mjs. A.menu-sfx-and-music-heard fails every run and is probably a wrong expectation.

## Assumptions
- Doom default keys (arrows, Ctrl fire, Space use, Esc menu, Shift run, "." strafe) are the control requirement. Criteria are agent-proposed, not student-approved.
- Headless Chromium, one run; a coast of about 1 s counts as normal momentum.
- Manual interventions: none. Usage: not available. I wrote only in this directory.

## Next action
Human: run headed with working audio, listen, and test a real hidden tab. Tester: G3c route. Review-script owner: fix or drop the early menu-SFX expectation.
