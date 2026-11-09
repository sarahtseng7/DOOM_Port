FINDINGS

Movement, momentum, turning, strafe, run, fire, menu freeze, blur and tic rate behaved correctly again in headless Chromium on the existing dist/. Audio ran and was non-silent (peak 0.43), but nobody has listened to it, so audio correctness is UNVERIFIED. This run repeats the previous review on the same build and adds no new coverage.

## Source identity
HEAD e500c44 plus uncommitted changes. `git diff HEAD` sha256 prefix c9b3c829ca2c5a67 and dist/doom.wasm prefix 7afb94fa1ec64b5c, both the same as all prior reports. `make -n`: nothing to be done, so I did not rebuild. artifacts/specification.md and acceptance-criteria.md do not exist.

## Prior findings read
AGENTS.md, README.md, my role prompt, and all six reports in artifacts/reports/. Open items carried in: audio by ear, real hidden tab, level exit (G3c), pickups/damage, other browsers, the review-script menu-SFX expectation.

## Work and evidence (this directory)
review.mjs is the earlier script from reviewer_gameplay.6SoKWH with the port changed to 8184. Output: review.log, results/ (screens and review-results.json). Headless Chromium, no autoplay flag. I started python http.server on 8184 and stopped it (port confirmed free). Exit 0, page errors: none.
- PASS tic rate 35.0/s, and 35.0/s after returning to the page.
- PASS forward hold then release coasts and stops: per-250 ms frame diffs 0.509, 0.363, 0.207, 0.112, then 0 for 8 intervals (normal Doom momentum).
- PASS strafe with "." (0.535). PASS Shift-run (0.718).
- PASS fire: ammo region changes (0.140), SFX 4 to 5. PASS held fire repeats (5 to 9).
- PASS Esc menu freezes the view (diff 0.000 over 1.5 s). Frame diff only; tester U5 covers player position. Music kept sounding with the menu open (17 voices), which I believe is normal Doom behaviour.
- PASS blur stops an in-progress turn (diff 0.000).
- PASS audio context suspended before the gesture, running after. PASS level music switched (musicStarted 3). PASS audio clock advanced 2.005 s per 2.003 s wall.
- Final counters: 11 SFX requested and played, sfxBad 0, musicErrors 0, notesScheduled 1108, maxPeak 0.427.
- FAIL A.menu-sfx-and-music-heard: sfxPlayed 0 after the first Enter on the title screen (musicStarted 2, maxPeak 0.23). Same result as every earlier run. I believe the check's expectation is wrong (no SFX is due that early), but I did not confirm it, so I report it as an open failure rather than dismissing it.
- "Use" produced no SFX (no door in reach at the start). Doors are covered by tester G3a/G3b, which I did not rerun.

## Unresolved (owner)
1. UNVERIFIED, human: SFX and music by ear. Peak only shows non-silence.
2. UNVERIFIED, human: real hidden tab. The probe reported hidden:false (105 tics in 3 s), so headless cannot background a tab (H1 in tests/README.md).
3. UNVERIFIED, tester: level exit (G3c), pickups, damage, death, Firefox, Safari, HiDPI.
4. Known limits, owner coder_input_audio: WASD and mouse unmapped; linked-sound pitch ignored; first SFX before a gesture dropped.
5. Student decision: music is an oscillator synth, not GENMIDI/OPL.
6. Timing/display: only the tic rate was checked here (coder_render_timing owns the rest).
7. Owner of review.mjs: A.menu-sfx-and-music-heard fails every run and is probably a wrong expectation. The script lives only in log directories, not in a protected location.

## Assumptions
- Doom default keys (arrows, Ctrl fire, Space use, Esc menu, Shift run, "." strafe) are the control requirement. Criteria are agent-proposed, not student-approved.
- Headless Chromium, one run; a coast of about 1 s counts as normal momentum.
- Manual interventions: none. Usage: not available. I wrote only in this directory.

## Next action
Human: run headed with working audio, listen, and test a real hidden tab. Tester: G3c route. Review-script owner: fix or drop the early menu-SFX expectation.
