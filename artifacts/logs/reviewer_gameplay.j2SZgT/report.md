FINDINGS

Movement, momentum, fire, focus-loss and timing behaved correctly on this build. Audio is still not established: nobody has heard it, and in this run the headless audio clock stalled again (analyser peak 0, 16 notes). Two of my own review checks printed FAIL; both are explained below, neither is a confirmed product defect.

## Source identity
HEAD e500c44 plus uncommitted changes. `git diff HEAD` sha256 prefix 2c74d74fd2c699f9 and dist/doom.wasm prefix 7afb94fa1ec64b5c, the same as the previous reviewer_gameplay, tester and coder runs. `make -n`: nothing to be done, so I did not rebuild. artifacts/specification.md and acceptance-criteria.md do not exist.

## Prior findings read
AGENTS.md, README.md, loop/README.md, artifacts/README.md, my role prompt, reports/reviewer_gameplay.md and reports/tester.md, plus the earlier reviewer_gameplay.ZUZV8O review.log. I did not re-read reports for coder, coder_input_audio, coder_render_timing or reviewer_site in full.

## Work and evidence (this directory)
I re-ran the earlier review script (review.mjs, a copy with the port changed to 8151; not a protected check) in headless Chromium with no autoplay flag. The server was a python http.server on port 8151, which I started and stopped. Output: review.log, review/screens/.
- PASS tic rate 35.0/s.
- PASS forward key hold coasts then stops: frame diffs per 250 ms were 0.495, 0.352, 0.191, 0.12, then 0 for the rest. This is normal Doom momentum.
- PASS strafe with "." and Shift-run both move the view. PASS fire: ammo changes and SFX requests rise 4 to 5; held fire repeats (5 to 9).
- PASS blur stops an in-progress turn. PASS tic rate is 35.0/s after returning to the page. No page errors.
- Audio counters: ctx `suspended` before a gesture and `running` after. sfxRequested 11 and sfxPlayed 11 with sfxBad 0 and musicErrors 0. But notesScheduled stayed at 16 and maxPeak 0 throughout.
- FAIL A.menu-sfx-and-music-heard (sfxPlayed 0, maxPeak 0 right after the first keypress). This repeats the stalled-clock symptom in reports/reviewer_gameplay.md (a bare AudioContext in this browser advanced currentTime only 0.005 s in 2 s). The earlier run ZUZV8O on the same source saw peak 0.50 and 930 notes. I treat it as an environment fault in this headless session, but I did not re-measure the clock this time, so the cause is not confirmed.
- FAIL P.menu-pauses-game: my script counts engine tics while the menu is open (35 in 1 s). The tic counter keeps running during the menu even when gameplay is paused, so this check is not a valid pause test. The earlier report says a freeze was seen by frame diff on this build. I did not re-observe it here, so menu freeze is not re-verified this run.

## Findings
1. Check quality, owner tester: the tic-counter pause check in my script is wrong; any menu-freeze check should compare frames or player position. Also a peak assertion should first require ctx.currentTime to advance. tests/playtest.mjs does not assert on peak (A1 is marked UNVERIFIED there), so that guard is not currently needed there.
2. Known limits: WASD and mouse are not mapped; use-door sound count did not increase ("use sfx delta 0"), which is expected if no door was in reach but I did not verify that.

## Unresolved (owner)
1. UNVERIFIED, student/human: audio by ear (SFX identity, music, balance), on a headed or idle machine where the clock advances.
2. UNVERIFIED, human: real hidden tab and real focus loss (H1 in tests/README.md); my "background tab" probe reported hidden:false.
3. UNVERIFIED, tester: door use then walking through, level exit, pickups, damage, death, Firefox, Safari, HiDPI.
4. Student decision: the music is an oscillator synth, not GENMIDI/OPL.
5. Timing/display: no fault seen; I only checked tic rate (coder_render_timing owns the rest).

## Assumptions
- Doom default keys (arrows, Ctrl fire, Esc menu) are the control requirement.
- Headless Chromium on a machine at load average about 2.4. One run.
- Manual interventions: none. Usage: not available.
- I wrote only in this directory and left no processes running.

## Next action
Human: run headed, listen, and run H1. Tester: add a frame-diff menu-freeze check and G3 (door, then walk through).
