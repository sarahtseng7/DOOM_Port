FINDINGS

Movement, momentum, strafe, run, fire, menu freeze, focus loss and tic timing behaved correctly on this build. Audio is still not established: the headless audio clock did not advance (0.000 s in 2.004 s wall), so peak stayed 0 and nobody has heard anything.

## Source identity
HEAD e500c44 plus uncommitted changes. `git diff HEAD` sha256 prefix 2c74d74fd2c699f9; dist/doom.wasm prefix 7afb94fa1ec64b5c. Both match the previous reviewer_gameplay, tester and coder runs. I did not rebuild. artifacts/specification.md and acceptance-criteria.md do not exist.

## Prior findings read
AGENTS.md, README.md, loop/README.md, artifacts/README.md, my role prompt, artifacts/reports/reviewer_gameplay.md, tester.md, reviewer_site.md headers, and earlier reviewer_gameplay dirs (3rXq3f, WeHatJ). Open items carried in: audio by ear, real hidden tab, walking through a door.

## Work and evidence (this directory)
review.mjs is a copy of the 3rXq3f script (not a protected check); output in review.log and review/screens/. Headless Chromium, no autoplay flag, 800x600, local python http.server on 8152 which I started and stopped.
- PASS tic rate 34.7/s; 35.0/s after returning to the page.
- PASS forward hold then release coasts and stops: per-250 ms frame diffs 0.508, 0.333, 0.215, 0.129, then 0 for 8 intervals (normal Doom momentum).
- PASS strafe with "." (0.535). PASS Shift-run (0.708).
- PASS fire: ammo region changes, SFX played 4 to 5. PASS held fire repeats (5 to 9).
- PASS Esc menu freezes the view (diff 0.000 over 1.5 s). Frame diff only; it does not prove player position unchanged.
- PASS blur stops an in-progress turn (diff 0.000).
- Audio counters: ctx suspended before a gesture, running after. 11 SFX requested/played, sfxBad 0, musicErrors 0, music started 3 times. notesScheduled 16, maxPeak 0.
- FAIL A.audio-clock-advances (0.000 s per 2 s wall) and FAIL A.menu-sfx-and-music-heard (sfxPlayed 0, peak 0). Both follow from the stalled headless clock; I treat them as an environment limit, not a product defect, and not as a pass.
- "Use" produced no SFX (no door in reach at the start position). Door opening was observed by reviewer_gameplay.WeHatJ (door5-use-results.json); I did not repeat it.
- Page errors: none.

## Unresolved (owner)
1. UNVERIFIED, human: audio by ear on a machine where the audio clock advances. Earlier run ZUZV8O saw peak 0.50 with 930 notes when the clock ran, which is positive but not listening.
2. UNVERIFIED, human: real hidden tab. Probe reported hidden:false.
3. UNVERIFIED, tester: walking through an opened door, level exit, pickups, damage, death, Firefox, Safari, HiDPI. Add an audio-clock-advances guard before any peak assertion.
4. Known limits, owner coder_input_audio: WASD and mouse unmapped; linked-sound pitch ignored; first SFX before a gesture dropped.
5. Student decision: music is an oscillator synth, not GENMIDI/OPL.
6. Timing/display: no fault seen; only tic rate checked (coder_render_timing owns the rest).

## Assumptions
- Doom default keys (arrows, Ctrl fire, Space use, Esc menu, Shift run, "." strafe) are the control requirement. Criteria are agent-proposed, not student-approved.
- Headless Chromium, one run; a coast of about 1 s counts as normal momentum.
- Manual interventions: none. Usage: not available. I wrote only in this directory.

## Next action
Human: run headed on a machine with a working audio clock, listen, and test a real hidden tab. Tester: add the walk-through-door check and the audio-clock guard.
