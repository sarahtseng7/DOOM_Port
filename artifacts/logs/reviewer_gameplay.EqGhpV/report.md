FINDINGS

No new gameplay defect. The open audio question (analyser peak 0 in recent runs) is narrowed: in this headless Chromium the audio clock barely advances even for a bare AudioContext with no game code. This is FINDINGS, not PASS, because nobody has heard the audio, and a headed or idle-machine run is still needed to show the game's own audio output is correct.

## Source identity
HEAD e500c44 plus uncommitted changes. `git diff HEAD` sha256 prefix 2c74d74fd2c699f9, dist/doom.wasm prefix 7afb94fa1ec64b5c, the same as the previous gameplay, tester, coder and coder_input_audio runs. `make -n`: nothing to be done, so I did not rebuild. artifacts/specification.md and acceptance-criteria.md do not exist.

## Prior findings read
AGENTS.md, README.md, my role prompt, all six files in artifacts/reports/, and the headings of earlier reviewer_gameplay.* reports (movement, momentum, turn, blur, fire, menu freeze and door use were already observed on this build). I did not repeat them. I took on the item coder_input_audio and coder left open: peak 0 versus 0.388 earlier on identical source.

## Work and evidence (this directory)
audio2.mjs and clock.mjs are my own scripts, not protected checks. They drive headless Chromium (no autoplay flag) against throwaway local servers (ports 8137, 8138) that I started and killed.
- audio2.out (game): before a gesture ctx `suspended`, 0 notes. After Enter x4, ctx `running`. Over 8 one-second samples notesScheduled stayed at 16 and maxPeak stayed 0. After Ctrl fire, SFX requested/played 4/4, sfxBad 0, musicErrors 0, maxPeak still 0, no page errors. This reproduces coder_input_audio's peak 0 / 16 notes.
- clock.out (control, no game code): a fresh `AudioContext` in the same browser reached `running`, but `currentTime` advanced only 0.0053 s over a 2 s wait. Its analyser did see a signal (peak 0.99), so the graph works but time does not progress normally.
- Reading: the game's music scheduler is clocked from ctx.currentTime, so with the clock stalled, notes stop at 16 and the analyser sees nothing. That fits an environment fault in this headless run (load average about 2.5), not a fault in web/audio_web.js. It does not prove the game's audio is right; the earlier runs with peak 0.23 to 0.51 and 73 to 133 notes remain the only positive instrumented evidence.

## Findings
1. Environment, owner tester/human: the headless audio clock stalls intermittently here, which makes instrumented audio checks (peak, notes) flaky. A check that asserts on peak should first confirm ctx.currentTime advances, otherwise it can fail or pass for the wrong reason. I did not verify whether tests/verify.sh asserts on peak.
2. Unchanged known limits: WASD and mouse are not mapped; the first SFX before a gesture is dropped (autoplay policy).

## Unresolved (owner)
1. UNVERIFIED, student/human: audio by ear (SFX identity, recognisable music, balance), and a headed run where currentTime advances while the game plays.
2. UNVERIFIED, human: real hidden tab and real focus loss (H1 in tests/README.md).
3. UNVERIFIED, tester: walking through an opened door, level exit, pickups, damage and death, Firefox, Safari, HiDPI.
4. Student decision: music is an oscillator synth, not GENMIDI/OPL.
5. Timing/display: no fault seen; not measured by me (coder_render_timing).

## Assumptions
- Doom default keys (arrows, Ctrl fire, Esc menu) are the control requirement.
- Headless Chromium only. The stalled clock may be specific to this machine and session; I ran it twice, and the control script once.
- Manual interventions: none. Usage: not available.
- I wrote only in this directory. I stopped the two servers I started and no other processes.

## Next action
Human: rerun audio2.mjs headed or on an idle machine, then listen to the audio and run H1. Tester: make any peak assertion conditional on ctx.currentTime advancing, and add G3 (door, then walk through).
