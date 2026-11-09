FINDINGS

No source edits. The peak-0 question is narrowed to the audio clock. With `ctx.currentTime` guarded, headless and headed Chromium both show the clock not advancing on this machine, so game audio output cannot be verified here. Nobody has heard it.

## Source identity
HEAD e500c44 plus uncommitted changes. `git diff HEAD` sha256 prefix 2c74d74fd2c699f9 and dist/doom.wasm prefix 7afb94fa1ec64b5c, both identical to the previous runs. `make -n`: nothing to be done, so I did not rebuild. artifacts/specification.md and acceptance-criteria.md do not exist.

## Prior findings read
AGENTS.md, README.md, loop/README.md, artifacts/README.md, my role prompt, and all six files in artifacts/reports/. Nothing asks for a change in my owned files. The open item was: rerun check2.mjs on an idle machine and add a currentTime guard.

## Evidence (this dir)
check3.mjs is check2.mjs (from coder_input_audio.KqlYco) plus reads of `CapAudio._ctx().currentTime` before and after the scripted run. check3_headed.mjs is the same with `headless:false`. Neither is a protected check. Outputs are check3.out/err and check3_headed.out/err.
- Headless: currentTime 0 -> 0.0053 s across 12.8 s of wall time. ctx `running`, SFX 4/4 played, 0 bad, 3 songs started, 16 notes scheduled, 0 music errors, maxPeak 0, no page errors.
- Headed: currentTime 0 -> 0.0053 s across 12.8 s. SFX 5 played, 16 notes, maxPeak 0, no page errors.
- Load average was about 2.1 (not idle, but lower than the earlier run's 4). The identical 0.0053 s in both modes suggests the context is not being driven by an output device here rather than load. That is an inference; I did not test other causes.
- Counters show the code paths run (requests, starts, 0 errors). They do not show sound.

## Unresolved (owner)
1. UNVERIFIED, human/tester: audio output. Needs a machine where `ctx.currentTime` advances while the game plays, then listening to SFX and music. Positive instrumented evidence remains only the earlier runs (peak 0.23-0.51, 73-133 notes). Any peak assertion in tests should first require currentTime to advance (tester).
2. Unmet, student decision: music is a GM-family oscillator synth, not GENMIDI/OPL.
3. UNVERIFIED, tester: other E1 songs, real hidden tab, Firefox, Safari. I did not re-run controls and rely on tester.BNf9ts on the same hashes.
4. Known limits (mine, unfixed): linked-sound pitch ignored; first SFX before a gesture is dropped (autoplay policy); WASD and mouse not mapped.

## Assumptions
- Doom default keys are the control requirement. Persistence is out of scope (none supplied); volumes reset on load.
- AudioContext is created early and resumes on the first gesture.
- Manual interventions: none. Usage: not available. I wrote only in this directory.

## Next action
Human: run check3.mjs (`node check3.mjs dist`) on a machine with working audio, confirm t1-t0 is about the wall time, then listen. Tester: add the currentTime guard to any audio-peak check.
