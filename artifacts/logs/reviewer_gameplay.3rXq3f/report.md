FINDINGS

Movement, momentum, fire, menu freeze, focus loss and tic timing behaved correctly on this build. Audio is still not established. The headless audio clock did not advance at all in this run (0.000 s in 2.0 s of wall time), so nobody has heard the sound and the peak stayed 0.

## Source identity
HEAD e500c44 plus uncommitted changes. `git diff HEAD` sha256 prefix 2c74d74fd2c699f9 and dist/doom.wasm prefix 7afb94fa1ec64b5c. Both match the previous reviewer_gameplay, tester and coder runs. I did not rebuild. artifacts/specification.md and acceptance-criteria.md do not exist.

## Prior findings read
AGENTS.md, README.md, loop/README.md, artifacts/README.md, my role prompt, and all six files in artifacts/reports/. Prior open items for me: menu freeze by frame diff (new here), audio by ear, real hidden tab.

## Work and evidence (this directory)
review.mjs is a copy of the earlier reviewer script (port 8152; the tic-counter pause check replaced by a frame-diff check; an audio-clock probe added). It is not a protected check. A python http.server on port 8152, which I started and stopped. Headless Chromium, no autoplay flag, 800x600. Output: review.log, review/screens/ (screens/).
- PASS tic rate 35.0/s. PASS 35.0/s again after returning to the page.
- PASS forward hold then release coasts and stops: per-250 ms frame diffs 0.495, 0.352, 0.198, 0.107, then 0 for the next 8 intervals. This is normal Doom momentum.
- PASS strafe with "." (diff 0.499). PASS Shift-run (diff 0.690).
- PASS fire: ammo region changes and SFX requested/played rise 4 to 5. PASS held fire repeats (5 to 9).
- PASS menu freezes the world, by frame diff: with the Esc menu open after a forward run, the view diff over 1.5 s was 0.000. This closes the menu-freeze item from earlier reports for this build, in one run. The check does not prove the player position was unchanged in a case where the view stays identical for other reasons. It is also a single run.
- PASS blur stops an in-progress turn (diff 0.000).
- Audio counters: ctx `suspended` before a gesture and `running` after. 11 SFX requested, 11 played, sfxBad 0, musicErrors 0. Music started 3 times (menu, level), but notesScheduled stayed at 16 and maxPeak 0.
- FAIL A.audio-clock-advances: ctx.currentTime advanced 0.000 s in 2.002 s of wall time. This reproduces the stalled clock in the earlier reports, with a state of `running`. The FAIL is an environment check about the browser, not a product defect.
- FAIL A.menu-sfx-and-music-heard (sfxPlayed 0, maxPeak 0 right after the first keypress). It follows from the stalled clock. I do not count it as a product fault. It is also not a pass.
- Page errors: none.

## Findings
1. UNVERIFIED, human: audio. Counters show the code paths run (play requests, no bad buffers, no music errors). Whether the SFX and music sound right is not established. Earlier runs (ZUZV8O) saw peak 0.50 with 930 notes when the clock advanced, which is positive but is not listening.
2. Check quality, owner tester: any peak assertion should first require the audio clock to advance. A menu-freeze check by frame diff now exists in my script; the tester could adopt it.
3. Known limits, owner coder_input_audio: WASD and mouse unmapped; linked-sound pitch ignored; first SFX before a gesture dropped; "use" produced no SFX in this run (no door in reach, not verified).

## Unresolved (owner)
1. UNVERIFIED, human: audio by ear on a machine where the clock advances (run `node check3.mjs dist` from a coder_input_audio dir and compare t1-t0 to wall time).
2. UNVERIFIED, human: real hidden tab. My probe reported hidden:false, so it did not really background the tab (H1 in tests/README.md).
3. UNVERIFIED, tester: door use then walking through, level exit, pickups, damage, death, Firefox, Safari, HiDPI.
4. Student decision: music is a GM-style oscillator synth, not GENMIDI/OPL.
5. Timing/display: no fault seen. I only checked tic rate (coder_render_timing owns the rest).

## Assumptions
- Doom default keys (arrows, Ctrl fire, Space use, Esc menu, Shift run, "." strafe) are the control requirement. Criteria are agent-proposed, not student-approved.
- Headless Chromium, one run. Normal Doom momentum accepted as a coast of about 1 s.
- Manual interventions: none. Usage: not available.
- I wrote only in this directory. The server I started was stopped (port 8152 closed).

## Next action
Human: run headed on a machine with a working audio clock, listen, and run H1. Tester: add G3 (door, then walk through) and the audio-clock guard.
